/** Small, explicit calculations shared by the visual and its text explanation. */
export function networkTrace(x: number) {
  const firstSum = 2 * x - 1;
  const secondSum = -x + 3;
  const firstHidden = Math.max(0, firstSum);
  const secondHidden = Math.max(0, secondSum);
  return {
    firstSum,
    secondSum,
    firstHidden,
    secondHidden,
    output: firstHidden + 2 * secondHidden + 1,
  };
}

export const splitCards = [
  { id: "a1", source: "A", photo: 1, color: "#bf6250", holes: 2 },
  { id: "a2", source: "A", photo: 2, color: "#bf6250", holes: 2 },
  { id: "b1", source: "B", photo: 1, color: "#557b98", holes: 4 },
  { id: "b2", source: "B", photo: 2, color: "#557b98", holes: 4 },
  { id: "c1", source: "C", photo: 1, color: "#a88430", holes: 2 },
  { id: "c2", source: "C", photo: 2, color: "#a88430", holes: 2 },
] as const;
export const splitNames = {
  train: "Training",
  validation: "Validation",
  test: "Test",
} as const;
export type SplitName = keyof typeof splitNames;
export type CardId = (typeof splitCards)[number]["id"];
export type SplitAssignments = Record<CardId, SplitName>;
export const defaultSplitAssignments: SplitAssignments = {
  a1: "train",
  a2: "test",
  b1: "train",
  b2: "validation",
  c1: "test",
  c2: "validation",
};

export function inspectSplit(assignments: SplitAssignments) {
  const names = Object.keys(splitNames) as SplitName[];
  const counts = Object.fromEntries(
    names.map((name) => [
      name,
      splitCards.filter((card) => assignments[card.id] === name).length,
    ]),
  ) as Record<SplitName, number>;
  const crossings = (["A", "B", "C"] as const).flatMap((source) => {
    const partitions = [
      ...new Set(
        splitCards
          .filter((card) => card.source === source)
          .map((card) => assignments[card.id]),
      ),
    ];
    return partitions.length > 1 ? [{ source, partitions }] : [];
  });
  const empty = names.filter((name) => counts[name] === 0);
  return {
    counts,
    crossings,
    empty,
    solved: crossings.length === 0 && empty.length === 0,
  };
}

export const snackExamples = [
  { guests: 2, crackers: 6 },
  { guests: 3, crackers: 9 },
] as const;
export function compareSnackWeights() {
  return [2, 3].map((weight) => ({
    weight,
    predictions: snackExamples.map((example) => example.guests * weight),
    totalMiss: snackExamples.reduce(
      (sum, example) =>
        sum + Math.abs(example.guests * weight - example.crackers),
      0,
    ),
  }));
}
