import { mastered } from "./engine";
import type { Attempt, Curriculum, Lesson } from "./model";

export type PathChapter = {
  id: string;
  title: string;
  summary: string;
  start: number;
  lessons: Lesson[];
};

// Topic labels describe existing curriculum modules, not a second learning graph.
const topics: Record<string, string> = {
  M00: "Everyday AI ideas",
  M01: "How AI got here",
  M02: "How computers represent a problem",
  M03: "Learning from useful data",
  M04: "Reasoning with facts and rules",
  M05: "Searching and planning",
  M06: "Working with uncertainty",
  M07: "Learning to predict",
  M08: "Finding patterns and useful representations",
  M09: "Testing what a model has learned",
  M10: "Helping a model improve",
  M11: "Inside a neural network",
  M12: "Making sense of images",
  M13: "Learning from sequences and sound",
  M14: "Turning language into model inputs",
  M15: "Following attention through a transformer",
  M16: "Preparing and training a language model",
  M17: "Making training fit the hardware",
  M18: "Sharing work among experts",
  M19: "Other ways to process a sequence",
  M20: "Adapting a model after pretraining",
  M21: "Giving a model time to reason",
  M22: "Generating something new",
  M23: "Connecting words, images, and other signals",
  M24: "Learning through actions and rewards",
  M25: "Building an agent that uses tools",
  M26: "Finding information to support an answer",
  M27: "Running a model in the real world",
  M28: "Checking reliability and behavior",
  M29: "Making responsible system decisions",
  M30: "Connecting models to physical actions",
  M31: "Understanding causes and change",
  M32: "Combining different ways to learn",
  M33: "Building and operating an AI app",
  M34: "Using AI to investigate science",
  M35: "Tracing a complete AI system",
  M36: "Putting the pieces together",
  M37: "Exploring other kinds of neural models",
};

function moduleId(lesson: Lesson): string {
  return lesson.slot.split(".")[0];
}

function describeChapter(lessons: Lesson[], start: number) {
  const modules = new Map<string, number>();
  for (const lesson of lessons) {
    if (lesson.category === "bridge") continue;
    const id = moduleId(lesson);
    modules.set(id, (modules.get(id) ?? 0) + 1);
  }
  const dominant = [...modules].sort((a, b) => b[1] - a[1])[0]?.[0];
  const title =
    dominant === "M00"
      ? start === 0
        ? "Meet an AI system"
        : "Build your AI compass"
      : (topics[dominant ?? ""] ?? "Tools for thinking about models");
  const subjectNames = [...modules.keys()].map(
    (id) => topics[id] ?? "connected AI ideas",
  );
  if (lessons.some((lesson) => lesson.category === "bridge"))
    subjectNames.push("math preparation when it is needed");
  const summary =
    start === 0 && dominant === "M00"
      ? "Start with an everyday task, then follow its inputs, model, and output."
      : `Explore ${subjectNames
          .slice(0, 3)
          .map((subject) => subject[0].toLowerCase() + subject.slice(1))
          .join(
            "; ",
          )}${subjectNames.length > 3 ? "; and supporting ideas" : ""}.`;
  const focus =
    lessons.find((lesson) => moduleId(lesson) === dominant) ?? lessons[0];
  return { title, summary, focus: focus.title };
}

/** Wrap the exact prerequisite order in short, contiguous reading chapters. */
export function pathChapters(lessons: Lesson[]): PathChapter[] {
  if (!lessons.length) return [];
  const chunks: Lesson[][] = [];
  let offset = 0;
  // The opening seven M00 lessons form the complete everyday-system example.
  if (
    lessons.length >= 13 &&
    lessons.slice(0, 7).every((lesson) => moduleId(lesson) === "M00")
  ) {
    chunks.push(lessons.slice(0, 7));
    offset = 7;
  }

  // Prefer 6–8 lessons and existing module boundaries; never move a lesson.
  const remaining = lessons.length - offset;
  const cost = Array<number>(remaining + 1).fill(Infinity);
  const sizes = Array<number>(remaining + 1).fill(0);
  cost[remaining] = 0;
  for (let index = remaining - 1; index >= 0; index--) {
    for (let size = 1; size <= 8 && index + size <= remaining; size++) {
      const end = offset + index + size;
      const splitModule =
        end < lessons.length &&
        moduleId(lessons[end - 1]) === moduleId(lessons[end]);
      const candidate =
        (size - 7) ** 2 +
        (size < 6 ? 20 : 0) +
        (splitModule ? 2 : 0) +
        cost[index + size];
      if (candidate < cost[index]) {
        cost[index] = candidate;
        sizes[index] = size;
      }
    }
  }
  for (let index = 0; index < remaining; index += sizes[index])
    chunks.push(lessons.slice(offset + index, offset + index + sizes[index]));

  let start = 0;
  const chapters = chunks.map((chunk) => {
    const chapter = {
      id: chunk[0].id,
      ...describeChapter(chunk, start),
      start,
      lessons: chunk,
    };
    start += chunk.length;
    return chapter;
  });
  // A repeated module label is not enough to find the right chapter again.
  // Use its actual starting topic, without changing prerequisite order or IDs.
  const counts = new Map<string, number>();
  for (const chapter of chapters)
    counts.set(chapter.title, (counts.get(chapter.title) ?? 0) + 1);
  const titles = new Set<string>();
  return chapters.map(({ focus, ...chapter }) => {
    const title =
      (counts.get(chapter.title) ?? 0) > 1
        ? `${chapter.title}: ${focus}`
        : chapter.title;
    chapter.title = titles.has(title)
      ? `${title} (lessons ${chapter.start + 1}–${chapter.start + chapter.lessons.length})`
      : title;
    titles.add(chapter.title);
    return chapter;
  });
}

/** Reading position cannot count as evidence; reuse the existing version rules. */
export function chapterProgress(
  chapter: PathChapter,
  curriculum: Curriculum,
  required: readonly string[],
  attempts: Attempt[],
) {
  const lessonIds = new Set(chapter.lessons.map((lesson) => lesson.id));
  const objectives = curriculum.objectives.filter(
    (objective) =>
      objective.scope === "core" &&
      lessonIds.has(objective.lesson) &&
      required.includes(objective.id),
  );
  return {
    demonstrated: objectives.filter((objective) =>
      mastered(objective, attempts),
    ).length,
    total: objectives.length,
  };
}
