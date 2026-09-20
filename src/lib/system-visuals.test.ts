import { describe, expect, it } from "vitest";
import {
  audioWindowSeconds,
  changedVideoFrame,
  encodeToyWord,
  mergeTokenPair,
  robotStep,
  sineAt,
  sinePoints,
  tokenizerAfterMerges,
  tokenizerCorpus,
  tokenPairs,
  tokenTotal,
  videoFrame,
  visualDecimal,
} from "./system-visuals";

describe("tokenizer visual", () => {
  it("counts all copies and never counts across word boundaries", () => {
    expect(
      tokenPairs(tokenizerCorpus).map(({ key, count }) => [key, count]),
    ).toEqual([
      ["c+a", 3],
      ["a+t", 2],
      ["a+p", 1],
    ]);
    expect(tokenTotal(tokenizerAfterMerges(0))).toBe(9);
    expect(tokenizerAfterMerges(1).map((w) => w.pieces)).toEqual([
      ["ca", "t"],
      ["ca", "p"],
    ]);
    expect(tokenTotal(tokenizerAfterMerges(1))).toBe(6);
    expect(
      tokenPairs(tokenizerAfterMerges(1)).map(({ key, count }) => [key, count]),
    ).toEqual([
      ["ca+t", 2],
      ["ca+p", 1],
    ]);
    expect(tokenTotal(tokenizerAfterMerges(2))).toBe(4);
    expect(tokenizerCorpus[0].pieces).toEqual(["c", "a", "t"]);
  });
  it("encodes with frozen learned rules, preserving word spelling", () => {
    expect(encodeToyWord("cat", 2)).toEqual(["cat"]);
    expect(encodeToyWord("cap", 2)).toEqual(["ca", "p"]);
    for (const word of ["cat", "cap"] as const)
      for (const steps of [0, 1, 2])
        expect(encodeToyWord(word, steps).join("")).toBe(word);
  });
  it("breaks tied counts deterministically and merges overlapping pairs only once", () => {
    expect(
      tokenPairs([{ word: "aba", count: 1, pieces: ["a", "b", "a"] }]).map(
        (p) => p.key,
      ),
    ).toEqual(["a+b", "b+a"]);
    expect(
      mergeTokenPair(
        [{ word: "aaa", count: 1, pieces: ["a", "a", "a"] }],
        "a",
        "a",
      )[0].pieces,
    ).toEqual(["aa", "a"]);
    expect(() => tokenizerAfterMerges(3)).toThrow(RangeError);
  });
});
describe("video continuity visual", () => {
  it("changes identity in only frame 4 while keeping motion fixed", () => {
    for (let i = 0; i < 6; i++) {
      expect(videoFrame(i, false).shape).toBe("circle");
      expect(videoFrame(i, true).x).toBe(24 + 16 * i);
      expect(videoFrame(i, true).shape).toBe(
        i === changedVideoFrame ? "triangle" : "circle",
      );
    }
    expect(() => videoFrame(6, true)).toThrow(RangeError);
  });
});
describe("audio oscillator visual", () => {
  it("draws the oscillator equation over the same fixed ten-millisecond window", () => {
    expect(sineAt(440, 0)).toBe(0);
    expect(sineAt(440, 1 / (4 * 440))).toBeCloseTo(1, 12);
    expect(sineAt(440, 3 / (4 * 440))).toBeCloseTo(-1, 12);
    expect(sineAt(880, 1 / (4 * 440))).toBeCloseTo(0, 12);
    const points = sinePoints(440);
    expect(points).toHaveLength(401);
    expect(points.at(-1)?.t).toBe(audioWindowSeconds);
    expect(points.at(-1)?.y).toBeCloseTo(Math.sin(8.8 * Math.PI), 12);
    expect(sinePoints(880).at(-1)?.t).toBe(audioWindowSeconds);
    expect(() => sineAt(Infinity, 0)).toThrow(RangeError);
    expect(() => sinePoints(440, 1)).toThrow(RangeError);
  });
});
describe("robot control visual", () => {
  it("reproduces the project's exact three-step trace", () => {
    let position = 0;
    const trace = [];
    for (let i = 0; i < 3; i++) {
      position = robotStep(position, position, 2, 0.5).next;
      trace.push(position);
    }
    expect(trace).toEqual([1, 1.5, 1.75]);
    expect(trace.map(visualDecimal).join(" → ")).toBe("1 → 1.5 → 1.75");
  });
  it("uses the observation for the command and true position for motion", () => {
    expect(robotStep(1, 0, 2, 0.5)).toEqual({
      error: 2,
      rawCommand: 1,
      command: 1,
      next: 2,
    });
    expect(robotStep(1, 1, 2, 0.5).next).toBe(1.5);
    expect(robotStep(2, 3, 0, 0.5)).toEqual({
      error: -3,
      rawCommand: -1.5,
      command: -1,
      next: 1,
    });
  });
  it("clips both signs, holds at zero error, and rejects non-finite inputs", () => {
    expect(robotStep(0, 0, 3, 1.5).command).toBe(1);
    expect(robotStep(0, 0, -3, 1.5).command).toBe(-1);
    expect(robotStep(2, 2, 2, 1.5)).toEqual({
      error: 0,
      rawCommand: 0,
      command: 0,
      next: 2,
    });
    expect(robotStep(0, 0, 2, 0).next).toBe(0);
    for (const bad of [NaN, Infinity])
      expect(() => robotStep(bad, 0, 2, 0.5)).toThrow(RangeError);
    expect(() => robotStep(0, 0, 2, -1)).toThrow(RangeError);
  });
});
