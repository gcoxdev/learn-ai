import type { Curriculum, Lesson, Scene } from "./model";

type ContentVersions = Pick<Curriculum, "version" | "objectives">;

export const feedbackIssues = [
  { value: "correction", label: "Possible factual error" },
  { value: "clarity", label: "Unclear explanation" },
  { value: "accessibility", label: "Accessibility or interaction issue" },
  { value: "suggestion", label: "Other suggestion" },
] as const;

export type FeedbackIssue = (typeof feedbackIssues)[number]["value"];
export type ProjectReviewDraft = {
  notes: string;
  evidence: string;
  questions: string;
};
export type LessonFeedbackDraft = {
  sceneId: string;
  issue: FeedbackIssue;
  note: string;
};

/** The input is authored, sanitized scene HTML, not arbitrary page markup. */
export function scenePlainText(html: string): string {
  const entities: Record<string, string> = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
    nbsp: " ",
    ndash: "–",
    mdash: "—",
    lsquo: "‘",
    rsquo: "’",
    ldquo: "“",
    rdquo: "”",
    hellip: "…",
    times: "×",
    minus: "−",
    rarr: "→",
    larr: "←",
  };
  return html
    .replace(/<!--math:([^]*?)-->[^]*?<!--\/math-->/g, (_m, tex: string) =>
      decodeURIComponent(tex),
    )
    .replace(/<!--[^]*?-->/g, "")
    .replace(
      /<(script|style|iframe|object|template)\b[^>]*>[^]*?<\/\1\s*>/gi,
      "",
    )
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(?:p|div|li|h[1-6]|tr|ul|ol|blockquote|pre)>/gi, "\n\n")
    .replace(/<li\b[^>]*>/gi, "• ")
    .replace(/<\/t[dh]>/gi, " | ")
    .replace(/<[^>]*>/g, "")
    .replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
      if (!entity.startsWith("#"))
        return entities[entity.toLowerCase()] ?? match;
      const codepoint =
        entity[1].toLowerCase() === "x"
          ? Number.parseInt(entity.slice(2), 16)
          : Number.parseInt(entity.slice(1), 10);
      return codepoint > 0 &&
        codepoint <= 0x10ffff &&
        !(codepoint >= 0xd800 && codepoint <= 0xdfff)
        ? String.fromCodePoint(codepoint)
        : "�";
    })
    .replace(/[\t ]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Keep authored prose and learner-entered text literal in Markdown viewers.
function literal(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/([`*_{}\[\]()#+!|])/g, "\\$1")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function metadata(lesson: Lesson, versions: ContentVersions): string[] {
  return [
    `Lesson: ${literal(lesson.title)}`,
    `Lesson ID: ${literal(lesson.id)}`,
    `Lesson slot: ${literal(lesson.slot)}`,
    `Lesson status: ${literal(lesson.state)}`,
    `Curriculum version: ${literal(versions.version)}`,
    ...versions.objectives
      .filter((objective) => lesson.objectives.includes(objective.id))
      .map(
        (objective) =>
          `Objective version: ${literal(objective.id)} — ${literal(objective.version)}`,
      ),
    `Lesson location: /learn/${encodeURIComponent(lesson.id)}/`,
  ];
}

function sceneContext(scene: Scene): string {
  const parts = [
    `### ${literal(scene.title)}`,
    literal(scenePlainText(scene.html)),
  ];
  if (scene.table) {
    parts.push(literal(scene.table.columns.join(" | ")));
    parts.push(...scene.table.rows.map((row) => literal(row.join(" | "))));
  }
  if (scene.equation) parts.push(literal(scene.equation.reading));
  if (scene.figure) parts.push(literal(scene.figure.caption));
  if (scene.diagram)
    parts.push(literal(`${scene.diagram.caption} ${scene.diagram.description}`));
  if (scene.note) parts.push(literal(scenePlainText(scene.note)));
  return parts.filter(Boolean).join("\n\n");
}

export function createProjectReview(
  lesson: Lesson,
  versions: ContentVersions,
  draft: ProjectReviewDraft,
): string {
  if (lesson.archetype !== "project")
    throw new Error("A project lesson is required.");
  const order = [
    ...new Set([...lesson.routes.core, ...lesson.routes.mathematics]),
  ];
  const scenes = order
    .map((id) => lesson.scenes.find((scene) => scene.id === id))
    .filter(
      (scene): scene is Scene =>
        scene !== undefined &&
        scene.type !== "assessment" &&
        scene.type !== "question" &&
        scene.type !== "recap",
    );
  return (
    [
      "# Learn AI · Project review worksheet",
      ...metadata(lesson, versions),
      "Status: ungraded. For self or peer review; downloading or reviewing this worksheet does not award mastery credit.",
      "This file was prepared locally. Nothing was submitted. Share it and any chosen project files with a reviewer yourself.",
      "## Project context",
      literal(lesson.summary),
      "## Authored brief, deliverables, and review criteria",
      "The lesson's project instructions follow in reading order. Use its stated rubric or review questions; no new score is assigned here.",
      ...scenes.map(sceneContext),
      "## My project notes",
      literal(draft.notes.trim()) ||
        "[Add your approach, choices, and limitations.]",
      "## Evidence and artifacts to inspect",
      literal(draft.evidence.trim()) ||
        "[List the files, calculations, diagrams, or observations you will share separately.]",
      "## Questions for my reviewer",
      literal(draft.questions.trim()) ||
        "[Name an assumption, result, or tradeoff you would like challenged.]",
      "## Reviewer feedback",
      "Review method: [self review / peer review]",
      "Evidence inspected: \n\n",
      "What is supported by the evidence? \n\n",
      "What needs correction or more evidence? \n\n",
      "Comments against the authored criteria: \n\n",
      "Next revision: \n\n",
      "## Lesson sources",
      ...lesson.sources.map(
        (source) => `- ${literal(source.title)}: ${literal(source.url)}`,
      ),
      "This worksheet contains lesson context and the notes entered for this export. It does not include saved progress, quiz responses, answer keys, or a progress backup.",
    ].join("\n\n") + "\n"
  );
}

export function createLessonFeedback(
  lesson: Lesson,
  versions: ContentVersions,
  draft: LessonFeedbackDraft,
): string {
  const scene = lesson.scenes.find((scene) => scene.id === draft.sceneId);
  const issue = feedbackIssues.find((issue) => issue.value === draft.issue);
  if (!scene || !issue || !draft.note.trim())
    throw new Error("Choose a scene and issue, and add a note.");
  return (
    [
      "# Learn AI · Lesson feedback",
      ...metadata(lesson, versions),
      `Scene: "${literal(scene.title)}"`,
      `Scene ID: ${literal(scene.id)}`,
      `Issue type: ${issue.label}`,
      "## Learner note",
      literal(draft.note.trim()),
      "Status: downloaded locally, not submitted. Share this file manually through a channel you already use.",
      "Only lesson metadata and this note are included. Saved progress, quiz responses, answer keys, and progress backups are excluded.",
    ].join("\n\n") + "\n"
  );
}
