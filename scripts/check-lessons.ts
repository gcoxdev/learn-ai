import { execFileSync } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import { basename } from "node:path";
import { parseDocument } from "yaml";
import { compileLesson } from "./compile-lesson";
import { markdownWords } from "./lesson-markdown";

/**
 * Fast per-lesson validation for authors. Does not write generated files, so
 * several people can edit different lessons at the same time.
 *
 *   node --import tsx scripts/check-lessons.ts content/lessons/a.yaml [...]
 *   node --import tsx scripts/check-lessons.ts --all [--summary]
 *
 * ERRORS break the build or saved learner progress and must be fixed.
 * WARNINGS are teaching-quality lint; fix them unless there is a clear reason.
 * Compatibility is checked against the lesson file at git HEAD (or --base REF).
 */
const args = process.argv.slice(2);
const summaryOnly = args.includes("--summary");
const baseIndex = args.indexOf("--base");
const base = baseIndex >= 0 ? args[baseIndex + 1] : "HEAD";
let files = args.filter(
  (a, i) => !a.startsWith("--") && (baseIndex < 0 || i !== baseIndex + 1),
);
if (args.includes("--all") || !files.length)
  files = (await readdir("content/lessons"))
    .filter((f) => f.endsWith(".yaml"))
    .map((f) => `content/lessons/${f}`);

const allLessonIds = new Set<string>();
for (const f of await readdir("content/lessons"))
  if (f.endsWith(".yaml")) {
    const doc = parseDocument(await readFile(`content/lessons/${f}`, "utf8"));
    const id = (doc.toJSON() as any)?.lesson?.id;
    if (id) allLessonIds.add(id);
  }

const ABSOLUTE =
  /^(only|always|never|every|all|no)\b|\b(only|always|never|every|guarantee[sd]?|automatically|entire|all|nothing)\b/i;
const GENERIC_HINTS = [
  /^work through the example one step at a time/i,
  /^trace the example in your own words/i,
  /trace the inputs, operation, and result before choosing/i,
  /^write the operation and the intermediate values/i,
];
const META =
  /\b(draft(?! models?\b| tokens?\b)|question bank|small bank|institutional|course credit|mastery credit|certif(y|ies|icate)|the app\b|this app\b|the browser\b|in-app|does not grade|cannot grade|unseen artifact)/i;
const HEDGE =
  /\b(does|do|did|can)\s?not\s+(by itself\s+|alone\s+|necessarily\s+|automatically\s+)?(establish|prove|guarantee|certify)\b|\bis not (a )?(proof|guarantee|certificate)\b/gi;

type Report = { file: string; errors: string[]; warnings: string[]; words: number };
const reports: Report[] = [];

