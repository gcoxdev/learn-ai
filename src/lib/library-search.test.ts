import { describe, expect, it } from "vitest";
import { curriculum } from "./content";
import type { Attempt, Lesson } from "./model";
import {
  filterLessons,
  lessonEvidence,
  libraryHref,
  libraryPageSize,
  paginateLessons,
  rankLessons,
  readLibraryState,
  type LibraryState,
} from "./library-search";

const base: LibraryState = { view: "lessons", query: "" };
const evidence = lessonEvidence(curriculum, []);
const first = curriculum.lessons.find((lesson) => lesson.id === "ai-systems")!;
const objective = curriculum.objectives.find(
  (item) => item.id === first.objectives[0],
)!;
const correct: Attempt[] = objective.families.map((family, index) => ({
  id: `library-test-${index}`,
  objective: objective.id,
  version: objective.version,
  family,
  variant: first.questions.find((question) => question.family === family)!.id,
  correct: true,
  independent: true,
  mode: "assessment",
  at: index,
  responses: {},
}));

describe("library discovery", () => {
  it("ranks exact titles and title matches before summaries, retaining authored ties", () => {
    const lessons = [
      {
        ...first,
        id: "summary",
        title: "A broader idea",
        summary: "Attention is useful.",
      },
      {
        ...first,
        id: "title",
        title: "How attention works",
        summary: "One explanation.",
      },
      {
        ...first,
        id: "exact",
        title: "Attention",
        summary: "One explanation.",
      },
      {
        ...first,
        id: "tie",
        title: "How attention helps",
        summary: "One explanation.",
      },
    ];
    expect(
      rankLessons(lessons, "  ATTENTION  ").map((lesson) => lesson.id),
    ).toEqual(["exact", "title", "tie", "summary"]);
    expect(
      rankLessons(lessons, "attention useful").map((lesson) => lesson.id),
    ).toEqual(["summary"]);
    expect(rankLessons(lessons, "missing word")).toEqual([]);
    expect(rankLessons(lessons, "")).toBe(lessons);
    expect(rankLessons(curriculum.lessons, "M15.2")[0].id).toBe("attention");
  });

  it("combines all facets and search without hiding bridge or advanced entries", () => {
    const found = filterLessons(
      curriculum.lessons,
      {
        ...base,
        query: "attention",
        moduleFilter: "M15",
        time: "6-to-10",
        archetype: "mechanism",
        evidence: "not-demonstrated",
      },
      evidence,
    );
    expect(found.length).toBeGreaterThan(0);
    expect(found.some((lesson) => lesson.id === "attention")).toBe(true);
    expect(
      found.every(
        (lesson) =>
          lesson.slot.startsWith("M15.") &&
          lesson.minutes > 5 &&
          lesson.minutes <= 10,
      ),
    ).toBe(true);
    expect(
      filterLessons(
        curriculum.lessons,
        { ...base, moduleFilter: "bridges" },
        evidence,
      ),
    ).toHaveLength(23);
    expect(
      filterLessons(
        curriculum.lessons,
        { ...base, moduleFilter: "advanced", evidence: "practice" },
        evidence,
      ).map((lesson) => lesson.id),
    ).toEqual(["experts"]);
    expect(
      filterLessons(
        curriculum.lessons,
        { ...base, moduleFilter: "advanced", evidence: "demonstrated" },
        evidence,
      ),
    ).toEqual([]);
  });

  it.each([
    ["up-to-5", [5]],
    ["6-to-10", [6, 10]],
    ["11-to-20", [11, 20]],
    ["over-20", [21, 60]],
  ] as const)(
    "gives the %s time filter explicit, nonoverlapping boundaries",
    (time, expected) => {
      const lessons: Lesson[] = [5, 6, 10, 11, 20, 21, 60].map((minutes) => ({
        ...first,
        minutes,
      }));
      expect(
        filterLessons(lessons, { ...base, time }, evidence).map(
          (lesson) => lesson.minutes,
        ),
      ).toEqual(expected);
    },
  );

  it("uses all eligible core evidence and never promotes partial or practice evidence", () => {
    expect(lessonEvidence(curriculum, correct).get(first.id)).toBe(
      "demonstrated",
    );
    expect(lessonEvidence(curriculum, correct.slice(0, 1)).get(first.id)).toBe(
      "not-demonstrated",
    );
    for (const changes of [
      { correct: false },
      { independent: false },
      { mode: "practice" as const },
      { version: "obsolete" },
    ]) {
      expect(
        lessonEvidence(
          curriculum,
          correct.map((attempt) => ({ ...attempt, ...changes })),
        ).get(first.id),
      ).toBe("not-demonstrated");
    }
    expect(lessonEvidence(curriculum, []).get("experts")).toBe("practice");
    const gradient = curriculum.lessons.find(
      (lesson) => lesson.id === "learning-update",
    )!;
    const coreObjectives = curriculum.objectives.filter(
      (item) => gradient.objectives.includes(item.id) && item.scope === "core",
    );
    const coreAttempts = coreObjectives.flatMap((item) =>
      item.families.map((family) => ({
        ...correct[0],
        objective: item.id,
        version: item.version,
        family,
      })),
    );
    expect(gradient.objectives.length).toBeGreaterThan(coreObjectives.length);
    expect(lessonEvidence(curriculum, coreAttempts).get(gradient.id)).toBe(
      "demonstrated",
    );
  });

  it("paginates every lesson exactly once and clamps pages after filters narrow", () => {
    const firstPage = paginateLessons(curriculum.lessons);
    expect(firstPage.lessons).toHaveLength(libraryPageSize);
    const ids = Array.from(
      { length: firstPage.pages },
      (_, index) => paginateLessons(curriculum.lessons, index + 1).lessons,
    )
      .flat()
      .map((lesson) => lesson.id);
    expect(ids).toEqual(curriculum.lessons.map((lesson) => lesson.id));
    expect(new Set(ids).size).toBe(ids.length);
    expect(paginateLessons(curriculum.lessons.slice(0, 3), 9000).page).toBe(1);
    expect(paginateLessons([], 3)).toEqual({
      lessons: [],
      page: 1,
      pages: 1,
      start: 0,
    });
  });

  it("round-trips filters and escapes queries as data", () => {
    const state: LibraryState = {
      ...base,
      query: "attention & tokens/#",
      moduleFilter: "M15",
      time: "6-to-10",
      archetype: "mechanism",
      evidence: "not-demonstrated",
      page: 2,
    };
    const url = new URL(libraryHref(state), "https://classroom.test");
    expect(readLibraryState(url.searchParams)).toEqual(state);
    expect(url.hash).toBe("");
    expect(libraryHref(base)).toBe("/library/");
  });

  it("ignores unknown URL values without losing a valid search or facet", () => {
    const parsed = readLibraryState(
      new URLSearchParams(
        "q=attention&view=unknown&module=M99&time=fast&archetype=other&evidence=complete&page=-8",
      ),
    );
    expect(parsed).toEqual({
      ...base,
      query: "attention",
      moduleFilter: undefined,
      time: undefined,
      archetype: undefined,
      evidence: undefined,
      page: undefined,
    });
    expect(
      readLibraryState(new URLSearchParams("module=bridges&page=10001"))
        .moduleFilter,
    ).toBe("bridges");
    for (const page of ["1.2", "0", "Infinity", "10001", "2e2"]) {
      expect(
        readLibraryState(new URLSearchParams({ page })).page,
      ).toBeUndefined();
    }
    expect(
      readLibraryState(new URLSearchParams({ q: "x".repeat(1000) })).query,
    ).toHaveLength(500);
  });
});
