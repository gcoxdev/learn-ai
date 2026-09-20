import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function open(page: Page, lesson: string, scene: number, kind: string) {
  await page.goto(`/learn/${lesson}/`);
  await expect(page.locator("main")).toHaveAttribute("aria-busy", "false");
  await page
    .getByRole("button", { name: new RegExp(`^Scene ${scene}:`) })
    .click();
  const lab = page.locator(`[data-visual="${kind}"]`);
  await expect(lab.locator(".visual-lab")).toBeVisible();
  return lab;
}

test("Bayes counts preserve conditional direction, saved state, and undefined outcomes", async ({
  page,
}) => {
  const lab = await open(page, "bayes-rule", 2, "bayes");
  const reveal = lab.getByRole("button", {
    name: "Count the flags",
    exact: true,
  });
  await expect(reveal).toBeDisabled();
  await lab.getByLabel("Predict the flagged fraction").selectOption("less");
  await reveal.click();
  await expect(lab.getByTestId("bayes-result")).toContainText(
    "90 / 585 = 15.4%",
  );
  await page.reload();
  await expect(lab.getByTestId("bayes-result")).toContainText("15.4%");
  const rate = lab.getByRole("slider", {
    name: "Defect prevalence",
    exact: true,
  });
  await rate.focus();
  await rate.press("Home");
  await expect(lab.getByTestId("bayes-result")).toHaveCount(0);
  await expect(lab.getByLabel("Predict the flagged fraction")).toHaveValue("");
  await lab.getByRole("slider", { name: "Good parts falsely flagged" }).focus();
  await page.keyboard.press("Home");
  await lab
    .getByLabel("Predict the flagged fraction")
    .selectOption("undefined");
  await reveal.click();
  await expect(lab.getByTestId("bayes-result")).toContainText(
    "No parts are flagged",
  );
});

test("a movable threshold changes the error counts without retraining", async ({
  page,
}) => {
  const lab = await open(page, "classification-metrics", 3, "threshold");
  await lab.getByLabel("Predict missed defects").selectOption("1");
  await lab.getByRole("button", { name: "Reveal error counts" }).click();
  await expect(lab.getByTestId("threshold-result")).toContainText(
    "Caught defects: 3 · False alarms: 1 · Missed defects: 1 · Good parts left alone: 3",
  );
  const cutoff = lab.getByRole("slider", { name: "Flag threshold" });
  await cutoff.focus();
  await cutoff.press("End");
  await lab.getByLabel("Predict missed defects").selectOption("4");
  await lab.getByRole("button", { name: "Reveal error counts" }).click();
  await expect(lab.getByTestId("threshold-result")).toContainText(
    "Precision: undefined (no flags). Recall: 0.0%",
  );
  await page.reload();
  await expect(cutoff).toHaveValue("100");
  await expect(lab.getByTestId("threshold-result")).toContainText(
    "Missed defects: 4",
  );
});

test("filter weights, padding and stride produce the shown outputs and restore on reload", async ({
  page,
}) => {
  const lab = await open(page, "convolution", 3, "convolution");
  await lab.getByLabel("Predict filter output sign").selectOption("negative");
  await lab.getByRole("button", { name: "Reveal filter sum" }).click();
  await expect(lab.getByTestId("filter-result")).toContainText("[-3, 1]");
  await lab.getByLabel("Filter padding").selectOption("1");
  await lab.getByLabel("Filter stride").selectOption("2");
  await lab.getByLabel("Filter output position").selectOption("1");
  await expect(lab.getByTestId("filter-result")).toHaveCount(0);
  await lab.getByLabel("Predict filter output sign").selectOption("positive");
  await lab.getByRole("button", { name: "Reveal filter sum" }).click();
  await expect(lab.getByTestId("filter-result")).toContainText("[-2, 1]");
  await page.reload();
  await expect(lab.getByLabel("Filter output position")).toHaveValue("1");
  await expect(lab.getByTestId("filter-result")).toContainText("[-2, 1]");
  await lab.getByRole("slider", { name: "Second filter weight" }).focus();
  await page.keyboard.press("End");
  await expect(lab.getByLabel("Predict filter output sign")).toHaveValue("");
  await lab.getByLabel("Predict filter output sign").selectOption("positive");
  await lab.getByRole("button", { name: "Reveal filter sum" }).click();
  await expect(lab.getByTestId("filter-result")).toContainText("[4, 13]");
  await lab.getByRole("button", { name: "Reset filter" }).click();
  await expect(lab.getByLabel("Filter padding")).toHaveValue("0");
  await expect(lab.getByLabel("Filter stride")).toHaveValue("1");
});

for (const [lesson, scene, kind] of [
  ["bayes-rule", 2, "bayes"],
  ["classification-metrics", 3, "threshold"],
  ["convolution", 3, "convolution"],
] as const) {
  test(`${kind} has a usable mobile diagram, text alternative, and no automatic credit`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const lab = await open(page, lesson, scene, kind);
    await lab
      .getByRole("combobox", { name: /^Predict/ })
      .selectOption(
        kind === "bayes" ? "less" : kind === "threshold" ? "1" : "negative",
      );
    await lab
      .getByRole("button", {
        name: /^(Count the flags|Reveal error counts|Reveal filter sum)$/,
      })
      .click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(
      (
        await new AxeBuilder({ page })
          .include(`[data-visual="${kind}"]`)
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await lab.screenshot({ path: `/tmp/learn-ai-${kind}-mobile.png` });
    await page
      .getByRole("button", { name: "Toggle navigation", exact: true })
      .click();
    await page.getByRole("link", { name: "My progress", exact: true }).click();
    await expect(page.locator("main")).toHaveAttribute("aria-busy", "false");
    await expect(
      page.locator(".stat-card").nth(0).locator("strong"),
    ).toHaveText("0");
    await expect(
      page.locator(".stat-card").nth(1).locator("strong"),
    ).toHaveText("0");
  });
}

for (const width of [1280, 390]) {
  test(`search suggestions have one accessible link per lesson at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.locator("main")).toHaveAttribute("aria-busy", "false");
    await page
      .getByRole("searchbox", { name: "Search lessons and concepts" })
      .fill("atten");
    const panel = page.getByRole("navigation", { name: "Search suggestions" });
    await expect(panel).toHaveCount(1);
    const links = panel.locator("li a");
    await expect(links).toHaveCount(6);
    const hrefs = await links.evaluateAll((nodes) =>
      nodes.map((n) => (n as HTMLAnchorElement).pathname),
    );
    expect(new Set(hrefs).size).toBe(hrefs.length);
    await expect(page.locator("#lesson-search-suggestions")).toHaveCount(1);
    const snapshot = await panel.ariaSnapshot();
    for (const title of await links.locator("span").allTextContents()) {
      expect(snapshot.split(`link "${title}`).length - 1).toBe(1);
    }
    expect(
      (
        await new AxeBuilder({ page })
          .include(".global-search")
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
  });
}
