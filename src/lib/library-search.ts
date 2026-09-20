import type { ZodType } from "zod";
import { mastered } from "./engine";
import {
  lessonOriginSchema,
  type Attempt,
  type Curriculum,
  type Lesson,
  type LessonOrigin,
} from "./model";

export type LibraryOrigin = Extract<LessonOrigin, { kind: "library" }>;
export type LibraryState = Omit<LibraryOrigin, "kind" | "module">;
export type EvidenceState = NonNullable<LibraryState["evidence"]>;
export const libraryPageSize = 24;
export const timeOptions = [
  { value: "up-to-5", label: "5 min or less" },
  { value: "6-to-10", label: "6–10 min" },
  { value: "11-to-20", label: "11–20 min" },
  { value: "over-20", label: "Over 20 min" },
] as const;
export const archetypeOptions = [
  { value: "foundation", label: "Foundation" },
  { value: "mechanism", label: "How it works" },
  { value: "comparison", label: "Comparison" },
  { value: "project", label: "Project" },
  { value: "perspective", label: "Perspective" },
] as const;
export const evidenceOptions = [
  { value: "not-demonstrated", label: "Not yet demonstrated" },
  { value: "demonstrated", label: "Core ideas demonstrated" },
  { value: "practice", label: "Practice only" },
] as const;

function validValue<T>(schema: ZodType<T>, value: unknown): T | undefined {
  const parsed = schema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}

// Invalid URL facets are ignored individually; a shared URL cannot inject a
// return destination or prevent the rest of the library from opening.
export function readLibraryState(params: URLSearchParams): LibraryState {
  const fields = lessonOriginSchema.options[1].shape;
  const page = params.get("page");
  return {
    view: validValue(fields.view, params.get("view")) ?? "lessons",
    query: (params.get("q") ?? "").slice(0, 500),
    moduleFilter: validValue(fields.moduleFilter, params.get("module")),
    time: validValue(fields.time, params.get("time")),
    archetype: validValue(fields.archetype, params.get("archetype")),
    evidence: validValue(fields.evidence, params.get("evidence")),
    page:
      page && /^[1-9]\d*$/.test(page)
        ? validValue(fields.page, Number(page))
        : undefined,
  };
}

export function libraryHref(state: LibraryState, module?: string): string {
  const params = new URLSearchParams();
  if (state.view !== "lessons") params.set("view", state.view);
  if (state.query) params.set("q", state.query);
  if (state.moduleFilter) params.set("module", state.moduleFilter);
  if (state.time) params.set("time", state.time);
  if (state.archetype) params.set("archetype", state.archetype);
  if (state.evidence) params.set("evidence", state.evidence);
  if (state.page && state.page > 1) params.set("page", String(state.page));
  return `/library/${params.size ? `?${params}` : ""}${module ? `#${module}` : ""}`;
}

function normalized(text: string): string {
  return text.toLocaleLowerCase("en").trim().replace(/\s+/g, " ");
}

// Both live suggestions and library results use this ranking. Stable authored
// order breaks ties and remains the default when the query is empty.
export function rankLessons(lessons: Lesson[], query: string): Lesson[] {
  const phrase = normalized(query);
  if (!phrase) return lessons;
  const words = phrase.split(" ");
  return lessons
    .map((lesson, index) => {
      const title = normalized(lesson.title);
      const slot = normalized(lesson.slot);
      const text = `${title} ${normalized(lesson.summary)} ${slot}`;
      if (!words.every((word) => text.includes(word))) return null;
      const rank =
        title === phrase
          ? 100
          : slot === phrase
            ? 90
            : title.startsWith(phrase)
              ? 80
              : title.includes(phrase)
                ? 60
                : slot.includes(phrase)
                  ? 50
                  : 20;
      return { lesson, rank, index };
    })
    .filter((match) => match !== null)
    .sort((a, b) => b.rank - a.rank || a.index - b.index)
    .map(({ lesson }) => lesson);
}

export function lessonEvidence(
  curriculum: Curriculum,
  attempts: Attempt[],
): Map<string, EvidenceState> {
  const demonstrated = new Set(
    curriculum.objectives
      .filter(
        (objective) =>
          objective.scope === "core" && mastered(objective, attempts),
      )
      .map((objective) => objective.id),
  );
  const core = new Set(
    curriculum.objectives
      .filter((objective) => objective.scope === "core")
      .map((objective) => objective.id),
  );
  return new Map(
    curriculum.lessons.map((lesson) => {
      const objectives = lesson.objectives.filter((id) => core.has(id));
      const evidence =
        lesson.category === "advanced" || objectives.length === 0
          ? "practice"
          : objectives.every((id) => demonstrated.has(id))
            ? "demonstrated"
            : "not-demonstrated";
      return [lesson.id, evidence];
    }),
  );
}

export function filterLessons(
  lessons: Lesson[],
  state: LibraryState,
  evidence: Map<string, EvidenceState>,
): Lesson[] {
  return rankLessons(lessons, state.query).filter((lesson) => {
    if (state.moduleFilter === "bridges" && lesson.category !== "bridge")
      return false;
    if (state.moduleFilter === "advanced" && lesson.category !== "advanced")
      return false;
    if (
      state.moduleFilter?.startsWith("M") &&
      !lesson.slot.startsWith(`${state.moduleFilter}.`)
    )
      return false;
    if (state.archetype && state.archetype !== lesson.archetype) return false;
    if (state.evidence && state.evidence !== evidence.get(lesson.id))
      return false;
    if (state.time === "up-to-5" && lesson.minutes > 5) return false;
    if (
      state.time === "6-to-10" &&
      (lesson.minutes <= 5 || lesson.minutes > 10)
    )
      return false;
    if (
      state.time === "11-to-20" &&
      (lesson.minutes <= 10 || lesson.minutes > 20)
    )
      return false;
    if (state.time === "over-20" && lesson.minutes <= 20) return false;
    return true;
  });
}

export function paginateLessons(lessons: Lesson[], requested = 1) {
  const pages = Math.max(1, Math.ceil(lessons.length / libraryPageSize));
  const page = Math.min(pages, Math.max(1, Math.trunc(requested) || 1));
  const start = (page - 1) * libraryPageSize;
  return {
    lessons: lessons.slice(start, start + libraryPageSize),
    page,
    pages,
    start,
  };
}
