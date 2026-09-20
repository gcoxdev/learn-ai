import { describe, expect, it } from "vitest";
import { curriculum } from "./content";
import {
  grade,
  mastered,
  mergeProgress,
  parseBackup,
  planPath,
  questionsRemaining,
  validateGraph,
} from "./engine";
import {
  emptyPosition,
  emptyProgress,
  type Attempt,
  type Curriculum,
} from "./model";

function evidence(id: string, c: Curriculum = curriculum): Attempt[] {
  const objective = c.objectives.find((o) => o.id === id)!;
  return objective.families.map((family, i) => {
    const q = c.lessons
      .flatMap((l) => l.questions)
      .find((q) => !q.retired && q.objective === id && q.family === family)!;
    return {
      id: `${id}-${i}`,
      objective: id,
      version: objective.version,
      family,
      variant: q.id,
      correct: true,
      independent: true,
      mode: "assessment",
      at: i + 1,
      responses: Object.fromEntries(
        Object.entries(q.answers).map(([k, v]) => [k, String(v)]),
      ),
    };
  });
}
const objective = curriculum.objectives.find(
  (o) => o.id === "objective.ai-systems",
)!;
const lesson = curriculum.lessons.find((l) => l.id === "ai-systems")!;

describe("objective evidence", () => {
  it("requires every family, and never confuses viewed positions with mastery", () => {
    expect(mastered(objective, [])).toBe(false);
    expect(mastered(objective, evidence(objective.id).slice(0, 1))).toBe(false);
    expect(mastered(objective, evidence(objective.id))).toBe(true);
    const progress = {
      ...emptyProgress(),
      positions: { [lesson.id]: emptyPosition(lesson.routes.core.at(-1)!) },
    };
    expect(
      questionsRemaining(lesson, curriculum, progress, "core").complete,
    ).toBe(false);
  });
  it.each(["hinted", "practice", "old-version", "incorrect"])(
    "does not credit %s evidence",
    (caseName) => {
      const attempts = evidence(objective.id).map((a) => ({
        ...a,
        independent: caseName === "hinted" ? false : a.independent,
        mode: caseName === "practice" ? ("practice" as const) : a.mode,
        version: caseName === "old-version" ? "obsolete" : a.version,
        correct: caseName === "incorrect" ? false : a.correct,
      }));
      expect(mastered(objective, attempts)).toBe(false);
    },
  );
  it("moves past exposed variants and reports exhausted families honestly", () => {
    const p = emptyProgress();
    const first = questionsRemaining(lesson, curriculum, p, "core");
    p.exposures = first.items.map((q) => q.id);
    const retake = questionsRemaining(lesson, curriculum, p, "core");
    expect(retake.items).toHaveLength(2);
    expect(retake.items.every((q) => !p.exposures.includes(q.id))).toBe(true);
    p.exposures.push(...retake.items.map((q) => q.id));
    // Revised foundations provide four variants per family.
    for (let round = 0; round < 2; round++) {
      const more = questionsRemaining(lesson, curriculum, p, "core");
      expect(more.items).toHaveLength(2);
      p.exposures.push(...more.items.map((q) => q.id));
    }
    const exhausted = questionsRemaining(lesson, curriculum, p, "core");
    expect(exhausted.items).toHaveLength(0);
    expect(exhausted.exhausted).toHaveLength(2);
    expect(exhausted.complete).toBe(false);
  });
  it("keeps formal mathematics outside the core route", () => {
    const gradient = curriculum.lessons.find(
      (l) => l.id === "learning-update",
    )!;
    const core = questionsRemaining(
      gradient,
      curriculum,
      emptyProgress(),
      "core",
    );
    expect(core.objectives).toHaveLength(2);
    expect(core.objectives.every((o) => o.scope === "core")).toBe(true);
    expect(
      questionsRemaining(gradient, curriculum, emptyProgress(), "mathematics")
        .objectives,
    ).toHaveLength(3);
  });
  it("requires the complete transfer calculation, including prediction and loss", () => {
    const q = curriculum.lessons
      .flatMap((l) => l.questions)
      .find((q) => q.kind === "structured")!;
    const answers = Object.fromEntries(
      Object.entries(q.answers).map(([k, v]) => [k, String(v)]),
    );
    expect(grade(q, answers)).toBe(true);
    for (const field of Object.keys(answers))
      expect(grade(q, { ...answers, [field]: "" })).toBe(false);
    const numeric = Object.keys(q.answers).find(
      (k) => typeof q.answers[k] === "number",
    )!;
    expect(grade(q, { ...answers, [numeric]: "Infinity" })).toBe(false);
    expect(
      grade(q, { ...answers, [numeric]: String(Number(answers[numeric]) + 1) }),
    ).toBe(false);
  });
});

