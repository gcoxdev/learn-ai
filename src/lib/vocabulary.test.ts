import { expect, it } from "vitest";
import { termsInText, vocabulary } from "./vocabulary";
import { curriculum } from "./content";
import { planPath } from "./engine";
it("matches whole vocabulary terms and plural aliases without matching HTML URLs", () => {
  expect(termsInText("Weights multiply inputs.").map((t) => t.id)).toEqual(
    expect.arrayContaining(["weight", "input"]),
  );
  expect(
    termsInText('<a href="https://model.test/weight">several buttons</a>'),
  ).toEqual([]);
  expect(termsInText("A remodeling task").map((t) => t.id)).not.toContain(
    "model",
  );
});
it("connects every definition to an available teaching lesson", () => {
  for (const term of vocabulary)
    expect(curriculum.lessons.some((l) => l.id === term.lesson)).toBe(true);
});
it("uses contextual phrases for ambiguous ordinary words", () => {
  expect(
    termsInText("<strong>query</strong> vector").map((t) => t.id),
  ).toContain("query");
  const ids = termsInText(
    "The arrows mean that a value leaves this step. The key idea answers a query.",
  ).map((t) => t.id);
  for (const id of ["mean", "value", "key", "query"])
    expect(ids).not.toContain(id);
  expect(
    termsInText("Compute the arithmetic mean; mix the value vectors.").map(
      (t) => t.id,
    ),
  ).toEqual(expect.arrayContaining(["mean", "value"]));
});
it("puts definitions before training and includes evaluation and projects on both paths", () => {
  for (const recipe of curriculum.recipes) {
    const ids = planPath(curriculum, recipe, []).lessons.map((l) => l.id);
    const early = [
      "ai-systems",
      "inputs-and-outputs",
      "data-and-examples",
      "models-and-products",
      "weights-and-predictions",
      "training-and-inference",
      "inside-a-system",
    ];
    expect(ids.slice(0, early.length)).toEqual(early);
    expect(ids).toContain("human-and-model-judges");
    expect(ids).toContain("privacy-and-memorization");
    expect(ids.at(-1)).toBe(recipe.destination);
  }
});
