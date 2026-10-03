import data from "./generated/vocabulary.json";
import type { VocabularyTerm } from "./model";

export const vocabulary = data as VocabularyTerm[];
const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// Acronyms such as ZeRO, SAT, or STRIPS match case-sensitively so everyday words
// ("zero", "sat", "strips") don't pull in the wrong definition.
const isAcronym = (phrase: string) => /[A-Z].*[A-Z]/.test(phrase);
const group = (phrases: string[], flags: string) =>
  phrases.length
    ? new RegExp(`\\b(?:${phrases.map(escape).join("|")})\\b`, flags)
    : null;
const patterns = vocabulary.map((term) => {
  const phrases = term.matchPhrases ?? [term.term, ...term.aliases];
  return {
    term,
    exact: group(phrases.filter(isAcronym), ""),
    loose: group(
      phrases.filter((phrase) => !isAcronym(phrase)),
      "i",
    ),
  };
});

export function termsInText(html: string): VocabularyTerm[] {
  // The renderer supplies sanitized HTML; tags/URLs must not cause vocabulary matches.
  const text = html
    .replace(/<!--math:[^]*?-->[^]*?<!--\/math-->/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&[^;]+;/g, " ")
    .replace(/\s+/g, " ");
  return patterns
    .filter(({ exact, loose }) => exact?.test(text) || loose?.test(text))
    .map(({ term }) => term);
}
