import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { compileLesson } from "../../scripts/compile-lesson";
import { curriculum } from "./content";
import { scenePlainText } from "./lesson-exports";

function sourceLesson() {
  return parse(
    readFileSync("content/lessons/digital-representations.yaml", "utf8"),
  );
}

describe("lesson overviews", () => {
  it("opens every available route with one short, lesson-specific overview", () => {
    for (const lesson of curriculum.lessons) {
      const overview = lesson.scenes.find(
        (scene) => scene.type === "overview",
      )!;
      expect(overview, lesson.id).toBeDefined();
      expect(
        lesson.scenes.filter((scene) => scene.type === "overview"),
      ).toHaveLength(1);
      expect(scenePlainText(overview.html)).toContain(lesson.summary);
      expect(
        scenePlainText(overview.html).split(/\s+/).length,
      ).toBeLessThanOrEqual(130);
      expect(overview.activity).toBeUndefined();
      for (const route of Object.values(lesson.routes)) {
        if (!route.length) continue;
        expect(route[0]).toBe(overview.id);
        expect(route.filter((id) => id === overview.id)).toHaveLength(1);
        expect(
          lesson.scenes.find((scene) => scene.id === route.at(-1))?.type,
        ).toBe("assessment");
      }
      for (const objective of curriculum.objectives.filter(
        (o) => o.lesson === lesson.id,
      )) {
        expect(scenePlainText(overview.html)).toContain(objective.title);
        if (objective.scope === "mathematics")
          expect(scenePlainText(overview.html)).toContain(
            `Optional mathematics: ${objective.title}`,
          );
      }
    }
  });

  it("preserves authored scene IDs, route order, and aliases without mutating the source", () => {
    const source = sourceLesson();
    const original = structuredClone(source);
    const first = compileLesson(source, "digital-representations.yaml").lesson;
    const second = compileLesson(source, "digital-representations.yaml").lesson;
    expect(source).toEqual(original);
    expect(second).toEqual(first);
    expect(first.routes.core.slice(1)).toEqual(
      source.navigation.routes.find(
        (r: { id: string }) => r.id === "route.core",
      ).scene_sequence,
    );
    expect(first.scenes.slice(1).map((scene) => scene.id)).toEqual(
      source.scenes.map((scene: { id: string }) => scene.id),
    );
    expect(first.sceneAliases).toEqual(source.navigation.scene_aliases ?? {});
    expect(first.routes.mathematics).toEqual([]);
  });

  it("renders summary and goals as literal text, including prices and markup", () => {
    const source = sourceLesson();
    source.lesson.summary =
      'Compare $2 and $4; read <img src=x onerror="alert(1)"> as text.';
    source.objectives[0].statement = "Explain A & B < C.";
    const overview = compileLesson(source, "example.yaml").lesson.scenes[0];
    expect(overview.html).toContain("$2 and $4");
    expect(overview.html).toContain("&lt;img");
    expect(overview.html).not.toContain("<img");
    expect(overview.html).toContain("A &amp; B &lt; C.");
    expect(overview.html).not.toContain("katex");
  });
});
