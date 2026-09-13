import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { parseDocument } from "yaml";
import { marked } from "marked";
import sanitize from "sanitize-html";
import {
  curriculumSchema,
  lessonSchema,
  objectiveSchema,
  vocabularySchema,
  type Question,
  type Scene,
} from "../src/lib/model";
import { validateGraph, planPath } from "../src/lib/engine";
import { auditContent, coverageReport } from "./content-audit";
import { editorialMetrics, editorialReport } from "./editorial-report";

function readYaml(text: string) {
  const doc = parseDocument(text, { uniqueKeys: true });
  if (doc.errors.length)
    throw new Error(doc.errors.map((e) => e.message).join("\n"));
  return doc.toJSON();
}
function html(markdown: string) {
  return sanitize(marked.parse(markdown, { async: false }), {
    allowedTags: [
      "p",
      "strong",
      "em",
      "code",
      "ul",
      "ol",
      "li",
      "a",
      "blockquote",
      "br",
    ],
    allowedAttributes: { a: ["href", "title"] },
    allowedSchemes: ["http", "https", "mailto"],
  });
}
const index = readYaml(await readFile("content/curriculum.yaml", "utf8"));
const lessons = [];
const objectives = [];
const knownTypes = new Set([
  "explanation",
  "question",
  "equation",
  "simulation",
  "table",
  "assessment",
  "recap",
]);
for (const filename of (await readdir("content/lessons"))
  .filter((f) => f.endsWith(".yaml"))
  .sort()) {
  const source = readYaml(
    await readFile(`content/lessons/${filename}`, "utf8"),
  );
  if (source.schema_version !== "0.2-draft")
    throw new Error(`Unsupported schema: ${filename}`);
  const id = source.runtime?.slug ?? source.lesson.id;
  const questions: Question[] = [];
  for (const family of source.assessment_families) {
    for (const variant of family.variants) {
      const kind =
        family.response_type === "single_choice"
          ? "choice"
          : family.response_type === "numeric_fields_with_reason"
            ? "structured"
            : "numeric";
      questions.push({
        id: variant.id,
        objective: family.objective_ref,
        family: family.id,
        transfer: family.task === "transfer",
        prompt: variant.prompt,
        kind,
        options: variant.reason_options ?? variant.options ?? [],
        fields:
          kind === "numeric"
            ? [{ id: "value", label: "Your answer" }]
            : (family.numeric_fields ?? []),
        answers:
          kind === "choice"
            ? { choice: variant.answer }
            : kind === "numeric"
              ? { value: variant.answer }
              : { ...variant.answers, choice: variant.reason_answer },
        tolerance: family.absolute_tolerance ?? 0.000001,
        feedback: variant.feedback,
        hint: family.hint,
        remediation: family.remediation_scene,
        ...(variant.retired ? { retired: true } : {}),
      });
    }
  }
  for (const o of source.objectives) {
    objectives.push(
      objectiveSchema.parse({
        id: o.id,
        version: o.version,
        title: o.statement,
        lesson: id,
        scope:
          o.depths.length === 1 && o.depths[0] === "mathematics"
            ? "mathematics"
            : "core",
        prerequisites:
          source.runtime?.objective_prerequisites?.[o.id] ??
          o.prerequisites ??
          [],
        families: o.evidence_families,
      }),
    );
  }
  const scenes: Scene[] = source.scenes.map((s: any): Scene => {
    if (!knownTypes.has(s.type) || !s.text_mode)
      throw new Error(`Unknown block/missing text mode: ${id}/${s.id}`);
    const bridgeMap = source.runtime?.bridge_map ?? {};
    const activity = s.prediction_activity ?? s.question;
    let normalizedActivity: Scene["activity"];
    if (activity?.response_type === "single_choice")
      normalizedActivity = {
        id: activity.id,
        objective: s.objective_refs[0],
        family: "practice",
        transfer: false,
        prompt: s.markdown,
        kind: "choice",
        options: activity.options,
        fields: [],
        answers: { choice: activity.answer },
        tolerance: 0.000001,
        hint:
          activity.hint ??
          "Use the current example and predict before revealing the result.",
        feedback: activity.reveal_markdown ?? activity.feedback,
      };
    if (activity?.response_type === "numeric_fields")
      normalizedActivity = {
        id: activity.id,
        objective: s.objective_refs[0],
        family: "practice",
        transfer: false,
        prompt: s.markdown,
        kind: "structured",
        options: [],
        fields: activity.fields.map((f: any) => ({ id: f.id, label: f.label })),
        answers: Object.fromEntries(
          activity.fields.map((f: any) => [f.id, f.answer]),
        ),
        tolerance: 0.000001,
        hint: "Multiply each weight by the fixed input, 2.",
        feedback: activity.reveal_markdown,
      };
    let simulation = s.simulation;
    if (id === "learning-update" && s.type === "simulation")
      simulation = "gradient";
    if (s.visual?.kind === "curve_with_current_point_and_local_slope")
      simulation = "loss-curve";
    return {
      id: s.id,
      title: s.title,
      type: s.type,
      depth: s.depth,
      html: html(s.markdown),
      ...(s.takeaway ? { takeaway: html(s.takeaway) } : {}),
      bridges:
        s.bridges ??
        (s.bridge_refs ?? []).map((b: string) => bridgeMap[b]).filter(Boolean),
      ...(s.latex
        ? {
            equation: {
              latex: s.latex,
              reading: s.spoken_reading,
              symbols: s.symbols,
            },
          }
        : {}),
      ...(s.rows ? { table: { columns: s.columns, rows: s.rows } } : {}),
      ...(simulation ? { simulation } : {}),
      ...(normalizedActivity ? { activity: normalizedActivity } : {}),
    };
  });
  const core = source.navigation.routes.find(
    (r: any) => r.id === "route.core",
  ).scene_sequence;
  const math =
    source.navigation.routes.find(
      (r: any) => r.id === "route.prepared-mathematics",
    )?.scene_sequence ?? [];
  const entryChecks = (source.entry_check?.items ?? []).map((q: any) => ({
    id: q.id,
    objective: "objective." + source.runtime.bridge_map[q.requirement_ref],
    family: "preparation",
    transfer: false,
    prompt: q.prompt,
    kind: "numeric",
    fields: [{ id: "value", label: "Your answer" }],
    options: [],
    answers: { value: q.answer },
    tolerance: q.absolute_tolerance,
    feedback: q.feedback,
    hint: "Read the operation one step at a time; the matching math bridge can help.",
  }));
  const teachingWords = source.scenes
    .filter((s: any) => core.includes(s.id) && s.type !== "assessment")
    .reduce((n: number, s: any) => n + s.markdown.split(/\s+/).length, 0);
  const archetype =
    source.lesson.archetype ??
    (source.lesson.slot.startsWith("M36")
      ? "project"
      : source.lesson.slot.startsWith("M35")
        ? "comparison"
        : source.lesson.slot.startsWith("M00") ||
            source.lesson.slot.startsWith("B")
          ? "foundation"
          : /^M(01|29)\./.test(source.lesson.slot)
            ? "perspective"
            : "mechanism");
  const lesson = lessonSchema.parse({
    ...source.lesson,
    id,
    summary: source.lesson.summary,
    minutes:
      archetype === "project"
        ? source.lesson.minutes
        : Math.max(
            5,
            Math.round(
              teachingWords / 120 +
                source.assessment_families.filter((f: any) =>
                  f.variants.some((q: any) => !q.retired),
                ).length *
                  2 +
                scenes.filter((s) => core.includes(s.id) && s.simulation)
                  .length *
                  3,
            ),
          ),
    archetype,
    teachingWords,
    objectives: source.objectives.map((o: any) => o.id),
    scenes,
    questions,
    entryChecks,
    routes: { core, mathematics: math },
    sceneAliases: source.navigation.scene_aliases ?? {},
  });
  // Store source-only specimen contracts separately for inspection without exposing internal planning files.
  lessons.push(lesson);
}
const curriculum = curriculumSchema.parse({ ...index, lessons, objectives });
validateGraph(curriculum);
auditContent(curriculum);
curriculum.lessons.sort((a, b) => {
  const group = (slot: string) =>
    slot.startsWith("M") ? 0 : slot.startsWith("B") ? 1 : 2;
  return (
    group(a.slot) - group(b.slot) ||
    a.slot.localeCompare(b.slot, "en", { numeric: true })
  );
});
await mkdir("src/lib/generated", { recursive: true });
const vocabulary = vocabularySchema.parse(
  readYaml(await readFile("content/glossary.yaml", "utf8")),
);
if (new Set(vocabulary.map((t) => t.id)).size !== vocabulary.length)
  throw new Error("Duplicate vocabulary ID");
