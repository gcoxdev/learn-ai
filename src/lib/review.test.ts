import { expect, it } from "vitest";
import { curriculum } from "./content";
import { emptyProgress, type Attempt } from "./model";
import { reviewSchedule } from "./review";

const DAY = 86_400_000;
const objective = curriculum.objectives.find(
  (o) => o.scope === "core" && o.lesson === "ai-systems",
)!;
const lesson = curriculum.lessons.find((l) => l.id === objective.lesson)!;

function masteredProgress(t0: number) {
  const p = emptyProgress();
  p.attempts = objective.families.map((family, i): Attempt => {
    const q = lesson.questions.find((q) => !q.retired && q.family === family)!;
    p.exposures.push(q.id);
    return {
      id: `m-${i}`,
      objective: objective.id,
      version: objective.version,
      family,
      variant: q.id,
      correct: true,
      independent: true,
      mode: "assessment",
      at: t0 + i,
      responses: {},
    };
  });
  return p;
}
function review(p: ReturnType<typeof emptyProgress>, at: number, correct: boolean) {
  const q = lesson.questions.find((q) => p.exposures.includes(q.id))!;
  p.attempts.push({
    id: `r-${at}`,
    objective: objective.id,
    version: objective.version,
    family: q.family,
    variant: q.id,
    correct,
    independent: false,
    mode: "practice",
    at,
    responses: {},
  });
}

it("schedules a mastered idea after growing gaps and resets after a miss", () => {
  const t0 = Date.UTC(2026, 0, 1);
  const p = masteredProgress(t0);
  const find = (now: number) => {
    const s = reviewSchedule(curriculum, p, now);
    return {
      due: s.due.some((i) => i.objective === objective.id),
      item: [...s.due, ...s.upcoming].find((i) => i.objective === objective.id)!,
    };
  };
  expect(find(t0 + 0.5 * DAY).due).toBe(false);
  expect(find(t0 + 1.1 * DAY).due).toBe(true);
  // Only previously seen questions are reused, so fresh checks stay unspent.
  expect(p.exposures).toContain(find(t0 + 2 * DAY).item.question.id);

  review(p, t0 + 2 * DAY, true);
  expect(find(t0 + 4 * DAY).due).toBe(false);
  expect(find(t0 + 5.1 * DAY).due).toBe(true);
  review(p, t0 + 6 * DAY, true);
  expect(find(t0 + 6 * DAY).item.streak).toBe(2);
  expect(find(t0 + 12 * DAY).due).toBe(false);
  expect(find(t0 + 13.1 * DAY).due).toBe(true);

  review(p, t0 + 14 * DAY, false);
  expect(find(t0 + 14 * DAY).item.streak).toBe(0);
  expect(find(t0 + 15.1 * DAY).due).toBe(true);
});

it("ignores ideas that are not mastered", () => {
  const p = emptyProgress();
  expect(reviewSchedule(curriculum, p).due).toHaveLength(0);
});
