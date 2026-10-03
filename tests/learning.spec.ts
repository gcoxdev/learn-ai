import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import type { Curriculum } from "../src/lib/model";
const data = JSON.parse(
  readFileSync(
    new URL("../src/lib/generated/curriculum.json", import.meta.url),
    "utf8",
  ),
) as Curriculum;
for (const lesson of data.lessons)
  lesson.questions = lesson.questions.filter((q) => !q.retired);

async function ready(page: Page, url: string) {
  await page.goto(url);
  await expect(page.locator("main")).toHaveAttribute("aria-busy", "false");
}
async function database(page: Page) {
  return page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const r = indexedDB.open("learn-ai", 1);
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
    const result = await new Promise<any>((resolve, reject) => {
      const r = db
        .transaction("learner")
        .objectStore("learner")
        .get("progress");
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
    db.close();
    return result;
  });
}
async function firstLessonMastery(page: Page, openLesson = true) {
  if (openLesson) await ready(page, "/learn/ai-systems/");
  await page
    .getByRole("button", { name: "Check my knowledge", exact: true })
    .click();
  await page.getByRole("button", { name: "Begin knowledge check" }).click();
  const lesson = data.lessons.find((l) => l.id === "ai-systems")!;
  const questions = [...new Set(lesson.questions.map((q) => q.family))].map(
    (family) => lesson.questions.find((q) => q.family === family)!,
  );
  for (const q of questions) {
    const option = q.options.find((o) => o.id === q.answers.choice)!;
    await page.getByRole("radio", { name: option.text, exact: true }).check();
    await page
      .getByRole("button", { name: "Check answer", exact: true })
      .click();
    await page
      .getByRole("button", { name: /Next check|See my result/ })
      .click();
  }
  await expect(page.getByText("One more connection made.")).toBeVisible();
  await expect
    .poll(async () => (await database(page))?.attempts.length)
    .toBe(2);
}

test("mastery survives refresh and is reused on either path", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await firstLessonMastery(page);
  await expect(page.getByText("Keep what you’ve learned.")).toHaveCount(0);
  await page.reload();
  await expect(page.getByText("One more connection made.")).toBeVisible();
  await expect(page.getByText("Keep what you’ve learned.")).toHaveCount(0);
  for (const path of ["language", "images"]) {
    await ready(page, `/paths/${path}/`);
    await expect(
      page.locator(".syllabus-row").filter({
        hasText: data.lessons.find((l) => l.id === "ai-systems")!.title,
      }),
    ).toContainText("Demonstrated");
  }
  expect(errors).toEqual([]);
});

