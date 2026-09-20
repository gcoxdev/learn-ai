import { test, expect, type Page, type Locator } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync } from "node:fs";
import type { Curriculum, Progress } from "../src/lib/model";

const curriculum = JSON.parse(
  readFileSync(
    new URL("../src/lib/generated/curriculum.json", import.meta.url),
    "utf8",
  ),
) as Curriculum;

async function ready(page: Page, url: string) {
  await page.goto(url);
  await expect(page.locator("main")).toHaveAttribute("aria-busy", "false");
}

async function openScene(page: Page, lessonId: string, sceneId: string) {
  const lesson = curriculum.lessons.find((lesson) => lesson.id === lessonId)!;
  const scene = lesson.scenes.find((scene) => scene.id === sceneId)!;
  await ready(page, `/learn/${lessonId}/`);
  const index = lesson.routes.core.indexOf(sceneId);
  expect(index).toBeGreaterThanOrEqual(0);
  await page
    .getByRole("button", {
      name: `Scene ${index + 1}: ${scene.title}`,
      exact: true,
    })
    .click();
}

async function database(page: Page): Promise<Progress | undefined> {
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

async function move(slider: Locator, key: string, count = 1) {
  await slider.focus();
  for (let i = 0; i < count; i++) await slider.press(key);
}

test("bias shifts all predictions while weight changes them in proportion to the input", async ({
  page,
}) => {
  await openScene(page, "neurons", "neurons.s2");
  const lab = page.getByRole("region", {
    name: "Weight and bias experiment",
    exact: true,
  });
  await lab
    .getByText("See the numbers and the meaning of bias", { exact: true })
    .click();
  const rows = lab.locator("tbody tr");
  await expect(rows.nth(0).getByRole("cell")).toHaveText(["1", "0", "-1"]);
  await expect(rows.nth(1).getByRole("cell")).toHaveText(["3", "1", "-2"]);
  await expect(rows.nth(2).getByRole("cell")).toHaveText(["5", "2", "-3"]);
  await move(
    lab.getByRole("slider", { name: "Line bias", exact: true }),
    "ArrowRight",
  );
  await expect(rows.nth(0).getByRole("cell")).toHaveText(["1", "0.1", "-0.9"]);
  await expect(rows.nth(1).getByRole("cell")).toHaveText(["3", "1.1", "-1.9"]);
  await expect(rows.nth(2).getByRole("cell")).toHaveText(["5", "2.1", "-2.9"]);
  await move(
    lab.getByRole("slider", { name: "Line weight", exact: true }),
    "ArrowRight",
  );
  await expect(rows.nth(0).getByRole("cell")).toHaveText(["1", "0.1", "-0.9"]);
  await expect(rows.nth(1).getByRole("cell")).toHaveText(["3", "1.2", "-1.8"]);
  await expect(rows.nth(2).getByRole("cell")).toHaveText(["5", "2.3", "-2.7"]);
  await expect
    .poll(
      async () =>
        (await database(page))?.positions.neurons.visuals?.["neurons.s2"]
          ?.values,
    )
    .toEqual({ weight: 1.1, bias: 0.1 });
  await page.reload();
  await expect(page.locator("main")).toHaveAttribute("aria-busy", "false");
  await expect(
    lab.getByRole("slider", { name: "Line weight", exact: true }),
  ).toHaveValue("1.1");
  await expect(
    lab.getByRole("slider", { name: "Line bias", exact: true }),
  ).toHaveValue("0.1");
  expect((await database(page))?.attempts).toEqual([]);
});

test("a secant approaches the derivative without dividing by zero and handles signed slopes", async ({
  page,
}) => {
  await openScene(page, "derivatives", "derivatives.s3");
  const lab = page.getByRole("region", {
    name: "Derivative experiment",
    exact: true,
  });
  await expect(lab.getByTestId("derivative-slope")).toHaveText("2");
  await expect(lab.locator(".visual-result")).toContainText(
    "Two-point slope: 3 ÷ 1 = 3",
  );
  const distance = lab.getByRole("slider", {
    name: "Comparison distance",
    exact: true,
  });
  await move(distance, "Home");
  await expect(distance).toHaveValue("0.01");
  await expect(lab.locator(".visual-result")).toContainText(
    "Two-point slope: 0.0201 ÷ 0.01 = 2.01",
  );
  const point = lab.getByRole("slider", {
    name: "Derivative first point",
    exact: true,
  });
  await move(point, "Home");
  await expect(lab.getByTestId("derivative-slope")).toHaveText("-5");
  await expect(lab.locator(".visual-result")).toContainText("Negative slope");
  await move(point, "ArrowRight", 25);
  await expect(point).toHaveValue("0");
  await expect(lab.getByTestId("derivative-slope")).toHaveText("0");
  await expect(lab.locator(".visual-result")).toContainText(
    "Two-point slope: 0.0001 ÷ 0.01 = 0.01",
  );
  await expect(lab.getByRole("img")).toHaveAttribute(
    "aria-label",
    /local slope is 0/,
  );
  await expect
    .poll(
      async () =>
        (await database(page))?.positions.derivatives.visuals?.[
          "derivatives.s3"
        ]?.values,
    )
    .toEqual({ x: 0, h: 0.01 });
  await page.reload();
  await expect(lab.getByTestId("derivative-slope")).toHaveText("0");
  await expect(distance).toHaveValue("0.01");
  expect((await database(page))?.attempts).toEqual([]);
});

test("chain-rule tracing multiplies the local factors and keeps its place on reload", async ({
  page,
}) => {
  await openScene(page, "chain-rule", "chain-rule.s4");
  const lab = page.getByRole("region", {
    name: "Chain rule experiment",
    exact: true,
  });
  const next = lab.getByRole("button", {
    name: "Trace next derivative",
    exact: true,
  });
  await expect(lab.getByRole("img")).toHaveAttribute(
    "aria-label",
    /weight 1, prediction 2, residual -4, loss 16/,
  );
  await next.click();
  await expect(lab.locator(".visual-result")).toContainText(
    "2 × residual = -8",
  );
  await next.click();
  await expect(lab.locator(".visual-result")).toContainText(
    "Subtracting a fixed target has derivative 1",
  );
  await next.click();
  await expect(lab.getByTestId("chain-gradient")).toContainText(
    "weight gradient is -16",
  );
  await expect(next).toBeDisabled();
  await expect
    .poll(
      async () =>
        (await database(page))?.positions["chain-rule"].visuals?.[
          "chain-rule.s4"
        ]?.values,
    )
    .toEqual({ weight: 1, step: 3 });
  await page.reload();
  await expect(lab.getByTestId("chain-gradient")).toContainText(
    "weight gradient is -16",
  );
  await move(
    lab.getByRole("slider", { name: "Chain rule weight", exact: true }),
    "End",
  );
  await expect(lab.locator(".visual-result")).toContainText(
    "Backward step 0 of 3",
  );
  await expect(lab.getByRole("img")).toHaveAttribute(
    "aria-label",
    /weight 4, prediction 8, residual 2, loss 4/,
  );
  for (let i = 0; i < 3; i++) await next.click();
  await expect(lab.getByTestId("chain-gradient")).toContainText(
    "weight gradient is 8",
  );
  await expect(lab.getByTestId("chain-gradient")).toContainText(
    "weight decrease lowers this loss",
  );
  expect((await database(page))?.attempts).toEqual([]);
});

test("weight and bias update together and survive a calculus detour and reload", async ({
  page,
}) => {
  await openScene(page, "neural-training-loop", "neural-training-loop.s3");
  const lab = page.getByRole("region", {
    name: "Two parameter training experiment",
    exact: true,
  });
  await expect(lab.getByTestId("parameter-loss")).toHaveText("11.666667");
  await lab
    .getByRole("button", { name: "Update both parameters", exact: true })
    .click();
  await expect(lab.getByTestId("parameter-loss")).toHaveText("3.207407");
  await expect(lab.locator(".visual-result")).toContainText(
    "Step 1: weight 0.866667, bias 0.6",
  );
  await expect(lab.getByRole("img")).toHaveAttribute(
    "aria-label",
    /weight 0.866667, bias 0.6, loss 3.207407/,
  );
  await expect
    .poll(
      async () =>
        (await database(page))?.positions["neural-training-loop"].visuals?.[
          "neural-training-loop.s3"
        ]?.values,
    )
    .toEqual({ initialWeight: 0, initialBias: 0, rate: 0.1, steps: 1 });
  await page
    .locator('[id="bridge-neural-training-loop.s3-derivatives"]')
    .click();
  await expect(page).toHaveURL(/\/learn\/derivatives\//);
  await page.getByRole("button", { name: /^Return to / }).click();
  await expect(lab.getByTestId("parameter-loss")).toHaveText("3.207407");
  await page.reload();
  await expect(lab.getByTestId("parameter-loss")).toHaveText("3.207407");
  await lab
    .getByText("See the partial derivatives and exact updates", { exact: true })
    .click();
  await expect(
    lab.locator(".history-table tbody tr").nth(1).getByRole("cell"),
  ).toHaveText(["0.866667", "0.6", "3.207407"]);
  expect((await database(page))?.attempts).toEqual([]);
});

test("the two-parameter map keeps a bounded high-rate trajectory visible on mobile", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await openScene(page, "neural-training-loop", "neural-training-loop.s3");
  const lab = page.getByRole("region", {
    name: "Two parameter training experiment",
    exact: true,
  });
  await move(
    lab.getByRole("slider", { name: "Starting training weight", exact: true }),
    "Home",
  );
  await move(
    lab.getByRole("slider", { name: "Starting training bias", exact: true }),
    "Home",
  );
  await move(
    lab.getByRole("slider", {
      name: "Two parameter learning rate",
      exact: true,
    }),
    "End",
  );
  const update = lab.getByRole("button", {
    name: "Update both parameters",
    exact: true,
  });
  await expect(lab.getByTestId("parameter-loss")).toHaveText("74.666667");
  await update.click();
  await expect(lab.locator(".visual-result")).toContainText(
    "Step 1: weight 4.4, bias 1.8",
  );
  await expect(lab.getByTestId("parameter-loss")).toHaveText("14.08");
  const point = lab.locator("svg circle").last();
  expect(Number(await point.getAttribute("cx"))).toBeGreaterThanOrEqual(45);
  expect(Number(await point.getAttribute("cx"))).toBeLessThanOrEqual(322);
  expect(Number(await point.getAttribute("cy"))).toBeGreaterThanOrEqual(29);
  expect(Number(await point.getAttribute("cy"))).toBeLessThanOrEqual(244);
  for (let i = 1; i < 16; i++) await update.click();
  await expect(update).toBeDisabled();
  await expect(lab.locator(".visual-result")).toContainText("Step 16");
  expect(
    Number(await lab.getByTestId("parameter-loss").textContent()),
  ).toBeLessThan(14.08);
  for (const points of await lab
    .locator("svg polyline")
    .evaluateAll((lines) => lines.map((line) => line.getAttribute("points"))))
    expect(points).not.toMatch(/NaN|Infinity/);
  await lab
    .getByText("See the partial derivatives and exact updates", { exact: true })
    .click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.screenshot({
    path: "/tmp/learn-ai-parameter-mobile.png",
    fullPage: true,
  });
  await lab
    .getByRole("button", { name: "Reset experiment", exact: true })
    .click();
  await expect(lab.getByTestId("parameter-loss")).toHaveText("11.666667");
  await expect(update).toBeEnabled();
  expect(errors).toEqual([]);
});

test("the single-weight loss chart explains its tangent and the last update", async ({
  page,
}) => {
  const lesson = curriculum.lessons.find(
    (lesson) => lesson.id === "learning-update",
  )!;
  const scene = lesson.scenes.find(
    (scene) => scene.title === "Watch several updates",
  )!;
  await openScene(page, lesson.id, scene.id);
  await page
    .getByRole("button", { name: "Show worked example", exact: true })
    .click();
  const lab = page.getByRole("region", {
    name: "Gradient descent experiment",
    exact: true,
  });
  await lab.getByRole("button", { name: "Take one step", exact: true }).click();
  await expect(lab.getByTestId("current-loss")).toHaveText("0.0576");
  await expect(lab.locator(".gradient-explanation")).toContainText(
    "The tangent has slope -0.96",
  );
  await expect(lab.locator(".gradient-explanation")).toContainText(
    "Last update: 2.4 − 0.1 × (-4.8) = 2.88",
  );
  await move(
    lab.getByRole("slider", { name: "Learning rate", exact: true }),
    "Home",
  );
  await expect(lab.locator(".gradient-explanation")).toContainText(
    "With a zero learning rate",
  );
  await lab.getByRole("button", { name: "Take one step", exact: true }).click();
  await expect(lab.getByTestId("current-loss")).toHaveText("36");
});
