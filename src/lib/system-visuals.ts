/** Inspectable toy mechanisms used by the visual lessons. No model or hardware is run. */
export type TokenWord = { word: string; count: number; pieces: string[] };
export type PairCount = {
  left: string;
  right: string;
  key: string;
  count: number;
};
export const tokenizerCorpus: TokenWord[] = [
  { word: "cat", count: 2, pieces: ["c", "a", "t"] },
  { word: "cap", count: 1, pieces: ["c", "a", "p"] },
];

/** Count adjacent pairs within words, weighted by the number of copies of each word. */
export function tokenPairs(corpus: readonly TokenWord[]): PairCount[] {
  const counts = new Map<string, PairCount>();
  for (const { count, pieces } of corpus) {
    if (!Number.isSafeInteger(count) || count < 1)
      throw new RangeError("Word count must be positive");
    for (let i = 0; i + 1 < pieces.length; i++) {
      const left = pieces[i],
        right = pieces[i + 1],
        key = `${left}+${right}`;
      const pair = counts.get(key) ?? { left, right, key, count: 0 };
      pair.count += count;
      counts.set(key, pair);
    }
  }
  // Explicit, locale-independent tie rule: compare the pair label alphabetically.
  return [...counts.values()].sort(
    (a, b) => b.count - a.count || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0),
  );
}

/** Non-overlapping matches are merged from left to right; never cross a word boundary. */
export function mergeTokenPair(
  corpus: readonly TokenWord[],
  left: string,
  right: string,
): TokenWord[] {
  return corpus.map(({ word, count, pieces }) => {
    const merged: string[] = [];
    for (let i = 0; i < pieces.length; i++) {
      if (pieces[i] === left && pieces[i + 1] === right) {
        merged.push(left + right);
        i++;
      } else merged.push(pieces[i]);
    }
    return { word, count, pieces: merged };
  });
}
export function tokenizerAfterMerges(steps: number): TokenWord[] {
  if (!Number.isInteger(steps) || steps < 0 || steps > 2)
    throw new RangeError("Choose zero, one, or two merges");
  let corpus = tokenizerCorpus.map((word) => ({
    ...word,
    pieces: [...word.pieces],
  }));
  for (let i = 0; i < steps; i++) {
    const pair = tokenPairs(corpus)[0];
    corpus = mergeTokenPair(corpus, pair.left, pair.right);
  }
  return corpus;
}
export function tokenTotal(corpus: readonly TokenWord[]): number {
  return corpus.reduce(
    (total, { pieces, count }) => total + pieces.length * count,
    0,
  );
}
export function encodeToyWord(word: "cat" | "cap", steps: number): string[] {
  // Frozen rules are applied in their learned order. No new pair is fitted here.
  let corpus: TokenWord[] = [{ word, count: 1, pieces: [...word] }];
  if (!Number.isInteger(steps) || steps < 0 || steps > 2)
    throw new RangeError("Invalid merge count");
  if (steps >= 1) corpus = mergeTokenPair(corpus, "c", "a");
  if (steps >= 2) corpus = mergeTokenPair(corpus, "ca", "t");
  return corpus[0].pieces;
}

export const videoFrameCount = 6;
export const changedVideoFrame = 3; // Zero-based; displayed as frame 4.
export function videoFrame(index: number, changed: boolean) {
  if (!Number.isInteger(index) || index < 0 || index >= videoFrameCount)
    throw new RangeError("Invalid frame");
  return {
    index,
    x: 24 + index * 16,
    shape:
      changed && index === changedVideoFrame
        ? ("triangle" as const)
        : ("circle" as const),
  };
}

export const audioWindowSeconds = 0.01;
export const toneSeconds = 0.65;
export const toneGain = 0.035;
export function sineAt(frequency: number, timeSeconds: number): number {
  if (
    !Number.isFinite(frequency) ||
    frequency <= 0 ||
    !Number.isFinite(timeSeconds)
  )
    throw new RangeError("Invalid wave input");
  return Math.sin(2 * Math.PI * frequency * timeSeconds);
}
export function sinePoints(
  frequency: number,
  count = 401,
): { t: number; y: number }[] {
  if (!Number.isInteger(count) || count < 2 || count > 10001)
    throw new RangeError("Invalid drawing resolution");
  return Array.from({ length: count }, (_, i) => {
    const t = (audioWindowSeconds * i) / (count - 1);
    return { t, y: sineAt(frequency, t) };
  });
}

export function robotStep(
  position: number,
  observed: number,
  target: number,
  gain: number,
) {
  if (![position, observed, target, gain].every(Number.isFinite) || gain < 0)
    throw new RangeError("Invalid controller input");
  const error = target - observed;
  const rawCommand = gain * error;
  if (!Number.isFinite(rawCommand)) throw new RangeError("Controller overflow");
  const command = Math.max(-1, Math.min(1, rawCommand));
  const next = position + command;
  return { error, rawCommand, command, next };
}
export function visualDecimal(value: number): string {
  return Number(value.toFixed(3)).toString();
}