test("system paths can be filtered and optional branches are separate from core", async ({
  page,
}) => {
  await ready(page, "/");
  await expect(page.locator(".path-card")).toHaveCount(data.recipes.length);
  const filters = page.getByRole("group", { name: "Filter learning paths" });
  await filters.getByRole("button", { name: "Create", exact: true }).click();
  await expect(page.locator(".path-card")).toHaveCount(3);
  await expect(
    page.locator(".path-card").filter({ hasText: "Video generation" }),
  ).toBeVisible();
  await filters.getByRole("button", { name: "Act", exact: true }).click();
  await page.locator(".path-card").filter({ hasText: "Robotics" }).click();
  await expect(
    page.getByRole("heading", { name: "Robotics", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".related-paths")).toContainText(
    "shared core objectives",
  );
  await page.locator(".path-extensions summary").click();
  const vla = data.lessons.find(
    (l) => l.id === "vision-language-action-models",
  )!;
  await expect(
    page.locator(".extension-link").filter({ hasText: vla.title }),
  ).toBeVisible();
  await expect(
    page.locator(".syllabus-row").filter({ hasText: vla.title }),
  ).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  expect(
    (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze())
      .violations,
  ).toEqual([]);
  await page.screenshot({
    path: "/tmp/learn-ai-robotics-path.png",
    fullPage: true,
  });
});

for (const id of ["video", "audio", "robotics"]) {
  test(`${id} carries foundations forward, retains its return path, and exports its context`, async ({
    page,
    browser,
  }) => {
    await firstLessonMastery(page);
    const recipe = data.recipes.find((r) => r.id === id)!;
    await ready(page, `/paths/${id}/`);
    await expect(
      page.locator(".syllabus-row").filter({
        hasText: data.lessons.find((l) => l.id === "ai-systems")!.title,
      }),
    ).toContainText("Demonstrated");
    await page
      .getByRole("button", { name: "Continue my path", exact: true })
      .click();
    await expect(page).toHaveURL(/\/learn\/inputs-and-outputs\//);
    await expect
      .poll(async () => (await database(page))?.selectedPath)
      .toBe(id);
    await page
      .getByRole("button", { name: "Check my knowledge", exact: true })
      .click();
    await page.reload();
    await page
      .getByRole("region", { name: "Lesson completion" })
      .getByRole("link", { name: "Back to my learning path", exact: true })
      .click();
    await expect(page).toHaveURL(new RegExp(`/paths/${id}/$`));
    await page
      .locator(".path-context")
      .getByRole("link", {
        name: data.lessons.find((l) => l.id === recipe.destination)!.title,
        exact: true,
      })
      .click();
    await page
      .getByRole("button", { name: "Check my knowledge", exact: true })
      .click();
    await expect(
      page.getByRole("region", { name: "Lesson takeaway" }),
    ).toBeVisible();
    await expect
      .poll(
        async () =>
          (await database(page))?.positions[recipe.destination]?.origin?.path,
      )
      .toBe(id);
    if (id === "robotics") {
      await ready(page, "/progress/");
      const download = page.waitForEvent("download");
      await page
        .getByRole("button", { name: "Export progress", exact: true })
        .click();
      const backup = await readFile((await (await download).path())!);
      const context = await browser.newContext();
      try {
        const fresh = await context.newPage();
        await ready(fresh, "/progress/");
        await fresh.getByLabel("Choose backup file").setInputFiles({
          name: "robotics.json",
          mimeType: "application/json",
          buffer: backup,
        });
        await fresh
          .getByRole("button", { name: "Merge this backup", exact: true })
          .click();
        await expect
          .poll(async () => (await database(fresh))?.selectedPath)
          .toBe("robotics");
        await ready(fresh, `/learn/${recipe.destination}/`);
        await expect(
          fresh
            .getByRole("region", { name: "Lesson completion" })
            .getByRole("link", {
              name: "Back to my learning path",
              exact: true,
            }),
        ).toHaveAttribute("href", "/paths/robotics/");
      } finally {
        await context.close();
      }
    }
  });
}

test("worked lesson tables keep readable headers and values on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await ready(page, "/learn/algorithms-and-programs/");
  await page
    .getByRole("button", { name: /Scene \d+: Watch the numbers change/ })
    .click();
  await expect(
    page.getByRole("columnheader", { name: "Weight inspected" }),
  ).toBeVisible();
  await expect(
    page.getByRole("cell", { name: "9", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("a hint survives reload and cannot award independent evidence", async ({
  page,
}) => {
  await ready(page, "/learn/ai-systems/");
  await page
    .getByRole("button", { name: "Check my knowledge", exact: true })
    .click();
  await page.getByRole("button", { name: "Begin knowledge check" }).click();
  await page.getByRole("button", { name: "Give me a hint" }).click();
  await expect
    .poll(async () => (await database(page))?.exposures.length)
    .toBe(1);
  await page.reload();
  await expect(
    page.getByText("This attempt will count as practice."),
  ).toBeVisible();
  const q = data.lessons.find((l) => l.id === "ai-systems")!.questions[0];
  await page
    .getByRole("radio", {
      name: q.options.find((o) => o.id === q.answers.choice)!.text,
      exact: true,
    })
    .check();
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect
    .poll(async () => (await database(page))?.attempts[0]?.independent)
    .toBe(false);
});

test("math detours return to the saved experiment and prediction reveals stay gated", async ({
  page,
}) => {
  await ready(page, "/learn/learning-update/");
  await page
    .getByRole("button", {
      name: /Scene \d+: Watch several updates/,
    })
    .click();
  await expect(page.getByRole("button", { name: "Take one step" })).toHaveCount(
    0,
  );
  await expect(
    page.getByRole("cell", { name: "2.4", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Show worked example" }).click();
  await page.getByRole("button", { name: "Take one step" }).click();
  await expect(page.getByTestId("current-loss")).toHaveText("0.0576");
  await page.getByRole("button", { name: "Include the mathematics" }).click();
  await page
    .getByRole("button", { name: "Derivative preparation", exact: true })
    .click();
  await expect(page).toHaveURL(/learn\/derivatives/);
  await page.getByRole("button", { name: /^Return to / }).click();
  await expect(page.getByTestId("current-loss")).toHaveText("0.0576");
  await page.reload();
  await expect(page.getByTestId("current-loss")).toHaveText("0.0576");
});

test("mathematics reading checks remain uncredited practice", async ({
  page,
}) => {
  await ready(page, "/learn/learning-update/");
  await page.getByRole("button", { name: "Include the mathematics" }).click();
  await page
    .getByRole("button", { name: "Check my knowledge", exact: true })
    .click();
  await page.getByRole("button", { name: "Begin knowledge check" }).click();
  const q = data.lessons.find((l) => l.id === "learning-update")!.questions[0];
  for (const field of q.fields)
    await page
      .getByLabel(field.label, { exact: true })
      .fill(String((q.answers as Record<string, unknown>)[field.id]));
  if ("choice" in q.answers)
    await page
      .getByRole("radio", {
        name: q.options.find((o) => o.id === q.answers.choice)!.text,
        exact: true,
      })
      .check();
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect
    .poll(async () => (await database(page))?.attempts[0]?.mode)
    .toBe("practice");
  expect((await database(page)).attempts[0].independent).toBe(false);
});

test("backup restores evidence in a clean browser and rejects broken files safely", async ({
  page,
  browser,
  baseURL,
}) => {
  await firstLessonMastery(page);
  await ready(page, "/progress/");
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export progress", exact: true })
    .click();
  const path = await (await download).path();
  const backup = await readFile(path!);
  const context = await browser.newContext({ baseURL });
  const fresh = await context.newPage();
  await ready(fresh, "/progress/");
  await fresh.getByLabel("Choose backup file").setInputFiles({
    name: "backup.json",
    mimeType: "application/json",
    buffer: backup,
  });
  await expect(fresh.getByText(/2 new responses/)).toBeVisible();
  await fresh.getByRole("button", { name: "Merge this backup" }).click();
  await expect
    .poll(async () => (await database(fresh))?.attempts.length)
    .toBe(2);
  await fresh.getByLabel("Choose backup file").setInputFiles({
    name: "backup.json",
    mimeType: "application/json",
    buffer: backup,
  });
  await expect(fresh.getByText(/0 new responses/)).toBeVisible();
  await fresh.getByRole("button", { name: "Merge this backup" }).click();
  await fresh.getByLabel("Choose backup file").setInputFiles({
    name: "broken.json",
    mimeType: "application/json",
    buffer: Buffer.from("{oops"),
  });
  await expect(fresh.getByRole("alert")).toContainText("not valid JSON");
  expect((await database(fresh)).attempts).toHaveLength(2);
  await context.close();
});

test("search, keyboard navigation, and mobile layout", async ({ page }) => {
  await ready(page, "/");
  await page.screenshot({ path: "/tmp/learn-ai-home.png", fullPage: true });
  await page.keyboard.press("/");
  await expect(page.getByRole("searchbox")).toBeFocused();
  await page.getByRole("searchbox").fill("gradient");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/library\/\?q=gradient/);
  await expect(page.locator(".library-card")).toHaveCount(
    data.lessons.filter((l) =>
      `${l.title} ${l.summary} ${l.slot}`.toLowerCase().includes("gradient"),
    ).length,
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await ready(page, "/");
  await page.screenshot({ path: "/tmp/learn-ai-mobile.png", fullPage: true });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await ready(page, "/learn/learning-update/");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.locator("#lesson-stage")).toBeFocused();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "/tmp/learn-ai-lesson-mobile.png",
    fullPage: true,
  });
});

test("accessible page and interaction smoke checks", async ({ page }) => {
  test.setTimeout(90000);
  const findings: unknown[] = [];
  for (const url of [
    "/",
    "/paths/language/",
    "/library/",
    "/library/?view=glossary",
    "/progress/",
    "/learn/learning-update/",
    "/learn/experts/",
    "/learn/softmax-attention/",
  ]) {
    await ready(page, url);
    if (url === "/learn/learning-update/") {
      await page.getByRole("button", { name: "Read as a page" }).click();
      await page
        .getByRole("button", { name: "Include the mathematics" })
        .click();
    }
    if (url === "/learn/experts/" || url === "/learn/softmax-attention/")
      await page.getByRole("button", { name: "Read as a page" }).click();
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    if (result.violations.length)
      findings.push({ url, violations: result.violations });
  }
  await writeFile("/tmp/learn-ai-a11y.json", JSON.stringify(findings, null, 2));
  expect(
    findings.map((entry: any) => ({
      url: entry.url,
      issues: entry.violations.map((v: any) => ({
        id: v.id,
        count: v.nodes.length,
      })),
    })),
  ).toEqual([]);
});

test("unavailable browser storage keeps the session usable and exportable", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "indexedDB", {
      value: {
        open() {
          throw new DOMException("Storage disabled for test", "SecurityError");
        },
      },
    });
  });
  await ready(page, "/learn/ai-systems/");
  await expect(page.locator(".storage-alert")).toBeVisible();
  await page.getByRole("button", { name: "Save lesson", exact: true }).click();
  const download = page.waitForEvent("download");
  await page.locator(".storage-alert").getByRole("button").click();
  const path = await (await download).path();
  const backup = JSON.parse(await readFile(path!, "utf8"));
  expect(backup.bookmarks).toContain("ai-systems");
});

test("quiz, takeaway, and curriculum return share one closing page", async ({
  page,
}) => {
  await ready(page, "/paths/language/");
  await page.getByRole("button", { name: "Start this path" }).click();
  await ready(page, "/library/?view=curriculum#M00");
  await page.locator('#M00 a[href*="/learn/ai-systems/"]').click();
  await firstLessonMastery(page, false);
  await expect(page.locator(".assessment-panel").getByRole("link")).toHaveCount(
    0,
  );
  await expect(
    page.getByRole("button", {
      name: "Continue to the final thought",
      exact: true,
    }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("region", { name: "Lesson takeaway" }),
  ).toBeVisible();
  await expect(page.locator("#lesson-stage h2")).toHaveText(
    "Review and check your understanding",
  );
  const ending = page.getByRole("region", { name: "Lesson completion" });
  await expect(
    ending.getByRole("link", { name: "Back to the curriculum" }),
  ).toHaveAttribute("href", "/library/?view=curriculum#M00");
  await expect(
    ending.getByRole("link", { name: /^Next lesson:/ }),
  ).toContainText(
    data.lessons.find((l) => l.id === "inputs-and-outputs")!.title,
  );
  await expect(
    page
      .locator(".slide-navigation")
      .getByRole("button", { name: "See my result" }),
  ).toHaveCount(0);
  await page.reload();
  await expect(page.locator("#lesson-stage h2")).toHaveText(
    "Review and check your understanding",
  );
  await page.screenshot({
    path: "/tmp/learn-ai-final-thought.png",
    fullPage: true,
  });
  const a11y = await new AxeBuilder({ page })
    .include("main")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(a11y.violations).toEqual([]);
  await ending.getByRole("link", { name: "Back to the curriculum" }).click();
  await expect(page).toHaveURL(/library\/\?view=curriculum#M00$/);
  await expect(page.locator("#M00")).toHaveAttribute("open", "");
  await expect(
    page.locator('#M00 a[href*="/learn/ai-systems/"]'),
  ).toContainText("LAST VISITED");
});

test("library return preserves a local filter and reading mode ends at the same destination", async ({
  page,
}) => {
  await ready(page, "/library/");
  await page.getByRole("textbox", { name: "Filter library" }).fill("vectors");
  await page.locator('.library-card[href*="/learn/vectors/"]').click();
  await page.getByRole("button", { name: "Read as a page" }).click();
  const ending = page.getByRole("region", { name: "Lesson completion" });
  await ending
    .getByRole("link", { name: "Back to the lesson library" })
    .click();
  await expect(page).toHaveURL(/library\/\?q=vectors$/);
  await expect(
    page.getByRole("textbox", { name: "Filter library" }),
  ).toHaveValue("vectors");
});

test("path entry and direct entry have distinct useful final destinations", async ({
  page,
}) => {
  await ready(page, "/paths/images/");
  await page
    .getByRole("button", { name: "Show all lessons", exact: true })
    .click();
  await page.locator('.syllabus-row[href*="/learn/denoising/"]').click();
  await page.getByRole("button", { name: "Read as a page" }).click();
  await expect(
    page
      .getByRole("region", { name: "Lesson completion" })
      .getByRole("link", { name: "Back to my learning path" }),
  ).toHaveAttribute("href", "/paths/images/");
  await ready(page, "/learn/generative-models/");
  await page.getByRole("button", { name: "Read as a page" }).click();
  await expect(
    page
      .getByRole("region", { name: "Lesson completion" })
      .getByRole("link", { name: "Back to the lesson library" }),
  ).toHaveAttribute("href", "/library/");
});

test("new attention controls survive a math detour and stay usable on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await ready(page, "/learn/softmax-attention/");
  await page
    .getByRole("button", { name: /Scene \d+: Change the query/ })
    .click();
  await expect(page.getByTestId("attention-weight-3")).toHaveText("0");
  await page
    .getByRole("combobox", { name: "Query vector" })
    .selectOption("balanced");
  await expect(page.getByTestId("attention-output")).toHaveText("[2, 2]");
  await page.getByRole("checkbox", { name: "Apply the causal mask" }).uncheck();
  await expect(page.getByTestId("attention-weight-3")).not.toHaveText("0");
  const output = await page.getByTestId("attention-output").textContent();
  await page
    .locator(".bridge-links")
    .getByRole("button", { name: "Vectors: lists that work together" })
    .click();
  await page.getByRole("button", { name: /^Return to / }).click();
  await expect(page.getByTestId("attention-output")).toHaveText(output!);
  await expect(
    page.getByRole("checkbox", { name: "Apply the causal mask" }),
  ).not.toBeChecked();
  await page.reload();
  await expect(page.getByTestId("attention-output")).toHaveText(output!);
  const table = page.getByRole("region", {
    name: "Attention scores and values",
  });
  await table.focus();
  await page.keyboard.press("ArrowRight");
  await expect
    .poll(() => table.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "/tmp/learn-ai-attention-mobile.png",
    fullPage: true,
  });
});

test("the complete catalog exposes every lesson and opens a late case study", async ({
  page,
}) => {
  await ready(page, "/library/?view=curriculum#M35");
  await expect(page.locator(".curriculum-module")).toHaveCount(38);
  await expect(page.locator(".curriculum-module li a")).toHaveCount(
    data.catalog.reduce((n, m) => n + m.lessons.length, 0),
  );
  await expect(page.getByText("Unavailable", { exact: true })).toHaveCount(0);
  await page.locator('#M35 a[href*="/learn/deepseek-r1-case-study/"]').click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Separate DeepSeek-R1, R1-Zero, and distilled students",
  );
  await page.getByRole("button", { name: "Read as a page" }).click();
  await expect(page.locator(".reading-page")).toContainText("January 22, 2025");
  await expect(page.locator(".lesson-sources a").first()).toHaveAttribute(
    "href",
    "https://arxiv.org/abs/2501.12948v1",
  );
  const ending = page.getByRole("region", { name: "Lesson completion" });
  await expect(
    ending.getByRole("link", { name: /^Next lesson:/ }),
  ).toHaveAttribute("href", /olmo-three-case-study/);
  await ending.getByRole("link", { name: "Back to the curriculum" }).click();
  await expect(page).toHaveURL(/library\/\?view=curriculum#M35$/);
  await expect(page.locator("#M35")).toHaveAttribute("open", "");
});

test("new project and final module drafts render and preserve the closing page on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await ready(page, "/learn/small-network-gradient-project/");
  await page.getByRole("button", { name: "Read as a page" }).click();
  await expect(page.locator(".reading-page")).toContainText("0.0072");
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await ready(page, "/library/?view=curriculum#M37");
  await page
    .locator('#M37 a[href*="/learn/comparing-alternative-neural-models/"]')
    .click();
  await page
    .getByRole("button", {
      name: /Scene \d+: Review and check your understanding/,
    })
    .click();
  const ending = page.getByRole("region", { name: "Lesson completion" });
  await expect(ending.getByRole("link", { name: /^Next lesson:/ })).toHaveCount(
    0,
  );
  await expect(
    ending.getByRole("link", { name: "Back to the curriculum" }),
  ).toHaveAttribute("href", "/library/?view=curriculum#M37");
  await page.reload();
  await expect(page.locator("#lesson-stage h2")).toHaveText(
    "Review and check your understanding",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});

test("beginner weight controls and vocabulary detours explain roles and restore place", async ({
  page,
}) => {
  await ready(page, "/learn/weights-and-predictions/");
  await page
    .getByRole("button", { name: /Scene \d+: Change the dial, keep the question/ })
    .click();
  await expect(page.getByTestId("weight-result")).toHaveText(
    "3 × 2 = 6 crackers",
  );
  await page.getByRole("slider", { name: "Number of guests" }).focus();
  await page.keyboard.press("ArrowRight");
  await page.getByRole("slider", { name: "Crackers per guest" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByTestId("weight-result")).toHaveText(
    "4 × 3 = 12 crackers",
  );
  await page.screenshot({
    path: "/tmp/learn-ai-beginner-weights.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: /Scene \d+: Name the dial/ }).click();
  await page.locator(".lesson-vocabulary summary").click();
  const modelTitle = data.lessons.find(
    (l) => l.id === "models-and-products",
  )!.title;
  const definitionLink = page.getByRole("button", {
    name: `Read lesson: ${modelTitle}`,
    exact: true,
  });
  await definitionLink.click();
  await expect(page).toHaveURL(/learn\/models-and-products\/$/);
  await page.reload();
  await page.getByRole("button", { name: /^Return to / }).click();
  await expect(page.locator("#lesson-stage h2")).toHaveText("Name the dial");
  await expect(definitionLink).toBeFocused();
  const a11y = await new AxeBuilder({ page })
    .include("main")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(a11y.violations).toEqual([]);
  await ready(page, "/learn/attention/");
  await page
    .getByRole("button", { name: /Scene \d+: Why three vectors instead of one\?/ })
    .click();
  await page.locator(".lesson-vocabulary summary").click();
  const vectorsLink = page
    .getByRole("button", {
      name: "Read lesson: Vectors: lists that work together",
      exact: true,
    })
    .first();
  await vectorsLink.click();
  await page.getByRole("button", { name: /^Return to / }).click();
  await expect(vectorsLink).toBeFocused();
});

test("numeric foundation checks persist in reading mode on the combined closing page", async ({
  page,
}) => {
  await ready(page, "/learn/arithmetic/");
  await page.getByRole("button", { name: "Read as a page" }).click();
  await page.getByRole("button", { name: "Begin knowledge check" }).click();
  // Answer whichever variant the planner shows, using the authored key.
  const arithmetic = (data as Curriculum).lessons.find((l) => l.id === "arithmetic")!;
  const answerShown = async () => {
    const prompt = (await page.locator(".question-prompt").innerText()).trim();
    const q = arithmetic.questions.find((q) => !q.retired && q.prompt.trim() === prompt)!;
    expect(q).toBeTruthy();
    if (q.options.length) {
      const option = q.options.find((o) => o.id === q.answers.choice)!;
      await page.getByLabel(option.text, { exact: true }).check();
    } else
      for (const field of q.fields)
        await page.getByLabel(field.label, { exact: true }).fill(String(q.answers[field.id]));
    await page.getByRole("button", { name: "Check answer", exact: true }).click();
    await expect(page.getByText(/saved as a new attempt/).first()).toBeVisible();
  };
  await answerShown();
  await expect
    .poll(async () => (await database(page))?.attempts.length)
    .toBe(1);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Read as a page" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Next check" }).click();
  await answerShown();
  await page.getByRole("button", { name: "See my result" }).click();
  await expect(page.getByText("One more connection made.")).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Lesson takeaway" }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Lesson completion" }),
  ).toBeVisible();
});

