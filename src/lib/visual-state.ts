import { z } from "zod";

export const visualKindSchema = z.enum([
  "input-output",
  "training-inference",
  "data-splits",
  "neural-network",
  "network-layers",
  "clustering",
  "beam-search",
  "kv-cache",
  "learning-rate",
  "bayes",
  "threshold",
  "convolution",
  "bias",
  "derivative",
  "chain-rule",
  "parameter-training",
  "tokenizer",
  "video",
  "audio",
  "robot",
  "lifecycle",
  "history",
  "evaluation",
  "image-noise",
]);
export type VisualKind = z.infer<typeof visualKindSchema>;
export const visualValuesSchema = z
  .record(
    z.string().regex(/^[a-zA-Z][a-zA-Z0-9_-]{0,39}$/),
    z.union([
      z.number().finite().min(-1e6).max(1e6),
      z.string().max(80),
      z.boolean(),
    ]),
  )
  .refine(
    (values) => Object.keys(values).length <= 24,
    "Too many visual controls",
  );
export type VisualValues = z.infer<typeof visualValuesSchema>;
export const savedVisualSchema = z
  .object({ kind: visualKindSchema, values: visualValuesSchema })
  .strict();

/** All controls read through bounded helpers, including data restored from a backup. */
export function visualNumber(
  values: VisualValues,
  key: string,
  fallback: number,
  min: number,
  max: number,
  integer = false,
): number {
  const n = values[key];
  if (typeof n !== "number" || !Number.isFinite(n)) return fallback;
  const bounded = Math.max(min, Math.min(max, n));
  return integer ? Math.round(bounded) : bounded;
}
export function visualChoice<T extends string>(
  values: VisualValues,
  key: string,
  choices: readonly T[],
  fallback: T,
): T {
  const value = values[key];
  return typeof value === "string" && choices.includes(value as T)
    ? (value as T)
    : fallback;
}
export function visualBoolean(
  values: VisualValues,
  key: string,
  fallback = false,
): boolean {
  return typeof values[key] === "boolean" ? values[key] : fallback;
}
