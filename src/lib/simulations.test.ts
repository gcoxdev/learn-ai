import { expect, it } from "vitest";
import { attentionMix, descent, expertMixture } from "./simulations";

it.each([
  [0.1, [0, 2.4, 2.88, 2.976], [36, 1.44, 0.0576, 0.002304]],
  [0.2, [0, 4.8, 1.92, 3.648], [36, 12.96, 4.6656, 1.679616]],
  [0.3, [0, 7.2, -2.88, 11.232], [36, 70.56, 138.2976, 271.063296]],
] as const)(
  "matches all teaching values at rate %f",
  (rate, weights, losses) => {
    const rows = descent(rate);
    rows.forEach((row, index) => {
      expect(row.weight).toBeCloseTo(weights[index], 10);
      expect(row.loss).toBeCloseTo(losses[index], 10);
      expect(row.prediction).toBeCloseTo(2 * weights[index], 10);
      expect(row.gradient).toBeCloseTo(4 * (2 * weights[index] - 6), 10);
    });
  },
);
it("holds still at zero rate and resets to the chosen initial condition", () => {
  expect(descent(0, 2, 3).map((row) => row.weight)).toEqual([2, 2, 2, 2]);
  expect(descent(0.2, -1, 0)[0]).toEqual({
    step: 0,
    weight: -1,
    prediction: -2,
    loss: 64,
    gradient: -32,
  });
});

it("attention excludes future positions and renormalizes the allowed values", () => {
  const causal = attentionMix([0, 0], true);
  expect(causal.rows.map((row) => row.weight)).toEqual([0.5, 0.5, 0]);
  expect(causal.output).toEqual([2, 2]);
  const unmasked = attentionMix([0, 0], false);
  unmasked.rows.forEach((row) => expect(row.weight).toBeCloseTo(1 / 3, 12));
  unmasked.output.forEach((value) => expect(value).toBeCloseTo(8 / 3, 12));
});
it("attention scales two-coordinate dot products and responds to a changed query", () => {
  const a = attentionMix([2, 0], true),
    b = attentionMix([0, 2], true);
  expect(a.rows[0].score).toBe(2);
  expect(a.rows[0].scaled).toBeCloseTo(Math.sqrt(2), 12);
  expect(a.rows[0].weight).toBeGreaterThan(a.rows[1].weight);
  expect(a.output[0]).toBeCloseTo(b.output[1], 12);
  expect(a.rows.reduce((sum, row) => sum + row.weight, 0)).toBeCloseTo(1, 12);
  expect(() => attentionMix([Infinity, 0], true)).toThrow();
});
it("rejects nonfinite and invalid simulation input", () => {
  expect(() => descent(NaN)).toThrow();
  expect(() => descent(0.1, 0, 1.5)).toThrow();
  expect(() => descent(0.31)).toThrow();
  expect(() => descent(0.1, 0, 13)).toThrow();
});
it("renormalizes selected experts and combines their vectors", () => {
  const result = expertMixture([0.55, 0.25, 0.15, 0.05], 2);
  expect(result.weights.map((w) => w.id)).toEqual([0, 1]);
  expect(result.weights[0].weight).toBeCloseTo(0.6875, 12);
  expect(result.weights[1].weight).toBeCloseTo(0.3125, 12);
  expect(result.output).toEqual([1.375, 1.25]);
});
it("breaks routing ties deterministically and handles invalid distributions", () => {
  expect(expertMixture([1, 1, 1, 1], 1).weights[0].id).toBe(0);
  expect(() => expertMixture([0, 0, 0, 0], 2)).toThrow();
  expect(() => expertMixture([1, -1, 0, 0], 2)).toThrow();
  expect(() => expertMixture([1, 0, 0, 0], 5)).toThrow();
});
