import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync } from "node:fs";
import type { Curriculum, Question, Progress } from "../src/lib/model";

const curriculum = JSON.parse(
  readFileSync(
    new URL("../src/lib/generated/curriculum.json", import.meta.url),
    "utf8",
  ),
) as Curriculum;
const lesson = curriculum.lessons.find((item) => item.id === "ai-systems")!;
const questions = lesson.questions.filter((q) => !q.retired);
const families = [...new Set(questions.map((q) => q.family))];
const first = questions.find((q) => q.family === families[0])!;
const second = questions.find((q) => q.family === families[1])!;

async function ready(page: Page, url: string) {
  await page.goto(url);
  await expect(page.locator("main")).toHaveAttribute("aria-busy", "false");
}
async function answer(page: Page, question: Question, correct = true) {
  const option = question.options.find((option) =>
    correct
      ? option.id === question.answers.choice
      : option.id !== question.answers.choice,
  )!;
  await page.getByRole("radio", { name: option.text, exact: true }).check();
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
}
async function saved(page: Page): Promise<Progress> {
  return page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("learn-ai", 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    try {
      return await new Promise<Progress>((resolve, reject) => {
        const request = db
          .transaction("learner")
          .objectStore("learner")
          .get("progress");
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } finally {
      db.close();
    }
  });
}

test("partial independent evidence survives refresh while hinted answers remain practice", async ({
  page,
}) => {
  await ready(page, "/learn/ai-systems/?check=1");
  await page
    .getByRole("button", { name: "Begin knowledge check", exact: true })
    .click();
  await answer(page, first);
  const progress = page.getByLabel("Knowledge check progress");
  await expect(progress).toContainText("1 of 2 independent checks passed");
  await page.getByRole("button", { name: "Next check", exact: true }).click();
  await page
    .getByRole("button", { name: "Give me a hint", exact: true })
    .click();
  await answer(page, second);
  await expect(progress).toContainText("1 of 2 independent checks passed");
  await expect.poll(async () => (await saved(page)).attempts.length).toBe(2);
  await page.reload();
  await expect(progress).toContainText("1 of 2 independent checks passed");
  await page.getByRole("link", { name: "My progress", exact: true }).click();
  await expect(page.locator(".stat-card").first().locator("strong")).toHaveText(
    "0",
  );
  await expect(
    page.getByRole("heading", {
      name: "You’re building connections.",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Ideas in progress" }),
  ).toContainText("One more fresh check");
  expect((await saved(page)).attempts.map((a) => a.independent)).toEqual([
    true,
    false,
  ]);
});

test("previous questions offer repeatable practice without creating another independent check", async ({
  page,
}) => {
  await ready(page, "/learn/ai-systems/?check=1");
  await page
    .getByRole("button", { name: "Begin knowledge check", exact: true })
    .click();
  await answer(page, first);
  await page.getByText("Practice a previous check", { exact: true }).click();
  await page
    .getByRole("combobox", { name: "Choose a practice question", exact: true })
    .selectOption(first.id);
  await answer(page, first);
  await expect(
    page.getByText("Practice check passed.", { exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Knowledge check progress")).toContainText(
    "1 of 2 independent checks passed",
  );
  await page
    .getByRole("button", { name: "Try this practice again", exact: true })
    .click();
  await answer(page, first, false);
  await expect(
    page.getByText("Keep working with this example.", { exact: true }),
  ).toBeVisible();
  await expect.poll(async () => (await saved(page)).attempts.length).toBe(3);
  expect((await saved(page)).attempts.map((a) => a.mode)).toEqual([
    "assessment",
    "practice",
    "practice",
  ]);
});

test("test-out opens real checks and carries demonstrated ideas into the next path", async ({
  page,
}) => {
  await ready(page, "/paths/language/");
  await page.getByText("Already know some of this?", { exact: true }).click();
  await page
    .getByRole("combobox", { name: "Choose an idea to check", exact: true })
    .selectOption("ai-systems");
  await page
    .getByRole("link", { name: "Check what I already know", exact: true })
    .click();
  await expect(page).toHaveURL(/\/learn\/ai-systems\//);
  await page
    .getByRole("button", { name: "Begin knowledge check", exact: true })
    .click();
  await answer(page, first);
  await page.getByRole("button", { name: "Next check", exact: true }).click();
  await answer(page, second);
  await page
    .getByRole("button", { name: "See my result", exact: true })
    .click();
  await expect(
    page.getByRole("navigation", { name: "Learning path progress" }),
  ).toContainText("1 of 7 ideas demonstrated");
  await page
    .getByRole("link", { name: "Check the next idea", exact: true })
    .click();
  await expect(page).toHaveURL(/\/learn\/inputs-and-outputs\//);
  await expect(
    page.getByRole("button", { name: "Begin knowledge check", exact: true }),
  ).toBeVisible();
  await ready(page, "/paths/images/");
  await expect(page.locator(".carried-evidence")).toContainText(
    "1 demonstrated idea carries forward",
  );
  await expect(
    page.getByRole("progressbar", {
      name: "Core ideas demonstrated in this path",
      exact: true,
    }),
  ).toHaveAttribute("value", "1");
});

test("unsuccessful attempts get useful progress feedback and the new controls fit mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await ready(page, "/learn/ai-systems/?check=1");
  await page
    .getByRole("button", { name: "Begin knowledge check", exact: true })
    .click();
  await answer(page, first, false);
  await expect(page.getByLabel("Knowledge check progress")).toContainText(
    "0 of 2 independent checks passed",
  );
  await ready(page, "/progress/");
  await expect(
    page.getByText("Your first connection starts here.", { exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("region", { name: "Ideas in progress" }),
  ).toContainText("Use the feedback");
  expect(
    (
      await new AxeBuilder({ page })
        .include('[aria-label="Ideas in progress"]')
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await ready(page, "/paths/language/");
  await page.getByText("Already know some of this?", { exact: true }).click();
  const titles = await page
    .locator(".chapter-heading > strong")
    .allTextContents();
  expect(new Set(titles).size).toBe(titles.length);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(
    (
      await new AxeBuilder({ page })
        .include(".placement-entry")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
});

test("a test-out entry respects later review position on refresh and browser Back", async ({
  page,
}) => {
  await ready(page, "/learn/ai-systems/?check=1");
  await page
    .getByRole("button", { name: "Review the lesson first", exact: true })
    .click();
  const heading = page.getByRole("heading", {
    name: lesson.scenes.find((s) => s.id === lesson.routes.core[0])!.title,
    exact: true,
  });
  await expect(heading).toBeVisible();
  await expect
    .poll(async () => (await saved(page)).positions[lesson.id]?.scene)
    .toBe(lesson.routes.core[0]);
  await page.getByRole("link", { name: "My progress", exact: true }).click();
  await expect(page).toHaveURL(/\/progress\/$/);
  await page.goBack();
  await expect(heading).toBeVisible();
  expect(new URL(page.url()).searchParams.has("check")).toBe(false);
  await page.reload();
  await expect(heading).toBeVisible();
});
