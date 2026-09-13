import type {
  Attempt,
  Curriculum,
  Lesson,
  Objective,
  Progress,
  Question,
  Recipe,
  Responses,
} from "./model";
import { progressSchema } from "./model";

export function familyPassed(
  objective: Objective,
  family: string,
  attempts: Attempt[],
): boolean {
  return attempts.some(
    (a) =>
      a.objective === objective.id &&
      a.version === objective.version &&
      a.family === family &&
      a.correct &&
      a.independent &&
      a.mode !== "practice",
  );
}
export function mastered(objective: Objective, attempts: Attempt[]): boolean {
  return objective.families.every((f) => familyPassed(objective, f, attempts));
}
export function grade(question: Question, responses: Responses): boolean {
  return Object.entries(question.answers).every(([key, answer]) => {
    const raw = responses[key]?.trim();
    if (!raw) return false;
    return typeof answer === "number"
      ? Number.isFinite(Number(raw)) &&
          Math.abs(Number(raw) - answer) <= question.tolerance
      : raw === answer;
  });
}
export function questionsRemaining(
  lesson: Lesson,
  curriculum: Curriculum,
  progress: Progress,
  depth: "core" | "mathematics",
) {
  const objectives = curriculum.objectives.filter(
    (o) =>
      lesson.objectives.includes(o.id) &&
      (depth === "mathematics" || o.scope === "core"),
  );
  const items: Question[] = [];
  const exhausted: string[] = [];
  for (const objective of objectives) {
    for (const family of objective.families) {
      if (familyPassed(objective, family, progress.attempts)) continue;
      const next = lesson.questions.find(
        (q) =>
          !q.retired &&
          q.family === family &&
          !progress.exposures.includes(q.id),
      );
      if (next) items.push(next);
      else exhausted.push(family);
    }
  }
  return {
    items,
    exhausted,
    objectives,
    complete:
      objectives.length > 0 &&
      objectives.every((o) => mastered(o, progress.attempts)),
  };
}
export function validateGraph(curriculum: Curriculum): void {
  const objectives = new Map(curriculum.objectives.map((o) => [o.id, o]));
  const lessons = new Map(curriculum.lessons.map((l) => [l.id, l]));
  if (
    objectives.size !== curriculum.objectives.length ||
    lessons.size !== curriculum.lessons.length
  )
    throw new Error("Duplicate lesson/objective ID");
  const done = new Set<string>();
  const visiting = new Set<string>();
  const visit = (id: string) => {
    const objective = objectives.get(id);
    if (!objective) throw new Error(`Missing required objective: ${id}`);
    if (visiting.has(id)) throw new Error(`Required graph cycle: ${id}`);
    if (done.has(id)) return;
    const lesson = lessons.get(objective.lesson);
    if (!lesson || !lesson.objectives.includes(id))
      throw new Error(`Objective lacks its authored lesson: ${id}`);
    visiting.add(id);
    for (const group of objective.prerequisites) {
      if (!group.anyOf.length) throw new Error(`Empty alternative: ${id}`);
      group.anyOf.forEach(visit);
    }
    for (const family of objective.families) {
      const variants = lesson.questions.filter(
        (q) => !q.retired && q.objective === id && q.family === family,
      );
      if (variants.length < 2)
        throw new Error(`Missing retake variant: ${family}`);
    }
    visiting.delete(id);
    done.add(id);
  };
  curriculum.objectives.forEach((o) => visit(o.id));
  for (const recipe of curriculum.recipes) {
    recipe.roots.forEach(visit);
    if (!lessons.has(recipe.destination))
      throw new Error(`Missing destination: ${recipe.id}`);
  }
  const allQuestionIds = new Set<string>();
  for (const lesson of curriculum.lessons) {
    const ids = new Set(lesson.scenes.map((s) => s.id));
    if (ids.size !== lesson.scenes.length)
      throw new Error(`Duplicate scene: ${lesson.id}`);
    for (const route of Object.values(lesson.routes)) {
      if (
        new Set(route).size !== route.length ||
        route.some((id) => !ids.has(id))
      )
        throw new Error(`Invalid scene route: ${lesson.id}`);
      if (
        route.length &&
        (lesson.scenes.find((s) => s.id === route.at(-1))?.type !==
          "assessment" ||
          route.filter(
            (id) =>
              lesson.scenes.find((s) => s.id === id)?.type === "assessment",
          ).length !== 1)
      )
        throw new Error(
          `Lesson route must end in one combined assessment page: ${lesson.id}`,
        );
    }
    for (const [old, target] of Object.entries(lesson.sceneAliases)) {
      if (
        !ids.has(old) ||
        !ids.has(target) ||
        !lesson.routes.core.includes(target)
      )
        throw new Error(`Invalid saved scene alias: ${lesson.id}/${old}`);
    }
    for (const scene of lesson.scenes) {
      for (const bridge of scene.bridges)
        if (!lessons.has(bridge)) throw new Error(`Missing bridge: ${bridge}`);
    }
    const questionIds = new Set(lesson.questions.map((q) => q.id));
    if (questionIds.size !== lesson.questions.length)
      throw new Error(`Duplicate question: ${lesson.id}`);
    for (const q of lesson.questions) {
      const obj = objectives.get(q.objective);
      if (
        !obj ||
        obj.lesson !== lesson.id ||
        (!q.retired && !obj.families.includes(q.family))
      )
        throw new Error(`Unknown evidence mapping: ${q.id}`);
      if (allQuestionIds.has(q.id))
        throw new Error(`Duplicate global question: ${q.id}`);
      allQuestionIds.add(q.id);
    }
    for (const q of [
      ...lesson.questions,
      ...lesson.entryChecks,
      ...lesson.scenes.flatMap((s) => (s.activity ? [s.activity] : [])),
    ]) {
      const keys = [
        ...q.fields.map((f) => f.id),
        ...(q.options.length ? ["choice"] : []),
      ];
      if (
        !keys.length ||
        new Set(keys).size !== keys.length ||
        Object.keys(q.answers).length !== keys.length ||
        keys.some((key) => !(key in q.answers))
      )
        throw new Error(`Incomplete response contract: ${q.id}`);
      if (
        q.fields.some((f) => typeof q.answers[f.id] !== "number") ||
        (q.options.length && !q.options.some((o) => o.id === q.answers.choice))
      )
        throw new Error(`Invalid answer key: ${q.id}`);
      if (new Set(q.options.map((o) => o.id)).size !== q.options.length)
        throw new Error(`Duplicate option: ${q.id}`);
    }
  }
}