describe("dependency planning", () => {
  it("orders every system path by its actual prerequisites", () => {
    const plans = curriculum.recipes.map((r) => planPath(curriculum, r, []));
    expect(plans).toHaveLength(15);
    for (const plan of plans)
      for (const id of plan.remaining) {
        const obj = curriculum.objectives.find((o) => o.id === id)!;
        for (const group of obj.prerequisites)
          expect(
            group.anyOf.some(
              (dep) => plan.remaining.indexOf(dep) < plan.remaining.indexOf(id),
            ),
          ).toBe(true);
      }
  });
  it.each([0, 1])(
    "reuses shared understanding when switching away from path %i",
    (index) => {
      const completed = planPath(
        curriculum,
        curriculum.recipes[index],
        [],
      ).required.flatMap((id) => evidence(id));
      const switched = planPath(
        curriculum,
        curriculum.recipes[1 - index],
        completed,
      );
      const target = planPath(curriculum, curriculum.recipes[1 - index], []);
      const completedIds = new Set(completed.map((a) => a.objective));
      expect(switched.remaining.toSorted()).toEqual(
        target.required.filter((id) => !completedIds.has(id)).toSorted(),
      );
      expect(switched.remaining.length).toBeGreaterThan(0);
      expect(switched.remaining).not.toContain("objective.ai-systems");
    },
  );
  it("stops at a mastered intermediate without manufacturing ancestor evidence", () => {
    const attempts = evidence("objective.backpropagation");
    const recipe = {
      ...curriculum.recipes[0],
      roots: ["objective.backpropagation"],
    };
    const plan = planPath(curriculum, recipe, attempts);
    expect(plan.required).toContain("objective.backpropagation");
    expect(plan.required).not.toContain("objective.nonlinearity");
    expect(
      mastered(
        curriculum.objectives.find((o) => o.id === "objective.nonlinearity")!,
        attempts,
      ),
    ).toBe(false);
  });
  it("still traverses a separately required foundation", () => {
    const recipe = {
      ...curriculum.recipes[0],
      roots: ["objective.backpropagation", "objective.nonlinearity"],
    };
    const plan = planPath(
      curriculum,
      recipe,
      evidence("objective.backpropagation"),
    );
    expect(plan.remaining).toContain("objective.nonlinearity");
    expect(plan.remaining).toContain("objective.neurons");
  });
  it("prefers a mastered valid alternative", () => {
    const c = structuredClone(curriculum);
    c.objectives.find((o) => o.id === "objective.functions")!.prerequisites = [
      { anyOf: ["objective.arithmetic", "objective.history"] },
    ];
    const plan = planPath(
      c,
      { ...c.recipes[0], roots: ["objective.functions"] },
      evidence("objective.history"),
    );
    expect(plan.required).toContain("objective.history");
    expect(plan.required).not.toContain("objective.arithmetic");
  });
  it.each(["cycle", "missing"])(
    "rejects a %s even behind a mastered objective",
    (defect) => {
      const c = structuredClone(curriculum);
      c.objectives.find((o) => o.id === objective.id)!.prerequisites = [
        { anyOf: [defect === "cycle" ? objective.id : "missing"] },
      ];
      expect(() => planPath(c, c.recipes[0], evidence(objective.id))).toThrow();
    },
  );
  it("rejects missing assessment variants", () => {
    const c = structuredClone(curriculum);
    const target = c.lessons.find((l) => l.id === lesson.id)!;
    const first = target.questions.find((q) => !q.retired)!;
    target.questions = target.questions.filter(
      (q) => q.retired || q.family !== first.family || q.id === first.id,
    );
    expect(() => validateGraph(c)).toThrow("Missing retake variant");
  });
});

