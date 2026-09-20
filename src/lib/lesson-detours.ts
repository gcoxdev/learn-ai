import { z } from "zod";
import {
  detourSchema,
  type Curriculum,
  type Detour,
  type Progress,
} from "./model";

const trailSchema = z
  .object({
    version: z.literal(1),
    lesson: z.string().max(100),
    resetAt: z.number().finite().nonnegative(),
    frames: z.array(detourSchema).max(20),
  })
  .strict();
export type LessonTrail = z.infer<typeof trailSchema>;

/** Visiting an ancestor returns to it, rather than making a circular detour. */
export function framesForLesson(frames: Detour[], lesson: string): Detour[] {
  const path: Detour[] = [];
  for (const frame of frames) {
    const repeated = path.findIndex(
      (previous) => previous.lesson === frame.lesson,
    );
    if (repeated >= 0) path.length = repeated + 1;
    else path.push(frame);
  }
  const ancestor = path.findIndex((frame) => frame.lesson === lesson);
  return (ancestor < 0 ? path : path.slice(0, ancestor)).slice(-20);
}

export function lessonTrail(
  lesson: string,
  frames: Detour[],
  resetAt: number,
): LessonTrail {
  return {
    version: 1,
    lesson,
    resetAt,
    frames: framesForLesson(frames, lesson).map((frame) => ({ ...frame })),
  };
}

function validFrames(frames: Detour[], curriculum: Curriculum) {
  return frames.every((frame) =>
    curriculum.lessons.some(
      (lesson) =>
        lesson.id === frame.lesson &&
        lesson.scenes.some((scene) => scene.id === frame.scene),
    ),
  );
}

/** Missing history is distinct from invalid/stale history, which must not revive a trail. */
export function historyDetours(
  value: unknown,
  lesson: string,
  resetAt: number,
  curriculum: Curriculum,
): Detour[] | undefined {
  if (value === undefined) return undefined;
  const parsed = trailSchema.safeParse(value);
  if (
    !parsed.success ||
    parsed.data.lesson !== lesson ||
    parsed.data.resetAt !== resetAt ||
    !validFrames(parsed.data.frames, curriculum)
  )
    return [];
  return framesForLesson(parsed.data.frames, lesson);
}

/** Compatibility for a saved session predating per-entry browser history. */
export function savedDetours(
  progress: Progress,
  lesson: string,
  curriculum: Curriculum,
): Detour[] {
  const frames = progress.detours;
  if (!validFrames(frames, curriculum)) return [];
  if (frames.some((frame) => frame.lesson === lesson))
    return framesForLesson(frames, lesson);
  const parent = frames.at(-1);
  const source =
    parent &&
    curriculum.lessons
      .find((l) => l.id === parent.lesson)
      ?.scenes.find((s) => s.id === parent.scene);
  // A direct visit to an unrelated lesson must not inherit another lesson's trail.
  return progress.lastLesson === lesson || source?.bridges.includes(lesson)
    ? framesForLesson(frames, lesson)
    : [];
}