test("pixel controls distinguish stored values from their interpretation on mobile and keyboard", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await ready(page, "/learn/digital-representations/");
  await page
    .getByRole("button", { name: /Scene \d+: Four numbers, several pictures/ })
    .click();
  const reading = page.getByTestId("pixel-reading");
  await expect(reading).toContainText("[0, 1, 1, 0]");
  await expect(reading).toContainText("2 rows of 2");
  await page.getByLabel("Pixels per row").selectOption("4");
  await expect(reading).toContainText("1 row of 4");
  await page.getByLabel("Swap the color convention").check();
  await expect(reading).toContainText("[0, 1, 1, 0]");
  const first = page.getByRole("button", {
    name: "Stored value 1: 0. Displayed white",
    exact: true,
  });
  await first.focus();
  await page.keyboard.press("Space");
  await expect(
    page.getByRole("button", {
      name: "Stored value 1: 1. Displayed black",
      exact: true,
    }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(reading).toContainText("[1, 1, 1, 0]");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  expect(
    (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze())
      .violations,
  ).toEqual([]);
});

test("chain-rule checks retain intermediate answers across reload and award both calculation families", async ({
  page,
}) => {
  await ready(page, "/learn/chain-rule/");
  await page
    .getByRole("button", { name: "Check my knowledge", exact: true })
    .click();
  await page.getByRole("button", { name: "Begin knowledge check" }).click();
  await page.getByLabel("Prediction p", { exact: true }).fill("3");
  await page.getByLabel("Local loss rate dL/dp", { exact: true }).fill("-4");
  await expect(
    page.getByRole("button", { name: "Check answer", exact: true }),
  ).toBeDisabled();
  await expect
    .poll(
      async () =>
        (await database(page))?.positions["chain-rule"]?.drafts?.[
          "chain-rule.base.v2.1"
        ]?.outer,
    )
    .toBe("-4");
  await page.reload();
  await expect(page.getByLabel("Prediction p", { exact: true })).toHaveValue(
    "3",
  );
  await expect(
    page.getByLabel("Local loss rate dL/dp", { exact: true }),
  ).toHaveValue("-4");
  await page
    .getByLabel("Local prediction rate dp/dw", { exact: true })
    .fill("3");
  await page.getByLabel("Total loss rate dL/dw", { exact: true }).fill("-12");
  await page
    .getByRole("radio", {
      name: "Multiply the two local rates evaluated at this example.",
      exact: true,
    })
    .check();
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page.getByRole("button", { name: "Next check", exact: true }).click();
  await page.getByLabel("Full loss derivative", { exact: true }).fill("-12");
  await page.getByLabel("Next weight", { exact: true }).fill("1.2");
  await page
    .getByRole("radio", {
      name: "Subtract 0.1 times the full derivative from w.",
      exact: true,
    })
    .check();
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page
    .getByRole("button", { name: "See my result", exact: true })
    .click();
  await expect(page.getByText("One more connection made.")).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Lesson takeaway", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Lesson completion", exact: true }),
  ).toBeVisible();
});

