import { describe, expect, it } from "vitest";
import { curriculum as c } from "./content";
import {
  grade,
  mastered,
  parseBackup,
  planPath,
  questionsRemaining,
} from "./engine";
import { emptyPosition, emptyProgress, type Attempt } from "./model";

const revised = [
  "language-structure",
  "count-based-language",
  "tokenizer-training",
  "data-cleaning",
  "splits-and-leakage",
  "data-provenance",
  "neural-forward-pass",
  "nonlinearity",
  "backpropagation",
  "automatic-differentiation",
  "multi-head-attention",
  "positional-encodings",
  "residuals-normalization-dropout",
  "neural-training-loop",
  "pretraining-data-pipeline",
  "packing-and-masking",
  "pretraining-objectives",
  "training-data-mixtures",
  "posttraining-stages",
  "supervised-fine-tuning",
  "decoding-and-sampling",
  "evaluation-selection",
  "benchmark-design-and-comparison",
  "human-and-model-judges",
  "ai-product-framing",
  "production-data-and-model-artifacts",
  "evaluation-releases-and-rollback",
  "monitoring-drift-and-retraining",
  "human-review-and-user-experience",
  "base-model-design",
  "routers-and-top-k",
  "tiny-language-model-project",
];
const lesson = (id: string) => c.lessons.find((l) => l.id === id)!;
function check(slug: string, family: string, rows: Record<string, number>[]) {
  rows.forEach((row, index) => {
    const q = lesson(slug).questions.find(
      (q) => q.id === `${slug}.${family}.v2.${index + 1}`,
    )!;
    const response = {
      choice: String(q.answers.choice),
      ...Object.fromEntries(
        Object.entries(row).map(([k, v]) => [k, String(v)]),
      ),
    };
    for (const [field, value] of Object.entries(row))
      expect(q.answers[field]).toBeCloseTo(value, 6);
    expect(grade(q, response)).toBe(true);
    for (const [field, value] of Object.entries(row)) {
      expect(grade(q, { ...response, [field]: "" })).toBe(false);
      expect(grade(q, { ...response, [field]: String(value + 0.1) })).toBe(
        false,
      );
    }
    expect(
      grade(q, {
        ...response,
        choice: q.options.find((o) => o.id !== q.answers.choice)!.id,
      }),
    ).toBe(false);
  });
}

