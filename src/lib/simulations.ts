export interface DescentRow {
  step: number;
  weight: number;
  prediction: number;
  loss: number;
  gradient: number;
}
export function descent(
  rate = 0.1,
  initialWeight = 0,
  steps = 3,
  x = 2,
  target = 6,
): DescentRow[] {
  if (
    ![rate, initialWeight, steps, x, target].every(Number.isFinite) ||
    rate < 0 ||
    rate > 0.3 ||
    steps < 0 ||
    steps > 12 ||
    !Number.isInteger(steps)
  )
    throw new Error("Invalid simulation parameters");
  let weight = initialWeight;
  const rows: DescentRow[] = [];
  for (let step = 0; step <= steps; step++) {
    const prediction = weight * x;
    const loss = (prediction - target) ** 2;
    const gradient = 2 * x * (prediction - target);
    if (
      ![weight, prediction, loss, gradient].every(
        (v) => Number.isFinite(v) && Math.abs(v) <= 1_000_000,
      )
    )
      throw new Error(
        "This run exceeds the toy simulation range. Reset with a smaller rate.",
      );
    rows.push({ step, weight, prediction, loss, gradient });
    weight -= rate * gradient;
  }
  return rows;
}
export function expertMixture(scores: number[], k: number) {
  if (
    scores.length !== 4 ||
    scores.some((s) => !Number.isFinite(s) || s < 0) ||
    ![1, 2, 3, 4].includes(k) ||
    scores.every((s) => s === 0)
  )
    throw new Error(
      "Provide four nonnegative routing scores and at least one positive value.",
    );
  const outputs = [
    [2, 0],
    [0, 4],
    [-1, 1],
    [3, -2],
  ];
  const selected = scores
    .map((score, id) => ({ id, score }))
    .sort((a, b) => b.score - a.score || a.id - b.id)
    .slice(0, k);
  const sum = selected.reduce((total, x) => total + x.score, 0);
  const weights = selected.map((x) => ({
    ...x,
    weight: x.score / sum,
    output: outputs[x.id],
  }));
  return {
    weights,
    output: [0, 1].map((d) =>
      weights.reduce((v, e) => v + e.weight * e.output[d], 0),
    ),
  };
}
export const fmt = (value: number) =>
  Number(value.toFixed(6)).toLocaleString("en-US", {
    maximumFractionDigits: 6,
  });

export function attentionMix(query: readonly number[], causal: boolean) {
  if (
    query.length !== 2 ||
    query.some((n) => !Number.isFinite(n) || Math.abs(n) > 100)
  )
    throw new Error("Use a finite two-coordinate query within the toy range.");
  const keys = [
    [1, 0],
    [0, 1],
    [1, 1],
  ];
  const values = [
    [4, 0],
    [0, 4],
    [4, 4],
  ];
  const scores = keys.map((key) => query[0] * key[0] + query[1] * key[1]);
  const scaled = scores.map((n) => n / Math.sqrt(2));
  const allowed = keys.map((_, index) => !causal || index <= 1);
  const max = Math.max(...scaled.filter((_, index) => allowed[index]));
  const exponentials = scaled.map((score, index) =>
    allowed[index] ? Math.exp(score - max) : 0,
  );
  const sum = exponentials.reduce((a, b) => a + b, 0);
  const rows = keys.map((key, index) => ({
    id: index + 1,
    key,
    value: values[index],
    score: scores[index],
    scaled: scaled[index],
    allowed: allowed[index],
    weight: exponentials[index] / sum,
  }));
  const output = [0, 1].map((d) =>
    rows.reduce((total, row) => total + row.weight * row.value[d], 0),
  );
  return { rows, output };
}
