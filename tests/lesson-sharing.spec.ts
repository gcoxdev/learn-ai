import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import type { Curriculum } from "../src/lib/model";

const curriculum = JSON.parse(
  readFileSync(
    new URL("../src/lib/generated/curriculum.json", import.meta.url),
    "utf8",
  ),
) as Curriculum;
const project = curriculum.lessons.find(
  (lesson) => lesson.id === "tiny-language-model-project",
)!;

async function ready(page: Page, path: string) {
  await page.goto(path);
  await expect(page.locator("main")).toHaveAttribute("aria-busy", "false");
}

test("a project worksheet can be prepared and downloaded with the keyboard", async ({
  page,
}) => {
  await ready(page, `/learn/${project.id}/`);
  const submissions: string[] = [];
  page.on("request", (request) => {
    if (request.method() !== "GET") submissions.push(request.url());
  });
  const summary = page.locator("summary", {
    hasText: "Prepare a project review",
  });
  await summary.focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Project notes", { exact: true })).toBeFocused();
  await page.keyboard.type("I compared both checkpoints.");
  await page.keyboard.press("Tab");
  await expect(
    page.getByLabel("Evidence and artifacts", { exact: true }),
  ).toBeFocused();
  await page.keyboard.type("tables.csv and a diagram");
  await page.keyboard.press("Tab");
  await expect(
    page.getByLabel("Questions for your reviewer", { exact: true }),
  ).toBeFocused();
  await page.keyboard.type("Where is my evidence weakest?");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Download review worksheet" }),
  ).toBeFocused();
  const downloadPromise = page.waitForEvent("download");
  await page.keyboard.press("Enter");
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe(`learn-ai-${project.id}-review.md`);
  const markdown = await readFile((await download.path())!, "utf8");
  expect(markdown).toContain(`Lesson ID: ${project.id}`);
  expect(markdown).toContain("Curriculum version: prototype-1");
  expect(markdown).toContain(
    "counts and arithmetic; preserved versions; fixed and fair comparison; honest scope",
  );
  expect(markdown).toContain("I compared both checkpoints.");
  expect(markdown).toContain("tables.csv and a diagram");
  expect(markdown).toContain("Where is my evidence weakest?");
  expect(markdown).toContain("## Reviewer feedback");
  expect(markdown).toContain("Status: ungraded");
  expect(markdown).not.toContain('"attempts"');
  expect(markdown).not.toContain('"answers"');
  expect(markdown).not.toMatch(/<\/?[a-z][^>]*>/i);
  await expect(
    page.getByRole("status").filter({ hasText: "Worksheet download started" }),
  ).toBeVisible();
  expect(submissions).toEqual([]);
});

test("a regular lesson exports a scene-specific correction without submitting it", async ({
  page,
}) => {
  const lesson = curriculum.lessons.find(
    (lesson) => lesson.id === "ai-systems",
  )!;
  const scene = lesson.scenes.find(
    (scene) => scene.id === lesson.routes.core[0],
  )!;
  await ready(page, `/learn/${lesson.id}/`);
  await expect(
    page.locator("summary", { hasText: "Prepare a project review" }),
  ).toHaveCount(0);
  const form = page.getByRole("form", { name: "Lesson correction" });
  await expect(form).not.toBeVisible();
  await page.locator("summary", { hasText: "Suggest a correction" }).click();
  await page.getByLabel("Scene", { exact: true }).selectOption(scene.id);
  await page.getByLabel("Issue type", { exact: true }).selectOption("clarity");
  await page
    .getByLabel("What would you change?", { exact: true })
    .fill("Please distinguish the model from its interface.");
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download feedback", exact: true })
    .click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe(
    `learn-ai-${lesson.id}-feedback.md`,
  );
  const markdown = await readFile((await download.path())!, "utf8");
  expect(markdown).toContain(`Scene: "${scene.title}"`);
  expect(markdown).toContain(`Scene ID: ${scene.id}`);
  expect(markdown).toContain("Issue type: Unclear explanation");
  expect(markdown).toContain(
    "Please distinguish the model from its interface.",
  );
  expect(markdown).toContain("downloaded locally, not submitted");
  expect(markdown).not.toContain('"answers"');
  await expect(form.getByRole("status")).toContainText("Nothing was submitted");
  await page.reload();
  await expect(page.locator("main")).toHaveAttribute("aria-busy", "false");
  await page.locator("summary", { hasText: "Suggest a correction" }).click();
  await expect(
    page.getByLabel("What would you change?", { exact: true }),
  ).toHaveValue("");
});

test("review and correction forms fit mobile and have accessible labels", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await ready(page, `/learn/${project.id}/`);
  await page
    .locator("summary", { hasText: "Prepare a project review" })
    .click();
  await page.locator("summary", { hasText: "Suggest a correction" }).click();
  await expect(page.getByLabel("Scene", { exact: true })).toHaveAttribute(
    "required",
    "",
  );
  await expect(
    page.getByLabel("What would you change?", { exact: true }),
  ).toHaveAttribute("required", "");
  const dimensions = await page
    .locator(".lesson-tools")
    .evaluate((element) => ({
      content: element.scrollWidth,
      available: element.clientWidth,
      controlsFit: [
        ...element.querySelectorAll("textarea, select, button"),
      ].every((control) => {
        const rect = control.getBoundingClientRect();
        return rect.left >= 0 && rect.right <= window.innerWidth;
      }),
    }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.available);
  expect(dimensions.controlsFit).toBe(true);
  const result = await new AxeBuilder({ page })
    .include(".lesson-tools")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(result.violations).toEqual([]);
});

test("about explains learning, local privacy, and manual sharing without an account", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await ready(page, "/about/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Understand the system",
  );
  await expect(
    page.getByText("Understanding travels with you.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Your learning record stays in your browser.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Find a project to review" }),
  ).toHaveAttribute("href", "/library/?archetype=project");
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(result.violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