describe("portable progress", () => {
  it("round-trips valid evidence and preserves positions, drafts, reveals, and detours", () => {
    const p = emptyProgress();
    p.attempts = evidence(objective.id);
    p.positions[lesson.id] = {
      ...emptyPosition(lesson.routes.core[0]),
      drafts: { example: { choice: "a" } },
      reveals: ["example"],
    };
    p.detours = [{ lesson: lesson.id, scene: lesson.routes.core[0] }];
    expect(parseBackup(JSON.stringify(p), curriculum)).toEqual(p);
  });
  it("merges idempotently and keeps the more recent position", () => {
    const current = emptyProgress();
    current.attempts = evidence(objective.id);
    current.updatedAt = 10;
    current.positions[lesson.id] = {
      ...emptyPosition(lesson.routes.core[1]),
      updatedAt: 10,
    };
    const incoming = emptyProgress();
    incoming.attempts = evidence(objective.id);
    incoming.updatedAt = 5;
    incoming.positions[lesson.id] = {
      ...emptyPosition(lesson.routes.core[0]),
      updatedAt: 5,
    };
    const merged = mergeProgress(current, incoming);
    expect(merged.attempts).toHaveLength(2);
    expect(merged.positions[lesson.id].scene).toBe(lesson.routes.core[1]);
    expect(mergeProgress(merged, incoming)).toEqual(merged);
  });
  it("rejects conflicting immutable evidence without mutating current progress", () => {
    const current = emptyProgress();
    current.attempts = evidence(objective.id);
    const original = structuredClone(current);
    const incoming = structuredClone(current);
    incoming.attempts[0].responses = {};
    expect(() => mergeProgress(current, incoming)).toThrow(
      "Conflicting evidence",
    );
    expect(current).toEqual(original);
    expect(() => parseBackup(JSON.stringify(incoming), curriculum)).toThrow(
      "disagree",
    );
  });
  it.each([
    "bad-json",
    "new-format",
    "unknown-scene",
    "bad-range",
    "unknown-variant",
  ])("rejects %s imports", (defect) => {
    const p = emptyProgress();
    if (defect === "new-format") (p as { version: number }).version = 999;
    if (defect === "unknown-scene")
      p.positions[lesson.id] = emptyPosition("no-scene");
    if (defect === "bad-range")
      p.positions[lesson.id] = {
        ...emptyPosition(lesson.routes.core[0]),
        simulation: { rate: 999, initialWeight: 0, steps: 0 },
      };
    if (defect === "unknown-variant")
      p.attempts = [{ ...evidence(objective.id)[0], variant: "made-up" }];
    expect(() =>
      parseBackup(defect === "bad-json" ? "{" : JSON.stringify(p), curriculum),
    ).toThrow();
  });
  it("preserves old versions without granting current mastery", () => {
    const p = emptyProgress();
    p.attempts = evidence(objective.id).map((a) => ({
      ...a,
      version: "previous-draft",
    }));
    const parsed = parseBackup(JSON.stringify(p), curriculum);
    expect(parsed.attempts).toHaveLength(2);
    expect(mastered(objective, parsed.attempts)).toBe(false);
  });
  it("allows bookmark removal during ordinary saves", () => {
    const previous = {
      ...emptyProgress(),
      bookmarks: [lesson.id],
      updatedAt: 1,
    };
    const current = { ...emptyProgress(), updatedAt: 2 };
    expect(mergeProgress(previous, current, false).bookmarks).toEqual([]);
    expect(mergeProgress(previous, current, true).bookmarks).toEqual([
      lesson.id,
    ]);
  });
});

it("all lesson routes end in a combined check and takeaway", () => {
  for (const lesson of curriculum.lessons)
    for (const route of Object.values(lesson.routes)) {
      if (!route.length) continue;
      const ending = lesson.scenes.find((s) => s.id === route.at(-1))!;
      expect(ending.type).toBe("assessment");
      expect(ending.takeaway).toBeTruthy();
      expect(
        route.some(
          (id) => lesson.scenes.find((s) => s.id === id)?.type === "recap",
        ),
      ).toBe(false);
    }
  const invalid = structuredClone(curriculum);
  invalid.lessons[0].routes.core.reverse();
  expect(() => validateGraph(invalid)).toThrow(
    "end in one combined assessment",
  );
});

