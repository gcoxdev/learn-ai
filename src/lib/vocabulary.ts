import data from "./generated/vocabulary.json";
import type { VocabularyTerm } from "./model";

export const vocabulary = data as VocabularyTerm[];
const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const patterns = vocabulary.map((term) => ({
  term,
  pattern: new RegExp(
    `\\b(?:${(term.matchPhrases ?? [term.term, ...term.aliases]).map(escape).join("|")})\\b`,
    "i",
  ),
}));

export function termsInText(html: string): VocabularyTerm[] {
  // The renderer supplies sanitized HTML; tags/URLs must not cause vocabulary matches.
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&[^;]+;/g, " ")
    .replace(/\s+/g, " ");
  return patterns
    .filter(({ pattern }) => pattern.test(text))
    .map(({ term }) => term);
}
