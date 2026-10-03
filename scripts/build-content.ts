import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { parseDocument } from "yaml";
import { curriculumSchema, vocabularySchema } from "../src/lib/model";
import { compileLesson } from "./compile-lesson";
import { validateGraph, planPath } from "../src/lib/engine";
import { auditContent, coverageReport } from "./content-audit";
import { editorialMetrics, editorialReport } from "./editorial-report";
import { pathCoverageReport } from "./path-coverage";

function readYaml(text: string) {
  const doc = parseDocument(text, { uniqueKeys: true });
  if (doc.errors.length)
    throw new Error(doc.errors.map((e) => e.message).join("\n"));
  return doc.toJSON();
}
const index = readYaml(await readFile("content/curriculum.yaml", "utf8"));
const lessons: ReturnType<typeof compileLesson>["lesson"][] = [];
const objectives: ReturnType<typeof compileLesson>["objectives"] = [];

for (const filename of (await readdir("content/lessons"))
  .filter((f) => f.endsWith(".yaml"))
  .sort()) {
  const source = readYaml(
    await readFile(`content/lessons/${filename}`, "utf8"),
  );
  const compiled = compileLesson(source, filename);
  lessons.push(compiled.lesson);
  objectives.push(...compiled.objectives);
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
await writeFile("content/PATH_COVERAGE.md", pathCoverageReport(curriculum));
const quality = editorialMetrics(curriculum);
if (
  quality.longest / quality.choices > 0.5 ||
  quality.absoluteDistractors / quality.choices > 0.25 ||
  quality.binary / quality.choices > 0.1
)
  console.warn(
    "Editorial review needed: answer-shape patterns remain in later draft banks. See content/EDITORIAL_REVIEW.md.",
  );
