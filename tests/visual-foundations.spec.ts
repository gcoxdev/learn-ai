import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync } from "node:fs";
import type { Curriculum, Progress } from "../src/lib/model";

const curriculum = JSON.parse(
  readFileSync(
    new URL("../src/lib/generated/curriculum.json", import.meta.url),
    "utf8",
  ),
) as Curriculum;

async function openVisual(
  page: Page,
  lessonId: string,
  sceneId: string,
  kind: string,
) {
  const lesson = curriculum.lessons.find((lesson) => lesson.id === lessonId)!;
  const scene = lesson.scenes.find((scene) => scene.id === sceneId);
  const index = lesson.routes.core.indexOf(sceneId);
  if (!scene || index < 0) throw new Error(`Missing core scene ${sceneId}`);
  await page.goto(`/learn/${lessonId}/`);
  await expect(page.locator("main")).toHaveAttribute("aria-busy", "false");
  await page
    .getByRole("button", {
      name: `Scene ${index}: ${scene.title}`,
      exact: true,
    })
    .click();
  const lab = page.locator(`[data-visual="${kind}"]`);
  await expect(lab.locator(".visual-lab")).toBeVisible();
  return lab;
}

async function progress(page: Page): Promise<Progress | undefined> {
  return page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("learn-ai", 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    try {
      return await new Promise<Progress | undefined>((resolve, reject) => {
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

test("changing the input or the task changes the answer and survives refresh without mastery", async ({
  page,
}) => {
  const lessonId = "inputs-and-outputs",
    sceneId = `${lessonId}.s2`;
  const lab = await openVisual(page, lessonId, sceneId, "input-output");
  const picture = lab.getByRole("combobox", { name: /Picture — the input/ });
  const task = lab.getByRole("combobox", { name: /Task — what to find/ });
  const result = lab.getByTestId("input-output-result");
  await expect(result).toHaveText("The output is “red”.");
  await task.selectOption("holes");
  await expect(result).toHaveText("The output is “2 holes”.");
  await picture.selectOption("blue-four");
  await expect(result).toHaveText("The output is “4 holes”.");
  await expect(lab.getByRole("img")).toHaveAccessibleName(
    "Input: a blue button with 4 holes. Task: count the holes. Output: 4 holes.",
  );
  await expect
    .poll(
      async () =>
        (await progress(page))?.positions[lessonId]?.visuals?.[sceneId]?.values,
    )
    .toEqual({ picture: "blue-four", task: "holes" });
  await page.reload();
  await expect(page.locator("main")).toHaveAttribute("aria-busy", "false");
  await expect(picture).toHaveValue("blue-four");
  await expect(task).toHaveValue("holes");
  await expect(result).toHaveText("The output is “4 holes”.");
  await task.selectOption("color");
  await expect(result).toHaveText("The output is “blue”.");
  expect((await progress(page))?.attempts).toEqual([]);
  await lab
    .getByRole("button", { name: "Reset experiment", exact: true })
    .click();
  await expect(picture).toHaveValue("red-two");
  await expect(result).toHaveText("The output is “red”.");
});

test("inference keeps the weight fixed and fitting changes it using both examples", async ({
  page,
}) => {
  const lessonId = "training-and-inference",
    sceneId = `${lessonId}.s3`;
  const lab = await openVisual(page, lessonId, sceneId, "training-inference");
  const guests = lab.getByRole("slider", {
    name: "Guests to serve",
    exact: true,
  });
  const mode = lab.getByRole("combobox", {
    name: "Choose an activity",
    exact: true,
  });
  const result = lab.getByTestId("training-inference-result");
  await expect(result).toHaveText("3 × 2 = 6 crackers");
  await guests.focus();
  await guests.press("ArrowRight");
  await expect(result).toHaveText("4 × 2 = 8 crackers");
  await mode.selectOption("fit");
  await expect(result).toHaveText("4 × 2 = 8 crackers");
  await expect(lab.getByRole("table")).toContainText("Total miss");
  await expect(lab.getByRole("row").nth(1).locator("th, td")).toHaveText([
    "2",
    "4",
    "6",
    "5",
  ]);
  await expect(lab.getByRole("row").nth(2).locator("th, td")).toHaveText([
    "3",
    "6",
    "9",
    "0",
  ]);
  const fit = lab.getByRole("button", {
    name: "Fit using both examples",
    exact: true,
  });
  await fit.focus();
  await fit.press("Enter");
  await expect(result).toHaveText("4 × 3 = 12 crackers");
  await expect(fit).toBeDisabled();
  await mode.selectOption("use");
  await guests.focus();
  await guests.press("ArrowLeft");
  await expect(result).toHaveText("3 × 3 = 9 crackers");
  await expect
    .poll(
      async () =>
        (await progress(page))?.positions[lessonId]?.visuals?.[sceneId]?.values,
    )
    .toEqual({ mode: "use", guests: 3, weight: 3 });
  expect((await progress(page))?.attempts).toEqual([]);
  await lab
    .getByRole("button", { name: "Reset experiment", exact: true })
    .click();
  await expect(result).toHaveText("3 × 2 = 6 crackers");
});

test("the splitting puzzle detects shared sources and empty groups before accepting a fairer split on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const lab = await openVisual(
    page,
    "splits-and-leakage",
    "splits-and-leakage.s3",
    "data-splits",
  );
  const check = lab.getByRole("button", { name: "Check split", exact: true });
  const result = lab.getByTestId("data-split-result");
  await check.click();
  await expect(result).toContainText("3 source groups cross a boundary.");
  await expect(result).toContainText("Button A appears in Training and Test.");
  for (const source of ["A", "B", "C"]) {
    for (const photo of [1, 2]) {
      await lab
        .getByRole("combobox", {
          name: `Partition for button ${source} photo ${photo}`,
          exact: true,
        })
        .selectOption("train");
    }
  }
  await expect(result).toHaveCount(0);
  await check.click();
  await expect(result).toContainText("Related photos stay together.");
  await expect(result).toContainText("Still empty: Validation, Test.");
  for (const [source, partition] of [
    ["B", "validation"],
    ["C", "test"],
  ] as const) {
    for (const photo of [1, 2]) {
      await lab
        .getByRole("combobox", {
          name: `Partition for button ${source} photo ${photo}`,
          exact: true,
        })
        .selectOption(partition);
    }
  }
  await check.focus();
  await check.press("Enter");
  await expect(result).toContainText(
    "All three groups are filled, and each button stays in one group.",
  );
  await expect(
    lab.getByLabel("Examples per partition").locator("strong"),
  ).toHaveText(["2 photos", "2 photos", "2 photos"]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(
    (
      await new AxeBuilder({ page })
        .include('[data-visual="data-splits"]')
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  expect((await progress(page))?.attempts).toEqual([]);
  await page.screenshot({
    path: "/tmp/learn-ai-data-splits-mobile.png",
    fullPage: true,
  });
  await lab
    .getByRole("button", { name: "Reset experiment", exact: true })
    .click();
  await check.click();
  await expect(result).toContainText("3 source groups cross a boundary.");
});

test("network steps show separate biases and ReLU effects and remain usable by keyboard on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const lab = await openVisual(
    page,
    "neural-forward-pass",
    "neural-forward-pass.s3",
    "neural-network",
  );
  const result = lab.getByTestId("network-trace");
  const next = lab.getByRole("button", {
    name: "Next calculation",
    exact: true,
  });
  const previous = lab.getByRole("button", {
    name: "Previous step",
    exact: true,
  });
  await expect(previous).toBeDisabled();
  await expect(result).toContainText("Step 1: Start with the input");
  await next.click();
  await expect(result).toContainText(
    "First sum: 2 × 2 − 1 = 3. Second sum: −1 × 2 + 3 = 1.",
  );
  await next.click();
  await expect(result).toContainText("ReLU gives 3 and 1.");
  await next.click();
  await expect(result).toContainText("Output: 1 × 3 + 2 × 1 + 1 = 6.");
  await expect(next).toBeDisabled();
  const input = lab.getByRole("slider", { name: "Network input", exact: true });
  await input.focus();
  await input.press("ArrowRight");
  await input.press("ArrowRight");
  await expect(input).toHaveValue("4");
  await expect(result).toContainText("Step 1: Start with the input");
  await expect(previous).toBeDisabled();
  await next.focus();
  await next.press("Enter");
  await expect(result).toContainText(
    "First sum: 2 × 4 − 1 = 7. Second sum: −1 × 4 + 3 = -1.",
  );
  await next.press("Enter");
  await expect(result).toContainText(
    "ReLU gives 7 and 0. A negative sum became zero.",
  );
  await next.press("Enter");
  await expect(result).toContainText("Output: 1 × 7 + 2 × 0 + 1 = 8.");
  await expect(lab.getByRole("img")).toHaveAccessibleName(
    /Input 4\..*add bias minus 1.*add bias 3.*plus bias 1/,
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(
    (
      await new AxeBuilder({ page })
        .include('[data-visual="neural-network"]')
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  expect((await progress(page))?.attempts).toEqual([]);
  await page.screenshot({
    path: "/tmp/learn-ai-network-mobile.png",
    fullPage: true,
  });
  await lab
    .getByRole("button", { name: "Reset experiment", exact: true })
    .click();
  await expect(input).toHaveValue("2");
  await expect(previous).toBeDisabled();
});
