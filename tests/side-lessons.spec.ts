import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const root = "neural-training-loop";
const rootTitle = "Connect data, gradients, and saved model state";
const derivativeTitle = "A derivative is a local change";
async function ready(page: Page, path: string) {
  await page.goto(path);
  await expect(page.locator("main")).toHaveAttribute("aria-busy", "false");
}
async function openRoot(page: Page, suffix = "") {
  await ready(page, `/learn/${root}/${suffix}`);
  await page
    .getByRole("button", {
      name: "Scene 3: Steps 4 and 5, blame and update",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "Update both parameters", exact: true })
    .click();
  await expect(page.getByTestId("parameter-loss")).toHaveText("3.207407");
}
async function openDerivative(page: Page) {
  await page
    .locator('[id="bridge-neural-training-loop.s3-derivatives"]')
    .click();
  await expect(page).toHaveURL(/\/learn\/derivatives\/$/);
  await expect(
    page
      .locator(".classroom-breadcrumb")
      .getByRole("button", { name: `Return to ${rootTitle}`, exact: true }),
  ).toBeVisible();
}
async function openFunctions(page: Page) {
  await page
    .getByRole("button", {
      name: "Scene 1: Start with a rate you can picture",
      exact: true,
    })
    .click();
  await page.locator('[id="bridge-derivatives.s1-functions"]').click();
  await expect(page).toHaveURL(/\/learn\/functions\/$/);
}

test("browser Back and Forward restore side-lesson trails without self-return links", async ({
  page,
}) => {
  await openRoot(page);
  await openDerivative(page);
  await page.goBack();
  await expect(page).toHaveURL(new RegExp(`/learn/${root}/$`));
  await expect(page.getByRole("button", { name: /^Return to / })).toHaveCount(
    0,
  );
  await expect(
    page.getByRole("navigation", { name: "Side lesson trail" }),
  ).toHaveCount(0);
  await expect(page.getByTestId("parameter-loss")).toHaveText("3.207407");
  await page.goForward();
  await expect(page).toHaveURL(/\/learn\/derivatives\/$/);
  await expect(
    page
      .locator(".classroom-breadcrumb")
      .getByRole("button", { name: `Return to ${rootTitle}`, exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page.locator("main")).toHaveAttribute("aria-busy", "false");
  await page
    .locator(".classroom-breadcrumb")
    .getByRole("button", { name: `Return to ${rootTitle}`, exact: true })
    .click();
  await expect(page.getByTestId("parameter-loss")).toHaveText("3.207407");
  await expect(
    page.getByRole("navigation", { name: "Side lesson trail" }),
  ).toHaveCount(0);
});

test("nested detours survive refresh and browser history, then return through both endings", async ({
  page,
}) => {
  await openRoot(page, "?from=%2Flibrary%2F%3Fview%3Dcurriculum%23M11");
  await openDerivative(page);
  await openFunctions(page);
  await page.reload();
  await expect(page.locator("main")).toHaveAttribute("aria-busy", "false");
  await expect(
    page
      .getByRole("navigation", { name: "Side lesson trail" })
      .getByRole("button"),
  ).toHaveCount(2);
  await page.goBack();
  await expect(page).toHaveURL(/\/learn\/derivatives\/$/);
  await expect(
    page
      .getByRole("navigation", { name: "Side lesson trail" })
      .getByRole("button"),
  ).toHaveCount(1);
  await page.goForward();
  await expect(page).toHaveURL(/\/learn\/functions\/$/);
  await page
    .getByRole("button", { name: "Check my knowledge", exact: true })
    .click();
  await page
    .getByRole("region", { name: "Lesson completion", exact: true })
    .getByRole("button", { name: `Return to ${derivativeTitle}`, exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Start with a rate you can picture",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Check my knowledge", exact: true })
    .click();
  await page
    .getByRole("region", { name: "Lesson completion", exact: true })
    .getByRole("button", { name: `Return to ${rootTitle}`, exact: true })
    .click();
  await expect(page.getByTestId("parameter-loss")).toHaveText("3.207407");
  await page
    .getByRole("button", { name: "Check my knowledge", exact: true })
    .click();
  await expect(
    page
      .getByRole("region", { name: "Lesson completion", exact: true })
      .getByRole("link", { name: "Back to the curriculum", exact: true }),
  ).toHaveAttribute("href", "/library/?view=curriculum#M11");
});

test("the visible trail can skip back to the original lesson using keyboard on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openRoot(page);
  await openDerivative(page);
  await openFunctions(page);
  const trail = page.getByRole("navigation", { name: "Side lesson trail" });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(
    (
      await new AxeBuilder({ page })
        .include(".side-lesson-trail")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await trail.screenshot({ path: "/tmp/learn-ai-side-trail-mobile.png" });
  const jump = trail.getByRole("button", {
    name: `Jump back to ${rootTitle}`,
    exact: true,
  });
  await jump.focus();
  await jump.press("Enter");
  await expect(page.getByTestId("parameter-loss")).toHaveText("3.207407");
  await expect(trail).toHaveCount(0);
});

test("another tab cannot replace this tab's side-lesson return trail", async ({
  page,
  context,
}) => {
  await openRoot(page);
  await openDerivative(page);
  const other = await context.newPage();
  await ready(other, "/learn/softmax-attention/");
  await other
    .getByRole("button", { name: /Scene \d+: Change the query/ })
    .click();
  await other
    .locator(".bridge-links")
    .getByRole("button", {
      name: "Vectors: lists that work together",
      exact: true,
    })
    .click();
  await expect(other).toHaveURL(/\/learn\/vectors\/$/);
  await expect
    .poll(() =>
      other.evaluate(async () => {
        const db = await new Promise<IDBDatabase>((resolve, reject) => {
          const request = indexedDB.open("learn-ai", 1);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
        try {
          return await new Promise<string | undefined>((resolve, reject) => {
            const request = db
              .transaction("learner")
              .objectStore("learner")
              .get("progress");
            request.onsuccess = () =>
              resolve(request.result?.detours?.at(-1)?.lesson);
            request.onerror = () => reject(request.error);
          });
        } finally {
          db.close();
        }
      }),
    )
    .toBe("softmax-attention");
  // Reload reads shared progress, but the return trail belongs to this history entry.
  await page.reload();
  await expect(page.locator("main")).toHaveAttribute("aria-busy", "false");
  await expect(
    page
      .locator(".classroom-breadcrumb")
      .getByRole("button", { name: `Return to ${rootTitle}`, exact: true }),
  ).toBeVisible();
  await expect(
    other
      .locator(".classroom-breadcrumb")
      .getByRole("button", { name: /^Return to / }),
  ).not.toHaveText(`Return to ${rootTitle}`);
  await other.close();
});

test("reset progress prevents old browser entries from reviving a side trail", async ({
  page,
}) => {
  await openRoot(page);
  await openDerivative(page);
  await page.getByRole("link", { name: "My progress", exact: true }).click();
  await page
    .getByRole("button", { name: "Reset all progress", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Yes, reset all progress", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.goBack();
  await expect(page).toHaveURL(/\/learn\/derivatives\/$/);
  await expect(page.getByRole("button", { name: /^Return to / })).toHaveCount(
    0,
  );
  await expect(
    page.getByRole("navigation", { name: "Side lesson trail" }),
  ).toHaveCount(0);
  await page.reload();
  await expect(page.locator("main")).toHaveAttribute("aria-busy", "false");
  await expect(page.getByRole("button", { name: /^Return to / })).toHaveCount(
    0,
  );
});
