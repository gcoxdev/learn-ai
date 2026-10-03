import { mastered } from "./engine";
import type { Attempt, Curriculum, Progress, Question } from "./model";

/**
 * Spaced retrieval practice. Once an idea is mastered it comes back for a
 * short review after growing gaps; a miss brings it back the next day.
 * Reviews reuse questions the learner has already seen and are recorded as
 * practice, so they never spend fresh variants or change mastery evidence.
 */
export const REVIEW_INTERVAL_DAYS = [1, 3, 7, 16, 35, 90] as const;
const DAY = 86_400_000;

export type ReviewItem = {
  objective: string;
  lesson: string;
  lessonTitle: string;
  question: Question;
  dueAt: number;
  streak: number;
};

function masteredAt(
  objective: Curriculum["objectives"][number],
  attempts: Attempt[],
) {
  let latest = 0;
  for (const family of objective.families) {
    const first = attempts
      .filter(
        (a) =>
          a.objective === objective.id &&
          a.version === objective.version &&
          a.family === family &&
          a.correct &&
          a.independent &&
          a.mode !== "practice",
      )
      .reduce((min, a) => Math.min(min, a.at), Infinity);
    latest = Math.max(latest, first);
  }
  return latest;
}

/** Schedule state for every mastered core objective. */
export function reviewSchedule(
  curriculum: Curriculum,
  progress: Progress,
  now = Date.now(),
): { due: ReviewItem[]; upcoming: ReviewItem[] } {
  const due: ReviewItem[] = [];
  const upcoming: ReviewItem[] = [];
  for (const objective of curriculum.objectives) {
    if (objective.scope !== "core" || !mastered(objective, progress.attempts))
      continue;
    const lesson = curriculum.lessons.find((l) => l.id === objective.lesson);
    if (!lesson) continue;
    const start = masteredAt(objective, progress.attempts);
    const reviews = progress.attempts
      .filter(
        (a) =>
          a.objective === objective.id &&
          a.mode === "practice" &&
          a.at > start,
      )
      .sort((a, b) => a.at - b.at);
    let streak = 0;
    for (const r of reviews) streak = r.correct ? streak + 1 : 0;
    const last = reviews.at(-1);
    const lastAt = last ? last.at : start;
    const interval =
      REVIEW_INTERVAL_DAYS[Math.min(streak, REVIEW_INTERVAL_DAYS.length - 1)];
    const dueAt = lastAt + interval * DAY;
    // Seen, active questions for this objective, least recently practised first.
    const seen = lesson.questions.filter(
      (q) =>
        !q.retired &&
        q.objective === objective.id &&
        objective.families.includes(q.family) &&
        progress.exposures.includes(q.id),
    );
    if (!seen.length) continue;
    const lastUse = (q: Question) =>
      progress.attempts
        .filter((a) => a.variant === q.id)
        .reduce((max, a) => Math.max(max, a.at), 0);
    const question = [...seen].sort((a, b) => lastUse(a) - lastUse(b))[0];
    const item = {
      objective: objective.id,
      lesson: lesson.id,
      lessonTitle: lesson.title,
      question,
      dueAt,
      streak,
    };
    (dueAt <= now ? due : upcoming).push(item);
  }
  due.sort((a, b) => a.dueAt - b.dueAt);
  upcoming.sort((a, b) => a.dueAt - b.dueAt);
  return { due, upcoming };
}

