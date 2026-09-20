/** Inspectable toy mechanisms. These calculations do not run a trained model. */
export const clusterPoints = [1, 2, 4, 8, 9, 10] as const;

export function kMeansStep(
  points: readonly number[],
  centers: readonly [number, number],
) {
  if (
    !points.length ||
    points.length > 100 ||
    [...points, ...centers].some(
      (n) => !Number.isFinite(n) || Math.abs(n) > 100,
    )
  )
    throw new RangeError("Use one to 100 finite points and bounded centers.");
  // Equal distances go to A so the worked example is reproducible.
  const assignments = points.map((point) =>
    Math.abs(point - centers[0]) <= Math.abs(point - centers[1]) ? 0 : 1,
  );
  const groups = centers.map((_, index) =>
    points.filter((_, i) => assignments[i] === index),
  );
  // An empty group keeps its center; there is no mean to compute.
  const updated = groups.map((group, index) =>
    group.length
      ? group.reduce((sum, point) => sum + point, 0) / group.length
      : centers[index],
  );
  const squaredDistance = (positions: readonly number[]) =>
    points.reduce(
      (sum, point, i) => sum + (point - positions[assignments[i]]) ** 2,
      0,
    );
  return {
    assignments,
    groups,
    updated,
    before: squaredDistance(centers),
    after: squaredDistance(updated),
  };
}

export const beamBranches = [
  {
    token: "go",
    probability: 0.6,
    next: [
      { token: "home", probability: 0.5 },
      { token: "here", probability: 0.5 },
    ],
  },
  {
    token: "stay",
    probability: 0.4,
    next: [
      { token: "home", probability: 0.9 },
      { token: "here", probability: 0.1 },
    ],
  },
] as const;

/** All candidates have exactly two tokens. Ties retain their listed order. */
export function beamSearch(width: number) {
  if (width !== 1 && width !== 2)
    throw new RangeError("This tree supports beam widths one and two.");
  const retained = beamBranches.slice(0, width);
  const candidates = retained
    .flatMap((branch) =>
      branch.next.map((next) => ({
        sequence: `${branch.token} ${next.token}`,
        first: branch.probability,
        second: next.probability,
        score: branch.probability * next.probability,
      })),
    )
    .sort((a, b) => b.score - a.score);
  return {
    prefixes: retained.map((branch) => branch.token),
    candidates,
    kept: candidates.slice(0, width),
    winner: candidates[0],
  };
}

export const cacheConfiguration = {
  batch: 1,
  layers: 4,
  headDimension: 16,
} as const;

/** Dense, uncompressed cache payload only; excludes allocator and model memory. */
export function kvCacheSize(
  tokens: number,
  kvHeads: number,
  bytesPerValue: number,
) {
  if (
    !Number.isInteger(tokens) ||
    tokens < 0 ||
    tokens > 144 ||
    ![2, 4, 8].includes(kvHeads) ||
    ![1, 2].includes(bytesPerValue)
  )
    throw new RangeError(
      "Use the toy cache's bounded token, head, and precision settings.",
    );
  const bytesPerToken =
    2 *
    cacheConfiguration.batch *
    cacheConfiguration.layers *
    kvHeads *
    cacheConfiguration.headDimension *
    bytesPerValue;
  const bytes = tokens * bytesPerToken;
  return { bytesPerToken, bytes, kibibytes: bytes / 1024 };
}

/** Plain gradient descent on L(w)=w²; decay uses eta(t)=eta(0)/(t+1). */
export function learningRateTrace(
  rate: number,
  schedule: "constant" | "decay",
  steps: number,
) {
  if (
    !Number.isFinite(rate) ||
    rate < 0 ||
    rate > 1.2 ||
    !Number.isInteger(steps) ||
    steps < 0 ||
    steps > 6 ||
    !["constant", "decay"].includes(schedule)
  )
    throw new RangeError(
      "Use a learning rate from zero to 1.2 and at most six steps.",
    );
  let weight = 4;
  const rows = [
    { step: 0, weight, loss: weight * weight, rate: 0, gradient: 0 },
  ];
  for (let step = 1; step <= steps; step++) {
    const appliedRate = schedule === "constant" ? rate : rate / step;
    const gradient = 2 * weight;
    weight -= appliedRate * gradient;
    rows.push({
      step,
      weight,
      loss: weight * weight,
      rate: appliedRate,
      gradient,
    });
  }
  return rows;
}
