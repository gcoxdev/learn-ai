import { describe, expect, it } from "vitest";
import { curriculum } from "./content";
import { auditContent } from "../../scripts/content-audit";

describe("initial draft coverage", () => {
  it("fills every catalog slot and side lesson", () => {
    expect(auditContent(curriculum)).toEqual({
      main: 313,
      bridges: 23,
      previews: 1,
      total: 337,
    });
  });
  it("rejects a missing final-module lesson", () => {
    const c = structuredClone(curriculum);
    c.lessons = c.lessons.filter((l) => l.slot !== "M37.8");
    expect(() => auditContent(c)).toThrow("Missing authored slot: M37.8");
  });
  it("rejects duplicate catalog assignments", () => {
    const c = structuredClone(curriculum);
    c.lessons[1].slot = c.lessons[0].slot;
    expect(() => auditContent(c)).toThrow("Duplicate slot");
  });
  it("rejects a quiz placed before remaining teaching material", () => {
    const c = structuredClone(curriculum);
    const route = c.lessons[0].routes.core;
    [route[1], route[route.length - 1]] = [route[route.length - 1], route[1]];
    expect(() => auditContent(c)).toThrow(
      "Lesson needs a combined check and takeaway",
    );
  });
  it("rejects unfinished prose and duplicated retake prompts", () => {
    const unfinished = structuredClone(curriculum);
    unfinished.lessons[0].scenes[0].html = "<p>TODO: write this.</p>";
    expect(() => auditContent(unfinished)).toThrow("Unfilled scene");
    const repeated = structuredClone(curriculum);
    const active = repeated.lessons[0].questions.filter((q) => !q.retired);
    active[1].prompt = active[0].prompt;
    expect(() => auditContent(repeated)).toThrow("Repeated assessment prompt");
  });
});
