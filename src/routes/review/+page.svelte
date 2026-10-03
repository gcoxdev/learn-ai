<script lang="ts">
  import { curriculum } from "$lib/content";
  import { getLearner } from "$lib/learner.svelte";
  import { lessonHref } from "$lib/navigation";
  import { reviewSchedule, type ReviewItem } from "$lib/review";
  import type { Responses } from "$lib/model";
  import Icon from "$lib/components/Icon.svelte";
  import QuestionCard from "$lib/components/QuestionCard.svelte";

  const SESSION = 10;
  const learner = getLearner();
  const schedule = $derived(
    learner.hydrated
      ? reviewSchedule(curriculum, learner.data)
      : { due: [], upcoming: [] },
  );

  let session = $state<ReviewItem[] | null>(null);
  let index = $state(0);
  let responses = $state<Responses>({});
  let results = $state<boolean[]>([]);
  let answered = $state(false);

  function start() {
    session = schedule.due.slice(0, SESSION);
    index = 0;
    responses = {};
    results = [];
    answered = false;
  }
  function next() {
    index += 1;
    responses = {};
    answered = false;
  }
  const current = $derived(session?.[index]);
  const finished = $derived(session !== null && index >= session.length);
  const correctCount = $derived(results.filter(Boolean).length);
  const missed = $derived(
    session ? session.filter((_, i) => results[i] === false) : [],
  );
  function when(ms: number) {
    const days = Math.max(1, Math.round((ms - Date.now()) / 86_400_000));
    return days === 1 ? "tomorrow" : `in ${days} days`;
  }
</script>

<svelte:head><title>Daily review · Learn AI</title></svelte:head>

<div class="page-content review-page">
  <div class="page-title">
    <span class="eyebrow">REMEMBER WHAT YOU LEARNED</span>
    <h1>Daily review.</h1>
    <p class="lede">
      Recalling an idea after a gap is one of the most reliable ways to make it
      stick. Ideas you've mastered come back here after 1, 3, 7, 16, and 35
      days; a miss brings one back tomorrow. Reviews are practice, so they never
      change what you've demonstrated.
    </p>
  </div>

  {#if !learner.hydrated}
    <p class="muted">Loading your record…</p>
  {:else if session === null}
    {#if schedule.due.length}
      <section class="review-start">
        <div>
          <strong class="review-count">{schedule.due.length}</strong>
          <span
            >{schedule.due.length === 1 ? "idea is" : "ideas are"} ready for review</span
          >
        </div>
        <p>
          A session takes about {Math.min(schedule.due.length, SESSION) * 1} to {Math.min(
            schedule.due.length,
            SESSION,
          ) * 2} minutes: {Math.min(schedule.due.length, SESSION)} quick questions from
          lessons you've mastered.
        </p>
        <button class="button primary" onclick={start}
          >Start review <Icon name="arrow" size={17} /></button
        >
        <ul class="review-topics">
          {#each schedule.due.slice(0, SESSION) as item (item.objective)}<li>
              {item.lessonTitle}
            </li>{/each}
        </ul>
      </section>
    {:else}
      <section class="review-empty">
        <Icon name="check" size={28} />
        <h2>Nothing to review right now.</h2>
        {#if schedule.upcoming.length}
          <p>
            Your next review, <em>{schedule.upcoming[0].lessonTitle}</em>, is due
            {when(schedule.upcoming[0].dueAt)}. {schedule.upcoming.length}
            {schedule.upcoming.length === 1 ? "idea is" : "ideas are"} on your schedule.
          </p>
        {:else}
          <p>
            When you pass a lesson's knowledge check, that idea joins your review
            schedule and comes back here at the right time.
          </p>
          <a class="button primary" href="/">Find a lesson <Icon name="arrow" size={17} /></a>
        {/if}
      </section>
    {/if}
  {:else if current && !finished}
    <section class="review-session" aria-label="Review question">
      <div class="review-progress">
        <span>Question {index + 1} of {session.length}</span>
        <progress value={index} max={session.length}></progress>
        <a href={lessonHref(current.lesson, { kind: "progress" })}>From: {current.lessonTitle}</a>
      </div>
      {#key current.question.id + index}<QuestionCard
          question={current.question}
          {responses}
          practice={true}
          onchange={(r) => (responses = r)}
          onanswer={(answers, hinted) => {
            const attempt = learner.answer(current.question, answers, hinted, "practice");
            results[index] = attempt.correct && !hinted;
            answered = true;
          }}
          oncontinue={next}
        />{/key}
      {#if answered}<p class="muted small">
          Press Continue for the next question.
        </p>{/if}
    </section>
  {:else}
    <section class="review-done" aria-live="polite">
      <span class="eyebrow">SESSION COMPLETE</span>
      <h2>{correctCount} of {session.length} recalled.</h2>
      <p>
        {correctCount === session.length
          ? "Every idea held up. Each one will return after a longer gap."
          : "The ideas you missed will come back tomorrow. A quick look at the lesson now makes the next review easier."}
      </p>
      {#if missed.length}<ul class="review-missed">
          {#each missed as item (item.objective)}<li>
              <a href={lessonHref(item.lesson, { kind: "progress" })}
                >Revisit: {item.lessonTitle}<Icon name="arrow" size={15} /></a
              >
            </li>{/each}
        </ul>{/if}
      <div class="button-row">
        {#if schedule.due.length}<button class="button primary" onclick={start}
            >Review {Math.min(schedule.due.length, SESSION)} more</button
          >{/if}
        <a class="button secondary" href="/progress/">See my progress</a>
      </div>
    </section>
  {/if}
</div>

<style>
  .review-page {
    max-width: 820px;
  }
  .lede {
    max-width: 640px;
    color: #5f6d58;
    line-height: 1.8;
    font-size: 14px;
  }
  .review-start,
  .review-empty,
  .review-done,
  .review-session {
    margin-top: 28px;
    padding: 28px;
    border: 1px solid #dbe5cc;
    border-radius: 14px;
    background: #fbfcf8;
  }
  .review-count {
    font-family: Georgia, serif;
    font-size: 54px;
    line-height: 1;
    color: #193c32;
    margin-right: 12px;
  }
  .review-start > div {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 6px;
    font-size: 17px;
    color: #304b2c;
  }
  .review-start p,
  .review-empty p,
  .review-done p {
    color: #5f6d58;
    line-height: 1.8;
    font-size: 14px;
  }
  .review-topics,
  .review-missed {
    margin: 22px 0 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: 8px;
    font-size: 13px;
    color: #4d6a41;
  }
  .review-topics li::before {
    content: "↻ ";
    color: #8aa27a;
  }
  .review-missed a {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    color: #31543c;
    font-weight: 600;
  }
  .review-empty h2,
  .review-done h2 {
    font-family: Georgia, serif;
    font-weight: 400;
    font-size: 28px;
    margin: 10px 0;
    color: #26372e;
  }
  .review-progress {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 6px 16px;
    align-items: center;
    font-size: 12px;
    color: #5f6d58;
    margin-bottom: 6px;
  }
  .review-progress progress {
    width: 100%;
    height: 6px;
    accent-color: #427655;
  }
  .review-progress a {
    grid-column: 1 / -1;
    color: #31543c;
    font-size: 12px;
  }
  .button-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 18px;
  }
  .small {
    font-size: 12px;
  }
  @media (max-width: 620px) {
    .review-start,
    .review-empty,
    .review-done,
    .review-session {
      padding: 18px 15px;
    }
  }
</style>
