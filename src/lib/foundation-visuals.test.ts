import { describe, expect, it } from "vitest";
import {
  compareSnackWeights,
  defaultSplitAssignments,
  inspectSplit,
  networkTrace,
} from "./foundation-visuals";

describe("foundational visual experiments", () => {
  it("traces weighted sums, biases, ReLU, and the final output separately", () => {
    expect(networkTrace(2)).toEqual({
      firstSum: 3,
      secondSum: 1,
      firstHidden: 3,
      secondHidden: 1,
      output: 6,
    });
    expect(networkTrace(0)).toEqual({
      firstSum: -1,
      secondSum: 3,
      firstHidden: 0,
      secondHidden: 3,
      output: 7,
    });
    expect(networkTrace(3)).toEqual({
      firstSum: 5,
      secondSum: 0,
      firstHidden: 5,
      secondHidden: 0,
      output: 6,
    });
    expect(networkTrace(5)).toEqual({
      firstSum: 9,
      secondSum: -2,
      firstHidden: 9,
      secondHidden: 0,
      output: 10,
    });
  });
  it("detects source leakage even when partition sizes look balanced", () => {
    const split = inspectSplit(defaultSplitAssignments);
    expect(split.counts).toEqual({ train: 2, validation: 2, test: 2 });
    expect(split.crossings.map((crossing) => crossing.source)).toEqual([
      "A",
      "B",
      "C",
    ]);
    expect(split.solved).toBe(false);
  });
  it("accepts intact source groups only when all three partitions have examples", () => {
    expect(
      inspectSplit({
        a1: "train",
        a2: "train",
        b1: "validation",
        b2: "validation",
        c1: "test",
        c2: "test",
      }).solved,
    ).toBe(true);
    const empty = inspectSplit({
      a1: "train",
      a2: "train",
      b1: "train",
      b2: "train",
      c1: "test",
      c2: "test",
    });
    expect(empty.crossings).toEqual([]);
    expect(empty.empty).toEqual(["validation"]);
    expect(empty.solved).toBe(false);
  });
  it("chooses the matching snack rule using both examples, without changing the examples", () => {
    expect(compareSnackWeights()).toEqual([
      { weight: 2, predictions: [4, 6], totalMiss: 5 },
      { weight: 3, predictions: [6, 9], totalMiss: 0 },
    ]);
  });
});
