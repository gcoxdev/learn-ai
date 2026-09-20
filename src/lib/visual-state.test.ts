import { expect, it } from "vitest";
import { curriculum as c } from "./content";
import { emptyPosition, emptyProgress } from "./model";
import { parseBackup, questionsRemaining } from "./engine";
import {
  visualNumber,
  visualChoice,
  visualBoolean,
  visualValuesSchema,
} from "./visual-state";
import { imageNoiseFixture } from "./visual-data";

it("restores bounded per-scene visual settings without claiming knowledge evidence", () => {
  const l = c.lessons.find((l) => l.id === "derivatives")!;
  const scene = l.scenes.find((s) => s.figure?.kind === "derivative")!;
  const p = emptyProgress();
  p.positions[l.id] = {
    ...emptyPosition(scene.id),
    visuals: { [scene.id]: { kind: "derivative", values: { x: -1, h: 0.1 } } },
  };
  const restored = parseBackup(JSON.stringify(p), c);
  expect(restored).toEqual(p);
  expect(restored.attempts).toEqual([]);
  expect(questionsRemaining(l, c, restored, "core").complete).toBe(false);
  expect(
    parseBackup(
      JSON.stringify({ ...p, positions: { [l.id]: emptyPosition(scene.id) } }),
      c,
    ).positions[l.id].visuals,
  ).toBeUndefined();
  p.positions[l.id].visuals![scene.id].kind = "audio";
  expect(() => parseBackup(JSON.stringify(p), c)).toThrow(
    "unavailable visual activity",
  );
});
it("rejects oversized or structured payloads and safely bounds restored controls", () => {
  expect(() => visualValuesSchema.parse({ x: Infinity })).toThrow();
  expect(() => visualValuesSchema.parse({ items: [] })).toThrow();
  expect(() =>
    visualValuesSchema.parse(
      Object.fromEntries(Array.from({ length: 25 }, (_, i) => ["v" + i, i])),
    ),
  ).toThrow();
  expect(visualNumber({ x: 500 }, "x", 0, -3, 3)).toBe(3);
  expect(visualNumber({ x: "500" }, "x", 0, -3, 3)).toBe(0);
  expect(visualNumber({ step: 3.6 }, "step", 0, 0, 4, true)).toBe(4);
  expect(visualChoice({ mode: "missing" }, "mode", ["a", "b"], "a")).toBe("a");
  expect(visualBoolean({ playing: "true" }, "playing")).toBe(false);
});
it("makes zero-noise pixels identical and exposes clipping without pretending to denoise", () => {
  const clean = imageNoiseFixture(0, 1);
  expect(clean).toHaveLength(36);
  expect(clean.every((p) => p.clean === p.noisy)).toBe(true);
  const noisy = imageNoiseFixture(1, 1);
  expect(noisy.some((p) => p.raw < 0 || p.raw > 1)).toBe(true);
  expect(noisy.every((p) => p.noisy >= 0 && p.noisy <= 1)).toBe(true);
  expect(noisy.map((p) => p.clean)).toEqual(clean.map((p) => p.clean));
  expect(noisy).toEqual(imageNoiseFixture(1, 1));
  expect(noisy.map((p) => p.noisy)).not.toEqual(
    imageNoiseFixture(1, 2).map((p) => p.noisy),
  );
  expect(() => imageNoiseFixture(-1, 1)).toThrow();
});