describe("curriculum depth revision", () => {
  it("keeps old attempts readable without converting them into new mastery", () => {
    for (const id of revised) {
      const l = lesson(id),
        objective = c.objectives.find((o) => o.lesson === id)!;
      const p = emptyProgress();
      p.positions[id] = emptyPosition(`${id}.recap`);
      p.attempts = l.questions
        .filter((q) => q.retired)
        .map((q, index): Attempt => ({
          id: `${id}-old-${index}`,
          objective: objective.id,
          version: "1-draft",
          family: q.family,
          variant: q.id,
          correct: true,
          independent: true,
          mode: "assessment",
          at: index + 1,
          responses: Object.fromEntries(
            Object.entries(q.answers).map(([key, value]) => [
              key,
              String(value),
            ]),
          ),
        }));
      expect(p.attempts.length).toBeGreaterThan(0);
      const restored = parseBackup(JSON.stringify(p), c);
      expect(restored.attempts).toEqual(p.attempts);
      expect(mastered(objective, restored.attempts)).toBe(false);
      expect(l.sceneAliases[restored.positions[id].scene]).toBe(
        l.routes.core.at(-1),
      );
      const remaining = questionsRemaining(l, c, restored, "core");
      expect(remaining.items).toHaveLength(objective.families.length);
      expect(
        remaining.items.every((q) => !q.retired),
      ).toBe(true);
      const practice = l.scenes.find(
        (s) => l.routes.core.includes(s.id) && s.activity,
      )!;
      expect(practice.activity).toBeDefined();
      expect(l.questions.some((q) => q.id === practice.activity!.id)).toBe(
        false,
      );
    }
  });

  it("requires operations before language and agent endpoints while leaving MoE optional", () => {
    for (const path of ["language", "agents"]) {
      const recipe = c.recipes.find((r) => r.id === path)!;
      const plan = planPath(c, recipe, []);
      expect(plan.lessons.at(-1)!.id).toBe(recipe.destination);
      for (const id of [
        "evaluation-releases-and-rollback",
        "monitoring-drift-and-retraining",
        "human-review-and-user-experience",
      ])
        expect(plan.required).toContain(`objective.${id}`);
      const core = new Set(plan.lessons.map((l) => l.id));
      expect(recipe.extensions.every((e) => !core.has(e.lesson))).toBe(true);
    }
    const language = c.recipes.find((r) => r.id === "language")!;
    expect(planPath(c, language, []).required).not.toContain(
      "objective.routers-and-top-k",
    );
    expect(
      language.extensions.some((e) => e.lesson === "routers-and-top-k"),
    ).toBe(true);
    const router = lesson("routers-and-top-k");
    expect(
      router.scenes.some(
        (s) => router.routes.core.includes(s.id) && s.simulation === "moe",
      ),
    ).toBe(true);
    const prerequisites = c.objectives.find(
      (o) => o.id === "objective.backpropagation",
    )!.prerequisites;
    expect(prerequisites).toContainEqual({ anyOf: ["objective.chain-rule"] });
  });

  it("checks hidden ReLU values before the output, including inactive units", () => {
    check("neural-forward-pass", "base", [
      { h1: 1, h2: 2, y: 6 },
      { h1: 5, h2: 0, y: 6 },
      { h1: 0, h2: 3, y: 7 },
      { h1: 9, h2: 0, y: 10 },
    ]);
    check("nonlinearity", "base", [
      { h1: 0, h2: 0, y: 0 },
      { h1: 1, h2: 0, y: 1 },
      { h1: 1, h2: 0, y: 1 },
      { h1: 2, h2: 1, y: 0 },
    ]);
  });

  it("agrees with perturbing a scalar loss, including cancellation between shared branches", () => {
    const derivative = (f: (x: number) => number, x: number) =>
      (f(x + 0.0001) - f(x - 0.0001)) / 0.0002;
    check(
      "backpropagation",
      "base",
      [
        [1, 2, 5],
        [2, 3, 4],
        [3, 2, 5],
        [1, 4, 2],
      ].map(([w, x, t]) => ({
        prediction: w * x,
        local: derivative((p) => (p - t) ** 2, w * x),
        gradient: derivative((v) => (v * x - t) ** 2, w),
      })),
    );
    check("backpropagation", "transfer", [
      { first: 2, second: -2, total: 0 },
      { first: -2, second: -6, total: -8 },
      { first: 6, second: 2, total: 8 },
      { first: 6, second: 2, total: 8 },
    ]);
    check(
      "automatic-differentiation",
      "base",
      [1, 3, 0, -2].map((w) => ({
        loss: w * w + 3 * w,
        gradient: derivative((v) => v * v + 3 * v, w),
      })),
    );
    check("neural-training-loop", "base", [
      { loss: 4, gradient: -8, next: 1.8 },
      { loss: 9, gradient: -6, next: 2.6 },
      { loss: 4, gradient: -12, next: 1.2 },
      { loss: 4, gradient: 8, next: 2.2 },
    ]);
  });

  it("keeps head mixing, residual addition, and dropout rescaling distinct", () => {
    check("multi-head-attention", "base", [
      { a: 5, b: 7, y: 3 },
      { a: 1, b: 3, y: -1 },
      { a: 4, b: 8, y: 0 },
      { a: 5, b: 3, y: 7 },
    ]);
    check("positional-encodings", "base", [
      { first: 3, second: 2 },
      { first: 3, second: 4 },
      { first: 0, second: 5 },
      { first: 1, second: 1 },
    ]);
    check("residuals-normalization-dropout", "base", [
      { first: 3, second: 2 },
      { first: 2, second: 3 },
      { first: 3, second: 2 },
      { first: 1, second: 4 },
    ]);
    check("residuals-normalization-dropout", "transfer", [
      { first: 6, second: 0 },
      { first: 8, second: 0 },
      { first: 12, second: 0 },
      { first: 4, second: 0 },
    ]);
  });

  it("counts independent sequence targets without inventing a start-token prediction", () => {
    check("packing-and-masking", "base", [
      { padding: 2, targets: 3 },
      { padding: 3, targets: 4 },
      { padding: 2, targets: 2 },
      { padding: 1, targets: 5 },
    ]);
  });

  it("normalizes selected experts and mixes corresponding coordinates", () => {
    check("routers-and-top-k", "base", [
      { total: 0.8, first: 0.75, second: 0.25 },
      { total: 0.75, first: 0.6, second: 0.4 },
      { total: 0.8, first: 0.625, second: 0.375 },
      { total: 0.8, first: 0.6, second: 0.4 },
    ]);
    check("routers-and-top-k", "transfer", [
      { first: 1.5, second: 1 },
      { first: 1.2, second: 1.6 },
      { first: 1.6, second: 0.8 },
      { first: 1.25, second: 1.5 },
    ]);
  });

  it("adds smoothing mass for every vocabulary item in the project checks", () => {
    check("tiny-language-model-project", "base", [
      { denominator: 9, cat: 4 / 9, dog: 2 / 9 },
      { denominator: 8, cat: 2 / 8, dog: 3 / 8 },
      { denominator: 9, cat: 3 / 9, dog: 3 / 9 },
      { denominator: 10, cat: 5 / 10, dog: 2 / 10 },
    ]);
  });
});
