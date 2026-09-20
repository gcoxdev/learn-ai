import { describe, expect, it } from "vitest";
import { curriculum } from "./content";
import { emptyProgress, positionSchema, type LessonOrigin } from "./model";
import {
  defaultOrigin,
  lessonHref,
  nextLesson,
  originFromLessonUrl,
  originFromLocation,
  returnDestination,
} from "./navigation";

describe("lesson return context", () => {
  const origins: LessonOrigin[] = [
    {
      kind: "library",
      view: "curriculum",
      query: "language & attention",
      module: "M15",
    },
    { kind: "library", view: "lessons", query: "vectors" },
    {
      kind: "library",
      view: "lessons",
      query: "attention & routing",
      moduleFilter: "M15",
      time: "6-to-10",
      archetype: "mechanism",
      evidence: "not-demonstrated",
      page: 2,
    },
    { kind: "library", view: "lessons", query: "", moduleFilter: "bridges" },
    {
      kind: "library",
      view: "lessons",
      query: "",
      moduleFilter: "advanced",
      evidence: "practice",
    },
    { kind: "library", view: "glossary", query: "" },
    { kind: "path", path: "images" },
    { kind: "progress" },
    { kind: "home" },
  ];
  it.each(origins)(
    "round-trips $kind links without losing their original destination",
    (origin) => {
      const url = new URL(
        lessonHref("attention", origin),
        "https://classroom.test",
      );
      expect(originFromLessonUrl(url)).toEqual(origin);
      expect(
        originFromLocation(new URL(returnDestination(origin).href, url)),
      ).toEqual(origin);
    },
  );
  it("uses a useful library fallback for lessons opened directly", () => {
    expect(returnDestination(defaultOrigin)).toEqual({
      href: "/library/",
      label: "Back to the lesson library",
    });
    expect(
      originFromLessonUrl(new URL("https://classroom.test/learn/attention/")),
    ).toBeUndefined();
  });
  it.each([
    "https://elsewhere.test",
    "//elsewhere.test",
    "/\\elsewhere.test",
    "/\\[",
    "/unknown/",
    "/library/?view=invalid",
  ])("rejects an unsupported return URL: %s", (from) => {
    const url = new URL("https://classroom.test/learn/attention/");
    url.searchParams.set("from", from);
    expect(originFromLessonUrl(url)).toBeUndefined();
  });
  it("does not mistake a math-detour entry for a new course origin", () => {
    expect(
      originFromLocation(new URL("https://classroom.test/learn/attention/")),
    ).toBeUndefined();
  });
  it("keeps old saved positions valid and validates new context", () => {
    const old = {
      scene: "ai-systems.s1",
      depth: "core",
      mode: "slides",
      updatedAt: 0,
    };
    expect(positionSchema.parse(old).origin).toBeUndefined();
    expect(positionSchema.parse({ ...old, origin: origins[0] }).origin).toEqual(
      origins[0],
    );
    expect(() =>
      positionSchema.parse({
        ...old,
        origin: { kind: "external", href: "https://elsewhere.test" },
      }),
    ).toThrow();
  });
  it("offers the next authored curriculum lesson and ends safely at the last one", () => {
    const first = curriculum.lessons.find((l) => l.id === "ai-systems")!;
    expect(nextLesson(curriculum, first, origins[0], emptyProgress())?.id).toBe(
      "inputs-and-outputs",
    );
    const last = curriculum.lessons.find(
      (l) => l.id === "comparing-alternative-neural-models",
    )!;
    expect(
      nextLesson(curriculum, last, origins[0], emptyProgress()),
    ).toBeUndefined();
  });
  it.each([
    { moduleFilter: "M99" },
    { moduleFilter: "https://elsewhere.test" },
    { time: "quick" },
    { archetype: "anything" },
    { evidence: "completed" },
    { page: -1 },
    { page: 1.5 },
    { page: 10001 },
  ])("rejects unsupported saved library filters: %j", (invalid) => {
    expect(() =>
      positionSchema.parse({
        scene: "ai-systems.s1",
        depth: "core",
        mode: "slides",
        updatedAt: 0,
        origin: { ...defaultOrigin, ...invalid },
      }),
    ).toThrow();
  });
  it("preserves a curriculum anchor independently of an active lesson facet", () => {
    const origin: LessonOrigin = {
      kind: "library",
      view: "curriculum",
      query: "",
      module: "M15",
      moduleFilter: "bridges",
    };
    const href = returnDestination(origin).href;
    expect(href).toBe("/library/?view=curriculum&module=bridges#M15");
    expect(originFromLocation(new URL(href, "https://classroom.test"))).toEqual(
      origin,
    );
  });
});