it("preserves historical answers and recap positions without granting revised credit", () => {
  const p = emptyProgress();
  const oldQuestion = lesson.questions.find((q) => q.retired)!;
  p.positions[lesson.id] = emptyPosition("ai-systems.recap");
  p.attempts = [
    {
      ...evidence(objective.id)[0],
      version: "1-draft",
      family: oldQuestion.family,
      variant: oldQuestion.id,
      responses: Object.fromEntries(
        Object.entries(oldQuestion.answers).map(([k, v]) => [k, String(v)]),
      ),
    },
  ];
  const restored = parseBackup(JSON.stringify(p), curriculum);
  expect(restored.attempts[0]).toEqual(p.attempts[0]);
  expect(lesson.sceneAliases[restored.positions[lesson.id].scene]).toBe(
    "ai-systems.check",
  );
  expect(mastered(objective, restored.attempts)).toBe(false);
  expect(
    questionsRemaining(lesson, curriculum, restored, "core").items.every(
      (q) => !q.retired,
    ),
  ).toBe(true);
  p.attempts[0].version = objective.version;
  expect(() => parseBackup(JSON.stringify(p), curriculum)).toThrow(
    "Practice evidence",
  );
});

it("requires intermediate calculations in the revised prediction and neuron checks", () => {
  const prediction = curriculum.lessons
    .find((l) => l.id === "prediction")!
    .questions.find((q) => q.id === "prediction.base.v2.1")!;
  const response = {
    prediction: "13",
    residual: "3",
    loss: "9",
    choice: "rule",
  };
  expect(grade(prediction, response)).toBe(true);
  expect(grade(prediction, { ...response, residual: "-3" })).toBe(false);
  expect(grade(prediction, { loss: "9", choice: "rule" })).toBe(false);
  const neuron = curriculum.lessons
    .find((l) => l.id === "neurons")!
    .questions.find((q) => q.id === "neurons.base.v2.1")!;
  const trace = {
    weighted_sum: "6",
    pre_activation: "-2",
    output: "0",
    choice: "rule",
  };
  expect(grade(neuron, trace)).toBe(true);
  expect(grade(neuron, { ...trace, pre_activation: "-3" })).toBe(false);
  expect(grade(neuron, { output: "0", choice: "rule" })).toBe(false);
});

it("accepts backups from before the reset feature", () => {
  const original = emptyProgress();
  const { resetAt: _resetAt, ...legacy } = original;
  expect(parseBackup(JSON.stringify(legacy), curriculum)).toEqual(original);
});

it("keeps reset records intact when stale tabs save or synchronize", () => {
  const stale = {
    ...emptyProgress(),
    updatedAt: 999,
    attempts: evidence(objective.id),
    exposures: [lesson.questions[0].id],
    positions: { [lesson.id]: emptyPosition(lesson.routes.core[1]) },
    bookmarks: [lesson.id],
    selectedPath: "language" as const,
    lastLesson: lesson.id,
    studyDays: ["2026-09-13"],
  };
  const cleared = { ...emptyProgress(), resetAt: 10, updatedAt: 10 };
  expect(mergeProgress(stale, cleared, false)).toEqual(cleared);
  expect(mergeProgress(cleared, stale, false)).toEqual(cleared);
  const studiedAgain = { ...cleared, updatedAt: 11, bookmarks: ["data"] };
  expect(mergeProgress(studiedAgain, stale, false)).toEqual(studiedAgain);
});

it("restores an explicitly imported backup without adopting its reset boundary", () => {
  const current = { ...emptyProgress(), resetAt: 10, updatedAt: 10 };
  for (const backupReset of [0, 100]) {
    const backup = {
      ...emptyProgress(),
      resetAt: backupReset,
      updatedAt: 100,
      attempts: evidence(objective.id),
      bookmarks: [lesson.id],
    };
    const restored = mergeProgress(current, backup);
    expect(restored.resetAt).toBe(10);
    expect(restored.attempts).toEqual(backup.attempts);
    expect(restored.bookmarks).toEqual(backup.bookmarks);
    expect(mergeProgress(current, restored, false)).toEqual(restored);
  }
});
