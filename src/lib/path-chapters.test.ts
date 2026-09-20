import { describe, expect, it } from "vitest";
import { curriculum } from "./content";
import { planPath } from "./engine";
import type { Attempt } from "./model";
import { chapterProgress, pathChapters } from "./path-chapters";

describe("path chapters", () => {
  it("preserves every path's complete prerequisite order and unique lesson links", () => {
    for (const recipe of curriculum.recipes) {
      const plan = planPath(curriculum, recipe, []);
      const chapters = pathChapters(plan.lessons);
      expect(chapters.flatMap((chapter) => chapter.lessons)).toEqual(
        plan.lessons,
      );
      expect(new Set(chapters.map((chapter) => chapter.id)).size).toBe(
        chapters.length,
      );
      let start = 0;
      for (const chapter of chapters) {
        expect(chapter.start).toBe(start);
        expect(chapter.lessons.length).toBeGreaterThanOrEqual(6);
        expect(chapter.lessons.length).toBeLessThanOrEqual(8);
        start += chapter.lessons.length;
      }
      expect(chapters[0].lessons.map((lesson) => lesson.id)).toEqual([
        "ai-systems",
        "inputs-and-outputs",
        "data-and-examples",
        "models-and-products",
        "weights-and-predictions",
        "training-and-inference",
        "inside-a-system",
      ]);
    }
  });

  it("handles an empty or short syllabus without losing lessons", () => {
    expect(pathChapters([])).toEqual([]);
    for (let count = 1; count <= 20; count++) {
      const lessons = curriculum.lessons.slice(0, count);
      const chapters = pathChapters(lessons);
      expect(chapters.flatMap((chapter) => chapter.lessons)).toEqual(lessons);
      expect(chapters.every((chapter) => chapter.lessons.length <= 8)).toBe(
        true,
      );
    }
  });

  it("counts only required objectives with compatible independent assessment evidence", () => {
    const plan = planPath(curriculum, curriculum.recipes[0], []);
    const chapter = pathChapters(plan.lessons)[0];
    const objective = curriculum.objectives.find(
      (item) => item.id === "objective.ai-systems",
    )!;
    const attempts: Attempt[] = objective.families.map((family, index) => ({
      id: `chapter-test-${index}`,
      objective: objective.id,
      version: objective.version,
      family,
      variant: "chapter-test",
      correct: true,
      independent: true,
      mode: "assessment",
      at: index + 1,
      responses: {},
    }));
    const progress = (evidence: Attempt[]) =>
      chapterProgress(chapter, curriculum, plan.required, evidence);
    expect(progress([]).demonstrated).toBe(0);
    expect(progress(attempts).demonstrated).toBe(1);
    expect(progress(attempts.slice(0, 1)).demonstrated).toBe(0);
    expect(
      progress(attempts.map((attempt) => ({ ...attempt, version: "old" })))
        .demonstrated,
    ).toBe(0);
    expect(
      progress(attempts.map((attempt) => ({ ...attempt, independent: false })))
        .demonstrated,
    ).toBe(0);
    expect(
      progress(attempts.map((attempt) => ({ ...attempt, mode: "practice" })))
        .demonstrated,
    ).toBe(0);
    expect(chapterProgress(chapter, curriculum, [], attempts)).toEqual({
      demonstrated: 0,
      total: 0,
    });
    expect(progress(attempts).total).toBe(progress([]).total);
  });
});