test("an old final-slide position and unfinished retired quiz resume safely", async ({
  page,
}) => {
  await ready(page, "/learn/ai-systems/");
  await page
    .getByRole("button", { name: "Check my knowledge", exact: true })
    .click();
  await expect
    .poll(async () => (await database(page))?.positions["ai-systems"]?.scene)
    .toBe("ai-systems.check");
  const all = JSON.parse(
    readFileSync(
      new URL("../src/lib/generated/curriculum.json", import.meta.url),
      "utf8",
    ),
  ) as Curriculum;
  const retired = all.lessons
    .find((l) => l.id === "ai-systems")!
    .questions.find((q) => q.retired)!;
  await page.evaluate(async (questionId) => {
    const db = await new Promise<IDBDatabase>((resolve) => {
      const request = indexedDB.open("learn-ai", 1);
      request.onsuccess = () => resolve(request.result);
    });
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("learner", "readwrite");
      const store = tx.objectStore("learner");
      const request = store.get("progress");
      request.onsuccess = () => {
        const progress = request.result;
        progress.positions["ai-systems"].scene = "ai-systems.recap";
        progress.positions["ai-systems"].activeQuestion = questionId;
        store.put(progress, "progress");
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  }, retired.id);
  await page.reload();
  await expect(page.locator("#lesson-stage h2")).toHaveText(
    "Review and check your understanding",
  );
  await expect(
    page.getByText(/This saved question belongs to an earlier lesson version/),
  ).toBeVisible();
  await expect(
    page.getByText(/This advanced view is a practice preview/),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Start the revised checks" }).click();
  await expect(page.locator(".question-prompt")).toHaveText(
    data.lessons.find((l) => l.id === "ai-systems")!.questions[0].prompt,
  );
  expect((await database(page)).attempts).toEqual([]);
});

test("prediction checks grade the intermediate residual as well as the final loss", async ({
  page,
}) => {
  await ready(page, "/learn/prediction/");
  await page
    .getByRole("button", { name: "Check my knowledge", exact: true })
    .click();
  await page.getByRole("button", { name: "Begin knowledge check" }).click();
  await page.getByLabel("Prediction", { exact: true }).fill("13");
  await page.getByLabel("Prediction minus target", { exact: true }).fill("-3");
  await page.getByLabel("Squared-error loss", { exact: true }).fill("9");
  await page
    .getByRole("radio", {
      name: "Square the signed difference between prediction and target.",
      exact: true,
    })
    .check();
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.getByText("Let’s connect the idea again.")).toBeVisible();
  await expect(
    page.getByText("Prediction is 13, residual is 13−10=3, and loss is 3²=9."),
  ).toBeVisible();
  await expect
    .poll(async () => (await database(page))?.attempts[0]?.correct)
    .toBe(false);
  await page.getByRole("button", { name: "Next check" }).click();
  await page.getByLabel("Prediction", { exact: true }).fill("13");
  await page.getByLabel("Prediction minus target", { exact: true }).fill("-2");
  await page.getByLabel("Squared-error loss", { exact: true }).fill("4");
  await page
    .getByRole("radio", {
      name: "Square the signed difference between prediction and target.",
      exact: true,
    })
    .check();
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.getByText("You’ve got this part.")).toBeVisible();
  const a11y = await new AxeBuilder({ page })
    .include("main")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(a11y.violations).toEqual([]);
});

