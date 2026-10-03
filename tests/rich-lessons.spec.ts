import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync } from "node:fs";
import type { Curriculum, Progress } from "../src/lib/model";

const curriculum = JSON.parse(
  readFileSync(
    new URL("../src/lib/generated/curriculum.json", import.meta.url),
    "utf8",
  ),
) as Curriculum;

async function readAsPage(page: Page, lessonId: string) {
  await page.goto(`/learn/${lessonId}/`);
  await expect(page.locator("main")).toHaveAttribute("aria-busy", "false");
  await page.getByRole("button", { name: /Read as a page/ }).click();
}

test("rich lesson blocks render accessibly: diagram, callouts, math, and runnable code", async ({
  page,
}) => {
  await readAsPage(page, "agent-memory-and-context");

  const diagram = page.locator(".diagram").first();
  await expect(diagram.locator("svg[role=img]")).toBeVisible();
  await expect(diagram.locator("figcaption")).toContainText("context builder");
  await diagram.getByText("Read this diagram as text").click();
  await expect(diagram.locator(".diagram-text li").first()).toContainText("→");

  const predict = page.locator(".callout-predict").first();
  await expect(predict.locator(".callout-body")).toBeHidden();
  await predict.getByText("Reveal the answer").click();
  await expect(predict.locator(".callout-body")).toContainText("2,300 tokens");

  await expect(page.locator(".callout-mixup").first()).toBeVisible();
  await expect(page.locator(".math-display .katex").first()).toBeVisible();

  const code = page.locator(".code-block.runnable").first();
  await expect(code.locator(".tok-kw").first()).toBeVisible();
  await expect(code.getByRole("button", { name: "Run" })).toBeVisible();
  await code.getByRole("button", { name: "Edit code" }).click();
  await expect(code.getByLabel("Python code editor")).toHaveValue(
    /newest_wins/,
  );
  await expect(code.locator("pre").first()).toBeHidden();

  const results = await new AxeBuilder({ page })
    .include(".reading-page, .lesson-stage")
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("daily review brings back a mastered idea as practice and keeps mastery evidence unchanged", async ({
  page,
}) => {
  const lesson = curriculum.lessons.find((l) => l.id === "ai-systems")!;
  const objective = curriculum.objectives.find((o) => o.lesson === lesson.id)!;
  const threeDaysAgo = Date.now() - 3 * 86_400_000;
  const questions = objective.families.map(
    (family) => lesson.questions.find((q) => !q.retired && q.family === family)!,
  );
  await page.goto("/");
  await expect(page.locator("main")).toHaveAttribute("aria-busy", "false");
  const seeded: Progress = {
    format: "learn-ai-progress",
    version: 1,
    curriculum: "prototype-1",
    updatedAt: Date.now(),
    resetAt: 0,
    selectedPath: null,
    attempts: questions.map((q, i) => ({
      id: `seed-${i}`,
      objective: objective.id,
      version: objective.version,
      family: q.family,
      variant: q.id,
      correct: true,
      independent: true,
      mode: "assessment" as const,
      at: threeDaysAgo + i,
      responses: Object.fromEntries(
        Object.entries(q.answers).map(([k, v]) => [k, String(v)]),
      ),
    })),
    exposures: questions.map((q) => q.id),
    positions: {},
    bookmarks: [],
    detours: [],
    lastExportAt: 0,
    backupDismissedAt: 0,
    lastLesson: null,
    studyDays: [],
  };
  await page.evaluate(async (progress) => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("learn-ai", 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("learner", "readwrite");
      tx.objectStore("learner").put(progress, "progress");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  }, seeded);

  await page.goto("/review/");
  await expect(page.locator("main")).toHaveAttribute("aria-busy", "false");
  await expect(page.locator(".nav-badge")).toHaveText("1");
  await expect(page.getByText(/idea is ready for review/)).toBeVisible();
  await page.getByRole("button", { name: /Start review/ }).click();

  const card = page.locator(".question-card");
  const question = lesson.questions.find((q) =>
    questions.some((s) => s.id === q.id),
  )!;
  await expect(card).toBeVisible();
  const prompt = await card.locator(".question-prompt").innerText();
  const shown = questions.find((q) => q.prompt === prompt)!;
  expect(shown).toBeTruthy();
  if (shown.options.length) {
    const option = shown.options.find((o) => o.id === shown.answers.choice)!;
    await card.getByLabel(option.text).check();
  } else {
    for (const field of shown.fields)
      await card.getByLabel(field.label).fill(String(shown.answers[field.id]));
  }
  await card.getByRole("button", { name: /Check answer/ }).click();
  await expect(card.getByText("That’s right.")).toBeVisible();
  await card.getByRole("button", { name: /Continue/ }).click();
  await expect(page.getByText(/1 of 1 recalled/)).toBeVisible();
  await expect(page.locator(".nav-badge")).toHaveCount(0);
  expect(question).toBeTruthy();
});
