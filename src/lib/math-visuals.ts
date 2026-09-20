/** Small, inspectable calculations used by the visual mathematics lessons. */
export const lineExamples = [
  { x: 0, target: 1 },
  { x: 1, target: 3 },
  { x: 2, target: 5 },
] as const;

function finiteBounded(value: number, bound = 10_000): void {
  if (!Number.isFinite(value) || Math.abs(value) > bound)
    throw new RangeError("Use finite values within the toy experiment range.");
}

/** A secant compares two different points; the derivative is a limit at one. */
export function squareSlope(x: number, h: number) {
  finiteBounded(x, 1_000);
  if (!Number.isFinite(h) || h < 0.000001 || h > 1_000)
    throw new RangeError("The comparison distance must be positive.");
  const start = x * x;
  const end = (x + h) ** 2;
  // The expanded expression avoids subtracting nearly equal squares.
  const secant = 2 * x + h;
  return { x, h, start, end, rise: h * secant, secant, derivative: 2 * x };
}

/** The graph is w → p = w × x → residual = p − target → loss = residual². */
export function chainTrace(weight: number, x = 2, target = 6) {
  for (const value of [weight, x, target]) finiteBounded(value, 100);
  const prediction = weight * x;
  const residual = prediction - target;
  const loss = residual * residual;
  const lossToResidual = 2 * residual;
  const residualToPrediction = 1;
  const predictionToWeight = x;
  const gradient = lossToResidual * residualToPrediction * predictionToWeight;
  return {
    weight,
    x,
    target,
    prediction,
    residual,
    loss,
    lossToResidual,
    residualToPrediction,
    predictionToWeight,
    gradient,
  };
}

/** Both partial derivatives use the same current parameters and all three examples. */
export function lineFit(weight: number, bias: number) {
  finiteBounded(weight);
  finiteBounded(bias);
  const rows = lineExamples.map(({ x, target }) => {
    const prediction = weight * x + bias;
    const residual = prediction - target;
    return {
      x,
      target,
      prediction,
      residual,
      squaredError: residual * residual,
    };
  });
  const loss =
    rows.reduce((sum, row) => sum + row.squaredError, 0) / rows.length;
  const weightGradient =
    (2 * rows.reduce((sum, row) => sum + row.residual * row.x, 0)) /
    rows.length;
  const biasGradient =
    (2 * rows.reduce((sum, row) => sum + row.residual, 0)) / rows.length;
  return { weight, bias, rows, loss, weightGradient, biasGradient };
}

export function parameterTrajectory(
  initialWeight: number,
  initialBias: number,
  rate: number,
  steps: number,
) {
  if (
    !Number.isFinite(initialWeight) ||
    initialWeight < -2 ||
    initialWeight > 4 ||
    !Number.isFinite(initialBias) ||
    initialBias < -3 ||
    initialBias > 3 ||
    !Number.isFinite(rate) ||
    rate < 0 ||
    rate > 0.3 ||
    !Number.isInteger(steps) ||
    steps < 0 ||
    steps > 16
  )
    throw new RangeError(
      "Use the experiment's bounded starting values, rate, and step count.",
    );
  let weight = initialWeight;
  let bias = initialBias;
  const rows = [];
  for (let step = 0; step <= steps; step++) {
    const row = lineFit(weight, bias);
    rows.push({ step, ...row });
    // Simultaneous update: neither derivative sees the new parameter values.
    weight = row.weight - rate * row.weightGradient;
    bias = row.bias - rate * row.biasGradient;
  }
  return rows;
}
