import { describe, expect, it } from "vitest";
import { curriculum } from "./content";
import { grade } from "./engine";

function verify(slug: string, family: string, rows: Record<string, number>[]) {
  const lesson = curriculum.lessons.find((l) => l.id === slug)!;
  for (const [i, expected] of rows.entries()) {
    const q = lesson.questions.find(
      (q) => q.id === `${slug}.${family}.v2.${i + 1}`,
    )!;
    // Retired variants keep grading exactly as before so saved answers stay valid.
    const responses = { choice: String(q.answers.choice) };
    for (const [field, value] of Object.entries(expected)) {
      expect(q.answers[field]).toBeCloseTo(value, 6);
      Object.assign(responses, { [field]: String(value) });
    }
    expect(grade(q, responses)).toBe(true);
    // A correct final answer must not hide a missing or wrong intermediate step.
    for (const [field, value] of Object.entries(expected)) {
      expect(grade(q, { ...responses, [field]: "" })).toBe(false);
      expect(grade(q, { ...responses, [field]: String(value + 1) })).toBe(
        false,
      );
    }
    const wrongReason = q.options.find((o) => o.id !== q.answers.choice)!;
    expect(grade(q, { ...responses, choice: wrongReason.id })).toBe(false);
  }
  // Every active calculation still requires each intermediate value.
  const active = lesson.questions.filter(
    (q) => !q.retired && q.kind === "structured",
  );
  for (const q of active) {
    const responses: Record<string, string> = {
      choice: String(q.answers.choice),
    };
    for (const f of q.fields) responses[f.id] = String(q.answers[f.id]);
    expect(grade(q, responses)).toBe(true);
    for (const f of q.fields)
      expect(grade(q, { ...responses, [f.id]: "" })).toBe(false);
  }
}

describe("worked curriculum calculations", () => {
  it("keeps products and indexed contributions separate in algebra", () => {
    verify("algebra-notation", "base", [
      { product: 12, output: 14 },
      { product: 10, output: 9 },
      { product: 8, output: 11 },
      { product: 6, output: 4 },
    ]);
    verify("algebra-notation", "transfer", [
      { first: 6, second: 4, sum: 10 },
      { first: 6, second: -2, sum: 4 },
      { first: 4, second: 6, sum: 10 },
      { first: -4, second: 3, sum: -1 },
    ]);
  });

  it("distinguishes finite-step rates from local derivatives", () => {
    const square = (x: number) => x * x;
    verify(
      "derivatives",
      "base",
      [3, 1, -2, 0].map((x) => ({
        change: square(x + 0.1) - square(x),
        average: (square(x + 0.1) - square(x)) / 0.1,
        derivative: (square(x + 0.0001) - square(x - 0.0001)) / 0.0002,
      })),
    );
    verify("derivatives", "transfer", [
      { loss: 9, derivative: -6, next: 0.6 },
      { loss: 1, derivative: -2, next: 2.2 },
      { loss: 1, derivative: 2, next: 3.8 },
      { loss: 4, derivative: 4, next: 4.6 },
    ]);
  });

  it("multiplies each input by the matching matrix column before adding bias", () => {
    verify("matrices-tensors", "base", [
      { first: 13, second: 3 },
      { first: 14, second: 1 },
      { first: 12, second: 5 },
      { first: 9, second: 1 },
    ]);
    verify("matrices-tensors", "transfer", [
      { rows: 3, columns: 4, values: 12 },
      { rows: 4, columns: 2, values: 8 },
      { rows: 2, columns: 3, values: 6 },
      { rows: 5, columns: 2, values: 10 },
    ]);
  });

  it("checks the chain derivative against perturbing the complete loss", () => {
    const fixtures = [
      [1, 3, 5],
      [2, 2, 3],
      [1, 2, 5],
      [3, 1, 1],
    ];
    verify(
      "chain-rule",
      "base",
      fixtures.map(([w, x, t]) => {
        const loss = (weight: number) => (weight * x - t) ** 2;
        return {
          p: w * x,
          outer: 2 * (w * x - t),
          inner: x,
          total: (loss(w + 0.0001) - loss(w - 0.0001)) / 0.0002,
        };
      }),
    );
    verify("chain-rule", "transfer", [
      { gradient: -12, next: 1.2 },
      { gradient: -6, next: 2.6 },
      { gradient: 8, next: 1.2 },
      { gradient: -18, next: 2.8 },
    ]);
  });

  it("counts pixels, channel values, and bytes as different quantities", () => {
    verify("digital-representations", "base", [
      { pixels: 6, values: 18, bytes: 18 },
      { pixels: 8, values: 8, bytes: 16 },
      { pixels: 6, values: 18, bytes: 36 },
      { pixels: 10, values: 10, bytes: 10 },
    ]);
  });

  it("excludes threshold equality and counts repeated parcels individually", () => {
    verify("algorithms-and-programs", "base", [
      { count: 2, total: 10 },
      { count: 0, total: 0 },
      { count: 2, total: 10 },
      { count: 2, total: 11 },
    ]);
  });

  it("preserves the batch and output-feature axes in matrix products", () => {
    verify("tensor-shape-tracing", "base", [
      { rows: 2, columns: 4, values: 8 },
      { rows: 5, columns: 3, values: 15 },
      { rows: 3, columns: 2, values: 6 },
      { rows: 4, columns: 1, values: 4 },
    ]);
  });

  it("agrees with explicitly enumerated tree paths including the root", () => {
    verify(
      "search-growth",
      "base",
      [
        [2, 4],
        [3, 2],
        [4, 2],
        [2, 2],
      ].map(([b, depth]) => {
        let paths = [""];
        let total = 1;
        for (let level = 0; level < depth; level++) {
          paths = paths.flatMap((path) =>
            Array.from({ length: b }, (_, i) => `${path}${i}`),
          );
          total += paths.length;
        }
        return { last: paths.length, total };
      }),
    );
  });

  it("advances generator state after every draw", () => {
    verify("randomness-reproducibility", "base", [
      { first: 1, second: 4, third: 5 },
      { first: 7, second: 6, third: 3 },
      { first: 2, second: 7, third: 6 },
      { first: 5, second: 0, third: 1 },
    ]);
  });

  it("leaves serial time intact when computing ideal speedup", () => {
    verify("processors-and-parallelism", "base", [
      { parallel: 2, total: 4, speedup: 2 },
      { parallel: 3, total: 4, speedup: 2.5 },
      { parallel: 4, total: 8, speedup: 3 },
      { parallel: 3, total: 6, speedup: 1.5 },
    ]);
  });
});
