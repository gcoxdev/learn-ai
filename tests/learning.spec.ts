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
  const questions = [lesson.questions[0], lesson.questions[2]];
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
  await page.reload();
  await expect(page.getByText("One more connection made.")).toBeVisible();
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
}) => {
  await firstLessonMastery(page);
  await ready(page, "/progress/");
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export progress", exact: true })
    .click();
  const path = await (await download).path();
  const backup = await readFile(path!);
  const context = await browser.newContext();
  const fresh = await context.newPage();
  await ready(fresh, "http://127.0.0.1:4173/progress/");
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

test("quiz completion leads through the final thought before returning to its curriculum module", async ({
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
  await page
    .getByRole("button", { name: "Continue to the final thought", exact: true })
    .click();
  await expect(page.locator("#lesson-stage h2")).toHaveText(
    "One idea to take with you",
  );
  const ending = page.getByRole("region", { name: "Lesson completion" });
  await expect(
    ending.getByRole("link", { name: "Back to the curriculum" }),
  ).toHaveAttribute("href", "/library/?view=curriculum#M00");
  await expect(
    ending.getByRole("link", { name: /^Next lesson:/ }),
  ).toContainText(
    data.lessons.find((l) => l.id === "models-and-products")!.title,
  );
  await expect(
    page
      .locator(".slide-navigation")
      .getByRole("button", { name: "See my result" }),
  ).toHaveCount(0);
  await page.reload();
  await expect(page.locator("#lesson-stage h2")).toHaveText(
    "One idea to take with you",
  );
  await page.screenshot({
    path: "/tmp/learn-ai-final-thought.png",
    fullPage: true,
  });
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

test("the complete catalog exposes 304 lessons and opens a late case study", async ({
  page,
}) => {
  await ready(page, "/library/?view=curriculum#M35");
  await expect(page.locator(".curriculum-module")).toHaveCount(38);
  await expect(page.locator(".curriculum-module li a")).toHaveCount(304);
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

test("new project and final module drafts render and preserve the final thought on mobile", async ({
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
    .getByRole("button", { name: /Scene \d+: One idea to take with you/ })
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
    "One idea to take with you",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
