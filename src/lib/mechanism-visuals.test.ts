import { describe, expect, it } from "vitest";
import {
  beamBranches,
  beamSearch,
  clusterPoints,
  kMeansStep,
  kvCacheSize,
  learningRateTrace,
} from "./mechanism-visuals";

describe("inspectable mechanism labs", () => {
  it("assigns nearest centers with a documented tie rule, then reduces squared error", () => {
    const step = kMeansStep(clusterPoints, [2, 6]);
    expect(step.assignments).toEqual([0, 0, 0, 1, 1, 1]);
    expect(step.groups).toEqual([
      [1, 2, 4],
      [8, 9, 10],
    ]);
    expect(step.updated[0]).toBeCloseTo(7 / 3, 12);
    expect(step.updated[1]).toBe(9);
    expect(step.before).toBe(34);
    expect(step.after).toBeCloseTo(20 / 3, 12);
    expect(step.after).toBeLessThan(step.before);
    const empty = kMeansStep([1, 2], [0, 100]);
    expect(empty.updated).toEqual([1.5, 100]);
    expect(empty.groups[1]).toEqual([]);
  });

  it("normalizes every branch and preserves an initially weaker prefix that wins by sequence score", () => {
    expect(
      beamBranches.reduce((sum, branch) => sum + branch.probability, 0),
    ).toBeCloseTo(1);
    for (const branch of beamBranches)
      expect(
        branch.next.reduce((sum, next) => sum + next.probability, 0),
      ).toBeCloseTo(1);
    expect(beamSearch(1).prefixes).toEqual(["go"]);
    expect(beamSearch(1).winner).toMatchObject({
      sequence: "go home",
      score: 0.3,
    });
    expect(beamSearch(2).prefixes).toEqual(["go", "stay"]);
    expect(beamSearch(2).winner.sequence).toBe("stay home");
    expect(beamSearch(2).winner.score).toBeCloseTo(0.36, 12);
    expect(beamSearch(2).kept).toHaveLength(2);
    expect(
      beamSearch(2).candidates.reduce((sum, row) => sum + row.score, 0),
    ).toBeCloseTo(1);
  });

  it("counts two vectors per KV head and distinguishes byte precision from query heads", () => {
    expect(kvCacheSize(16, 2, 2)).toEqual({
      bytesPerToken: 512,
      bytes: 8192,
      kibibytes: 8,
    });
    expect(kvCacheSize(32, 2, 2).bytes).toBe(16384);
    expect(kvCacheSize(16, 8, 2).bytes).toBe(32768);
    expect(kvCacheSize(16, 2, 1).bytes).toBe(4096);
    expect(kvCacheSize(0, 2, 2).bytes).toBe(0);
    expect(kvCacheSize(17, 2, 2).bytes - kvCacheSize(16, 2, 2).bytes).toBe(512);
  });

  it("recomputes each quadratic gradient and changes the rate only after the common first update", () => {
    const constant = learningRateTrace(0.8, "constant", 2);
    const decay = learningRateTrace(0.8, "decay", 2);
    expect(constant[1].weight).toBeCloseTo(-2.4, 12);
    expect(decay[1]).toEqual(constant[1]);
    expect(constant[2].weight).toBeCloseTo(1.44, 12);
    expect(decay[2].weight).toBeCloseTo(-0.48, 12);
    expect(decay[2].loss).toBeCloseTo(0.2304, 12);
    expect(constant[2].loss).toBeCloseTo(2.0736, 12);
    expect(learningRateTrace(0.2, "constant", 2)[2].loss).toBeLessThan(
      learningRateTrace(0.2, "decay", 2)[2].loss,
    );
    expect(learningRateTrace(1.2, "constant", 6)[6].loss).toBeGreaterThan(16);
    expect(
      learningRateTrace(0, "decay", 6).every((row) => row.weight === 4),
    ).toBe(true);
    expect(learningRateTrace(0.5, "constant", 6)[6].loss).toBe(0);
  });

  it("rejects nonfinite values, fractional counts, and unbounded restored settings", () => {
    expect(() => kMeansStep([], [1, 2])).toThrow(RangeError);
    expect(() => kMeansStep([NaN], [1, 2])).toThrow(RangeError);
    for (const width of [0, 1.5, 3, Infinity])
      expect(() => beamSearch(width)).toThrow(RangeError);
    for (const tokens of [-1, 1.5, 145, NaN])
      expect(() => kvCacheSize(tokens, 2, 2)).toThrow(RangeError);
    expect(() => kvCacheSize(16, 16, 2)).toThrow(RangeError);
    expect(() => kvCacheSize(16, 2, 4)).toThrow(RangeError);
    for (const rate of [-1, 1.21, NaN, Infinity])
      expect(() => learningRateTrace(rate, "decay", 2)).toThrow(RangeError);
    expect(() => learningRateTrace(0.8, "constant", 7)).toThrow(RangeError);
  });
});
