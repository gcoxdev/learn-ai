import { describe, expect, it } from "vitest";
import {
  detectorCounts,
  thresholdCounts,
  slideFilter,
} from "./decision-visuals";

describe("detector counts and conditional direction", () => {
  it("reproduces the 10,000-part example and separates sensitivity from precision", () => {
    const r = detectorCounts(1, 90, 5);
    expect(r).toMatchObject({
      defective: 100,
      good: 9900,
      truePositive: 90,
      falsePositive: 495,
      flagged: 585,
      missed: 10,
      correctRejections: 9405,
    });
    expect(r.posterior).toBeCloseTo(2 / 13, 12);
    expect(detectorCounts(10, 90, 5).posterior).toBeCloseTo(2 / 3, 12);
  });
  it("keeps impossible conditioning undefined and conserves all cases", () => {
    expect(detectorCounts(0, 90, 0).posterior).toBeNull();
    expect(detectorCounts(100, 90, 5).posterior).toBe(1);
    for (const prevalence of [0, 1, 17, 50, 100]) {
      const r = detectorCounts(prevalence, 83, 7);
      expect(
        r.truePositive + r.falsePositive + r.missed + r.correctRejections,
      ).toBeCloseTo(10000);
    }
    expect(() => detectorCounts(-1, 90, 5)).toThrow(RangeError);
  });
});

describe("score thresholds", () => {
  it("counts errors at the inclusive boundary, before and after lowering the threshold", () => {
    expect(thresholdCounts(60)).toMatchObject({
      tp: 3,
      fp: 1,
      fn: 1,
      tn: 3,
      precision: 0.75,
      recall: 0.75,
      accuracy: 0.75,
    });
    expect(thresholdCounts(61)).toMatchObject({ tp: 2, fp: 1, fn: 2, tn: 3 });
    expect(thresholdCounts(30)).toMatchObject({
      tp: 4,
      fp: 2,
      fn: 0,
      tn: 2,
      precision: 2 / 3,
      recall: 1,
    });
    expect(thresholdCounts(100)).toMatchObject({
      tp: 0,
      fp: 0,
      fn: 4,
      tn: 4,
      precision: null,
      recall: 0,
    });
  });
  it("never loses a flagged case when the threshold decreases", () => {
    let found = 0,
      falseAlarms = 0;
    for (let threshold = 100; threshold >= 0; threshold--) {
      const r = thresholdCounts(threshold);
      expect(r.tp).toBeGreaterThanOrEqual(found);
      expect(r.fp).toBeGreaterThanOrEqual(falseAlarms);
      expect(r.tp + r.fp + r.fn + r.tn).toBe(8);
      found = r.tp;
      falseAlarms = r.fp;
    }
  });
});

describe("sliding a shared filter", () => {
  it("agrees with hand calculations including negative weights and boundaries", () => {
    expect(
      slideFilter([2, 5, 4], [1, -1], 1, 0).windows.map((w) => w.sum),
    ).toEqual([-3, 1]);
    expect(
      slideFilter([2, 5, 4], [1, -1], 1, 1).windows.map((w) => w.sum),
    ).toEqual([-2, -3, 1, 4]);
    expect(
      slideFilter([2, 5, 4], [1, -1], 2, 1).windows.map((w) => w.sum),
    ).toEqual([-2, 1]);
    expect(
      slideFilter([2, 5, 4], [0.5, 0.5], 1, 0).windows.map((w) => w.sum),
    ).toEqual([3.5, 4.5]);
    expect(
      slideFilter([2, 5, 4], [0, 0], 1, 0).windows.map((w) => w.sum),
    ).toEqual([0, 0]);
    expect(slideFilter([2], [1, -1], 1, 0).windows).toEqual([]);
    expect(() => slideFilter([2], [1], 0, 0)).toThrow(RangeError);
  });
});
