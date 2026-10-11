import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import type { Progress } from "../src/lib/model";

async function openNetwork(page: Page) {
  await page.goto("/learn/neural-forward-pass/");
  await expect(page.locator("main")).toHaveAttribute("aria-busy", "false");
  await page
    .getByRole("button", { name: /Scene \d+: One sweep from input to answer/ })
    .click();
  const lab = page.locator('[data-visual="network-layers"]');
  await expect(lab).toBeVisible();
  return lab;
}

async function savedProgress(page: Page): Promise<Progress | undefined> {
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

test("layers reveal shared calculations and unit inspection explains weights, bias, and ReLU", async ({
  page,
}) => {
  const lab = await openNetwork(page);
  const stage = lab.getByTestId("layered-network-stage");
  const inspector = lab.getByTestId("layered-network-inspector");
  const next = lab.getByRole("button", { name: "Next layer", exact: true });
  const unit = lab.getByRole("combobox", {
    name: "Inspect a unit",
    exact: true,
  });
  await expect(lab.locator("svg circle")).toHaveCount(8);
  await expect(lab.locator("svg [data-edge]")).toHaveCount(14);
  await expect(stage).toContainText("Stage 0 of 3: Inputs ready");
  await expect(
    lab.getByRole("button", { name: "Previous layer", exact: true }),
  ).toBeDisabled();
  await next.focus();
  await next.press("Enter");
  await expect(stage).toContainText("A = 1.5, B = 1, C = 0");
  await expect(inspector.getByRole("row").nth(1).locator("th, td")).toHaveText([
    "X1: 1",
    "× 1",
    "1",
  ]);
  await expect(inspector.getByRole("row").nth(2).locator("th, td")).toHaveText([
    "X2: 2",
    "× 0.5",
    "1",
  ]);
  await expect(inspector).toContainText("Bias: -0.5");
  await unit.selectOption("c");
  await expect(lab.getByTestId("layered-network-activation")).toContainText(
    "ReLU: -1 → 0.",
  );
  await expect(lab.locator('[data-unit="c"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(lab.locator('[data-emphasized="true"]')).toHaveCount(2);
  await unit.selectOption("y");
  await expect(inspector).toContainText(
    "This unit has not been calculated yet.",
  );
  await expect(lab.getByTestId("layered-network-output")).toHaveCount(0);
  await next.click();
  await expect(stage).toContainText("D = 1.5, E = 0.75");
  await next.click();
  await expect(lab.getByTestId("layered-network-output")).toHaveText(
    "Output Y = 1",
  );
  await expect(lab.getByTestId("layered-network-activation")).toContainText(
    "Linear output: Y = 1.",
  );
  await expect(next).toBeDisabled();
});

test("keyboard changes to both inputs and a weight recalculate the output and survive reload", async ({
  page,
}) => {
  const lab = await openNetwork(page);
  await lab
    .getByRole("combobox", { name: "Calculation stage", exact: true })
    .selectOption("3");
  await lab
    .getByText("Try changing one connection weight", { exact: true })
    .click();
  const weight = lab.getByRole("slider", {
    name: "Weight from X1 to A",
    exact: true,
  });
  await weight.focus();
  await weight.press("End");
  await expect(lab.getByTestId("layered-network-output")).toHaveText(
    "Output Y = 2.5",
  );
  await expect(lab.locator('[data-edge="x1-a"]')).toHaveAttribute(
    "data-weight",
    "2",
  );
  const x1 = lab.getByRole("slider", {
    name: "Layered network input X1",
    exact: true,
  });
  const x2 = lab.getByRole("slider", {
    name: "Layered network input X2",
    exact: true,
  });
  await x1.focus();
  await x1.press("ArrowRight");
  await expect(lab.getByTestId("layered-network-output")).toHaveText(
    "Output Y = 3.25",
  );
  await x2.focus();
  await x2.press("ArrowLeft");
  await expect(lab.getByTestId("layered-network-output")).toHaveText(
    "Output Y = 2.5",
  );
  const output = lab.locator('[data-unit="y"]');
  await output.focus();
  await output.press("Space");
  await expect(
    lab.getByRole("combobox", { name: "Inspect a unit", exact: true }),
  ).toHaveValue("y");
  await expect
    .poll(
      async () =>
        (await savedProgress(page))?.positions["neural-forward-pass"]
          ?.visuals?.["neural-forward-pass.s1"]?.values,
    )
    .toEqual({ x1: 1.5, x2: 1.5, weight: 2, step: 3, unit: "y" });
  await page.reload();
  await expect(page.locator("main")).toHaveAttribute("aria-busy", "false");
  await expect(lab.getByTestId("layered-network-output")).toHaveText(
    "Output Y = 2.5",
  );
  await expect(x1).toHaveValue("1.5");
  await expect(x2).toHaveValue("1.5");
  await expect(
    lab.getByRole("combobox", { name: "Inspect a unit", exact: true }),
  ).toHaveValue("y");
  expect((await savedProgress(page))?.attempts).toEqual([]);
  await lab.getByRole("button", { name: "Reset network", exact: true }).click();
  await expect(x1).toHaveValue("1");
  await expect(x2).toHaveValue("2");
  await lab
    .getByText("Try changing one connection weight", { exact: true })
    .click();
  await expect(weight).toHaveValue("1");
  await expect(
    lab.getByRole("combobox", { name: "Calculation stage", exact: true }),
  ).toHaveValue("0");
  await expect(
    lab.getByRole("combobox", { name: "Inspect a unit", exact: true }),
  ).toHaveValue("x1");
});

test("the mobile network scrolls within its frame and offers an accessible unit selector", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const lab = await openNetwork(page);
  const viewport = lab.getByTestId("layered-network-scroll");
  expect(
    await viewport.evaluate(
      (element) => element.scrollWidth > element.clientWidth,
    ),
  ).toBe(true);
  await viewport.focus();
  await viewport.press("ArrowRight");
  await expect
    .poll(() => viewport.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(0);
  await lab
    .getByRole("combobox", { name: "Calculation stage", exact: true })
    .selectOption("3");
  await lab
    .getByRole("combobox", { name: "Inspect a unit", exact: true })
    .selectOption("e");
  await expect(lab.getByTestId("layered-network-activation")).toContainText(
    "ReLU: 0.75 → 0.75.",
  );
  await lab
    .getByText("Try changing one connection weight", { exact: true })
    .click();
  await lab
    .getByText("What do the circles and connections mean?", { exact: true })
    .click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(
    (
      await new AxeBuilder({ page })
        .include('[data-visual="network-layers"]')
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  expect(errors).toEqual([]);
});
