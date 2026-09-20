import { expect, it } from "vitest";
import { curriculum } from "./content";
import { mastered, parseBackup, questionsRemaining } from "./engine";
import { emptyProgress, type Attempt } from "./model";

it("replenishes exhausted beginner banks while preserving compatible earlier evidence", () => {
  const lessons = curriculum.lessons.filter((l) => l.slot.startsWith("M00."));
  expect(lessons).toHaveLength(11);
  for (const lesson of lessons) {
    const active = lesson.questions.filter((q) => !q.retired);
    const objective = curriculum.objectives.find(
      (o) => o.lesson === lesson.id,
    )!;
    const p = emptyProgress();
    const old = active.filter((q) => !/\.v2\.[56]$/.test(q.id));
    p.exposures = old.map((q) => q.id);
    expect(old).toHaveLength(8);
    for (const suffix of [5, 6]) {
      const next = questionsRemaining(lesson, curriculum, p, "core");
      expect(next.items).toHaveLength(2);
      expect(next.items.every((q) => q.id.endsWith(`.v2.${suffix}`))).toBe(
        true,
      );
      p.exposures.push(...next.items.map((q) => q.id));
    }
    expect(
      questionsRemaining(lesson, curriculum, p, "core").exhausted,
    ).toHaveLength(2);
    p.attempts = objective.families.map((family, i): Attempt => {
      const q = old.find((q) => q.family === family)!;
      return {
        id: `${lesson.id}-existing-${i}`,
        objective: objective.id,
        version: objective.version,
        family,
        variant: q.id,
        correct: true,
        independent: true,
        mode: "assessment",
        at: i + 1,
        responses: Object.fromEntries(
          Object.entries(q.answers).map(([key, value]) => [key, String(value)]),
        ),
      };
    });
    expect(
      mastered(objective, parseBackup(JSON.stringify(p), curriculum).attempts),
    ).toBe(true);
  }
});
