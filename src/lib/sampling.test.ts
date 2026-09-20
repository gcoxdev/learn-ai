import { describe, expect, it } from "vitest";
import {
  sampleFromDistribution,
  samplingCounts,
  samplingDistribution,
  samplingScores,
} from "./sampling";

describe("sampling experiment", () => {
  it("turns the synthetic scores into normalized softmax probabilities", () => {
    const probabilities = samplingDistribution(samplingScores, 1, 3);
    expect(probabilities[0]).toBeCloseTo(0.6652409558, 9);
    expect(probabilities[1]).toBeCloseTo(0.2447284711, 9);
    expect(probabilities[2]).toBeCloseTo(0.0900305732, 9);
    expect(probabilities.reduce((sum, p) => sum + p, 0)).toBeCloseTo(1, 14);
    expect(samplingDistribution([1002, 1001, 1000], 1, 3)).toEqual(
      probabilities,
    );
  });

  it("temperature changes the distribution while the same draw can change choice", () => {
    const cool = samplingDistribution(samplingScores, 0.5, 3);
    const warm = samplingDistribution(samplingScores, 2, 3);
    expect(cool[0]).toBeCloseTo(0.8668133322, 9);
    expect(warm[0]).toBeCloseTo(0.5064803911, 9);
    expect(sampleFromDistribution(cool, 0.75)).toBe(0);
    expect(sampleFromDistribution(warm, 0.75)).toBe(1);
  });

  it("keeps only top-k candidates, then renormalizes without reordering them", () => {
    const probabilities = samplingDistribution([0, 2, 1], 1, 2);
    expect(probabilities[0]).toBe(0);
    expect(probabilities[1]).toBeCloseTo(0.7310585786, 9);
    expect(probabilities[2]).toBeCloseTo(0.2689414214, 9);
    expect(samplingDistribution(samplingScores, 2, 1)).toEqual([1, 0, 0]);
    expect(sampleFromDistribution(probabilities, 0)).toBe(1);
    expect(sampleFromDistribution(probabilities, 0.99)).toBe(2);
  });

  it("a new draw changes the pick, not the probabilities", () => {
    const probabilities = samplingDistribution(samplingScores, 1, 3);
    const before = [...probabilities];
    expect(sampleFromDistribution(probabilities, 0)).toBe(0);
    expect(sampleFromDistribution(probabilities, 0.75)).toBe(1);
    expect(sampleFromDistribution(probabilities, 0.99)).toBe(2);
    expect(probabilities).toEqual(before);
  });

  it("uses half-open draw intervals and never selects a zero-probability candidate", () => {
    expect(sampleFromDistribution([0.5, 0, 0.5], 0.5)).toBe(2);
    expect(sampleFromDistribution([0, 1, 0], 0)).toBe(1);
    expect(sampleFromDistribution([0, 1, 0], 1 - Number.EPSILON)).toBe(1);
  });

  it("counts exactly 100 fixed, evenly spaced draws reproducibly", () => {
    const probabilities = samplingDistribution(samplingScores, 1, 3);
    expect(samplingCounts(probabilities)).toEqual([67, 24, 9]);
    expect(samplingCounts(probabilities)).toEqual(
      samplingCounts(probabilities),
    );
    expect(samplingCounts([1, 0, 0])).toEqual([100, 0, 0]);
    expect(samplingCounts([0.2, 0.3, 0.5])).toEqual([20, 30, 50]);
  });

  it("handles tied scores and extreme finite temperatures without NaN", () => {
    expect(samplingDistribution([2, 2, 0], 1, 1)).toEqual([1, 0, 0]);
    expect(samplingDistribution(samplingScores, Number.MIN_VALUE, 3)).toEqual([
      1, 0, 0,
    ]);
    for (const probability of samplingDistribution(samplingScores, 1e100, 3))
      expect(probability).toBeCloseTo(1 / 3, 14);
  });

  it("rejects invalid controls and distributions explicitly", () => {
    for (const temperature of [0, -1, Infinity, NaN])
      expect(() =>
        samplingDistribution(samplingScores, temperature, 3),
      ).toThrow(RangeError);
    for (const topK of [0, 4, 1.5, NaN])
      expect(() => samplingDistribution(samplingScores, 1, topK)).toThrow(
        RangeError,
      );
    for (const draw of [-0.1, 1, Infinity, NaN])
      expect(() => sampleFromDistribution([1], draw)).toThrow(RangeError);
    for (const scores of [[], [NaN], [Infinity]])
      expect(() => samplingDistribution(scores, 1, 1)).toThrow(RangeError);
    for (const probabilities of [[], [0], [0.5], [-1, 2], [NaN]])
      expect(() => sampleFromDistribution(probabilities, 0.5)).toThrow(
        RangeError,
      );
    expect(() => samplingCounts([1], 0)).toThrow(RangeError);
  });
});
