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

async function openLab(
  page: Page,
  lessonId: string,
  sceneId: string,
  kind: string,
) {
  const lesson = curriculum.lessons.find((lesson) => lesson.id === lessonId)!;
  const scene = lesson.scenes.find((scene) => scene.id === sceneId)!;
  await page.goto(`/learn/${lessonId}/`);
  await expect(page.locator("main")).toHaveAttribute("aria-busy", "false");
  await page
    .getByRole("button", {
      name: `Scene ${lesson.routes.core.indexOf(sceneId) + 1}: ${scene.title}`,
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

test("k-means predicts assignments, moves centers, persists, and resets the prediction when inputs change", async ({
  page,
}) => {
  const lab = await openLab(page, "clustering", "clustering.s2", "clustering");
  const assign = lab.getByRole("button", {
    name: "Assign points",
    exact: true,
  });
  await expect(assign).toBeDisabled();
  await lab
    .getByRole("combobox", { name: "Predict point 4 assignment" })
    .selectOption("B");
  await assign.click();
  await expect(lab.locator(".visual-result")).toContainText(
    "You predicted B; the nearest center is A.",
  );
  await expect(lab.getByTestId("cluster-centers")).toHaveCount(0);
  await lab.getByRole("button", { name: "Move centers to means" }).click();
  await expect(lab.getByTestId("cluster-centers")).toHaveText(
    "Updated centers: A = 2.333333, B = 9.",
  );
  await expect
    .poll(
      async () =>
        (await progress(page))?.positions.clustering.visuals?.["clustering.s2"]
          ?.values,
    )
    .toEqual({ centerA: 2, centerB: 6, stage: 2, prediction: "B" });
  await page.reload();
  await expect(lab.getByTestId("cluster-centers")).toContainText("2.333333");
  const first = lab.getByRole("slider", {
    name: "Starting center A",
    exact: true,
  });
  await first.focus();
  await first.press("ArrowRight");
  await expect(first).toHaveValue("2.5");
  await expect(
    lab.getByRole("combobox", { name: "Predict point 4 assignment" }),
  ).toHaveValue("");
  await expect(assign).toBeDisabled();
  expect((await progress(page))?.attempts).toEqual([]);
});

test("beam width changes search outcomes with the same probabilities", async ({
  page,
}) => {
  const lab = await openLab(
    page,
    "sequence-to-sequence",
    "sequence-to-sequence.s4",
    "beam-search",
  );
  const reveal = lab.getByRole("button", {
    name: "Compare completed sequences",
  });
  await expect(reveal).toBeDisabled();
  await lab
    .getByRole("combobox", { name: "Predict beam outcome" })
    .selectOption("same");
  await reveal.click();
  await expect(lab.getByTestId("beam-winner")).toHaveText(
    "Beam width 2: “stay home”, score 0.4 × 0.9 = 0.36.",
  );
  await expect
    .poll(
      async () =>
        (await progress(page))?.positions["sequence-to-sequence"].visuals?.[
          "sequence-to-sequence.s4"
        ]?.values,
    )
    .toEqual({ width: 2, prediction: "same", revealed: true });
  await page.reload();
  await expect(lab.getByTestId("beam-winner")).toContainText("stay home");
  await lab
    .getByRole("combobox", { name: "Beam width", exact: true })
    .selectOption("1");
  await expect(lab.getByTestId("beam-winner")).toHaveCount(0);
  await lab
    .getByRole("combobox", { name: "Predict beam outcome" })
    .selectOption("same");
  await reveal.click();
  await expect(lab.getByTestId("beam-winner")).toHaveText(
    "Beam width 1: “go home”, score 0.6 × 0.5 = 0.3.",
  );
  expect((await progress(page))?.attempts).toEqual([]);
});

test("cache growth follows retained tokens, KV heads, and precision, with proportional bars", async ({
  page,
}) => {
  const lab = await openLab(
    page,
    "cached-inference",
    "cached-inference.s4",
    "kv-cache",
  );
  await expect(lab.getByTestId("cache-size")).toContainText(
    "8,192 bytes (8 KiB)",
  );
  await lab.getByRole("button", { name: "Append one processed token" }).click();
  await expect(lab.getByTestId("cache-size")).toContainText(
    "8,704 bytes (8.5 KiB)",
  );
  await lab
    .getByRole("combobox", { name: "Predict doubled cache size" })
    .selectOption("double");
  await lab.getByRole("button", { name: "Reveal doubled cache" }).click();
  await expect(lab.getByTestId("cache-comparison")).toHaveText(
    "17 → 34 positions; 8.5 → 17 KiB.",
  );
  const bars = lab.locator("svg rect");
  expect(Number(await bars.nth(2).getAttribute("width"))).toBeCloseTo(
    2 * Number(await bars.nth(0).getAttribute("width")),
    8,
  );
  await expect
    .poll(
      async () =>
        (await progress(page))?.positions["cached-inference"].visuals?.[
          "cached-inference.s4"
        ]?.values,
    )
    .toEqual({
      promptTokens: 16,
      appended: 1,
      heads: "2",
      precision: "2",
      prediction: "double",
      revealed: true,
    });
  await page.reload();
  await expect(lab.getByTestId("cache-comparison")).toContainText(
    "8.5 → 17 KiB",
  );
  await lab
    .getByRole("combobox", { name: "Cache precision" })
    .selectOption("1");
  await expect(lab.getByTestId("cache-size")).toContainText(
    "4,352 bytes (4.25 KiB)",
  );
  await lab
    .getByRole("combobox", { name: "KV heads", exact: true })
    .selectOption("4");
  await expect(lab.getByTestId("cache-size")).toContainText(
    "8,704 bytes (8.5 KiB)",
  );
  expect((await progress(page))?.attempts).toEqual([]);
});

test("schedule comparison shows recomputed gradients and does not imply decay always wins", async ({
  page,
}) => {
  const lab = await openLab(
    page,
    "momentum-and-adam",
    "momentum-and-adam.s1",
    "learning-rate",
  );
  await lab
    .getByRole("combobox", { name: "Predict lower loss" })
    .selectOption("decay");
  await lab.getByRole("button", { name: "Compare two updates" }).click();
  await expect(lab.getByTestId("schedule-loss")).toHaveText(
    "After 2 updates — constant loss: 2.0736; decaying loss: 0.2304.",
  );
  await expect
    .poll(
      async () =>
        (await progress(page))?.positions["momentum-and-adam"].visuals?.[
          "momentum-and-adam.s1"
        ]?.values,
    )
    .toEqual({ rate: 0.8, steps: 2, prediction: "decay" });
  await page.reload();
  await expect(lab.getByTestId("schedule-loss")).toContainText("0.2304");
  const next = lab.getByRole("button", { name: "Take one more paired step" });
  for (let i = 0; i < 4; i++) await next.click();
  await expect(next).toBeDisabled();
  const rate = lab.getByRole("slider", { name: "Schedule starting rate" });
  await rate.focus();
  await rate.press("Home");
  await rate.press("ArrowRight");
  await rate.press("ArrowRight");
  await expect(rate).toHaveValue("0.2");
  await lab
    .getByRole("combobox", { name: "Predict lower loss" })
    .selectOption("constant");
  await lab.getByRole("button", { name: "Compare two updates" }).click();
  await expect(lab.locator(".visual-result")).toContainText(
    "the constant rate gives the smaller loss",
  );
  expect((await progress(page))?.attempts).toEqual([]);
});

const mobileLabs = [
  {
    lesson: "clustering",
    scene: "clustering.s2",
    kind: "clustering",
    prediction: "Predict point 4 assignment",
    choice: "A",
    reveal: "Assign points",
  },
  {
    lesson: "sequence-to-sequence",
    scene: "sequence-to-sequence.s4",
    kind: "beam-search",
    prediction: "Predict beam outcome",
    choice: "different",
    reveal: "Compare completed sequences",
  },
  {
    lesson: "cached-inference",
    scene: "cached-inference.s4",
    kind: "kv-cache",
    prediction: "Predict doubled cache size",
    choice: "double",
    reveal: "Reveal doubled cache",
  },
  {
    lesson: "momentum-and-adam",
    scene: "momentum-and-adam.s1",
    kind: "learning-rate",
    prediction: "Predict lower loss",
    choice: "decay",
    reveal: "Compare two updates",
  },
];
for (const fixture of mobileLabs) {
  test(`${fixture.kind} works by keyboard without mobile overflow or accessibility violations`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const lab = await openLab(
      page,
      fixture.lesson,
      fixture.scene,
      fixture.kind,
    );
    const choice = lab.getByRole("combobox", { name: fixture.prediction });
    await choice.focus();
    await choice.press("End");
    await choice.press("Enter");
    await expect(choice).not.toHaveValue("");
    const reveal = lab.getByRole("button", {
      name: fixture.reveal,
      exact: true,
    });
    await reveal.focus();
    await reveal.press("Enter");
    await expect(lab.locator(".visual-result")).not.toContainText(
      "Choose a prediction",
    );
    await lab.locator("summary").focus();
    await lab.locator("summary").press("Enter");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(
      (
        await new AxeBuilder({ page })
          .include(`[data-visual="${fixture.kind}"]`)
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    expect(errors).toEqual([]);
  });
}
