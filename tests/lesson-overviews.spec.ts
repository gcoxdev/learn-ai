import { expect, test } from "@playwright/test";

for (const width of [1280, 390]) {
  test(`lesson overview, continuation, and saved position at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/learn/digital-representations/");
    await expect(page.locator("main")).toHaveAttribute("aria-busy", "false");
    const stage = page.locator("#lesson-stage");
    await expect(
      stage.getByRole("heading", { name: "Lesson overview", exact: true }),
    ).toBeVisible();
    await expect(
      stage.getByRole("heading", { name: "What you’ll explore" }),
    ).toBeVisible();
    await expect(stage).toContainText(
      "Calculate a raw image’s pixels, channel values, and bytes",
    );
    await expect(
      stage.locator(".question-card, .entry-check, .lesson-vocabulary"),
    ).toHaveCount(0);

    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await expect(
      stage.getByRole("heading", { name: "Eight switches make a byte" }),
    ).toBeVisible();
    await expect(stage).toBeFocused();
    await expect(stage.locator(".scene-kicker")).toContainText("IDEA 01");
    await expect
      .poll(() =>
        stage.evaluate((element) =>
          Math.round(element.getBoundingClientRect().top),
        ),
      )
      .toBe(width === 390 ? 83 : 20);
    await page.reload();
    await expect(page.locator("main")).toHaveAttribute("aria-busy", "false");
    await expect(
      stage.getByRole("heading", { name: "Eight switches make a byte" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Previous", exact: true }).click();
    await expect(
      stage.getByRole("heading", { name: "Lesson overview", exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Read as a page" }).click();
    await expect(
      page
        .locator(".reading-page > article")
        .first()
        .getByRole("heading", { name: "Lesson overview", exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Check my knowledge", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Begin knowledge check" }),
    ).toBeVisible();
  });
}