export interface PlannedPath {
  lessons: Lesson[];
  required: string[];
  remaining: string[];
  mastered: string[];
  reasons: Record<string, string[]>;
}
export function planPath(
  curriculum: Curriculum,
  recipe: Recipe,
  attempts: Attempt[],
): PlannedPath {
  // Validate complete content independently of an individual's existing evidence.
  validateGraph(curriculum);
  const objectives = new Map(curriculum.objectives.map((o) => [o.id, o]));
  const required = new Set<string>();
  const remaining: string[] = [];
  const reasons: Record<string, string[]> = {};
  const visited = new Set<string>();
  function visit(id: string, reason: string) {
    const objective = objectives.get(id)!;
    required.add(id);
    reasons[id] = [...new Set([...(reasons[id] ?? []), reason])];
    if (visited.has(id)) return;
    visited.add(id);
    if (mastered(objective, attempts)) return;
    for (const group of objective.prerequisites) {
      // Authored order is the deterministic editorial priority; a mastered valid alternative wins.
      const chosen =
        group.anyOf.find((candidate) =>
          mastered(objectives.get(candidate)!, attempts),
        ) ?? group.anyOf[0];
      visit(chosen, objective.title);
    }
    remaining.push(id);
  }
  recipe.roots.forEach((id) => visit(id, "Required path outcome"));
  // Include satisfied roots/requirements in the syllabus; never manufacture ancestor credit.
  const ordered = [...remaining, ...required].filter(
    (id, i, all) => all.indexOf(id) === i,
  );
  const lessonIds = new Set(ordered.map((id) => objectives.get(id)!.lesson));
  const lessons = [...lessonIds].map((id) =>
    curriculum.lessons.find((l) => l.id === id)!,
  );
  return {
    lessons,
    required: [...required],
    remaining,
    mastered: [...required].filter((id) =>
      mastered(objectives.get(id)!, attempts),
    ),
    reasons,
  };
}

