import { expect, it } from "vitest";
import { curriculum as c } from "./content";
import { emptyPosition, emptyProgress, type Attempt } from "./model";
import { grade, parseBackup, planPath, validateGraph } from "./engine";
import { lessonHref, originFromLessonUrl } from "./navigation";
import { pathCoverage } from "../../scripts/path-coverage";

const route = (id: string) => c.recipes.find((r) => r.id === id)!;
const plan = (id: string) => planPath(c, route(id), []);
function completed(id: string): Attempt[] {
  return plan(id).required.flatMap((id) => {
    const objective = c.objectives.find((o) => o.id === id)!;
    return objective.families.map((family) => {
      const q = c.lessons
        .flatMap((l) => l.questions)
        .find((q) => !q.retired && q.family === family)!;
      return {
        id: q.id,
        objective: id,
        version: objective.version,
        family,
        variant: q.id,
        correct: true,
        independent: true,
        mode: "assessment",
        at: 1,
        responses: Object.fromEntries(
          Object.entries(q.answers).map(([k, v]) => [k, String(v)]),
        ),
      };
    });
  });
}

it.each(c.recipes.map((r) => r.id))(
  "persists %s paths and returns from lessons to that same route",
  (id) => {
    const p = emptyProgress();
    p.selectedPath = id;
    p.positions["ai-systems"] = {
      ...emptyPosition("ai-systems.s1"),
      origin: { kind: "path", path: id },
    };
    expect(parseBackup(JSON.stringify(p), c)).toEqual(p);
    expect(
      originFromLessonUrl(
        new URL(
          lessonHref("ai-systems", p.positions["ai-systems"].origin),
          "https://learn.test",
        ),
      ),
    ).toEqual({ kind: "path", path: id });
  },
);

it("rejects unknown paths in backups and navigation without rejecting older valid backups", () => {
  expect(() =>
    parseBackup(
      JSON.stringify({ ...emptyProgress(), selectedPath: "missing" }),
      c,
    ),
  ).toThrow("unavailable learning path");
  const p = emptyProgress();
  p.positions["ai-systems"] = {
    ...emptyPosition("ai-systems.s1"),
    origin: { kind: "path", path: "missing" },
  };
  expect(() => parseBackup(JSON.stringify(p), c)).toThrow(
    "unavailable learning path",
  );
  expect(
    originFromLessonUrl(
      new URL("https://learn.test/learn/ai-systems/?from=/paths/missing/"),
    ),
  ).toBeUndefined();
  expect(
    parseBackup(
      JSON.stringify({ ...emptyProgress(), selectedPath: "language" }),
      c,
    ).selectedPath,
  ).toBe("language");
});

it.each([
  ["images", "video"],
  ["language", "audio"],
  ["audio", "multimodal"],
  ["video", "robotics"],
  ["prediction", "science"],
])("reuses mastery from %s on %s without granting new evidence", (from, to) => {
  const evidence = completed(from),
    known = new Set(evidence.map((a) => a.objective));
  const next = planPath(c, route(to), evidence);
  expect(next.mastered.length).toBeGreaterThan(10);
  expect(next.remaining.toSorted()).toEqual(
    plan(to)
      .required.filter((id) => !known.has(id))
      .toSorted(),
  );
  expect(next.mastered.every((id) => known.has(id))).toBe(true);
});

it.each([
  ["language", ["routers-and-top-k", "selective-state-spaces"]],
  [
    "images",
    [
      "video-models",
      "world-models-and-predictive-representations",
      "flow-matching-and-solvers",
    ],
  ],
  ["agents", ["reinforcement-learning-loop", "multi-agent-learning-and-games"]],
  ["robotics", ["vision-language-action-models", "robot-rl-and-sim-to-real"]],
  ["forecasting", ["speech-recognition", "speech-and-audio-generation"]],
] as const)(
  "keeps unrelated architecture branches outside %s core",
  (id, excluded) => {
    const ids = plan(id).lessons.map((l) => l.id);
    for (const lesson of excluded) expect(ids).not.toContain(lesson);
  },
);

it("validates endpoints, extensions, and related-route references", () => {
  for (const mutation of [
    (copy: typeof c) => copy.recipes.push(copy.recipes[0]),
    (copy: typeof c) => (copy.recipes[0].destination = "speech-audio-project"),
    (copy: typeof c) =>
      copy.recipes[0].extensions.push({
        lesson: "missing",
        why: "An unavailable extension",
      }),
    (copy: typeof c) => copy.recipes[0].related.push("missing"),
  ]) {
    const copy = structuredClone(c);
    mutation(copy);
    expect(() => validateGraph(copy)).toThrow();
  }
});

it("makes every authored draft reachable in a core or an explicitly optional branch", () => {
  expect(pathCoverage(c).unassigned).toEqual([]);
});

it("preserves semantic headers and cells in authored worked tables", () => {
  const scene = c.lessons
    .find((l) => l.id === "algorithms-and-programs")!
    .scenes.find((s) => s.id.endsWith(".s3"))!;
  expect(scene.html).toContain("<table>");
  expect(scene.html).toContain("<th>Weight inspected</th>");
  expect(scene.html).toContain("<td>9</td>");
});

it.each([
  [
    "video-generation-project",
    [
      { bytes: 216, seconds: 3 },
      { bytes: 96, seconds: 2 },
      { bytes: 72, seconds: 1.5 },
      { bytes: 180, seconds: 2 },
    ],
  ],
  [
    "speech-audio-project",
    [
      { percent: 25, seconds: 2 },
      { percent: 50, seconds: 1 },
      { percent: 150, seconds: 3 },
      { percent: 10, seconds: 0.5 },
    ],
  ],
  [
    "robotics-system-project",
    [
      { error: 3, command: 1, next: 1 },
      { error: -3, command: -1, next: 1 },
      { error: 1, command: 0.5, next: 1.5 },
      { error: 2, command: 1, next: 2 },
    ],
  ],
] as const)("checks the numerical evidence in %s", (id, fixtures) => {
  for (const [i, expected] of fixtures.entries()) {
    const q = c.lessons
      .find((l) => l.id === id)!
      .questions.find((q) => q.id === `${id}.transfer.${i + 1}`)!;
    for (const [field, value] of Object.entries(expected))
      expect(q.answers[field]).toBe(value);
    const responses = Object.fromEntries(
      Object.entries({ ...expected, choice: q.answers.choice }).map(
        ([k, v]) => [k, String(v)],
      ),
    );
    expect(grade(q, responses)).toBe(true);
    for (const field of Object.keys(expected))
      expect(grade(q, { ...responses, [field]: "" })).toBe(false);
  }
});
