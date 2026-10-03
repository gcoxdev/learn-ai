import { expect, it } from "vitest";
import { curriculum } from "./content";
import { mastered, parseBackup, questionsRemaining } from "./engine";
import { emptyProgress, type Attempt } from "./model";

it("gives every beginner family six fresh retakes and keeps earlier evidence readable", () => {
  const lessons = curriculum.lessons.filter((l) => l.slot.startsWith("M00."));
  expect(lessons).toHaveLength(11);
  for (const lesson of lessons) {
    const objective = curriculum.objectives.find(
      (o) => o.lesson === lesson.id,
    )!;
    for (const family of objective.families)
      expect(
        lesson.questions.filter((q) => !q.retired && q.family === family)
          .length,
      ).toBeGreaterThanOrEqual(6);

    // Each attempt reveals one fresh variant per family until the bank is spent.
    const p = emptyProgress();
    let rounds = 0;
    for (;;) {
      const next = questionsRemaining(lesson, curriculum, p, "core");
      if (!next.items.length) break;
      p.exposures.push(...next.items.map((q) => q.id));
      rounds += 1;
    }
    expect(rounds).toBeGreaterThanOrEqual(6);
    expect(
      questionsRemaining(lesson, curriculum, p, "core").exhausted,
    ).toHaveLength(objective.families.length);

    // One unassisted correct answer per family demonstrates the objective.
    p.attempts = objective.families.map((family, i): Attempt => {
      const q = lesson.questions.find(
        (q) => !q.retired && q.family === family,
      )!;
      return {
        id: `${lesson.id}-current-${i}`,
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

    // Evidence recorded against a retired question under an earlier version stays importable.
    const retired = lesson.questions.find((q) => q.retired);
    if (retired) {
      const old = emptyProgress();
      old.attempts = [
        {
          id: `${lesson.id}-legacy`,
          objective: objective.id,
          version: "legacy-draft",
          family: retired.family,
          variant: retired.id,
          correct: true,
          independent: true,
          mode: "assessment",
          at: 1,
          responses: Object.fromEntries(
            Object.entries(retired.answers).map(([k, v]) => [k, String(v)]),
          ),
        },
      ];
      old.exposures = [retired.id];
      const parsed = parseBackup(JSON.stringify(old), curriculum);
      expect(mastered(objective, parsed.attempts)).toBe(false);
    }
  }
});
