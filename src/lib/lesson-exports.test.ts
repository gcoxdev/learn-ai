import { describe, expect, it } from "vitest";
import { curriculum } from "./content";
import {
  createLessonFeedback,
  createProjectReview,
  scenePlainText,
} from "./lesson-exports";

const project = curriculum.lessons.find(
  (lesson) => lesson.id === "tiny-language-model-project",
)!;
const emptyDraft = { notes: "", evidence: "", questions: "" };

describe("project review worksheets", () => {
  it("exports authored context and rubric in route order with truthful version metadata", () => {
    const result = createProjectReview(project, curriculum, {
      notes: "I kept two checkpoint tables.",
      evidence: "counts.csv and comparison.pdf",
      questions: "Is the comparison fair?",
    });
    expect(result).toContain(`Lesson ID: ${project.id}`);
    expect(result).toContain(`Lesson slot: ${project.slot}`);
    expect(result).toContain("Curriculum version: prototype-1");
    const objective = curriculum.objectives.find(
      (item) => item.id === project.objectives[0],
    )!;
    expect(result).toContain(
      `Objective version: ${objective.id} — ${objective.version}`,
    );
    expect(result).not.toContain("Lesson version:");
    // Authored teaching scenes appear in route order (titles are Markdown-escaped).
    const plain = result.replace(/\\(.)/g, "$1");
    const positions = project.routes.core
      .map((id) => project.scenes.find((scene) => scene.id === id)!)
      .filter((scene) => !["assessment", "question", "recap"].includes(scene.type))
      .map((scene) => plain.indexOf(`### ${scene.title}`));
    expect(positions.length).toBeGreaterThan(2);
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
    expect(plain).toMatch(/rubric/i);
    expect(result).toContain("I kept two checkpoint tables.");
    expect(result).toContain("counts.csv and comparison.pdf");
    expect(result).toContain("Is the comparison fair?");
    expect(result).toContain("## Reviewer feedback");
    expect(result).toContain("Status: ungraded");
    expect(result).toContain("does not award mastery credit");
    expect(result).not.toMatch(/<\/?[a-z][^>]*>/i);
  });

  it.each(
    curriculum.lessons.filter((lesson) => lesson.archetype === "project"),
  )(
    "includes the actual reading sequence for $id, without quiz payloads",
    (lesson) => {
      const result = createProjectReview(lesson, curriculum, emptyDraft);
      const plain = result.replace(/\\(.)/g, "$1");
      for (const id of [...lesson.routes.core, ...lesson.routes.mathematics]) {
        const scene = lesson.scenes.find((scene) => scene.id === id)!;
        if (["assessment", "question", "recap"].includes(scene.type)) continue;
        // Titles are Markdown-escaped in the export; compare the unescaped text.
        expect(plain).toContain(scene.title);
      }
      expect(result).toContain("Evidence inspected:");
      expect(result).not.toContain('"answers"');
      expect(result).not.toContain('"attempts"');
    },
  );

  it("never serializes extra progress fields or activity answer keys from its inputs", () => {
    const lesson = structuredClone(project);
    const secret = "PRIVATE_ANSWER_AND_PROGRESS_7c81";
    Object.assign(lesson, {
      progress: secret,
      attempts: [secret],
      backup: secret,
    });
    for (const question of lesson.questions)
      question.answers = { choice: secret };
    for (const scene of lesson.scenes) {
      if (scene.activity) scene.activity.answers = { choice: secret };
      if (scene.type === "assessment" || scene.type === "question")
        scene.html = secret;
    }
    expect(createProjectReview(lesson, curriculum, emptyDraft)).not.toContain(
      secret,
    );
    const result = createLessonFeedback(lesson, curriculum, {
      sceneId: lesson.routes.core[0],
      issue: "clarity",
      note: "Please clarify this example.",
    });
    expect(result).not.toContain(secret);
  });

  it("keeps entered Markdown and HTML literal instead of executable markup", () => {
    const result = createProjectReview(project, curriculum, {
      notes:
        '<script>alert("private")</script>\n# False status\n[click](javascript:alert(1))',
      evidence: "<img src=x onerror=alert(1)>",
      questions: "",
    });
    expect(result).not.toContain("<script>");
    expect(result).not.toContain("<img");
    expect(result).toContain("&lt;script&gt;");
    expect(result).toContain("\\# False status");
    expect(result).toContain("\\[click\\]");
  });

  it("rejects a review export for a non-project lesson", () => {
    const lesson = curriculum.lessons.find(
      (lesson) => lesson.archetype !== "project",
    )!;
    expect(() => createProjectReview(lesson, curriculum, emptyDraft)).toThrow(
      "project lesson",
    );
  });
});

describe("lesson correction exports", () => {
  it("quotes the selected scene and exports only the intentional note with context", () => {
    const scene = project.scenes[0];
    const result = createLessonFeedback(project, curriculum, {
      sceneId: scene.id,
      issue: "clarity",
      note: "  Can you define smoothing earlier?  ",
    });
    expect(result).toContain(`Scene: "${scene.title}"`);
    expect(result).toContain(`Scene ID: ${scene.id}`);
    expect(result).toContain("Issue type: Unclear explanation");
    expect(result).toContain("Can you define smoothing earlier?");
    expect(result).toContain("downloaded locally, not submitted");
    expect(result).not.toContain(scenePlainText(scene.html));
  });

  it("requires a scene belonging to the lesson and a nonempty note", () => {
    expect(() =>
      createLessonFeedback(project, curriculum, {
        sceneId: "other-lesson.s1",
        issue: "clarity",
        note: "This is unclear.",
      }),
    ).toThrow("Choose a scene");
    expect(() =>
      createLessonFeedback(project, curriculum, {
        sceneId: project.scenes[0].id,
        issue: "clarity",
        note: "  \n  ",
      }),
    ).toThrow("add a note");
  });
});

it("converts authored HTML to readable text without carrying markup or scripts", () => {
  expect(
    scenePlainText(
      "<p>A &amp; B<br>4 &lt; 5 &#x2192; true</p><ul><li>Count</li><li>Compare &#8212; then revise</li></ul><script>hidden()</script>",
    ),
  ).toBe("A & B\n4 < 5 → true\n\n• Count\n\n• Compare — then revise");
});
