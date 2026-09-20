import { familyPassed } from "./engine";
import type { Attempt, Objective } from "./model";

/** Partial evidence uses exactly the same family/version rules as mastery. */
export function objectiveEvidence(objective: Objective, attempts: Attempt[]) {
  const passed = objective.families.filter((family) =>
    familyPassed(objective, family, attempts),
  ).length;
  const total = objective.families.length;
  const tried = attempts.some((attempt) => attempt.objective === objective.id);
  const remaining = total - passed;
  return {
    passed,
    total,
    remaining,
    tried,
    complete: total > 0 && remaining === 0,
  };
}

export function evidenceMessage(
  evidence: ReturnType<typeof objectiveEvidence>,
) {
  if (evidence.complete)
    return "This idea is demonstrated. Your checks count on every path that uses it.";
  if (evidence.passed > 0)
    return `${evidence.remaining === 1 ? "One more fresh check" : `${evidence.remaining} more fresh checks`} without hints will demonstrate this idea.`;
  if (evidence.tried)
    return "Your responses are saved. Use the feedback, then try a fresh check without hints. Practice helps you prepare; it does not count as independent evidence.";
  return "Each different check is one step toward demonstrating this idea. Reading and practice do not award mastery.";
}
