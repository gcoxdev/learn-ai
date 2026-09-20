import { expect, it } from "vitest";
import { curriculum } from "./content";
import { mastered } from "./engine";
import { evidenceMessage, objectiveEvidence } from "./evidence-progress";
import type { Attempt } from "./model";

const objective = curriculum.objectives.find(
  (o) => o.id === "objective.ai-systems",
)!;
const answers: Attempt[] = objective.families.map((family, index) => ({
  id: `partial-${index}`,
  objective: objective.id,
  version: objective.version,
  family,
  variant: `partial-question-${index}`,
  correct: true,
  independent: true,
  mode: "assessment",
  at: index + 1,
  responses: {},
}));

it("shows family-level partial evidence without changing mastery", () => {
  expect(objectiveEvidence(objective, answers.slice(0, 1))).toMatchObject({
    passed: 1,
    remaining: 1,
    complete: false,
  });
  expect(mastered(objective, answers.slice(0, 1))).toBe(false);
  expect(
    objectiveEvidence(objective, [
      answers[0],
      { ...answers[0], id: "duplicate" },
    ]).passed,
  ).toBe(1);
  expect(objectiveEvidence(objective, answers).complete).toBe(
    mastered(objective, answers),
  );
});

it("keeps hints, practice, wrong answers, obsolete versions, and unrelated families out of partial credit", () => {
  for (const patch of [
    { independent: false },
    { mode: "practice" as const },
    { correct: false },
    { version: "old" },
    { family: "unknown" },
  ]) {
    const evidence = objectiveEvidence(
      objective,
      answers.map((answer) => ({ ...answer, ...patch })),
    );
    expect(evidence.passed).toBe(0);
    expect(evidence.tried).toBe(true);
    expect(evidenceMessage(evidence)).not.toContain("One more");
  }
  expect(
    objectiveEvidence(
      objective,
      answers.map((a) => ({ ...a, mode: "placement" })),
    ).passed,
  ).toBe(2);
});

it("distinguishes an untouched idea, work in progress, and a demonstrated idea", () => {
  expect(objectiveEvidence(objective, []).tried).toBe(false);
  expect(
    evidenceMessage(objectiveEvidence(objective, answers.slice(0, 1))),
  ).toContain("One more fresh check");
  expect(evidenceMessage(objectiveEvidence(objective, answers))).toContain(
    "every path",
  );
});