test("reset progress confirms, clears the complete record, and permits backup restoration", async ({
  page,
}) => {
  await firstLessonMastery(page);
  await page.getByRole("button", { name: "Save lesson", exact: true }).click();
  await ready(page, "/paths/language/");
  await page
    .getByRole("button", { name: "Continue my path", exact: true })
    .click();
  await ready(page, "/learn/weights-and-predictions/");
  await page.getByRole("button", { name: /Scene \d+: Name the dial/ }).click();
  await page.locator(".bridge-links button").click();
  await expect(page).toHaveURL(/learn\/arithmetic/);
  await expect.poll(async () => (await database(page))?.detours.length).toBe(1);
  await ready(page, "/progress/");
  const before = await database(page);
  expect(before.attempts).toHaveLength(2);
  expect(before.bookmarks).toContain("ai-systems");
  expect(before.selectedPath).toBe("language");
  await page
    .getByRole("button", { name: "Reset all progress", exact: true })
    .click();
  const dialog = page.getByRole("dialog", { name: "Reset all progress?" });
  await expect(
    dialog.getByRole("button", { name: "Cancel", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  expect(await database(page)).toEqual(before);
  await page
    .getByRole("button", { name: "Reset all progress", exact: true })
    .click();
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  expect(await database(page)).toEqual(before);
  await page
    .getByRole("button", { name: "Reset all progress", exact: true })
    .click();
  const accessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(accessibility.violations).toEqual([]);
  const download = page.waitForEvent("download");
  await dialog.getByRole("button", { name: "Export a backup first" }).click();
  const backup = await readFile((await (await download).path())!);
  await dialog
    .getByRole("button", { name: "Yes, reset all progress", exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
  await expect(
    page.getByText(
      "All progress in this browser has been reset. You can start a new learning path.",
    ),
  ).toBeVisible();
  const cleared = await database(page);
  expect(cleared.resetAt).toBeGreaterThan(0);
  for (const field of [
    "attempts",
    "exposures",
    "bookmarks",
    "detours",
    "studyDays",
  ])
    expect(cleared[field]).toEqual([]);
  expect(cleared.positions).toEqual({});
  expect(cleared.selectedPath).toBeNull();
  expect(cleared.lastLesson).toBeNull();
  expect(cleared.lastExportAt).toBe(0);
  expect(cleared.backupDismissedAt).toBe(0);
  await page.reload();
  await expect(page.locator("main")).toHaveAttribute("aria-busy", "false");
  await expect(page.locator(".progress-stats strong")).toHaveText([
    "0",
    "0",
    "0",
  ]);
  await page.getByLabel("Choose backup file").setInputFiles({
    name: "before-reset.json",
    mimeType: "application/json",
    buffer: backup,
  });
  await page
    .getByRole("button", { name: "Merge this backup", exact: true })
    .click();
  await expect
    .poll(async () => (await database(page))?.attempts.length)
    .toBe(2);
  const restored = await database(page);
  expect(restored.resetAt).toBe(cleared.resetAt);
  expect(restored.bookmarks).toEqual(before.bookmarks);
  expect(restored.positions).toEqual(before.positions);
});

test("reset reaches open tabs and stale writes cannot restore cleared progress", async ({
  page,
}) => {
  await firstLessonMastery(page);
  const live = await page.context().newPage();
  await ready(live, "/progress/");
  await expect(live.locator(".progress-stats strong")).toHaveText([
    "1",
    "2",
    "0",
  ]);
  const stale = await page.context().newPage();
  await stale.addInitScript(() => {
    Reflect.deleteProperty(window, "BroadcastChannel");
  });
  await ready(stale, "/learn/ai-systems/");
  await expect(stale.getByText("One more connection made.")).toBeVisible();
  await ready(page, "/progress/");
  await page
    .getByRole("button", { name: "Reset all progress", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Yes, reset all progress", exact: true })
    .click();
  await expect(live.locator(".progress-stats strong")).toHaveText([
    "0",
    "0",
    "0",
  ]);
  const resetAt = (await database(page)).resetAt;
  // This tab missed the reset message and still holds the old attempts in memory.
  await stale.getByRole("button", { name: "Save lesson", exact: true }).click();
  await expect(
    stale.getByRole("button", { name: "Save lesson", exact: true }),
  ).toBeVisible();
  await expect(stale.getByText("One more connection made.")).toHaveCount(0);
  expect((await database(page)).attempts).toEqual([]);
  expect((await database(page)).bookmarks).toEqual([]);
  // New work in the current reset period can be saved normally.
  await stale.getByRole("button", { name: "Save lesson", exact: true }).click();
  await expect
    .poll(async () => (await database(page))?.bookmarks)
    .toEqual(["ai-systems"]);
  expect((await database(page)).resetAt).toBe(resetAt);
  await live.close();
  await stale.close();
});

test("a failed reset keeps progress and displays a retryable error", async ({
  page,
}) => {
  await firstLessonMastery(page);
  await ready(page, "/progress/");
  const before = await database(page);
  await page.evaluate(() => {
    const original = IDBDatabase.prototype.transaction;
    IDBDatabase.prototype.transaction = function (
      ...args: Parameters<typeof original>
    ) {
      if (args[1] === "readwrite")
        throw new DOMException("Blocked test write", "QuotaExceededError");
      return original.apply(this, args);
    };
  });
  await page
    .getByRole("button", { name: "Reset all progress", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Yes, reset all progress", exact: true })
    .click();
  const dialog = page.getByRole("dialog", { name: "Reset all progress?" });
  await expect(dialog.getByRole("alert")).toContainText(
    "Saved progress could not be reset.",
  );
  expect(await database(page)).toEqual(before);
  await expect(page.locator(".progress-stats strong")).toHaveText([
    "1",
    "2",
    "0",
  ]);
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(dialog).not.toBeVisible();
});

test("chapters open with the keyboard, expose every lesson, and preserve return navigation", async ({
  page,
}) => {
  await ready(page, "/paths/language/");
  const chapters = page.locator(".path-chapter");
  await expect(chapters.first()).toHaveAttribute("open", "");
  const first = chapters.first().locator("summary");
  await first.focus();
  await page.keyboard.press("Enter");
  await expect(chapters.first()).not.toHaveAttribute("open", "");
  await page.keyboard.press("Enter");
  await expect(chapters.first()).toHaveAttribute("open", "");
  await page
    .getByRole("button", { name: "Show all lessons", exact: true })
    .click();
  await expect(page.locator(".path-chapter[open]")).toHaveCount(
    await chapters.count(),
  );
  const target = page.locator(
    '.syllabus-row[href*="/learn/evaluation-releases-and-rollback/"]',
  );
  await expect(target).toBeVisible();
  await target.click();
  await page
    .getByRole("button", { name: "Check my knowledge", exact: true })
    .click();
  await page
    .getByRole("region", { name: "Lesson completion" })
    .getByRole("link", { name: "Back to my learning path" })
    .click();
  await expect(page).toHaveURL(/\/paths\/language\/$/);
  await expect(page.locator(".path-chapter[open]")).toHaveCount(1);
  await page.setViewportSize({ width: 390, height: 844 });
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
    path: "/tmp/learn-ai-language-chapters.png",
    fullPage: true,
  });
});

test("sampling controls expose changed probabilities without awarding mastery", async ({
  page,
}) => {
  await ready(page, "/learn/decoding-and-sampling/");
  const lesson = data.lessons.find((l) => l.id === "decoding-and-sampling")!;
  const activity = lesson.scenes.find((s) => s.simulation === "sampling")!;
  await page
    .getByRole("button", { name: new RegExp(`Scene \\d+: ${activity.title}`) })
    .click();
  await expect(page.getByTestId("sampling-probability-A")).toHaveText("66.5%");
  await expect(page.getByTestId("sampling-choice")).toContainText(
    "candidate B",
  );
  const temperature = page.getByRole("slider", {
    name: "Temperature",
    exact: true,
  });
  await temperature.focus();
  for (let i = 0; i < 5; i++) await page.keyboard.press("ArrowLeft");
  await expect(temperature).toHaveValue("0.5");
  await expect(page.getByTestId("sampling-probability-A")).toHaveText("86.7%");
  await expect(page.getByTestId("sampling-choice")).toContainText(
    "candidate A",
  );
  await page
    .getByRole("combobox", { name: "Top-k", exact: true })
    .selectOption("1");
  await expect(page.getByTestId("sampling-probability-A")).toHaveText("100.0%");
  await expect(page.getByTestId("sampling-probability-B")).toHaveText("0.0%");
  await page
    .getByRole("slider", { name: "Sampling draw", exact: true })
    .focus();
  await page.keyboard.press("End");
  await expect(page.getByTestId("sampling-choice")).toContainText(
    "Draw 0.99 picks candidate A",
  );
  await page
    .getByRole("button", { name: "Reset experiment", exact: true })
    .click();
  await expect(page.getByTestId("sampling-choice")).toContainText(
    "Draw 0.75 picks candidate B",
  );
  await page.setViewportSize({ width: 390, height: 844 });
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
  expect((await database(page))?.attempts).toEqual([]);
  await page.screenshot({
    path: "/tmp/learn-ai-sampling-mobile.png",
    fullPage: true,
  });
});

test("new prediction puzzles preserve drafts and reveals separately from assessment evidence", async ({
  page,
}) => {
  const lesson = data.lessons.find((l) => l.id === "routers-and-top-k")!;
  const scene = lesson.scenes.find(
    (s) => lesson.routes.core.includes(s.id) && s.activity,
  )!;
  const activity = scene.activity!;
  await ready(page, `/learn/${lesson.id}/`);
  await page
    .getByRole("button", { name: new RegExp(`Scene \\d+: ${scene.title}`) })
    .click();
  const wrong = activity.options.find((o) => o.id !== activity.answers.choice)!;
  await page.getByRole("radio", { name: wrong.text, exact: true }).check();
  await expect
    .poll(
      async () =>
        (await database(page))?.positions[lesson.id]?.drafts[activity.id]
          ?.choice,
    )
    .toBe(wrong.id);
  await page.reload();
  await expect(
    page.getByRole("radio", { name: wrong.text, exact: true }),
  ).toBeChecked();
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(
    page.getByText(activity.feedback, { exact: true }),
  ).toBeVisible();
  await expect
    .poll(async () => (await database(page))?.positions[lesson.id]?.reveals)
    .toContain(activity.id);
  await page.reload();
  await expect(
    page.getByText(activity.feedback, { exact: true }),
  ).toBeVisible();
  expect((await database(page))?.attempts).toEqual([]);
  await page
    .getByRole("button", { name: "Check my knowledge", exact: true })
    .click();
  await page.getByRole("button", { name: "Begin knowledge check" }).click();
  await expect(
    page.getByText(lesson.questions[0].prompt, { exact: true }),
  ).toBeVisible();
});

test("expert routing is interactive inside its teaching lesson", async ({
  page,
}) => {
  await ready(page, "/learn/routers-and-top-k/");
  await page
    .getByRole("button", {
      name: /Scene \d+: Predict, then change the expert count/,
    })
    .click();
  const lab = page.getByRole("region", { name: "Expert routing example" });
  await expect(lab).toBeVisible();
  const selector = lab.getByRole("combobox", { name: "Select experts" });
  await expect(selector).toHaveValue("2");
  await selector.selectOption("1");
  await expect(selector).toHaveValue("1");
  await expect(lab).toContainText("[2, 0]");
  await selector.selectOption("2");
  await expect(lab).toContainText("[1.375, 1.25]");
});
