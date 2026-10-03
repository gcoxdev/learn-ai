import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync } from "node:fs";
import type { Curriculum } from "../src/lib/model";

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

test("rapid library edits keep the latest query and every selected facet", async ({
  page,
}) => {
  await ready(page, "/library/?page=2");
  const search = page.getByRole("textbox", { name: "Filter library" });
  await search.focus();
  // Multiple edits in one event-loop turn exercise overlapping Kit navigations.
  await page.evaluate(() => {
    const input = document.querySelector<HTMLInputElement>(
      'input[aria-label="Filter library"]',
    )!;
    const edit = (value: string) => {
      input.value = value;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    };
    const select = (name: string, value: string) => {
      const control = document.querySelector<HTMLSelectElement>(
        `select[aria-label="${name}"]`,
      )!;
      control.value = value;
      control.dispatchEvent(new Event("change", { bubbles: true }));
    };
    edit("a");
    edit("at");
    select("Module", "M15");
    edit("atten");
    select("Estimated time", "11-to-20");
    edit("attention");
    select("Lesson type", "mechanism");
  });
  await expect(page).toHaveURL(
    /\/library\/\?q=attention&module=M15&time=11-to-20&archetype=mechanism$/,
  );
  await expect(search).toHaveValue("attention");
  await expect(search).toBeFocused();
  await expect(
    page.getByRole("combobox", { name: "Module", exact: true }),
  ).toHaveValue("M15");
  await expect(
    page.getByRole("combobox", { name: "Estimated time" }),
  ).toHaveValue("11-to-20");
  await expect(
    page.locator('.library-card[href*="/learn/attention/"]'),
  ).toHaveCount(1);
  await page.reload();
  await expect(page.locator("main")).toHaveAttribute("aria-busy", "false");
  await expect(search).toHaveValue("attention");
  await expect(
    page.getByRole("combobox", { name: "Module", exact: true }),
  ).toHaveValue("M15");
});

