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

test("the answer tray renormalizes over the candidates left and keeps that choice", async ({
  page,
}) => {
  const lab = await open(page, "typed-decision-questions", 2, "answer-tray");
  const result = lab.getByTestId("tray-result");
  await expect(result).toContainText("Top answer: Billing at 41%");
  await lab.getByLabel("Customer message").selectOption("spanish");
  await expect(result).toContainText("Top answer: Not enough information at 30%");
  await lab.getByRole("checkbox", { name: "Not enough information" }).uncheck();
  await lab.getByRole("checkbox", { name: "Other topic" }).uncheck();
  await expect(result).toContainText("must put all of its probability");
  await page.reload();
  await expect(
    lab.getByRole("checkbox", { name: "Other topic" }),
  ).not.toBeChecked();
  const axe = await new AxeBuilder({ page })
    .include('[data-visual="answer-tray"]')
    .analyze();
  expect(axe.violations).toEqual([]);
});

test("the temperature dial changes certainty but not the wrong ranking", async ({
  page,
}) => {
  const lab = await open(page, "calibrated-decision-training", 5, "confidence-dial");
  const result = lab.getByTestId("dial-result");
  await expect(result).toContainText(
    "Top answer: Bookings · top probability 0.37 · reported confidence 0.21",
  );
  const dial = lab.getByRole("slider", { name: "Temperature" });
  await dial.fill("0.25");
  await expect(result).toContainText("top probability 0.69 · reported confidence 0.62");
  await lab.getByRole("button", { name: "Reveal the correct answer" }).click();
  await expect(result).toContainText("The correct answer is Safety");
  await expect(result).toContainText("wrong at every temperature");
  const axe = await new AxeBuilder({ page })
    .include('[data-visual="confidence-dial"]')
    .analyze();
  expect(axe.violations).toEqual([]);
});

test("the help desk shows a confident new-language batch slipping past the gate", async ({
  page,
}) => {
  const lab = await open(page, "building-with-decision-models", 3, "help-desk");
  const result = lab.getByTestId("desk-result");
  await expect(result).toContainText(
    "Automated 125 of 200 · wrong among them 14 · review queue 75 · total cost 177.5",
  );
  await lab.getByRole("slider", { name: "Automation threshold" }).fill("90");
  await lab.getByRole("checkbox", { name: "Add 40 messages in a new language" }).check();
  await expect(result).toContainText("Automated 80 of 240 · wrong among them 17");
  await expect(result).toContainText("New-language messages automated: 29, of which 13");
  const axe = await new AxeBuilder({ page })
    .include('[data-visual="help-desk"]')
    .analyze();
  expect(axe.violations).toEqual([]);
});
