import { expect, it } from "vitest";
import { curriculum } from "./content";
import { emptyProgress, progressSchema, type Detour } from "./model";
import {
  framesForLesson,
  historyDetours,
  lessonTrail,
  savedDetours,
} from "./lesson-detours";

const parent: Detour = {
  lesson: "neural-training-loop",
  scene: "neural-training-loop.s3",
  control: "bridge",
};
const child: Detour = {
  lesson: "derivatives",
  scene: "derivatives.s1",
  control: "vocabulary",
};

it("associates each browser entry with its own return trail", () => {
  const original = lessonTrail(parent.lesson, [], 0);
  const first = lessonTrail(child.lesson, [parent], 0);
  const second = lessonTrail("functions", [parent, child], 0);
  expect(historyDetours(original, parent.lesson, 0, curriculum)).toEqual([]);
  expect(historyDetours(first, child.lesson, 0, curriculum)).toEqual([parent]);
  expect(historyDetours(second, "functions", 0, curriculum)).toEqual([
    parent,
    child,
  ]);
  expect(historyDetours(second, parent.lesson, 0, curriculum)).toEqual([]);
  expect(historyDetours(first, child.lesson, 100, curriculum)).toEqual([]);
});

it("returns to ancestors without self-references or repeated lesson keys", () => {
  expect(framesForLesson([parent, child], parent.lesson)).toEqual([]);
  expect(framesForLesson([parent, child], child.lesson)).toEqual([parent]);
  expect(framesForLesson([parent, child, parent, child], "functions")).toEqual([
    parent,
    child,
  ]);
});

it("rejects broken history while distinguishing absent legacy history", () => {
  expect(historyDetours(undefined, "functions", 0, curriculum)).toBeUndefined();
  for (const value of [
    null,
    {},
    { ...lessonTrail("functions", [parent], 0), version: 9 },
    lessonTrail("functions", [{ ...parent, scene: "missing" }], 0),
  ])
    expect(historyDetours(value, "functions", 0, curriculum)).toEqual([]);
});

it("keeps old backups readable and only resumes a related saved detour", () => {
  const progress = emptyProgress();
  progress.detours = [parent, child];
  expect(progressSchema.parse(progress).detours).toEqual([parent, child]);
  expect(savedDetours(progress, "functions", curriculum)).toEqual([
    parent,
    child,
  ]);
  expect(savedDetours(progress, parent.lesson, curriculum)).toEqual([]);
  expect(savedDetours(progress, child.lesson, curriculum)).toEqual([parent]);
  expect(savedDetours(progress, "speech-audio-project", curriculum)).toEqual(
    [],
  );
  progress.lastLesson = "arithmetic";
  expect(savedDetours(progress, "arithmetic", curriculum)).toEqual([
    parent,
    child,
  ]);
});
