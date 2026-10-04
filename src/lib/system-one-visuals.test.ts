import { describe, expect, it } from "vitest";
import {
  choiceConfidence,
  DESK_CASES,
  deskOutcome,
  dialReadout,
  softmax,
  TRAY_CANDIDATES,
  trayProbabilities,
} from "./system-one-visuals";

const allOn = Object.fromEntries(TRAY_CANDIDATES.map((c) => [c.id, true])) as Parameters<
  typeof trayProbabilities
>[1];

describe("answer tray", () => {
  it("splits the brakes-and-refund message between billing and safety", () => {
    const rows = trayProbabilities("brakes", allOn);
    const p = Object.fromEntries(rows.map((r) => [r.id, r.probability]));
    expect(p.billing).toBeCloseTo(0.41, 2);
    expect(p.safety).toBeCloseTo(0.34, 2);
    expect(rows.reduce((a, r) => a + r.probability, 0)).toBeCloseTo(1, 12);
  });
  it("renormalizes over the remaining candidates when one is removed", () => {
    const rows = trayProbabilities("spanish", { ...allOn, unclear: false });
    expect(rows.map((r) => r.id)).not.toContain("unclear");
    expect(rows.reduce((a, r) => a + r.probability, 0)).toBeCloseTo(1, 12);
    expect(rows.find((r) => r.id === "bookings")!.probability).toBeGreaterThan(0.3);
  });
});

describe("confidence dial", () => {
  it("matches the documented TypeSafe example: p_max 0.74 over five options gives 0.675", () => {
    expect(choiceConfidence([0.74, 0.1, 0.08, 0.05, 0.03])).toBeCloseTo(0.675, 3);
  });
  it("keeps the brake-lever answer wrong while lower temperature makes it more confident", () => {
    const warm = dialReadout("lever", 1);
    const cold = dialReadout("lever", 0.25);
    expect(warm.isCorrect).toBe(false);
    expect(cold.isCorrect).toBe(false);
    expect(warm.topProbability).toBeCloseTo(0.366, 3);
    expect(cold.topProbability).toBeCloseTo(0.694, 3);
    expect(cold.confidence).toBeLessThan(cold.topProbability);
  });
  it("never changes the ranking when only temperature changes", () => {
    const order = (p: number[]) => p.map((_, i) => i).sort((a, b) => p[b] - p[a]);
    expect(order(softmax([0.2, 1.6, 1.1, 1.3, -0.4], 0.3))).toEqual(
      order(softmax([0.2, 1.6, 1.1, 1.3, -0.4], 2.5)),
    );
  });
});

describe("help desk", () => {
  it("has a fixed sample of 200 ordinary and 40 shifted messages", () => {
    expect(DESK_CASES.filter((c) => !c.shifted)).toHaveLength(200);
    expect(DESK_CASES.filter((c) => c.shifted)).toHaveLength(40);
  });
  it("reproduces the readouts the lesson prose quotes", () => {
    expect(deskOutcome(0.75, 10, 0.5, false)).toMatchObject({ automated: 125, wrong: 14, review: 75, cost: 177.5 });
    expect(deskOutcome(0.9, 10, 0.5, false)).toMatchObject({ automated: 51, wrong: 4, review: 149 });
    expect(deskOutcome(0.9, 10, 0.5, true)).toMatchObject({ automated: 80, wrong: 17, shiftedAutomated: 29, shiftedWrong: 13 });
  });
  it("reports an unmeasurable error rate when nothing is automated", () => {
    expect(deskOutcome(1, 10, 0.5, true).errorRate).toBeNull();
  });
});
