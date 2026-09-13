<script lang="ts">
  import { ZodError } from "zod";
  import { curriculum, getLesson } from "$lib/content";
  import { getLearner } from "$lib/learner.svelte";
  import { mastered, mergeProgress, parseBackup } from "$lib/engine";
  import { lessonHref } from "$lib/navigation";
  import type { Progress } from "$lib/model";
  import Icon from "$lib/components/Icon.svelte";
  const learner = getLearner();
  const demonstrated = $derived(
    curriculum.objectives.filter(
      (o) => o.scope === "core" && mastered(o, learner.data.attempts),
    ),
  );
  let incoming = $state.raw<Progress | null>(null);
  let filename = $state("");
  let error = $state("");
  let reading = $state(false);
  const added = $derived(
    incoming?.attempts.filter(
      (a) => !learner.data.attempts.some((b) => b.id === a.id),
    ).length ?? 0,
  );
  async function inspect(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    incoming = null;
    error = "";
    if (!file) return;
    reading = true;
    try {
      if (file.size > 8_000_000)
        throw new Error("This file exceeds the 8 MB backup limit.");
      const parsed = parseBackup(await file.text(), curriculum);
      mergeProgress(learner.data, parsed);
      incoming = parsed;
      filename = file.name;
    } catch (cause) {
      error =
        cause instanceof ZodError
          ? "This file does not match the supported Learn AI backup format. Your progress has not changed."
          : cause instanceof SyntaxError
            ? "This file is not valid JSON. Your progress has not changed."
            : cause instanceof Error
              ? `${cause.message.split("\n")[0]} Your progress has not changed.`
              : "This backup could not be read. Your progress has not changed.";
    } finally {
      reading = false;
      input.value = "";
    }
  }
  function confirmImport() {
    if (!incoming) return;
    try {
      learner.importProgress(incoming);
      incoming = null;
      error = "";
    } catch (cause) {
      error =
        cause instanceof Error
          ? cause.message
          : "Import failed. Current progress was kept.";
    }
  }
</script>

<svelte:head><title>My progress · Learn AI</title></svelte:head>
<div class="page-content">
  <div class="page-title">
    <span class="eyebrow">EVERY CONNECTION COUNTS</span>
    <h1>Your understanding, growing.</h1>
    <p>
      See what you’ve demonstrated and keep a copy of your learning journey.
    </p>
  </div>
  <div class="progress-stats">
    <div class="stat-card">
      <strong>{demonstrated.length}</strong><span
        >Core objectives demonstrated</span
      >
    </div>
    <div class="stat-card">
      <strong>{learner.data.attempts.length}</strong><span
        >Assessment responses recorded</span
      >
    </div>
    <div class="stat-card">
      <strong>{learner.data.bookmarks.length}</strong><span
        >Lessons saved for later</span
      >
    </div>
  </div>
  {#if learner.notice}<div class="notice-message" role="status">
      <p>{learner.notice}</p>
      <button class="text-button" onclick={() => (learner.notice = "")}
        >Dismiss message</button
      >
    </div>{/if}
  <div class="progress-grid">
    <section class="progress-panel">
      <span class="eyebrow">YOUR LEARNING RECORD</span>
      <h2>Ideas you can use.</h2>
      <p class="muted">
        Mastery requires two varied, fresh, unassisted checks for each scoped
        objective. These drafts record personal study, not a reviewed
        credential.
      </p>
      {#if demonstrated.length}<ul class="mastery-list">
          {#each demonstrated as objective (objective.id)}<li>
              <Icon name="check" size={18} /><a
                href={lessonHref(objective.lesson, { kind: "progress" })}
                >{objective.title}<small>{objective.version}</small></a
              >
            </li>{/each}
        </ul>{:else}<div class="empty-state">
          <Icon name="sprout" size={30} />
          <h3>Your first connection starts here.</h3>
          <p>
            Explore a lesson and try its knowledge check. Viewing slides alone
            does not mark an objective as learned.
          </p>
          <a class="button primary" href="/"
            >Choose a learning path <Icon name="arrow" size={16} /></a
          >
        </div>{/if}
      {#if learner.data.lastLesson}<a
          class="resume-link inline-link"
          href={lessonHref(learner.data.lastLesson, { kind: "progress" })}
          >Resume {getLesson(learner.data.lastLesson)?.title}
          <Icon name="arrow" size={16} /></a
        >{/if}
      {#if learner.data.bookmarks.length}<h3 class="saved-heading">
          Saved for a return visit
        </h3>
        <ul class="mastery-list">
          {#each learner.data.bookmarks as id (id)}<li>
              <Icon name="bookmark" size={17} /><a
                href={lessonHref(id, { kind: "progress" })}
                >{getLesson(id)?.title}</a
              >
            </li>{/each}
        </ul>{/if}
    </section>
    <section class="progress-panel">
      <span class="eyebrow">KEEP YOUR PLACE</span>
      <h2>Your progress belongs to you.</h2>
      <p>
        Progress is stored in this browser on this device. Download a backup
        before switching devices or clearing browser data.
      </p>
      <button
        class="button primary"
        disabled={!learner.hydrated}
        onclick={() => learner.exportProgress()}
        ><Icon name="download" size={17} />Export progress</button
      >
      <p class="small muted">
        {learner.data.lastExportAt
          ? `Last download started: ${new Date(learner.data.lastExportAt).toLocaleString()}`
          : "No backup download started yet."} A download is only a backup once you
        have kept the file.
      </p>
      <div class="import-section">
        <h3>Bring a backup with you.</h3>
        <p>
          Import a Learn AI JSON backup. We combine compatible evidence once and
          keep newer saved positions. You can review the file before applying
          it.
        </p>
        <label class="button secondary file-label"
          ><Icon name="upload" size={17} />{reading
            ? "Reading backup…"
            : "Choose backup file"}<input
            type="file"
            accept="application/json,.json"
            aria-label="Choose backup file"
            disabled={!learner.hydrated || reading}
            onchange={inspect}
          /></label
        >
        {#if error}<p class="error-message" role="alert">{error}</p>{/if}
        {#if incoming}<div class="import-preview">
            <h4>Ready to merge: {filename}</h4>
            <p>
              {added} new response{added === 1 ? "" : "s"} · {incoming.attempts
                .length - added} already recorded · {Object.keys(
                incoming.positions,
              ).length} saved lesson position{Object.keys(incoming.positions)
                .length === 1
                ? ""
                : "s"}.
            </p>
            <p>
              Current evidence stays intact. Conflicting records are rejected.
              Compatible objectives retain their recorded versions.
            </p>
            <div class="button-row">
              <button class="button primary" onclick={confirmImport}
                >Merge this backup</button
              ><button
                class="button secondary"
                onclick={() => (incoming = null)}>Cancel</button
              >
            </div>
          </div>{/if}
      </div>
      <p class="draft-note">
        No account or cloud sync is active in this prototype. Only this
        curriculum version is supported; incompatible files are rejected without
        replacing your progress.
      </p>
    </section>
  </div>
</div>
