/** Synthetic candidate scores, chosen for a small, inspectable experiment. */
export const samplingScores = [2, 1, 0] as const;

export function samplingDistribution(
  scores: readonly number[],
  temperature: number,
  topK: number,
): number[] {
  if (!scores.length || scores.some((score) => !Number.isFinite(score)))
    throw new RangeError("Scores must be a nonempty list of finite numbers.");
  if (!Number.isFinite(temperature) || temperature <= 0)
    throw new RangeError("Temperature must be positive and finite.");
  if (!Number.isInteger(topK) || topK < 1 || topK > scores.length)
    throw new RangeError("Top-k must retain between one and all candidates.");

  const ranked = scores.map((score, index) => ({ score, index }));
  // Ties keep the original candidate order, including at the top-k boundary.
  ranked.sort((a, b) => b.score - a.score || a.index - b.index);
  const retained = new Set(ranked.slice(0, topK).map((item) => item.index));
  const maximum = ranked[0].score;
  // Subtract before dividing: a tiny temperature cannot overflow the maximum.
  const weights = scores.map((score, index) =>
    retained.has(index) ? Math.exp((score - maximum) / temperature) : 0,
  );
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  return weights.map((weight) => weight / total);
}

/** Inverse-CDF sampling: intervals include their lower, not upper, boundary. */
export function sampleFromDistribution(
  probabilities: readonly number[],
  draw: number,
): number {
  const total = probabilities.reduce(
    (sum, probability) => sum + probability,
    0,
  );
  if (
    !probabilities.length ||
    probabilities.some(
      (probability) => !Number.isFinite(probability) || probability < 0,
    ) ||
    Math.abs(total - 1) > 1e-10
  )
    throw new RangeError("Probabilities must be nonnegative and sum to one.");
  if (!Number.isFinite(draw) || draw < 0 || draw >= 1)
    throw new RangeError("The draw must be at least zero and less than one.");

  let cumulative = 0;
  let lastPositive = 0;
  for (let index = 0; index < probabilities.length; index++) {
    if (probabilities[index] > 0) lastPositive = index;
    cumulative += probabilities[index];
    if (draw < cumulative) return index;
  }
  // Protect the last interval against floating-point summation rounding.
  return lastPositive;
}

/** A repeatable coverage comparison, not a sequence of independent random draws. */
export function samplingCounts(
  probabilities: readonly number[],
  count = 100,
): number[] {
  if (!Number.isInteger(count) || count < 1)
    throw new RangeError(
      "The number of comparison draws must be a positive integer.",
    );
  const counts = probabilities.map(() => 0);
  for (let index = 0; index < count; index++) {
    const choice = sampleFromDistribution(probabilities, (index + 0.5) / count);
    counts[choice]++;
  }
  return counts;
}