for (const file of files) {
  const r: Report = { file, errors: [], warnings: [], words: 0 };
  reports.push(r);
  let source: any;
  try {
    const doc = parseDocument(await readFile(file, "utf8"), { uniqueKeys: true });
    if (doc.errors.length) throw new Error(doc.errors.map((e) => e.message).join("; "));
    source = doc.toJSON();
  } catch (e) {
    r.errors.push(`YAML: ${(e as Error).message}`);
    continue;
  }
  let compiled: ReturnType<typeof compileLesson>;
  try {
    compiled = compileLesson(source, basename(file));
  } catch (e) {
    r.errors.push(`compile: ${(e as Error).message.split("\n").slice(0, 6).join(" | ")}`);
    continue;
  }
  const { lesson } = compiled;
  const scenes = new Map(lesson.scenes.map((s) => [s.id, s]));
  const srcScenes = new Map<string, any>(source.scenes.map((s: any) => [s.id, s]));
  if (scenes.size !== lesson.scenes.length) r.errors.push("duplicate scene id");

  // Structure (mirrors content-audit / validateGraph for this lesson).
  for (const [name, route] of Object.entries(lesson.routes)) {
    if (!route.length) continue;
    for (const id of route) if (!scenes.has(id)) r.errors.push(`route ${name} lists missing scene ${id}`);
    const last = scenes.get(route.at(-1)!);
    if (last?.type !== "assessment" || !last.takeaway)
      r.errors.push(`route ${name} must end with the assessment scene carrying a takeaway`);
    if (route.slice(0, -1).length < 3) r.errors.push(`route ${name} needs at least 3 teaching scenes`);
  }
  for (const [alias, target] of Object.entries(lesson.sceneAliases))
    if (!scenes.has(target)) r.errors.push(`scene alias ${alias} → missing ${target}`);
  const objectiveIds = new Set(source.objectives.map((o: any) => o.id));
  for (const s of source.scenes) {
    for (const o of s.objective_refs ?? [])
      if (!objectiveIds.has(o)) r.errors.push(`scene ${s.id} refers to unknown objective ${o}`);
    for (const b of s.bridges ?? [])
      if (!allLessonIds.has(b)) r.errors.push(`scene ${s.id} bridge to unknown lesson ${b}`);
  }
  const active = lesson.questions.filter((q) => !q.retired);
  const prompts = active.map((q) => q.prompt.trim());
  if (new Set(prompts).size !== prompts.length) r.errors.push("two active questions share a prompt");
  for (const o of source.objectives)
    for (const fam of o.evidence_families) {
      const n = active.filter((q) => q.family === fam).length;
      if (n < 2) r.errors.push(`family ${fam} needs at least 2 active variants (has ${n})`);
    }
  for (const fam of source.assessment_families) {
    if (fam.remediation_scene && !scenes.has(fam.remediation_scene))
      r.errors.push(`family ${fam.id} remediation scene ${fam.remediation_scene} does not exist`);
    if (!objectiveIds.has(fam.objective_ref)) r.errors.push(`family ${fam.id} has unknown objective`);
  }
  for (const q of lesson.questions) {
    if (q.options.length && !q.options.some((o) => o.id === q.answers.choice))
      r.errors.push(`${q.id}: answer key not among options`);
    if (new Set(q.options.map((o) => o.id)).size !== q.options.length)
      r.errors.push(`${q.id}: duplicate option ids`);
    for (const f of q.fields)
      if (typeof q.answers[f.id] !== "number") r.errors.push(`${q.id}: field ${f.id} needs a numeric answer`);
  }

  // Compatibility with saved learner progress at the base revision.
  let old: any = null;
  try {
    const text = execFileSync("git", ["show", `${base}:${file}`], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    old = parseDocument(text).toJSON();
  } catch {
    /* new lesson */
  }
  if (old) {
    if (old.lesson.id !== source.lesson.id) r.errors.push("lesson id changed");
    if (old.lesson.slot !== source.lesson.slot) r.warnings.push("slot changed (catalog must match)");
    for (const s of old.scenes) {
      if (!srcScenes.has(s.id) && !(s.id in lesson.sceneAliases))
        r.errors.push(`scene ${s.id} was removed; keep it or add a scene_aliases entry`);
      const now = srcScenes.get(s.id);
      if (s.figure && now && now.figure?.kind !== s.figure.kind)
        r.errors.push(`scene ${s.id} must keep figure kind ${s.figure.kind} (saved learner state)`);
    }
    const oldObjectives = new Map<string, any>(old.objectives.map((o: any) => [o.id, o]));
    for (const [id] of oldObjectives)
      if (!objectiveIds.has(id)) r.errors.push(`objective ${id} was removed`);
    const oldVariants = new Map<string, any>();
    for (const fam of old.assessment_families)
      for (const v of fam.variants) oldVariants.set(v.id, { ...v, family: fam.id, objective: fam.objective_ref });
    const newVariants = new Map<string, any>();
    for (const fam of source.assessment_families)
      for (const v of fam.variants) newVariants.set(v.id, { ...v, family: fam.id, objective: fam.objective_ref });
    const changedObjectives = new Set<string>();
    for (const [id, v] of oldVariants) {
      const now = newVariants.get(id);
      if (!now) {
        r.errors.push(`variant ${id} was deleted; mark it retired: true instead`);
        continue;
      }
      if (now.family !== v.family) r.errors.push(`variant ${id} moved family`);
      const oldIds = (v.options ?? v.reason_options ?? []).map((o: any) => o.id).join();
      const newIds = (now.options ?? now.reason_options ?? []).map((o: any) => o.id).join();
      if (oldIds !== newIds) r.errors.push(`variant ${id} changed its option ids`);
      if (JSON.stringify(v.answer ?? v.answers) !== JSON.stringify(now.answer ?? now.answers))
        r.errors.push(`variant ${id} changed its answer key; retire it and add a new variant`);
      if (!v.retired && now.retired) changedObjectives.add(v.objective);
      if (v.retired && !now.retired) r.errors.push(`variant ${id} was un-retired`);
    }
    for (const o of source.objectives) {
      const before = oldObjectives.get(o.id);
      if (!before) continue;
      const familiesChanged =
        JSON.stringify(before.evidence_families) !== JSON.stringify(o.evidence_families);
      if ((changedObjectives.has(o.id) || familiesChanged) && before.version === o.version)
        r.errors.push(
          `objective ${o.id}: variants were retired or families changed, so bump its version (currently ${o.version})`,
        );
    }
  }

  // Teaching-quality lint.
  const coreIds = lesson.routes.core;
  const teaching = source.scenes.filter(
    (s: any) => coreIds.includes(s.id) && s.type !== "assessment",
  );
  r.words = teaching.reduce((n: number, s: any) => n + markdownWords(s.markdown ?? ""), 0);
  const isBridge = lesson.category === "bridge";
  const isProject = lesson.archetype === "project";
  if (!isProject && lesson.slot !== "A01" && r.words < (isBridge ? 300 : 350))
    r.warnings.push(`only ${r.words} teaching words; core lessons should reach ~350+ with a worked example`);
  const prose = [
    ["summary", source.lesson.summary ?? ""],
    // Recap scenes sit outside every route, so learners never see them.
    ...source.scenes
      .filter((s: any) => s.type !== "recap")
      .map((s: any) => [s.id, `${s.markdown ?? ""}\n${s.takeaway ?? ""}`]),
  ] as [string, string][];
  for (const [where, text] of prose) {
    const meta = text.match(META);
    if (meta) r.warnings.push(`${where}: learner-facing text mentions "${meta[0]}" (authoring/product language)`);
  }
  const hedges = prose.flatMap(([, t]) => t.match(HEDGE) ?? []);
  if (hedges.length > 1)
    r.warnings.push(`${hedges.length} disclaimers like "${hedges[0]}"; keep at most one, phrased as advice`);
  if ((source.objectives[0]?.statement ?? "").trim() === (source.lesson.summary ?? "").trim())
    r.warnings.push("summary copies the objective; write an invitation instead");
  for (const s of teaching) {
    const md: string = s.markdown ?? "";
    const seen = new Set<string>();
    for (const m of md.matchAll(/\*\*([^*]{3,40})\*\*/g)) {
      if (seen.has(m[1].toLowerCase())) continue;
      seen.add(m[1].toLowerCase());
      if (new RegExp(`\\*\\*${m[1].replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\*\\*`, "i").test(md.slice(0, m.index))) continue;
      const term = m[1].toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const earlier = md.slice(0, m.index).replace(/\*\*/g, "").toLowerCase();
      if (new RegExp(`\\b${term}\\b`).test(earlier))
        r.warnings.push(`${s.id}: "${m[1]}" is used before it is defined in bold`);
    }
  }
  for (const q of active) {
    if (q.kind !== "choice") continue;
    const answer = q.options.find((o) => o.id === q.answers.choice);
    const distractors = q.options.filter((o) => o.id !== q.answers.choice);
    if (!answer) continue;
    if (q.options.length < 3) r.warnings.push(`${q.id}: offer at least three options`);
    const longestOther = Math.max(...distractors.map((d) => d.text.length));
    if (answer.text.length > longestOther * 1.3 && answer.text.length - longestOther > 12)
      r.warnings.push(`${q.id}: correct option is much longer than every distractor`);
    if (!ABSOLUTE.test(answer.text) && distractors.length && distractors.every((d) => ABSOLUTE.test(d.text)))
      r.warnings.push(`${q.id}: every distractor uses an absolute word (only/every/always/guarantee…) and the answer does not`);
    if (
      /^(is|are|does|do|can|must|should|will)\b/i.test(q.prompt) &&
      q.options.some((o) => /^(yes|no)\b/i.test(o.text))
    )
      r.warnings.push(`${q.id}: yes/no question; ask for a choice among plausible alternatives`);
    if ((q.feedback ?? "").trim().replace(/\.$/, "") === answer.text.trim().replace(/\.$/, ""))
      r.warnings.push(`${q.id}: feedback only repeats the answer; explain why`);
  }
  for (const fam of source.assessment_families)
    if (
      fam.variants.some((v: any) => !v.retired) &&
      GENERIC_HINTS.some((h) => h.test(fam.hint ?? ""))
    )
      r.warnings.push(`${fam.id}: generic hint; point to this lesson's specific idea`);
}

let errorCount = 0;
let warningCount = 0;
for (const r of reports) {
  errorCount += r.errors.length;
  warningCount += r.warnings.length;
  if (summaryOnly || (!r.errors.length && !r.warnings.length)) continue;
  console.log(`\n${r.file} (${r.words} teaching words)`);
  for (const e of r.errors) console.log(`  ERROR   ${e}`);
  for (const w of r.warnings) console.log(`  warning ${w}`);
}
console.log(
  `\nChecked ${reports.length} lesson file(s): ${errorCount} error(s), ${warningCount} warning(s).`,
);
if (summaryOnly) {
  const byKind = new Map<string, number>();
  for (const r of reports)
    for (const w of r.warnings) {
      const k = w.replace(/^[^:]*: /, "").replace(/"[^"]*"/g, '"…"').replace(/\d+/g, "N").slice(0, 70);
      byKind.set(k, (byKind.get(k) ?? 0) + 1);
    }
  for (const [k, n] of [...byKind].sort((a, b) => b[1] - a[1]).slice(0, 25))
    console.log(`${String(n).padStart(5)}  ${k}`);
}
process.exitCode = errorCount ? 1 : 0;