export function parseBackup(text: string, curriculum: Curriculum): Progress {
  if (text.length > 8_000_000)
    throw new Error("This backup is too large (maximum 8 MB).");
  const parsed = progressSchema.parse(JSON.parse(text));
  const ids = new Set(curriculum.lessons.map((l) => l.id));
  for (const [id, p] of Object.entries(parsed.positions)) {
    const lesson = curriculum.lessons.find((l) => l.id === id);
    if (!lesson || !lesson.scenes.some((s) => s.id === p.scene))
      throw new Error("This backup references an unavailable lesson or scene.");
    if (
      p.activeQuestion &&
      !lesson.questions.some((q) => q.id === p.activeQuestion)
    )
      throw new Error("Unknown saved question.");
    if (p.depth === "mathematics" && !lesson.routes.mathematics.length)
      throw new Error("Unsupported saved reading depth.");
  }
  if (parsed.bookmarks.some((id) => !ids.has(id)))
    throw new Error("Unknown saved lesson.");
  const questions = curriculum.lessons.flatMap((l) => l.questions);
  if (parsed.exposures.some((id) => !questions.some((q) => q.id === id)))
    throw new Error("Unknown question exposure.");
  if (parsed.lastLesson && !ids.has(parsed.lastLesson))
    throw new Error("Unknown resume lesson.");
  if (
    parsed.detours.some(
      (d) =>
        !ids.has(d.lesson) ||
        !curriculum.lessons
          .find((l) => l.id === d.lesson)!
          .scenes.some((s) => s.id === d.scene),
    )
  )
    throw new Error("Invalid saved math detour.");
  const attempts = new Map<string, string>();
  for (const attempt of parsed.attempts) {
    const prior = attempts.get(attempt.id);
    if (prior && prior !== JSON.stringify(attempt))
      throw new Error("Conflicting duplicate evidence IDs.");
    attempts.set(attempt.id, JSON.stringify(attempt));
    const objective = curriculum.objectives.find(
      (o) => o.id === attempt.objective,
    );
    const q = curriculum.lessons
      .flatMap((l) => l.questions)
      .find((q) => q.id === attempt.variant);
    if (
      !objective ||
      !q ||
      q.objective !== attempt.objective ||
      q.family !== attempt.family
    )
      throw new Error("This backup contains unknown assessment evidence.");
    // An older objective version may be preserved, but can never satisfy the new standard.
    if (attempt.correct !== grade(q, attempt.responses))
      throw new Error("An assessment response and its result disagree.");
    if (
      attempt.independent &&
      (attempt.mode === "practice" ||
        (q.retired && attempt.version === objective.version) ||
        objective.scope === "mathematics" ||
        objective.lesson === "experts")
    )
      throw new Error(
        "Practice evidence cannot claim independent core credit.",
      );
  }
  return parsed;
}

export function mergeProgress(
  current: Progress,
  incoming: Progress,
  importing = true,
): Progress {
  // Ordinary saves from before a reset must never restore deleted records.
  // An explicitly confirmed backup import can restore them into this reset period.
  if (!importing && current.resetAt !== incoming.resetAt)
    return current.resetAt > incoming.resetAt ? current : incoming;
  const attempts = new Map(current.attempts.map((a) => [a.id, a]));
  for (const a of incoming.attempts) {
    const old = attempts.get(a.id);
    if (old && JSON.stringify(old) !== JSON.stringify(a))
      throw new Error("Conflicting evidence: current progress has been kept.");
    attempts.set(a.id, a);
  }
  const positions = { ...current.positions };
  for (const [id, pos] of Object.entries(incoming.positions)) {
    if (!positions[id] || pos.updatedAt > positions[id].updatedAt)
      positions[id] = pos;
  }
  const recent = incoming.updatedAt > current.updatedAt ? incoming : current;
  return {
    ...recent,
    resetAt: current.resetAt,
    attempts: [...attempts.values()].sort(
      (a, b) => a.at - b.at || a.id.localeCompare(b.id),
    ),
    positions,
    exposures: [
      ...new Set([...current.exposures, ...incoming.exposures]),
    ].sort(),
    bookmarks: importing
      ? [...new Set([...current.bookmarks, ...incoming.bookmarks])].sort()
      : recent.bookmarks,
    updatedAt: Math.max(current.updatedAt, incoming.updatedAt),
    studyDays: [
      ...new Set([...current.studyDays, ...incoming.studyDays]),
    ].sort(),
    lastExportAt: Math.max(current.lastExportAt, incoming.lastExportAt),
    backupDismissedAt: Math.max(
      current.backupDismissedAt,
      incoming.backupDismissedAt,
    ),
  };
}
