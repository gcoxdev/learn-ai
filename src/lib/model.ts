import { z } from "zod";
import { savedVisualSchema, visualKindSchema } from "./visual-state";

const timestampSchema = z.number().finite().nonnegative().max(253402300799999);

export const optionSchema = z.object({ id: z.string(), text: z.string() });
export const questionSchema = z.object({
  id: z.string(),
  objective: z.string(),
  family: z.string(),
  transfer: z.boolean(),
  prompt: z.string().min(5),
  kind: z.enum(["choice", "numeric", "structured"]),
  options: z.array(optionSchema).default([]),
  fields: z.array(z.object({ id: z.string(), label: z.string() })).default([]),
  answers: z.record(z.string(), z.union([z.string(), z.number()])),
  tolerance: z.number().positive().default(0.000001),
  feedback: z.string().min(5),
  hint: z.string().min(3),
  remediation: z.string().optional(),
  retired: z.boolean().optional(),
});
export type Question = z.infer<typeof questionSchema>;
export type Responses = Record<string, string>;
export const sceneSchema = z.object({
  id: z.string(),
  title: z.string().min(2),
  html: z.string(),
  type: z.enum([
    "explanation",
    "question",
    "equation",
    "simulation",
    "table",
    "assessment",
    "recap",
  ]),
  depth: z.enum(["intuition", "mechanics", "mathematics"]),
  takeaway: z.string().optional(),
  bridges: z.array(z.string()).default([]),
  equation: z
    .object({
      latex: z.string(),
      reading: z.string(),
      symbols: z.record(z.string(), z.string()),
    })
    .optional(),
  table: z
    .object({
      columns: z.array(z.string()),
      rows: z.array(z.array(z.union([z.string(), z.number()]))),
    })
    .optional(),
  simulation: z
    .enum([
      "gradient",
      "moe",
      "tokens",
      "denoising",
      "loss-curve",
      "attention",
      "weighted-rule",
      "pixel-encoding",
      "sampling",
    ])
    .optional(),
  activity: questionSchema.optional(),
  figure: z
    .object({
      kind: visualKindSchema,
      caption: z.string().min(12),
      description: z.string().min(20),
    })
    .strict()
    .optional(),
  note: z.string().optional(),
});
export type Scene = z.infer<typeof sceneSchema>;
export const requirementSchema = z.object({
  anyOf: z.array(z.string()).min(1),
});
export const objectiveSchema = z.object({
  id: z.string(),
  version: z.string(),
  title: z.string(),
  lesson: z.string(),
  scope: z.enum(["core", "mathematics"]),
  prerequisites: z.array(requirementSchema),
  families: z.array(z.string()).min(2),
});
export type Objective = z.infer<typeof objectiveSchema>;
export const lessonSchema = z.object({
  id: z.string(),
  slot: z.string(),
  title: z.string(),
  summary: z.string(),
  category: z.enum(["common", "learning", "bridge", "destination", "advanced"]),
  minutes: z.number().positive(),
  state: z.literal("draft"),
  objectives: z.array(z.string()).min(1),
  scenes: z.array(sceneSchema).min(3),
  routes: z.object({
    core: z.array(z.string()).min(1),
    mathematics: z.array(z.string()),
  }),
  questions: z.array(questionSchema).min(4),
  entryChecks: z.array(questionSchema).default([]),
  sceneAliases: z.record(z.string(), z.string()).default({}),
  archetype: z
    .enum(["foundation", "mechanism", "comparison", "project", "perspective"])
    .default("mechanism"),
  teachingWords: z.number().int().nonnegative().default(0),
  sources: z
    .array(z.object({ title: z.string(), url: z.string().url() }))
    .min(1),
});
export type Lesson = z.infer<typeof lessonSchema>;
export const pathIdSchema = z.string().regex(/^[a-z][a-z0-9-]{0,59}$/);
export const recipeSchema = z.object({
  id: pathIdSchema,
  title: z.string(),
  subtitle: z.string(),
  question: z.string(),
  description: z.string(),
  outcome: z.string(),
  roots: z.array(z.string()).min(1),
  destination: z.string(),
  color: z.enum(["sage", "peach"]),
  group: z.enum(["Create", "Perceive", "Act", "Predict", "Investigate"]),
  icon: z.string().min(1),
  reference: z.string().min(20),
  extensions: z
    .array(z.object({ lesson: z.string(), why: z.string().min(10) }))
    .default([]),
  related: z.array(pathIdSchema).default([]),
});
export type Recipe = z.infer<typeof recipeSchema>;
export const vocabularySchema = z.array(
  z.object({
    id: z.string().min(1),
    term: z.string().min(1),
    definition: z.string().min(12),
    lesson: z.string(),
    aliases: z.array(z.string().min(1)),
    matchPhrases: z.array(z.string().min(1)).min(1).optional(),
  }),
);
export type VocabularyTerm = z.infer<typeof vocabularySchema>[number];
export const curriculumSchema = z.object({
  version: z.literal("prototype-1"),
  lessons: z.array(lessonSchema),
  objectives: z.array(objectiveSchema),
  recipes: z.array(recipeSchema),
  catalog: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      lessons: z.array(z.string()),
    }),
  ),
});
export type Curriculum = z.infer<typeof curriculumSchema>;

