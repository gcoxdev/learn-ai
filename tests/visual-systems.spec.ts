import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync } from "node:fs";
import type { Curriculum, Progress } from "../src/lib/model";

const curriculum = JSON.parse(
  readFileSync(
    new URL("../src/lib/generated/curriculum.json", import.meta.url),
    "utf8",
  ),
) as Curriculum;

async function ready(page: Page, path: string) {
  await page.goto(path);
  await expect(page.locator("main")).toHaveAttribute("aria-busy", "false");
}
function sceneButton(lessonId: string, sceneId: string) {
  const lesson = curriculum.lessons.find((lesson) => lesson.id === lessonId)!;
  const scene = lesson.scenes.find((scene) => scene.id === sceneId)!;
  const index = lesson.routes.core.indexOf(sceneId);
  if (!scene || index < 0) throw new Error(`Missing core scene ${sceneId}`);
  return `Scene ${index}: ${scene.title}`;
}
async function openVisual(
  page: Page,
  lessonId: string,
  sceneId: string,
  kind: string,
) {
  await ready(page, `/learn/${lessonId}/`);
  await page
    .getByRole("button", { name: sceneButton(lessonId, sceneId), exact: true })
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

test("tokenizer merging counts every copy and preserves frozen rules after refresh", async ({
  page,
}) => {
  const lessonId = "tokenizer-training",
    sceneId = `${lessonId}.s2`;
  const lab = await openVisual(page, lessonId, sceneId, "tokenizer");
  const pair = lab.getByRole("combobox", { name: "Pair to merge" });
  await expect(pair.locator("option")).toHaveText([
    "c + a — 3 occurrences",
    "a + t — 2 occurrences",
    "a + p — 1 occurrences",
  ]);
  await expect(lab.getByLabel("Current token boundaries")).toContainText(
    "9 tokens",
  );
  await pair.selectOption("a+t");
  await lab.getByRole("button", { name: "Merge selected pair" }).click();
  await expect(lab.getByRole("status")).toContainText(
    "The corpus has not changed",
  );
  await expect(lab.getByLabel("Current token boundaries")).toContainText(
    "0 of 2 merges learned",
  );
  await pair.selectOption("c+a");
  await lab.getByRole("button", { name: "Merge selected pair" }).click();
  await expect(lab.getByLabel("Current token boundaries")).toContainText(
    "6 tokens",
  );
  await expect(pair.locator("option")).toHaveText([
    "ca + t — 2 occurrences",
    "ca + p — 1 occurrences",
  ]);
  await lab.getByRole("button", { name: "Merge selected pair" }).click();
  await expect(lab.getByRole("status")).toContainText("Two learned rules");
  await expect(lab.getByLabel("Current token boundaries")).toContainText(
    "4 tokens",
  );
  const word = lab.getByRole("combobox", { name: "Word to encode" });
  await expect(lab).toContainText("cap → [ca, p]");
  await word.selectOption("cat");
  await expect(lab).toContainText("cat → [cat]");
  await expect
    .poll(
      async () =>
        (await progress(page))?.positions[lessonId]?.visuals?.[sceneId]?.values,
    )
    .toMatchObject({ steps: 2, word: "cat" });
  await page.reload();
  await expect(page.locator("main")).toHaveAttribute("aria-busy", "false");
  await expect(word).toHaveValue("cat");
  await expect(lab.getByLabel("Current token boundaries")).toContainText(
    "4 tokens",
  );
  await word.selectOption("cap");
  await expect(lab).toContainText("cap → [ca, p]");
  await expect(
    lab.getByRole("button", { name: "Merge selected pair" }),
  ).toHaveCount(0);
  expect((await progress(page))?.attempts).toEqual([]);
  await lab.getByRole("button", { name: "Reset merges" }).click();
  await expect(lab.getByLabel("Current token boundaries")).toContainText(
    "9 tokens",
  );
});

test("video inspection distinguishes an identity error from expected movement on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const lab = await openVisual(
    page,
    "video-generation-project",
    "video-generation-project.s5",
    "video",
  );
  await lab
    .getByRole("button", { name: "Inspect frame 2", exact: true })
    .click();
  await lab.getByRole("button", { name: "Check selected frame" }).click();
  await expect(lab.getByRole("status")).toContainText(
    "Frame 2 still shows the circle",
  );
  await lab
    .getByRole("button", { name: "Inspect frame 4", exact: true })
    .click();
  await expect(
    lab.getByRole("button", { name: "Inspect frame 4", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await lab.getByRole("button", { name: "Check selected frame" }).click();
  await expect(lab.getByRole("status")).toContainText(
    "frame 4 changes the circle into a triangle",
  );
  const scrubber = lab.getByRole("slider", { name: "Selected video frame" });
  await scrubber.focus();
  await scrubber.press("ArrowRight");
  await expect(scrubber).toHaveValue("4");
  await expect(scrubber).toHaveAttribute("aria-valuetext", "Frame 5");
  await lab
    .getByRole("combobox", { name: "Video sequence" })
    .selectOption("consistent");
  await expect(lab.getByRole("status")).toContainText(
    "All six frames keep the same circle",
  );
  await expect(
    lab.getByRole("button", { name: "Check selected frame" }),
  ).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(
    (
      await new AxeBuilder({ page })
        .include('[data-visual="video"]')
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  expect((await progress(page))?.attempts).toEqual([]);
  await page.screenshot({
    path: "/tmp/learn-ai-video-visual-mobile.png",
    fullPage: true,
  });
});

type AudioProbeWindow = Window & {
  __visualToneContexts: AudioContext[];
  __visualToneFrequencies: number[];
};

test("audio controls match the wave, require a click, and close audio when stopped or left", async ({
  page,
}) => {
  // Observe real Web Audio objects: do not replace oscillator calculations or playback.
  await page.addInitScript(() => {
    const probe = window as unknown as AudioProbeWindow;
    probe.__visualToneContexts = [];
    probe.__visualToneFrequencies = [];
    const OriginalContext = window.AudioContext;
    class TrackedContext extends OriginalContext {
      constructor(options?: AudioContextOptions) {
        super(options);
        probe.__visualToneContexts.push(this);
      }
      override createOscillator() {
        const node = super.createOscillator();
        // AudioParam.value can still be its default before the next render
        // quantum. Observe the scheduled value and delegate to the real API.
        const schedule = node.frequency.setValueAtTime.bind(node.frequency);
        node.frequency.setValueAtTime = (value, startTime) => {
          const result = schedule(value, startTime);
          probe.__visualToneFrequencies.push(value);
          return result;
        };
        return node;
      }
    }
    window.AudioContext = TrackedContext;
  });
  const lessonId = "speech-audio-project";
  const lab = await openVisual(page, lessonId, `${lessonId}.s2`, "audio");
  const frequency = lab.getByRole("slider", { name: "Tone frequency" });
  await expect(frequency).toHaveValue("440");
  await expect(lab.getByRole("status")).toContainText(
    "4.4 cycles fit in the same 10 ms window",
  );
  expect(
    await page.evaluate(
      () => (window as unknown as AudioProbeWindow).__visualToneContexts.length,
    ),
  ).toBe(0);
  await frequency.focus();
  await frequency.press("End");
  await expect(frequency).toHaveValue("880");
  await expect(lab.getByRole("img")).toHaveAccessibleName(
    "880 Hz sine wave: 8.8 cycles in ten milliseconds",
  );
  await frequency.press("Home");
  await expect(frequency).toHaveValue("220");
  await expect(lab.getByRole("status")).toContainText(
    "2.2 cycles fit in the same 10 ms window",
  );
  expect(
    await page.evaluate(
      () => (window as unknown as AudioProbeWindow).__visualToneContexts.length,
    ),
  ).toBe(0);
  await lab.getByRole("button", { name: "Play brief tone" }).click();
  await expect(
    lab.getByRole("button", { name: "Stop tone", exact: true }),
  ).toBeEnabled();
  expect(
    await page.evaluate(
      () => (window as unknown as AudioProbeWindow).__visualToneFrequencies,
    ),
  ).toEqual([220]);
  await lab.getByRole("button", { name: "Stop tone", exact: true }).click();
  await expect(lab.getByRole("status")).toContainText("Sound stopped");
  await expect
    .poll(() =>
      page.evaluate(() =>
        (window as unknown as AudioProbeWindow).__visualToneContexts.map(
          (context) => context.state,
        ),
      ),
    )
    .toEqual(["closed"]);
  await lab.getByRole("button", { name: "Play brief tone" }).click();
  await expect(
    lab.getByRole("button", { name: "Stop tone", exact: true }),
  ).toBeEnabled();
  await page
    .getByRole("button", {
      name: sceneButton(lessonId, `${lessonId}.s3`),
      exact: true,
    })
    .click();
  await expect(lab).toHaveCount(0);
  await expect
    .poll(() =>
      page.evaluate(() =>
        (window as unknown as AudioProbeWindow).__visualToneContexts.map(
          (context) => context.state,
        ),
      ),
    )
    .toEqual(["closed", "closed"]);
  expect((await progress(page))?.attempts).toEqual([]);
});

test("robot steps reproduce the project and preserve a delayed sensor state", async ({
  page,
}) => {
  const lessonId = "robotics-system-project",
    sceneId = `${lessonId}.s2`;
  const lab = await openVisual(page, lessonId, sceneId, "robot");
  await expect(lab.getByRole("status")).toContainText(
    "True position 0 · observed 0 · target 2",
  );
  await expect(lab.getByRole("status")).toContainText(
    "Proposed next position: 0 + (1) = 1",
  );
  for (const position of ["1", "1.5", "1.75"]) {
    await lab.getByRole("button", { name: "Apply one command" }).click();
    await expect(lab.getByRole("status")).toContainText(
      `True position ${position} · observed ${position} · target 2`,
    );
  }
  await expect(lab.getByRole("status")).toContainText("3 commands applied");
  await lab.getByRole("button", { name: "Try delayed example" }).click();
  await expect(lab.getByRole("status")).toContainText(
    "True position 1 · observed 0 · target 2",
  );
  await expect(lab.getByRole("status")).toContainText(
    "Proposed next position: 1 + (1) = 2",
  );
  await expect
    .poll(
      async () =>
        (await progress(page))?.positions[lessonId]?.visuals?.[sceneId]?.values,
    )
    .toMatchObject({ position: 1, previous: 0, mode: "delayed" });
  await page.reload();
  await expect(page.locator("main")).toHaveAttribute("aria-busy", "false");
  await expect(lab.getByRole("combobox", { name: "Robot sensor" })).toHaveValue(
    "delayed",
  );
  await expect(lab.getByRole("status")).toContainText(
    "True position 1 · observed 0 · target 2",
  );
  await lab
    .getByRole("combobox", { name: "Robot sensor" })
    .selectOption("fresh");
  await expect(lab.getByRole("status")).toContainText(
    "Proposed next position: 1 + (0.5) = 1.5",
  );
  const gain = lab.getByRole("slider", { name: "Controller gain" });
  await gain.focus();
  await gain.press("Home");
  await expect(gain).toHaveValue("0");
  await lab.getByRole("button", { name: "Apply one command" }).click();
  await expect(lab.getByRole("status")).toContainText(
    "True position 1 · observed 1 · target 2",
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
        .include('[data-visual="robot"]')
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  expect((await progress(page))?.attempts).toEqual([]);
  await page.screenshot({
    path: "/tmp/learn-ai-robot-visual-mobile.png",
    fullPage: true,
  });
});
