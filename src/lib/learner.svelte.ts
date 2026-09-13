import { createContext } from "svelte";
import { curriculum } from "./content";
import {
  emptyPosition,
  emptyProgress,
  type Position,
  type Progress,
  type Question,
  type Responses,
  type LessonOrigin,
} from "./model";
import { backupDue, grade, mastered, mergeProgress } from "./engine";
import { openProgressDB, readProgress, writeProgress } from "./storage";

export class Learner {
  data = $state.raw<Progress>(emptyProgress());
  hydrated = $state(false);
  saveStatus = $state<"loading" | "saving" | "saved" | "unavailable">(
    "loading",
  );
  notice = $state("");
  backupPrompt = $state(false);
  #db: IDBDatabase | null = null;
  #queue = Promise.resolve();
  #channel: BroadcastChannel | null = null;

  async init() {
    try {
      this.#db = await openProgressDB();
      const stored = await readProgress(this.#db);
      if (stored) this.data = mergeProgress(stored, this.data, false);
      this.saveStatus = "saved";
      if ("BroadcastChannel" in window) {
        this.#channel = new BroadcastChannel("learn-ai-progress");
        this.#channel.onmessage = async () => {
          if (!this.#db) return;
          try {
            const latest = await readProgress(this.#db);
            if (latest) this.data = mergeProgress(this.data, latest, false);
          } catch {
            this.notice =
              "Another tab could not be synchronized. Export your progress before closing.";
          }
        };
      }
    } catch (error) {
      this.saveStatus = "unavailable";
      this.notice =
        error instanceof Error
          ? error.message
          : "Local storage is unavailable.";
    } finally {
      this.hydrated = true;
      this.backupPrompt = backupDue(this.data);
    }
  }
  dispose() {
    this.#channel?.close();
    this.#db?.close();
  }
  update(change: (p: Progress) => Progress) {
    this.data = {
      ...change(this.data),
      updatedAt: Math.max(Date.now(), this.data.updatedAt + 1),
    };
    if (backupDue(this.data)) this.backupPrompt = true;
    if (!this.hydrated || !this.#db) {
      this.saveStatus = "unavailable";
      return;
    }
    const snapshot = this.data;
    this.saveStatus = "saving";
    this.#queue = this.#queue.then(async () => {
      try {
        const saved = await writeProgress(this.#db!, snapshot);
        this.data = mergeProgress(saved, this.data, false);
        if (this.data.updatedAt <= saved.updatedAt) this.saveStatus = "saved";
        this.#channel?.postMessage("changed");
      } catch {
        this.saveStatus = "unavailable";
        this.notice =
          "Progress is not being saved. Keep studying in this session and export a backup.";
      }
    });
  }
  choosePath(id: "language" | "images") {
    this.update((p) => ({ ...p, selectedPath: id, detours: [] }));
  }
  enterLesson(id: string, origin: LessonOrigin) {
    const lesson = curriculum.lessons.find((l) => l.id === id);
    if (!lesson) return;
    this.savePosition(id, lesson.routes.core[0], { origin });
    this.update((p) => ({
      ...p,
      selectedPath: origin.kind === "path" ? origin.path : p.selectedPath,
      detours: [],
    }));
  }
  position(lesson: string, firstScene: string) {
    return this.data.positions[lesson] ?? emptyPosition(firstScene);
  }
  savePosition(lesson: string, first: string, patch: Partial<Position>) {
    this.update((p) => ({
      ...p,
      lastLesson: lesson,
      studyDays: [
        ...new Set([...p.studyDays, new Date().toISOString().slice(0, 10)]),
      ],
      positions: {
        ...p.positions,
        [lesson]: {
          ...(p.positions[lesson] ?? emptyPosition(first)),
          ...patch,
          updatedAt: Math.max(Date.now(), p.updatedAt + 1),
        },
      },
    }));
  }
  draft(lesson: string, first: string, question: string, responses: Responses) {
    const pos = this.position(lesson, first);
    this.savePosition(lesson, first, {
      drafts: { ...pos.drafts, [question]: responses },
    });
  }
  reveal(lesson: string, first: string, id: string) {
    const pos = this.position(lesson, first);
    this.savePosition(lesson, first, {
      reveals: [...new Set([...pos.reveals, id])],
    });
  }
  expose(id: string) {
    this.update((p) => ({
      ...p,
      exposures: [...new Set([...p.exposures, id])],
    }));
  }
  answer(
    question: Question,
    responses: Responses,
    hinted: boolean,
    mode: "assessment" | "placement" | "practice",
  ) {
    const objective = curriculum.objectives.find(
      (o) => o.id === question.objective,
    )!;
    const wasMastered = mastered(objective, this.data.attempts);
    // Formal gradient and advanced MoE remain explicit practice previews in this first scope.
    const preview =
      objective.scope === "mathematics" || objective.lesson === "experts";
    const independent =
      !preview &&
      mode !== "practice" &&
      !hinted &&
      !this.data.exposures.includes(question.id);
    const attempt = {
      id: crypto.randomUUID(),
      objective: objective.id,
      version: objective.version,
      family: question.family,
      variant: question.id,
      correct: grade(question, responses),
      independent,
      mode: preview ? ("practice" as const) : mode,
      at: Date.now(),
      responses: { ...responses },
    };
    this.update((p) => ({
      ...p,
      attempts: [...p.attempts, attempt],
      studyDays: [
        ...new Set([...p.studyDays, new Date().toISOString().slice(0, 10)]),
      ],
      exposures: [...new Set([...p.exposures, question.id])],
    }));
    if (
      !wasMastered &&
      mastered(objective, this.data.attempts) &&
      this.data.lastExportAt === 0
    )
      this.backupPrompt = true;
    return attempt;
  }
  bookmark(id: string) {
    this.update((p) => ({
      ...p,
      bookmarks: p.bookmarks.includes(id)
        ? p.bookmarks.filter((x) => x !== id)
        : [...p.bookmarks, id],
    }));
  }
  pushDetour(lesson: string, scene: string) {
    this.update((p) => ({
      ...p,
      detours: [...p.detours.slice(-19), { lesson, scene }],
    }));
  }
  popDetour() {
    const target = this.data.detours.at(-1);
    this.update((p) => ({ ...p, detours: p.detours.slice(0, -1) }));
    return target;
  }
  dismissBackup() {
    this.backupPrompt = false;
    this.update((p) => ({ ...p, backupDismissedAt: Date.now() }));
  }
  exportProgress() {
    const exported = { ...this.data, lastExportAt: Date.now() };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(exported, null, 2)], {
        type: "application/json",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `learn-ai-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    this.update((p) => ({ ...p, lastExportAt: exported.lastExportAt }));
    this.backupPrompt = false;
    this.notice =
      "Backup download started. Keep the file somewhere you can find it.";
  }
  importProgress(incoming: Progress) {
    const merged = mergeProgress(this.data, incoming);
    this.update(() => merged);
    this.notice =
      "Backup merged. Compatible evidence was kept once; newer lesson positions were preserved.";
  }
}
export const [getLearner, setLearner] = createContext<Learner>();
