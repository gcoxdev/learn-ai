import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync } from "node:fs";
import type { Curriculum } from "../src/lib/model";

const data = JSON.parse(
  readFileSync(
    new URL("../src/lib/generated/curriculum.json", import.meta.url),
    "utf8",
  ),
) as Curriculum;
async function open(page: Page, lessonId: string, kind: string) {
  await page.goto(`/learn/${lessonId}/`);
  await expect(page.locator("main")).toHaveAttribute("aria-busy", "false");
  const lesson = data.lessons.find((l) => l.id === lessonId)!;
  const scene = lesson.scenes.find((s) => s.figure?.kind === kind)!;
  await page
    .getByRole("button", {
      name: `Scene ${lesson.routes.core.indexOf(scene.id)}: ${scene.title}`,
      exact: true,
    })
    .click();
  const lab = page.locator(`[data-visual="${kind}"]`);
  await expect(lab.locator(".visual-lab")).toBeVisible();
  return lab;
}

test("lifecycle separates learning from fixed-weight inference and restores the choice", async ({
  page,
}) => {
  const lab = await open(page, "pretraining-data-pipeline", "lifecycle");
  await lab
    .getByRole("button", { name: "2 · LEARN Pretrain", exact: true })
    .click();
  await expect(lab.locator(".visual-result")).toContainText("Weights change");
  await lab
    .getByRole("button", { name: "5 · INFERENCE Use the model", exact: true })
    .click();
  await expect(lab.locator(".visual-result")).toContainText(
    "Weights fixed for this example",
  );
  await expect(lab.locator(".visual-result")).toContainText(
    "not automatically a training run",
  );
  await page.reload();
  await expect(
    lab.getByRole("button", {
      name: "5 · INFERENCE Use the model",
      exact: true,
    }),
  ).toHaveAttribute("aria-pressed", "true");
  await lab.getByRole("button", { name: "Next stage", exact: true }).click();
  await expect(lab.locator(".visual-result")).toContainText(
    "does not automatically mean retraining",
  );
});

test("timeline distinguishes a proposal from demonstrated capability", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const lab = await open(page, "history", "history");
  await lab
    .getByRole("button", { name: "1955 / 1956 An organized research agenda" })
    .click();
  await expect(lab.locator(".visual-result")).toContainText(
    "written in 1955 for the summer of 1956",
  );
  await expect(lab.locator(".visual-result")).toContainText(
    "not capabilities already achieved",
  );
  await lab
    .getByRole("button", { name: "2012 An image-recognition milestone" })
    .click();
  await expect(lab.locator(".visual-result")).toContainText(
    "Measured task result",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(
    (
      await new AxeBuilder({ page })
        .include('[data-visual="history"]')
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
});

test("source comparison retains the factual answer when its position changes", async ({
  page,
}) => {
  const lab = await open(page, "human-and-model-judges", "evaluation");
  await lab.getByRole("button", { name: /^Answer A / }).click();
  await lab.getByRole("button", { name: "Check against the source" }).click();
  await expect(lab.getByRole("status")).toContainText(
    "A borrows Monday's start time",
  );
  await lab.getByRole("button", { name: /^Answer B / }).click();
  await expect(lab.getByRole("status")).toHaveCount(0);
  await lab.getByRole("button", { name: "Swap answer positions" }).click();
  await expect(
    lab
      .getByRole("group", { name: "Candidate answers" })
      .getByRole("button")
      .first(),
  ).toContainText("Answer B");
  await lab.getByRole("button", { name: "Check against the source" }).click();
  await expect(lab.getByRole("status")).toContainText(
    "B matches the supplied schedule",
  );
  expect(
    (
      await new AxeBuilder({ page })
        .include('[data-visual="evaluation"]')
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
});

test("noise controls change the corrupted image while the reference remains fixed", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const lab = await open(page, "denoising", "image-noise");
  const images = lab.getByRole("img");
  const colors = (index: number) =>
    images
      .nth(index)
      .locator("rect[fill]:not([fill='none'])")
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("fill")));
  const clean = await colors(0);
  await lab.getByRole("button", { name: "Remove the noise" }).click();
  expect(await colors(1)).toEqual(clean);
  const amount = lab.getByRole("slider", { name: /Noise amount/ });
  await amount.focus();
  await amount.press("End");
  await expect(amount).toHaveValue("1");
  expect(await colors(0)).toEqual(clean);
  expect(await colors(1)).not.toEqual(clean);
  await lab.getByRole("combobox", { name: "Inspect pixel" }).selectOption("0");
  await expect(lab.locator(".visual-result")).toContainText(
    "Pixel 1: 0.85 + 1 × (-0.42) = 0.43",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(
    (
      await new AxeBuilder({ page })
        .include('[data-visual="image-noise"]')
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.screenshot({
    path: "/tmp/learn-ai-noise-visual-mobile.png",
    fullPage: true,
  });
});
