/** Expected counts under a stated detector model, not a random simulation. */
export function detectorCounts(
  prevalence: number,
  sensitivity: number,
  falseAlarm: number,
) {
  for (const n of [prevalence, sensitivity, falseAlarm]) {
    if (!Number.isFinite(n) || n < 0 || n > 100)
      throw new RangeError("Use percentages from 0 to 100");
  }
  const defective = 100 * prevalence;
  const good = 10000 - defective;
  const truePositive = (defective * sensitivity) / 100;
  const falsePositive = (good * falseAlarm) / 100;
  const flagged = truePositive + falsePositive;
  return {
    defective,
    good,
    truePositive,
    falsePositive,
    flagged,
    missed: defective - truePositive,
    correctRejections: good - falsePositive,
    posterior: flagged === 0 ? null : truePositive / flagged,
  };
}

/** Invented held-out scores; scores are rankings, not calibrated probabilities. */
export const scoredParts = [
  { id: "A", score: 95, defective: true },
  { id: "B", score: 85, defective: false },
  { id: "C", score: 75, defective: true },
  { id: "D", score: 60, defective: true },
  { id: "E", score: 45, defective: false },
  { id: "F", score: 30, defective: true },
  { id: "G", score: 20, defective: false },
  { id: "H", score: 5, defective: false },
] as const;

export function thresholdCounts(threshold: number) {
  if (!Number.isFinite(threshold) || threshold < 0 || threshold > 100)
    throw new RangeError("Threshold must be from 0 to 100");
  const rows = scoredParts.map((part) => ({
    ...part,
    flagged: part.score >= threshold,
  }));
  const tp = rows.filter((r) => r.flagged && r.defective).length;
  const fp = rows.filter((r) => r.flagged && !r.defective).length;
  const fn = rows.filter((r) => !r.flagged && r.defective).length;
  const tn = rows.filter((r) => !r.flagged && !r.defective).length;
  return {
    rows,
    tp,
    fp,
    fn,
    tn,
    precision: tp + fp ? tp / (tp + fp) : null,
    recall: tp / (tp + fn),
    accuracy: (tp + tn) / rows.length,
  };
}

/** Single-channel, 1-D cross-correlation: no kernel reversal, bias, or activation. */
export function slideFilter(
  input: number[],
  kernel: number[],
  stride: number,
  padding: number,
) {
  if (
    !input.length ||
    !kernel.length ||
    ![...input, ...kernel].every(Number.isFinite) ||
    !Number.isInteger(stride) ||
    stride < 1 ||
    !Number.isInteger(padding) ||
    padding < 0 ||
    padding > 10
  ) {
    throw new RangeError(
      "Use finite arrays, positive integer stride, and padding from 0 to 10",
    );
  }
  const padded = [
    ...Array<number>(padding).fill(0),
    ...input,
    ...Array<number>(padding).fill(0),
  ];
  const windows = [];
  for (let start = 0; start + kernel.length <= padded.length; start += stride) {
    const values = padded.slice(start, start + kernel.length);
    const products = values.map((value, i) => value * kernel[i]);
    windows.push({
      start,
      values,
      products,
      sum: products.reduce((a, b) => a + b, 0),
    });
  }
  return { padded, windows };
}
