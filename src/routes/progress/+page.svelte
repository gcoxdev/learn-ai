<script lang="ts">
  import { ZodError } from "zod";
  import { curriculum, getLesson } from "$lib/content";
  import { getLearner } from "$lib/learner.svelte";
  import { mastered, mergeProgress, parseBackup } from "$lib/engine";
  import { lessonHref } from "$lib/navigation";
  import type { Progress } from "$lib/model";
  import Icon from "$lib/components/Icon.svelte";
  import ObjectiveProgress from "$lib/components/ObjectiveProgress.svelte";
  import { objectiveEvidence } from "$lib/evidence-progress";
  const learner = getLearner();
  const demonstrated = $derived(
    curriculum.objectives.filter(
      (o) => o.scope === "core" && mastered(o, learner.data.attempts),
    ),
  );
  const developing = $derived(
    curriculum.objectives.filter((objective) => {
      if (objective.scope !== "core") return false;
      const evidence = objectiveEvidence(objective, learner.data.attempts);
      return evidence.tried && !evidence.complete;
    }),
  );
  let incoming = $state.raw<Progress | null>(null);
  let filename = $state("");
  let error = $state("");
  let reading = $state(false);
  let resetError = $state("");
  let resetDialog: HTMLDialogElement;
  let cancelResetButton: HTMLButtonElement;
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
  function openReset() {
    resetError = "";
    resetDialog.showModal();
    cancelResetButton.focus();
  }
  async function confirmReset() {
    resetError = "";
    if (await learner.resetProgress()) {
      incoming = null;
      filename = "";
      error = "";
      resetDialog.close();
    } else {
      resetError = learner.notice;
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
        </ul>{:else if learner.data.attempts.length}<div class="empty-state">
          <Icon name="sprout" size={30} />
          <h3>You’re building connections.</h3>
          <p>
            Your {learner.data.attempts.length} recorded response{learner.data
              .attempts.length === 1
              ? ""
              : "s"}
            {learner.data.attempts.length === 1 ? "gives" : "give"} you feedback to
            work with. Correct, fresh answers from different checks build the evidence
            shown below. Hinted and repeated answers remain useful practice.
          </p>
        </div>{:else}<div class="empty-state">
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
      {#if developing.length}<section aria-label="Ideas in progress">
          <h3>Ideas taking shape</h3>
          {#each developing as objective (objective.id)}
            <article class="developing-idea">
              <a
                class="inline-link"
                href={`${lessonHref(objective.lesson, { kind: "progress" })}&check=1`}
                >{getLesson(objective.lesson)?.title}<Icon
                  name="arrow"
                  size={15}
                /></a
              >
              <ObjectiveProgress {objective} attempts={learner.data.attempts} />
            </article>
          {/each}
        </section>{/if}
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
        disabled={!learner.hydrated || learner.resetting}
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
            disabled={!learner.hydrated || reading || learner.resetting}
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
              <button
                class="button primary"
                disabled={learner.resetting}
                onclick={confirmImport}>Merge this backup</button
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
      <section class="reset-section" aria-labelledby="reset-progress-heading">
        <h3 id="reset-progress-heading">Start over</h3>
        <p>
          Clear your learning record across all paths in this browser, including
          quiz answers, lesson positions, and saved lessons.
        </p>
        <button
          class="button secondary"
          disabled={!learner.hydrated || reading || learner.resetting}
          onclick={openReset}
          ><Icon name="reset" size={17} />Reset all progress</button
        >
      </section>
    </section>
  </div>
</div>

<dialog
  bind:this={resetDialog}
  aria-labelledby="reset-dialog-title"
  aria-describedby="reset-description"
  oncancel={(event) => {
    if (learner.resetting) event.preventDefault();
  }}
>
  <h2 id="reset-dialog-title">Reset all progress?</h2>
  <p id="reset-description">
    This clears all quiz answers and results, hints seen, saved lessons, reading
    positions, activity settings, and your selected path. It applies to Learn AI
    in this browser, including other open tabs.
  </p>
  <p>
    You can restore progress only from a backup you have kept. Downloaded
    backups are not deleted.
  </p>
  <button
    class="inline-link"
    disabled={learner.resetting}
    onclick={() => learner.exportProgress()}>Export a backup first</button
  >
  {#if resetError}<p class="error-message" role="alert">{resetError}</p>{/if}
  <div class="button-row reset-actions">
    <button
      bind:this={cancelResetButton}
      class="button secondary"
      disabled={learner.resetting}
      onclick={() => resetDialog.close()}>Cancel</button
    >
    <button
      class="button confirm-reset"
      disabled={learner.resetting}
      onclick={confirmReset}
      >{learner.resetting ? "Resetting…" : "Yes, reset all progress"}</button
    >
  </div>
</dialog>

<style>
  .reset-section {
    border-top: 1px solid var(--line);
    margin-top: 1.5rem;
    padding-top: 1.5rem;
  }
  dialog {
    width: min(32rem, calc(100vw - 2rem));
    padding: 1.5rem;
    border: 1px solid var(--line);
    border-radius: 12px;
    color: var(--ink);
    background: var(--paper);
  }
  dialog::backdrop {
    background: #14251ab3;
  }
  dialog h2 {
    margin-top: 0;
  }
  dialog p {
    font-size: 0.9rem;
    line-height: 1.65;
  }
  .reset-actions {
    margin-top: 1.5rem;
  }
  .confirm-reset {
    background: #973727;
    color: white;
  }
</style>