test("library facets survive reload, lesson return, and browser Back", async ({
  page,
}) => {
  await ready(page, "/library/");
  await expect(page.locator(".library-card")).toHaveCount(24);
  await page.getByRole("textbox", { name: "Filter library" }).fill("attention");
  await page
    .getByRole("combobox", { name: "Module", exact: true })
    .selectOption("M15");
  await page
    .getByRole("combobox", { name: "Estimated time" })
    .selectOption("11-to-20");
  await page
    .getByRole("combobox", { name: "Lesson type" })
    .selectOption("mechanism");
  await page
    .getByRole("combobox", { name: "Evidence", exact: true })
    .selectOption("not-demonstrated");
  await expect(page).toHaveURL(/evidence=not-demonstrated$/);
  const filteredUrl = page.url();
  expect(new URL(filteredUrl).searchParams.get("q")).toBe("attention");
  expect(new URL(filteredUrl).searchParams.get("module")).toBe("M15");
  expect(new URL(filteredUrl).searchParams.get("time")).toBe("11-to-20");
  expect(new URL(filteredUrl).searchParams.get("archetype")).toBe("mechanism");
  expect(new URL(filteredUrl).searchParams.get("evidence")).toBe(
    "not-demonstrated",
  );
  const titles = await page.locator(".library-card h3").allTextContents();
  expect(titles.length).toBeGreaterThan(0);
  await page.reload();
  await expect(page.locator("main")).toHaveAttribute("aria-busy", "false");
  await expect(
    page.getByRole("combobox", { name: "Module", exact: true }),
  ).toHaveValue("M15");
  await expect(
    page.getByRole("textbox", { name: "Filter library" }),
  ).toHaveValue("attention");
  await expect(page.locator(".library-card h3")).toHaveText(titles);
  await page.locator('.library-card[href*="/learn/attention/"]').click();
  await page.getByRole("button", { name: "Read as a page" }).click();
  const back = page
    .getByRole("region", { name: "Lesson completion" })
    .getByRole("link", { name: "Back to the lesson library" });
  await expect(back).toHaveAttribute(
    "href",
    new URL(filteredUrl).pathname + new URL(filteredUrl).search,
  );
  await back.click();
  await expect(page).toHaveURL(filteredUrl);
  await page.locator('.library-card[href*="/learn/attention/"]').click();
  await expect(page).toHaveURL(/\/learn\/attention\//);
  await expect(page.locator("main")).toHaveAttribute("aria-busy", "false");
  await page.goBack();
  await expect(page).toHaveURL(filteredUrl);
  await expect(page.locator(".library-card h3")).toHaveText(titles);
});

test("pagination keeps filters on lesson return and resets when a facet changes", async ({
  page,
}) => {
  await ready(
    page,
    "/library/?time=11-to-20&archetype=mechanism&evidence=not-demonstrated",
  );
  await page.getByRole("link", { name: "Next page", exact: true }).click();
  await expect(page).toHaveURL(/page=2$/);
  await expect(page.locator(".library-card")).toHaveCount(24);
  const secondPage = page.url();
  const titles = await page.locator(".library-card h3").allTextContents();
  await page.locator(".library-card").first().click();
  await page.getByRole("button", { name: "Read as a page" }).click();
  await page
    .getByRole("region", { name: "Lesson completion" })
    .getByRole("link", { name: "Back to the lesson library" })
    .click();
  await expect(page).toHaveURL(secondPage);
  await expect(page.locator(".library-card h3")).toHaveText(titles);
  await page.reload();
  await expect(page.locator(".library-card h3")).toHaveText(titles);
  await page
    .getByRole("combobox", { name: "Module", exact: true })
    .selectOption("M15");
  await expect(page).not.toHaveURL(/[?&]page=/);
  expect(new URL(page.url()).searchParams.has("page")).toBe(false);
  await expect(page.locator(".library-card")).toHaveCount(
    curriculum.lessons.filter(
      (lesson) =>
        lesson.slot.startsWith("M15.") &&
        lesson.archetype === "mechanism" &&
        lesson.minutes > 10 &&
        lesson.minutes <= 20,
    ).length,
  );
  await page
    .getByRole("button", { name: "Clear filters", exact: true })
    .click();
  await expect(page).toHaveURL(/\/library\/$/);
  await expect(page.locator(".library-card")).toHaveCount(24);
});

test("bridge and advanced facets remain discoverable, and empty filters are recoverable", async ({
  page,
}) => {
  await ready(page, "/library/?module=bridges");
  await expect(page.locator(".library-card")).toHaveCount(23);
  await page
    .getByRole("combobox", { name: "Module", exact: true })
    .selectOption("advanced");
  await page
    .getByRole("combobox", { name: "Evidence", exact: true })
    .selectOption("practice");
  await expect(page.locator(".library-card")).toHaveCount(1);
  await expect(page.locator(".library-card")).toContainText("Practice only");
  await page
    .getByRole("combobox", { name: "Evidence", exact: true })
    .selectOption("demonstrated");
  await expect(page.locator(".library-card")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "No matching ideas yet." }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Clear filters", exact: true })
    .click();
  await expect(page.locator(".library-card")).toHaveCount(24);
});

test("curriculum anchors and glossary context preserve their existing return behavior", async ({
  page,
}) => {
  await ready(page, "/library/?view=curriculum#M15");
  await expect(page.locator("#M15")).toHaveAttribute("open", "");
  await page.locator('#M15 a[href*="/learn/attention/"]').click();
  await page.getByRole("button", { name: "Read as a page" }).click();
  await page
    .getByRole("region", { name: "Lesson completion" })
    .getByRole("link", { name: "Back to the curriculum" })
    .click();
  await expect(page).toHaveURL(/view=curriculum#M15$/);
  await expect(page.locator("#M15")).toHaveAttribute("open", "");
  await ready(page, "/library/?view=glossary&q=attention");
  await expect(
    page.getByRole("textbox", { name: "Filter library" }),
  ).toHaveValue("attention");
  const link = page.locator(".glossary-entry a").first();
  const destination = await link.getAttribute("href");
  expect(
    new URL(destination!, "https://classroom.test").searchParams.get("from"),
  ).toBe("/library/?view=glossary&q=attention");
});

test("header suggestions support native links, arrow keys, Escape, and Enter for full search", async ({
  page,
}) => {
  await ready(page, "/");
  await page.keyboard.press("/");
  const search = page.getByRole("searchbox", {
    name: "Search lessons and concepts",
  });
  await expect(search).toBeFocused();
  await search.fill("attention");
  const suggestions = page.getByRole("navigation", {
    name: "Search suggestions",
  });
  await expect(suggestions).toBeVisible();
  await expect(suggestions.locator("li a")).toHaveCount(6);
  const first = suggestions.locator("li a").first();
  const href = await first.getAttribute("href");
  expect(href).toMatch(/^\/learn\//);
  await search.press("ArrowDown");
  await expect(first).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(suggestions.locator("li a").nth(1)).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(search).toBeFocused();
  await expect(suggestions).toHaveCount(0);
  await search.fill("attention");
  await search.press("Tab");
  await expect(first).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(
    new RegExp(new URL(href!, "https://classroom.test").pathname),
  );
  await expect(suggestions).toHaveCount(0);
  await ready(page, "/");
  await search.fill("gradient");
  await search.press("Enter");
  await expect(page).toHaveURL(/\/library\/\?q=gradient$/);
  await expect(page.locator(".library-card")).toHaveCount(
    Math.min(
      24,
      curriculum.lessons.filter((lesson) =>
        `${lesson.title} ${lesson.summary} ${lesson.slot}`
          .toLowerCase()
          .includes("gradient"),
      ).length,
    ),
  );
});

test("mobile filters and open suggestions stay within the viewport and expose accessible controls", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await ready(page, "/library/");
  await page
    .getByRole("combobox", { name: "Module", exact: true })
    .selectOption("M15");
  await expect(page.locator(".library-card")).toHaveCount(8);
  const search = page.getByRole("searchbox", {
    name: "Search lessons and concepts",
  });
  await search.fill("attention");
  const suggestions = page.getByRole("navigation", {
    name: "Search suggestions",
  });
  await expect(suggestions).toBeVisible();
  const bounds = await suggestions.boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const scan = await new AxeBuilder({ page })
    .include(".global-search")
    .include(".library-facets")
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(scan.violations).toEqual([]);
  await search.fill("zzzz-no-result-zzzz");
  await expect(suggestions).toContainText("No matching lessons yet.");
  await expect(
    suggestions.getByRole("link", { name: "Search the full library" }),
  ).toBeVisible();
});
