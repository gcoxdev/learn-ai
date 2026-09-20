<script lang="ts">
  import { curriculum } from "$lib/content";
  import type { Lesson } from "$lib/model";
  import {
    createLessonFeedback,
    createProjectReview,
    feedbackIssues,
    type FeedbackIssue,
  } from "$lib/lesson-exports";

  let { lesson }: { lesson: Lesson } = $props();
  const uid = $props.id();
  let notes = $state("");
  let evidence = $state("");
  let questions = $state("");
  let sceneId = $state("");
  let issue = $state<FeedbackIssue>("correction");
  let note = $state("");
  let reviewNotice = $state("");
  let feedbackNotice = $state("");
  const sceneOptions = $derived(
    [...new Set([...lesson.routes.core, ...lesson.routes.mathematics])]
      .map((id) => lesson.scenes.find((scene) => scene.id === id))
      .filter((scene) => scene !== undefined),
  );

  function download(content: string, kind: string) {
    const url = URL.createObjectURL(
      new Blob([content], { type: "text/markdown;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `learn-ai-${lesson.id}-${kind}.md`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function review(event: SubmitEvent) {
    event.preventDefault();
    try {
      download(
        createProjectReview(lesson, curriculum, { notes, evidence, questions }),
        "review",
      );
      reviewNotice =
        "Worksheet download started. Share the file and your chosen artifacts with a reviewer yourself.";
    } catch {
      reviewNotice =
        "The download could not start. Your notes are still here; please try again.";
    }
  }

  function feedback(event: SubmitEvent) {
    event.preventDefault();
    if (!note.trim()) {
      feedbackNotice =
        "Add a note about what you would change before downloading.";
      return;
    }
    try {
      download(
        createLessonFeedback(lesson, curriculum, { sceneId, issue, note }),
        "feedback",
      );
      feedbackNotice =
        "Feedback download started. Nothing was submitted; share the file manually.";
    } catch {
      feedbackNotice =
        "The download could not start. Check your scene and note, then try again.";
    }
  }
</script>

<section class="lesson-tools" aria-label="Lesson feedback and project review">
  {#if lesson.archetype === "project"}
    <details class="lesson-tool">
      <summary>Prepare a project review</summary>
      <div class="tool-content">
        <p class="tool-intro">
          Give someone the context to challenge your thinking.
        </p>
        <p>
          Download the authored brief, deliverables, and review criteria with
          your notes. Use the worksheet for self or peer review. Project
          artifacts are ungraded here, and this review does not award mastery
          credit.
        </p>
        <form onsubmit={review} aria-label="Project review worksheet">
          <label for={`${uid}-notes`}>Project notes</label>
          <textarea
            id={`${uid}-notes`}
            bind:value={notes}
            rows="4"
            maxlength="10000"
            placeholder="Explain your approach, choices, and limitations."
          ></textarea>
          <label for={`${uid}-evidence`}>Evidence and artifacts</label>
          <textarea
            id={`${uid}-evidence`}
            bind:value={evidence}
            rows="3"
            maxlength="10000"
            placeholder="List files, calculations, or diagrams you will share separately."
          ></textarea>
          <label for={`${uid}-questions`}>Questions for your reviewer</label>
          <textarea
            id={`${uid}-questions`}
            bind:value={questions}
            rows="3"
            maxlength="6000"
            placeholder="Which assumption or result would you like challenged?"
          ></textarea>
          <p class="tool-hint" id={`${uid}-review-help`}>
            These optional fields stay on this page until you leave or reload.
            Download to keep them. Saved progress and quiz responses are
            excluded. You choose who receives the file; nothing is submitted
            here.
          </p>
          <button
            class="button"
            type="submit"
            aria-describedby={`${uid}-review-help`}
            >Download review worksheet</button
          >
          <p class="download-notice" role="status">{reviewNotice}</p>
        </form>
      </div>
    </details>
  {/if}

  <details class="lesson-tool">
    <summary>Suggest a correction</summary>
    <div class="tool-content">
      <p class="tool-intro">A precise note can make an explanation better.</p>
      <p>
        Choose the scene and describe what needs attention. Download a feedback
        file to share through a channel you already use. This page does not send
        feedback or connect you with a reviewer.
      </p>
      <form onsubmit={feedback} aria-label="Lesson correction">
        <div class="field-pair">
          <div>
            <label for={`${uid}-scene`}>Scene</label>
            <select id={`${uid}-scene`} bind:value={sceneId} required>
              <option value="" disabled>Choose a scene</option>
              {#each sceneOptions as scene (scene.id)}
                <option value={scene.id}>{scene.title}</option>
              {/each}
            </select>
          </div>
          <div>
            <label for={`${uid}-issue`}>Issue type</label>
            <select id={`${uid}-issue`} bind:value={issue}>
              {#each feedbackIssues as option (option.value)}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
          </div>
        </div>
        <label for={`${uid}-note`}>What would you change?</label>
        <textarea
          id={`${uid}-note`}
          bind:value={note}
          rows="4"
          maxlength="6000"
          required
          placeholder="Describe the issue and, if useful, include a source or steps to reproduce it."
        ></textarea>
        <p class="tool-hint" id={`${uid}-feedback-help`}>
          The file includes this note, the scene title, and lesson metadata.
          Your saved progress and quiz responses are excluded. Download before
          leaving or reloading to keep your note.
        </p>
        <button
          class="button ghost"
          type="submit"
          aria-describedby={`${uid}-feedback-help`}>Download feedback</button
        >
        <p class="download-notice" role="status">{feedbackNotice}</p>
      </form>
    </div>
  </details>
</section>

<style>
  .lesson-tools {
    margin-top: 1.5rem;
    border-top: 1px solid #d7decd;
  }
  .lesson-tool {
    border-bottom: 1px solid #d7decd;
  }
  summary {
    padding: 1rem 0;
    color: #385335;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
  }
  summary:focus-visible {
    outline: 2px solid #617b4e;
    outline-offset: 4px;
    border-radius: 3px;
  }
  .tool-content {
    padding: 0 0 1.25rem;
    max-width: 48rem;
  }
  .tool-content p {
    color: #59634f;
    font-size: 0.85rem;
    line-height: 1.7;
  }
  .tool-content .tool-intro {
    color: #354c32;
    font:
      1.2rem/1.5 Georgia,
      serif;
    margin: 0 0 0.5rem;
  }
  form {
    display: grid;
    gap: 0.55rem;
    margin-top: 1rem;
  }
  label {
    color: #3d5136;
    font-size: 0.8rem;
    font-weight: 600;
  }
  textarea,
  select {
    width: 100%;
    min-width: 0;
    border: 1px solid #b7c3aa;
    border-radius: 7px;
    background: #fffef9;
    color: #303e2b;
    padding: 0.7rem;
    font: inherit;
    font-size: 0.9rem;
    line-height: 1.5;
  }
  textarea {
    resize: vertical;
    margin-bottom: 0.45rem;
  }
  textarea::placeholder {
    color: #68705e;
  }
  textarea:focus-visible,
  select:focus-visible {
    outline: 2px solid #617b4e;
    outline-offset: 2px;
  }
  .field-pair {
    display: grid;
    grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
    gap: 0.8rem;
    margin-bottom: 0.5rem;
  }
  .field-pair > div {
    display: grid;
    gap: 0.55rem;
    min-width: 0;
  }
  .tool-content .tool-hint {
    font-size: 0.78rem;
    margin: 0.25rem 0 0.5rem;
  }
  button {
    justify-self: start;
    min-height: 44px;
    max-width: 100%;
    white-space: normal;
    text-align: left;
  }
  .download-notice {
    margin: 0;
  }
  .download-notice:empty {
    display: none;
  }
  @media (max-width: 600px) {
    .field-pair {
      grid-template-columns: 1fr;
    }
    textarea,
    select {
      font-size: 1rem;
    }
  }
</style>
