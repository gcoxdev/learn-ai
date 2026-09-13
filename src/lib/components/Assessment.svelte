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
    onfinish,
  }: {
    lesson: Lesson;
    depth?: "core" | "mathematics";
    onreview: (id?: string) => void;
    onfinish: () => void;
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
    lesson.category === "advanced" || depth === "mathematics",
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
          ? "This fresh, unassisted response was recorded against its objective."
          : "This response is practice. Hinted, repeated, and advanced-preview responses do not award core mastery."}
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
    {#if preview}<p class="draft-note">
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
        You demonstrated {passed} scoped objective{passed === 1 ? "" : "s"} with two
        different checks each. Compatible evidence will carry into your other learning
        paths.
      </p>
      <button class="button primary" onclick={onfinish}
        >Continue to the final thought <Icon name="arrow" size={17} /></button
      ><small
        >Draft instruction · personal-study evidence · not an independently
        reviewed credential</small
      >
    </div>
  {:else}
    <div class="assessment-intro">
      <span class="eyebrow">TURN FAMILIARITY INTO UNDERSTANDING</span>
      <h3>A small check. A stronger foundation.</h3>
      <p>
        Apply the lesson to a different example. Each critical objective needs
        two varied, unassisted checks. Existing compatible evidence is already
        counted.
      </p>
      <div class="check-facts">
        <span
          ><Icon name="check" size={16} />{remaining.items.length} fresh checks available</span
        ><span
          ><Icon name="clock" size={16} />Untimed · revisit whenever you need</span
        >
      </div>
      {#if remaining.exhausted.length}<p class="hint-box">
          This draft bank has no unused variants for {remaining.exhausted
            .length} requirement{remaining.exhausted.length === 1 ? "" : "s"}.
          Reading and practice remain available; repeated answers will not be
          relabeled as fresh mastery evidence.
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
