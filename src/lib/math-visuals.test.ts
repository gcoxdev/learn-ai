import { describe, expect, it } from "vitest";
import {
  chainTrace,
  lineFit,
  parameterTrajectory,
  squareSlope,
} from "./math-visuals";

describe("visual mathematics", () => {
  it("separates the two-point slope from the derivative, including negative and zero slopes", () => {
    expect(squareSlope(2, 0.5)).toEqual({
      x: 2,
      h: 0.5,
      start: 4,
      end: 6.25,
      rise: 2.25,
      secant: 4.5,
      derivative: 4,
    });
    expect(squareSlope(-2, 0.5).secant).toBe(-3.5);
    expect(squareSlope(-2, 0.5).derivative).toBe(-4);
    expect(squareSlope(0, 0.1).derivative).toBe(0);
    expect(squareSlope(0, 0.1).secant).toBe(0.1);
    expect(Math.abs(squareSlope(2, 0.01).secant - 4)).toBeLessThan(
      Math.abs(squareSlope(2, 0.5).secant - 4),
    );
  });

  it("matches chain-rule factors to an independent central difference", () => {
    const fixture = chainTrace(1);
    expect(fixture).toMatchObject({
      prediction: 2,
      residual: -4,
      loss: 16,
      lossToResidual: -8,
      residualToPrediction: 1,
      predictionToWeight: 2,
      gradient: -16,
    });
    for (const weight of [-2, 0, 1, 3, 4]) {
      const epsilon = 0.00001;
      const numerical =
        (((weight + epsilon) * 2 - 6) ** 2 -
          ((weight - epsilon) * 2 - 6) ** 2) /
        (2 * epsilon);
      expect(chainTrace(weight).gradient).toBeCloseTo(numerical, 7);
    }
    expect(chainTrace(3).gradient).toBe(0);
  });

  it("shifts every prediction equally with bias and changes predictions by x times the weight adjustment", () => {
    const start = lineFit(1, 0);
    const shifted = lineFit(1, 2);
    const tilted = lineFit(2, 0);
    expect(start.rows.map((row) => row.prediction)).toEqual([0, 1, 2]);
    expect(
      shifted.rows.map((row, i) => row.prediction - start.rows[i].prediction),
    ).toEqual([2, 2, 2]);
    expect(
      tilted.rows.map((row, i) => row.prediction - start.rows[i].prediction),
    ).toEqual([0, 1, 2]);
    expect(lineFit(2, 1).loss).toBe(0);
  });

  it("calculates mean squared error, not total error, and its two partial derivatives", () => {
    const start = lineFit(0, 0);
    expect(start.rows.map((row) => row.squaredError)).toEqual([1, 9, 25]);
    expect(start.loss).toBeCloseTo(35 / 3, 12);
    expect(start.weightGradient).toBeCloseTo(-26 / 3, 12);
    expect(start.biasGradient).toBe(-6);
    for (const [weight, bias] of [
      [-1, 2],
      [1.5, -0.5],
      [2, 1],
    ]) {
      const epsilon = 0.00001;
      const directLoss = (w: number, b: number) =>
        ((b - 1) ** 2 + (w + b - 3) ** 2 + (2 * w + b - 5) ** 2) / 3;
      const fit = lineFit(weight, bias);
      expect(fit.weightGradient).toBeCloseTo(
        (directLoss(weight + epsilon, bias) -
          directLoss(weight - epsilon, bias)) /
          (2 * epsilon),
        7,
      );
      expect(fit.biasGradient).toBeCloseTo(
        (directLoss(weight, bias + epsilon) -
          directLoss(weight, bias - epsilon)) /
          (2 * epsilon),
        7,
      );
    }
  });

  it("updates both parameters from the same old values and lowers this toy loss", () => {
    const rows = parameterTrajectory(0, 0, 0.1, 1);
    expect(rows[1].weight).toBeCloseTo(13 / 15, 12);
    expect(rows[1].bias).toBeCloseTo(3 / 5, 12);
    expect(rows[1].loss).toBeCloseTo(433 / 135, 12);
    expect(rows[1].loss).toBeLessThan(rows[0].loss);
    // Sequentially recomputing the bias derivative would yield a different value.
    expect(rows[1].bias).not.toBeCloseTo(0.4266666667, 6);
    for (const rate of [0.01, 0.1, 0.3]) {
      const run = parameterTrajectory(-2, -3, rate, 16);
      expect(run).toHaveLength(17);
      for (let i = 1; i < run.length; i++)
        expect(run[i].loss).toBeLessThanOrEqual(run[i - 1].loss + 1e-12);
    }
    expect(parameterTrajectory(1, 1, 0, 2).map((row) => row.weight)).toEqual([
      1, 1, 1,
    ]);
  });

  it("does not divide by zero or execute unbounded restored values", () => {
    for (const h of [0, -1, NaN, Infinity])
      expect(() => squareSlope(1, h)).toThrow(RangeError);
    expect(() => lineFit(Infinity, 0)).toThrow(RangeError);
    expect(() => chainTrace(NaN)).toThrow(RangeError);
    for (const steps of [-1, 1.5, 17, Infinity])
      expect(() => parameterTrajectory(0, 0, 0.1, steps)).toThrow(RangeError);
    expect(() => parameterTrajectory(0, 0, -1, 1)).toThrow(RangeError);
    expect(() => parameterTrajectory(0, 0, 0.31, 1)).toThrow(RangeError);
    expect(() => parameterTrajectory(10, 0, 0.1, 1)).toThrow(RangeError);
  });
});