for (const term of vocabulary)
  if (!curriculum.lessons.some((l) => l.id === term.lesson))
    throw new Error(`Missing vocabulary lesson: ${term.id}`);
await writeFile(
  "src/lib/generated/vocabulary.json",
  JSON.stringify(vocabulary),
);
await writeFile(
  "src/lib/generated/curriculum.json",
  JSON.stringify(curriculum),
);
const closure = curriculum.recipes.map((recipe) => {
  const path = planPath(curriculum, recipe, []);
  return {
    recipe: recipe.id,
    level: "initial draft course",
    objectiveCount: path.required.length,
    objectiveIds: path.required,
    lessonIds: path.lessons.map((l) => l.id),
    assetCount: path.lessons.length,
    estimatedMinutes: path.lessons.reduce((n, l) => n + l.minutes, 0),
  };
});
await writeFile(
  "src/lib/generated/closures.json",
  JSON.stringify(closure, null, 2),
);
console.log(
  `Validated ${lessons.length} draft assets, ${objectives.length} objectives, ${curriculum.catalog.length} complete draft modules.`,
);
for (const route of closure)
  console.log(
    `${route.recipe}: ${route.assetCount} assets / ${route.objectiveCount} objectives (initial draft course).`,
  );
await writeFile("content/COVERAGE.md", coverageReport(curriculum));
await writeFile("content/EDITORIAL_REVIEW.md", editorialReport(curriculum));
const quality = editorialMetrics(curriculum);
if (
  quality.longest / quality.choices > 0.5 ||
  quality.absoluteDistractors / quality.choices > 0.25 ||
  quality.binary / quality.choices > 0.1
)
  console.warn(
    "Editorial review needed: answer-shape patterns remain in later draft banks. See content/EDITORIAL_REVIEW.md.",
  );