export const attemptSchema = z
  .object({
    id: z.string().max(100),
    objective: z.string().max(150),
    version: z.string().max(40),
    family: z.string().max(180),
    variant: z.string().max(180),
    correct: z.boolean(),
    independent: z.boolean(),
    mode: z.enum(["assessment", "placement", "practice"]),
    at: timestampSchema,
    responses: z.record(z.string().max(80), z.string().max(2000)),
  })
  .strict();
export type Attempt = z.infer<typeof attemptSchema>;
export const lessonOriginSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("path"), path: pathIdSchema }).strict(),
  z
    .object({
      kind: z.literal("library"),
      view: z.enum(["lessons", "curriculum", "glossary"]),
      query: z.string().max(500).default(""),
      module: z
        .string()
        .regex(/^M\d{2}$/)
        .optional(),
    })
    .strict(),
  z.object({ kind: z.literal("progress") }).strict(),
  z.object({ kind: z.literal("home") }).strict(),
]);
export type LessonOrigin = z.infer<typeof lessonOriginSchema>;
export const positionSchema = z
  .object({
    scene: z.string().max(150),
    depth: z.enum(["core", "mathematics"]),
    mode: z.enum(["slides", "text"]),
    updatedAt: timestampSchema,
    simulation: z
      .object({
        rate: z.number().min(0).max(0.3),
        initialWeight: z.number().min(-6).max(12),
        steps: z.number().int().min(0).max(12),
      })
      .optional(),
    drafts: z
      .record(
        z.string().max(180),
        z.record(z.string().max(80), z.string().max(2000)),
      )
      .default({}),
    reveals: z.array(z.string().max(180)).max(1000).default([]),
    activeQuestion: z.string().max(180).optional(),
    origin: lessonOriginSchema.optional(),
    attention: z
      .object({
        query: z.enum(["first", "second", "balanced"]),
        causal: z.boolean(),
      })
      .strict()
      .optional(),
    visuals: z
      .record(z.string().max(150), savedVisualSchema)
      .refine(
        (values) => Object.keys(values).length <= 100,
        "Too many saved visual activities",
      )
      .optional(),
  })
  .strict();
export type Position = z.infer<typeof positionSchema>;
export const progressSchema = z
  .object({
    format: z.literal("learn-ai-progress"),
    version: z.literal(1),
    curriculum: z.literal("prototype-1"),
    updatedAt: timestampSchema,
    resetAt: timestampSchema.default(0),
    selectedPath: pathIdSchema.nullable(),
    attempts: z.array(attemptSchema).max(20000),
    exposures: z.array(z.string().max(180)).max(20000),
    positions: z.record(z.string().max(100), positionSchema),
    bookmarks: z.array(z.string().max(100)).max(1000),
    detours: z
      .array(
        z
          .object({
            lesson: z.string().max(100),
            scene: z.string().max(150),
            control: z.enum(["bridge", "vocabulary"]).optional(),
          })
          .strict(),
      )
      .max(20),
    lastExportAt: timestampSchema,
    backupDismissedAt: timestampSchema,
    lastLesson: z.string().max(100).nullable(),
    studyDays: z.array(z.iso.date()).max(20000).default([]),
  })
  .strict();
export type Progress = z.infer<typeof progressSchema>;
export function emptyProgress(): Progress {
  return {
    format: "learn-ai-progress",
    version: 1,
    curriculum: "prototype-1",
    updatedAt: 0,
    resetAt: 0,
    selectedPath: null,
    attempts: [],
    exposures: [],
    positions: {},
    bookmarks: [],
    detours: [],
    lastExportAt: 0,
    backupDismissedAt: 0,
    lastLesson: null,
    studyDays: [],
  };
}
export function emptyPosition(scene: string): Position {
  return {
    scene,
    depth: "core",
    mode: "slides",
    updatedAt: 0,
    drafts: {},
    reveals: [],
  };
}
