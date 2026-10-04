/**
 * Fixed, invented teaching fixtures for the System One decision-model activities (module M38).
 * None of these numbers come from a real model; lessons label them as invented.
 */

export const TRAY_CANDIDATES = [
  { id: "billing", label: "Billing" },
  { id: "bookings", label: "Bookings" },
  { id: "repairs", label: "Repairs" },
  { id: "safety", label: "Safety" },
  { id: "other", label: "Other topic" },
  { id: "unclear", label: "Not enough information" },
] as const;
export type TrayCandidate = (typeof TRAY_CANDIDATES)[number]["id"];

export const TRAY_MESSAGES = [
  {
    id: "brakes",
    text: "My brakes failed on the hill and I want my money back.",
    note: "Two real concerns: safety and a refund request.",
    logits: { billing: 2.1, bookings: 0.2, repairs: 1.0, safety: 1.9, other: -1.0, unclear: -0.5 },
  },
  {
    id: "move",
    text: "Can I move my Saturday booking to Sunday?",
    note: "A clear bookings question.",
    logits: { billing: 0.1, bookings: 3.0, repairs: -0.8, safety: -1.5, other: -0.5, unclear: 0.0 },
  },
  {
    id: "spanish",
    text: "Hola, ¿dónde recojo la bici?",
    note: "A language the desk does not support.",
    logits: { billing: 0.3, bookings: 0.9, repairs: 0.2, safety: -0.6, other: 0.4, unclear: 1.1 },
  },
] as const;
export type TrayMessage = (typeof TRAY_MESSAGES)[number]["id"];

export function softmax(logits: number[], temperature = 1): number[] {
  const t = Math.max(temperature, 1e-6);
  const scaled = logits.map((z) => z / t);
  const max = Math.max(...scaled);
  const exps = scaled.map((z) => Math.exp(z - max));
  const total = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / total);
}

/** Renormalize one fixed output over the candidates still in the tray. */
export function trayProbabilities(
  message: TrayMessage,
  enabled: Record<TrayCandidate, boolean>,
): { id: TrayCandidate; label: string; probability: number }[] {
  const m = TRAY_MESSAGES.find((x) => x.id === message)!;
  const kept = TRAY_CANDIDATES.filter((c) => enabled[c.id]);
  const probs = softmax(kept.map((c) => m.logits[c.id]));
  return kept.map((c, i) => ({ id: c.id, label: c.label, probability: probs[i] }));
}

/** TypeSafe documents Choice confidence as (p_max − 1/n) / (1 − 1/n). */
export function choiceConfidence(probabilities: number[]): number {
  const n = probabilities.length;
  if (n < 2) return 1;
  const top = Math.max(...probabilities);
  return (top - 1 / n) / (1 - 1 / n);
}

export const DIAL_CANDIDATES = ["Billing", "Bookings", "Repairs", "Safety", "Other topic"] as const;
export const DIAL_EXAMPLES = [
  {
    id: "lever",
    text: "The brake lever snapped off while I was riding.",
    correct: 3,
    logits: [0.2, 1.6, 1.1, 1.3, -0.4],
  },
  {
    id: "move",
    text: "Can I move my Saturday booking to Sunday?",
    correct: 1,
    logits: [0.1, 2.8, 0.3, -0.5, -0.2],
  },
] as const;
export type DialExample = (typeof DIAL_EXAMPLES)[number]["id"];

export function dialReadout(example: DialExample, temperature: number) {
  const e = DIAL_EXAMPLES.find((x) => x.id === example)!;
  const probabilities = softmax([...e.logits], temperature);
  const top = probabilities.indexOf(Math.max(...probabilities));
  return {
    probabilities,
    top,
    topProbability: probabilities[top],
    confidence: choiceConfidence(probabilities),
    correct: e.correct,
    isCorrect: top === e.correct,
  };
}

/** Deterministic pseudo-random numbers so the help-desk sample never changes. */
function lcg(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export type DeskCase = { confidence: number; correct: boolean; shifted: boolean };

/** 200 ordinary messages whose confidence matches their accuracy, plus 40 shifted ones that stay confident but are often wrong. */
export const DESK_CASES: DeskCase[] = (() => {
  const rand = lcg(38);
  const cases: DeskCase[] = [];
  for (let i = 0; i < 200; i++) {
    const confidence = Math.round((0.4 + 0.59 * rand() ** 0.6) * 100) / 100;
    cases.push({ confidence, correct: rand() < confidence, shifted: false });
  }
  for (let i = 0; i < 40; i++) {
    const confidence = Math.round((0.85 + 0.12 * rand()) * 100) / 100;
    cases.push({ confidence, correct: rand() < 0.55, shifted: true });
  }
  return cases;
})();

export function deskOutcome(
  threshold: number,
  wrongCost: number,
  reviewCost: number,
  includeShift: boolean,
) {
  const cases = DESK_CASES.filter((c) => includeShift || !c.shifted);
  const automated = cases.filter((c) => c.confidence >= threshold);
  const wrong = automated.filter((c) => !c.correct).length;
  const review = cases.length - automated.length;
  const shiftedAutomated = automated.filter((c) => c.shifted);
  return {
    total: cases.length,
    automated: automated.length,
    wrong,
    // With no automated cases the error rate is not measurable, not zero.
    errorRate: automated.length ? wrong / automated.length : null,
    review,
    cost: wrong * wrongCost + review * reviewCost,
    shiftedAutomated: shiftedAutomated.length,
    shiftedWrong: shiftedAutomated.filter((c) => !c.correct).length,
  };
}
