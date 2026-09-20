import { describe, expect, it } from "vitest";
import {
  layeredControls,
  layeredDefaults,
  layeredNetworkTrace,
} from "./layered-network";

describe("the layered neural-network fixture", () => {
  it("calculates both hidden layers and the linear output with the default inputs", () => {
    const trace = layeredNetworkTrace(1, 2);
    // Independently: A = 1 + 1 - .5; B = -1 + 2; C = max(0, .5 - 2 + .5).
    // D = 1.5 + 1 - 0 - 1; E = -.75 + 1 + 0 + .5; Y = 1.5 - .75 + .25.
    expect(trace.units.map(({ sum, value }) => [sum, value])).toEqual([
      [1, 1],
      [2, 2],
      [1.5, 1.5],
      [1, 1],
      [-1, 0],
      [1.5, 1.5],
      [0.75, 0.75],
      [1, 1],
    ]);
    expect(trace.edges).toHaveLength(14);
    expect(trace.byId.a.incoming).toEqual([
      {
        id: "x1-a",
        source: "x1",
        target: "a",
        input: 1,
        weight: 1,
        contribution: 1,
      },
      {
        id: "x2-a",
        source: "x2",
        target: "a",
        input: 2,
        weight: 0.5,
        contribution: 1,
      },
    ]);
  });

  it("keeps negative linear outputs and clips only the hidden ReLU sums", () => {
    const trace = layeredNetworkTrace(0, 0);
    expect(trace.units.slice(2).map(({ sum, value }) => [sum, value])).toEqual([
      [-0.5, 0],
      [0, 0],
      [0.5, 0.5],
      [-1.5, 0],
      [1, 1],
      [-0.75, -0.75],
    ]);
    expect(trace.output).toBe(-0.75);
  });

  it("propagates one changed weight downstream while keeping independent units fixed", () => {
    const base = layeredNetworkTrace(1, 2);
    const changed = layeredNetworkTrace(1, 2, -1);
    expect(changed.byId.a.sum).toBe(-0.5);
    expect(changed.byId.a.value).toBe(0);
    expect(changed.byId.b).toEqual(base.byId.b);
    expect(changed.byId.c).toEqual(base.byId.c);
    expect(changed.byId.d.value).toBe(0);
    expect(changed.byId.e.value).toBe(1.5);
    expect(changed.output).toBe(-1.25);
    expect(
      changed.edges
        .filter((edge, i) => edge.weight !== base.edges[i].weight)
        .map((edge) => edge.id),
    ).toEqual(["x1-a"]);
    expect(layeredNetworkTrace(1, 2, 0).output).toBe(-0.5);
    expect(layeredNetworkTrace(1, 2, 2).output).toBe(2.5);
  });

  it("uses both inputs, including negative inputs, in the same forward computation", () => {
    const trace = layeredNetworkTrace(-2, 3);
    expect(trace.units.map((unit) => unit.value)).toEqual([
      -2, 3, 0, 5, 0, 4, 5.5, -1.25,
    ]);
    expect(layeredNetworkTrace(3, -2).units.map((unit) => unit.value)).toEqual([
      3, -2, 1.5, 0, 4, 0, 3.75, -3.5,
    ]);
  });

  it("bounds every restored control and ignores unsupported state", () => {
    expect(layeredControls()).toEqual(layeredDefaults);
    expect(
      layeredControls({
        x1: 99,
        x2: -99,
        weight: -99,
        step: 2.8,
        unit: "unknown",
        output: 999,
      }),
    ).toEqual({ x1: 3, x2: -2, weight: -2, step: 3, unit: "x1" });
    expect(
      layeredControls({
        x1: "2",
        x2: NaN,
        weight: Infinity,
        step: -1,
        unit: "e",
      }),
    ).toEqual({ ...layeredDefaults, unit: "e" });
    expect(() => layeredNetworkTrace(NaN, 1)).toThrow(/finite/);
  });
});
