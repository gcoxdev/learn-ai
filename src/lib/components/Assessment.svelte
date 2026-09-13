<script lang="ts">
  import { curriculum } from "$lib/content";
  import { getLearner } from "$lib/learner.svelte";
  import { questionsRemaining, mastered } from "$lib/engine";
  import type { Lesson } from "$lib/model";
  import QuestionCard from "./QuestionCard.svelte";
  import Icon from "./Icon.svelte";
  let {
    lesson,
    depth = "core",
    onreview,
  }: {
    lesson: Lesson;
    depth?: "core" | "mathematics";
    onreview: (id?: string) => void;
  } = $props();
  const learner = getLearner();
  const position = $derived(learner.position(lesson.id, lesson.routes.core[0]));
  const remaining = $derived(
    questionsRemaining(lesson, curriculum, learner.data, depth),
  );
  const active = $derived(
    lesson.questions.find((q) => q.id === position.activeQuestion),
  );
  const attempt = $derived(
    active
      ? learner.data.attempts.filter((a) => a.variant === active.id).at(-1)
      : undefined,
  );
  const preview = $derived(
    lesson.category === "advanced" ||
      depth === "mathematics" ||
      !!active?.retired,
  );
  const passed = $derived(
    remaining.objectives.filter((o) => mastered(o, learner.data.attempts))
      .length,
  );
  function advance() {
    learner.savePosition(lesson.id, lesson.routes.core[0], {
      activeQuestion: remaining.items[0]?.id,
    });
  }
</script>

<section class="assessment-panel" aria-label="Lesson knowledge check">
  {#if learner.data.attempts.some( (a) => remaining.objectives.some((o) => o.id === a.objective && o.version !== a.version) )}
    <p class="draft-note">
      This lesson has new knowledge checks. Your earlier attempts are kept; try
      the new questions to show what you understand about the updated material.
    </p>
  {/if}
  {#if active && attempt}
    <div
      class={["assessment-feedback", attempt.correct ? "correct" : "review"]}
      role="status"
    >
      <span class="feedback-icon"
        ><Icon name={attempt.correct ? "check" : "book"} size={26} /></span
      >
      <h3>
        {attempt.correct
          ? "You’ve got this part."
          : "Let’s connect the idea again."}
      </h3>
      <p>{active.feedback}</p>
      <p class="muted">
        {attempt.independent
          ? "This answer was saved as a new attempt without help."
          : "This answer was saved as practice. Hints, repeated questions, and practice previews help you learn but do not count toward completing the lesson."}
      </p>
      <div class="button-row">
        <button class="button primary" onclick={advance}
          >{remaining.complete
            ? "See my result"
            : remaining.items.length
              ? "Next check"
              : "See review options"}<Icon name="arrow" size={17} /></button
        >{#if !attempt.correct}<button
            class="button secondary"
            onclick={() => onreview(active?.remediation)}
            >Revisit the explanation</button
          >{/if}
      </div>
    </div>
  {:else if active}
    {#if active.retired}<p class="draft-note">
        This saved question belongs to an earlier lesson version. You can finish
        it as practice; use the revised checks for current mastery.
        <button class="inline-link" onclick={advance}
          >Start the revised checks</button
        >
      </p>{:else if preview}<p class="draft-note">
        This advanced view is a practice preview. It does not award formal
        mathematics or MoE course credit.
      </p>{/if}
    {#key active.id}<QuestionCard
        question={active}
        responses={position.drafts[active.id] ?? {}}
        exposed={learner.data.exposures.includes(active.id)}
        practice={!!preview}
        onchange={(responses) =>
          learner.draft(lesson.id, lesson.routes.core[0], active.id, responses)}
        onhint={() => learner.expose(active.id)}
        onanswer={(responses, hinted) =>
          learner.answer(
            active,
            responses,
            hinted,
            preview ? "practice" : "assessment",
          )}
      />{/key}
  {:else if remaining.complete}
    <div class="achievement">
      <span class="achievement-mark"><Icon name="check" size={34} /></span><span
        class="eyebrow">PERSONAL-STUDY MASTERY</span
      >
      <h3>One more connection made.</h3>
      <p>
        You passed two different checks for each of {passed} main idea{passed ===
        1
          ? ""
          : "s"}. We’ll remember this understanding when you explore another
        learning path.
      </p>
      <small
        >Draft lesson · for personal learning · not a school certificate</small
      >
    </div>
  {:else}
    <div class="assessment-intro">
      <span class="eyebrow">TURN FAMILIARITY INTO UNDERSTANDING</span>
      <h3>A small check. A stronger foundation.</h3>
      <p>
        Try a different example without hints to show what you understand. Each
        main idea needs two different correct answers. We already count the
        ideas you have demonstrated in these checks.
      </p>
      <div class="check-facts">
        <span
          ><Icon name="check" size={16} />{remaining.items.length} new questions available</span
        ><span
          ><Icon name="clock" size={16} />Untimed · revisit whenever you need</span
        >
      </div>
      {#if remaining.exhausted.length}<p class="hint-box">
          You have tried all the available questions for {remaining.exhausted
            .length} idea{remaining.exhausted.length === 1 ? "" : "s"}. You can
          still review and practice. Repeated answers will not count as new
          checks toward completing the lesson.
        </p>{/if}
      <div class="button-row">
        <button
          class="button primary"
          disabled={!learner.hydrated || !remaining.items.length}
          onclick={advance}
          >{lesson.category === "advanced"
            ? "Begin practice"
            : "Begin knowledge check"}<Icon name="arrow" size={17} /></button
        ><button class="text-button" onclick={() => onreview()}
          >Review the lesson first</button
        >
      </div>
    </div>
  {/if}
</section>
