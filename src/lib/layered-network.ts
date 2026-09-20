import { visualChoice, visualNumber, type VisualValues } from "./visual-state";

export const layeredUnitIds = [
  "x1",
  "x2",
  "a",
  "b",
  "c",
  "d",
  "e",
  "y",
] as const;
export type LayeredUnitId = (typeof layeredUnitIds)[number];

export const layeredDefaults = {
  x1: 1,
  x2: 2,
  weight: 1,
  step: 0,
  unit: "x1" as LayeredUnitId,
};

/** Persist controls only; derive all results from the hand-authored fixture. */
export function layeredControls(values: VisualValues = {}) {
  return {
    x1: visualNumber(values, "x1", layeredDefaults.x1, -2, 3),
    x2: visualNumber(values, "x2", layeredDefaults.x2, -2, 3),
    weight: visualNumber(values, "weight", layeredDefaults.weight, -2, 2),
    step: visualNumber(values, "step", layeredDefaults.step, 0, 3, true),
    unit: visualChoice(values, "unit", layeredUnitIds, layeredDefaults.unit),
  };
}

export interface LayeredEdge {
  id: string;
  source: LayeredUnitId;
  target: LayeredUnitId;
  input: number;
  weight: number;
  contribution: number;
}

export interface LayeredUnit {
  id: LayeredUnitId;
  label: string;
  layer: number;
  activation: "input" | "relu" | "linear";
  bias: number;
  sum: number;
  value: number;
  incoming: LayeredEdge[];
}

/**
 * A deliberately tiny 2 → 3 → 2 → 1 feedforward network, not a trained model.
 * Hidden units use ReLU. The output retains its weighted sum (linear output).
 * Only the X1 → A weight varies; all other weights and biases stay fixed.
 */
export function layeredNetworkTrace(x1: number, x2: number, firstWeight = 1) {
  if (![x1, x2, firstWeight].every(Number.isFinite)) {
    throw new Error("Network inputs and weight must be finite numbers");
  }
  const byId = {} as Record<LayeredUnitId, LayeredUnit>;
  const units: LayeredUnit[] = [];
  const edges: LayeredEdge[] = [];

  function input(id: "x1" | "x2", value: number) {
    const unit: LayeredUnit = {
      id,
      label: id.toUpperCase(),
      layer: 0,
      activation: "input",
      bias: 0,
      sum: value,
      value,
      incoming: [],
    };
    byId[id] = unit;
    units.push(unit);
  }

  function calculate(
    id: LayeredUnitId,
    layer: number,
    bias: number,
    weights: [LayeredUnitId, number][],
    activation: "relu" | "linear" = "relu",
  ) {
    const incoming = weights.map(([source, weight]): LayeredEdge => ({
      id: `${source}-${id}`,
      source,
      target: id,
      input: byId[source].value,
      weight,
      contribution: byId[source].value * weight,
    }));
    const sum = incoming.reduce(
      (total, edge) => total + edge.contribution,
      bias,
    );
    const unit: LayeredUnit = {
      id,
      label: id.toUpperCase(),
      layer,
      activation,
      bias,
      sum,
      value: activation === "relu" ? Math.max(0, sum) : sum,
      incoming,
    };
    byId[id] = unit;
    units.push(unit);
    edges.push(...incoming);
  }

  input("x1", x1);
  input("x2", x2);
  calculate("a", 1, -0.5, [
    ["x1", firstWeight],
    ["x2", 0.5],
  ]);
  calculate("b", 1, 0, [
    ["x1", -1],
    ["x2", 1],
  ]);
  calculate("c", 1, 0.5, [
    ["x1", 0.5],
    ["x2", -1],
  ]);
  calculate("d", 2, -1, [
    ["a", 1],
    ["b", 1],
    ["c", -1],
  ]);
  calculate("e", 2, 0.5, [
    ["a", -0.5],
    ["b", 1],
    ["c", 1],
  ]);
  calculate(
    "y",
    3,
    0.25,
    [
      ["d", 1],
      ["e", -1],
    ],
    "linear",
  );

  return { units, byId, edges, output: byId.y.value };
}

/** Round display only, preserving exact intermediate values for calculation. */
export function layeredNumber(value: number): string {
  return String(Number(value.toFixed(4)));
}
