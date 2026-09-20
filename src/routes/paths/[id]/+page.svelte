<script lang="ts">
  import { goto } from "$app/navigation";
  import { curriculum } from "$lib/content";
  import { planPath, mastered } from "$lib/engine";
  import { getLearner } from "$lib/learner.svelte";
  import type { Recipe, Lesson } from "$lib/model";
  import Icon from "$lib/components/Icon.svelte";
  import PathArt from "$lib/components/PathArt.svelte";
  import { lessonHref } from "$lib/navigation";
  import { chapterProgress, pathChapters } from "$lib/path-chapters";
  import { objectiveEvidence } from "$lib/evidence-progress";
  let { data }: { data: { recipe: Recipe } } = $props();
  const learner = getLearner();
  const full = $derived(planPath(curriculum, data.recipe, []));
  const extensions = $derived(
    data.recipe.extensions.filter(
      (e) => !full.lessons.some((l) => l.id === e.lesson),
    ),
  );
  const related = $derived(
    data.recipe.related.map((id) => {
      const recipe = curriculum.recipes.find((r) => r.id === id)!;
      const plan = planPath(curriculum, recipe, []);
      return {
        recipe,
        shared: plan.required.filter((id) => full.required.includes(id)).length,
        remaining: planPath(curriculum, recipe, learner.data.attempts).remaining
          .length,
      };
    }),
  );
  const current = $derived(
    planPath(curriculum, data.recipe, learner.data.attempts),
  );
  const demonstrated = $derived(
    full.required.filter((id) =>
      mastered(
        curriculum.objectives.find((o) => o.id === id)!,
        learner.data.attempts,
      ),
    ).length,
  );
  let placementChoice = $state<{ path: string; lesson: string } | null>(null);
  const next = $derived(
    current.lessons.find((l) =>
      l.objectives.some((id) => current.remaining.includes(id)),
    ),
  );
  const placementLesson = $derived(
    placementChoice?.path === data.recipe.id
      ? placementChoice.lesson
      : (next?.id ?? data.recipe.destination),
  );
  const chapters = $derived(pathChapters(full.lessons));
  const nextChapter = $derived(
    chapters.find((chapter) =>
      chapter.lessons.some((lesson) => lesson.id === next?.id),
    ) ?? chapters[0],
  );
  // A writable derived resets expansion when the path, hydration, or next chapter changes.
  let expansion = $derived({
    path: data.recipe.id,
    hydrated: learner.hydrated,
    open: Object.fromEntries(
      chapters.map((chapter) => [chapter.id, chapter.id === nextChapter?.id]),
    ),
  });
  const allExpanded = $derived(
    chapters.every((chapter) => expansion.open[chapter.id]),
  );
  function toggleChapter(id: string) {
    expansion = {
      ...expansion,
      open: { ...expansion.open, [id]: !expansion.open[id] },
    };
  }
  function toggleAll() {
    expansion = {
      ...expansion,
      open: Object.fromEntries(
        chapters.map((chapter) => [
          chapter.id,
          !allExpanded || chapter.id === nextChapter?.id,
        ]),
      ),
    };
  }
  const minutes = $derived(
    current.lessons
      .filter((l) => l.objectives.some((id) => current.remaining.includes(id)))
      .reduce((sum, l) => sum + l.minutes, 0),
  );
  function lessonState(lesson: Lesson) {
    const required = curriculum.objectives.filter(
      (o) => lesson.objectives.includes(o.id) && o.scope === "core",
    );
    if (required.every((o) => mastered(o, learner.data.attempts)))
      return "Demonstrated";
    if (!required.some((o) => current.required.includes(o.id)))
      return "Preparation not assigned";
    const passed = required.reduce(
      (sum, objective) =>
        sum + objectiveEvidence(objective, learner.data.attempts).passed,
      0,
    );
    if (passed)
      return `${passed} of ${required.reduce((sum, o) => sum + o.families.length, 0)} checks passed`;
    return "To explore";
  }
  async function start() {
    learner.choosePath(data.recipe.id);
    await goto(
      lessonHref(next?.id ?? data.recipe.destination, {
        kind: "path",
        path: data.recipe.id,
      }),
    );
  }
</script>

<svelte:head><title>{data.recipe.title} — Learn AI</title></svelte:head>
<div class="page-content path-page">
  <a class="inline-link back-link" href="/"
    ><Icon name="left" size={17} />All learning paths</a
  >
  <section class="path-intro">
    <div>
      <span class="eyebrow">YOUR FOUNDATION-FIRST SYLLABUS</span>
      <h1>{data.recipe.title}</h1>
      <p class="lead">{data.recipe.description}</p>
      <div class="path-stat-row">
        <span
          ><strong>{demonstrated} of {full.required.length}</strong> core ideas demonstrated</span
        ><span><strong>{full.lessons.length}</strong> draft lessons</span><span
          ><strong>{Math.round(minutes / 5) * 5}</strong> estimated minutes remaining</span
        >
      </div>
      <progress
        class="path-progress"
        max={full.required.length}
        value={demonstrated}
        aria-label="Core ideas demonstrated in this path"
      ></progress>
      {#if demonstrated}<p class="carried-evidence" role="status">
          {demonstrated} demonstrated idea{demonstrated === 1
            ? " carries"
            : "s carry"} forward. Your existing checks count here, whichever path
          you studied first. Start or continue to reach the next idea that needs evidence.
        </p>{/if}
      <button
        class="button primary large"
        disabled={!learner.hydrated}
        onclick={start}
        >{current.remaining.length === 0
          ? "Revisit this path"
          : current.mastered.length
            ? "Continue my path"
            : "Start this path"}<Icon name="arrow" size={18} /></button
      >
      {#if next}<p class="next-lesson-note">
          Next: <strong>{next.title}</strong> · {next.minutes} min
        </p>{/if}
      <details class="placement-entry">
        <summary>Already know some of this?</summary>
        <p>
          Go straight to an idea’s knowledge check. Passing its different checks
          without hints carries that evidence into this path. Checking an
          advanced idea does not award its prerequisites; you can still explore
          them.
        </p>
        <label
          >Choose an idea to check
          <select
            value={placementLesson}
            onchange={(event) =>
              (placementChoice = {
                path: data.recipe.id,
                lesson: event.currentTarget.value,
              })}
          >
            {#each full.lessons as lesson (lesson.id)}<option value={lesson.id}
                >{lesson.title}</option
              >{/each}
          </select>
        </label>
        <a
          class="button secondary"
          href={`${lessonHref(placementLesson, { kind: "path", path: data.recipe.id })}&check=1`}
          >Check what I already know <Icon name="arrow" size={16} /></a
        >
      </details>
    </div>
    <PathArt type={data.recipe.id} />
  </section>
  <div class="path-body">
    <section class="syllabus">
      <div class="section-heading">
        <div>
          <span class="eyebrow">THE IDEAS, IN ORDER</span>
          <h2>Build your understanding.</h2>
        </div>
        <span class="small-badge">Shared credit is automatic</span>
      </div>
      <div class="chapter-toolbar">
        <p>
          {chapters.length} short chapters, in prerequisite order. Open any chapter
          to explore.
        </p>
        <button class="text-button" onclick={toggleAll}>
          {allExpanded ? "Collapse to next chapter" : "Show all lessons"}
        </button>
      </div>
      <p class="chapter-credit-note">
        Chapter counts use compatible knowledge-check evidence. Reading a lesson
        does not mark its ideas as demonstrated.
      </p>
      {#each chapters as chapter, chapterIndex (chapter.id)}
        {@const evidence = chapterProgress(
          chapter,
          curriculum,
          full.required,
          learner.data.attempts,
        )}
        <details class="path-chapter" open={expansion.open[chapter.id]}>
          <summary
            onclick={(event) => {
              event.preventDefault();
              toggleChapter(chapter.id);
            }}
          >
            <span class="chapter-heading">
              <span class="chapter-kicker"
                >Chapter {chapterIndex + 1} · Lessons {chapter.start +
                  1}–{chapter.start + chapter.lessons.length}</span
              >
              <strong>{chapter.title}</strong>
              <span class="chapter-description">{chapter.summary}</span>
              <span class="chapter-counts">
                {chapter.lessons.length} lessons · {evidence.demonstrated} of {evidence.total}
                core ideas demonstrated
                {#if next && chapter.id === nextChapter?.id}<span
                    class="chapter-next">Up next</span
                  >{/if}
              </span>
            </span>
          </summary>
          <div class="chapter-lessons">
            {#each chapter.lessons as lesson, i (lesson.id)}
              {@const status = lessonState(lesson)}
              <a
                class="syllabus-row"
                href={lessonHref(lesson.id, {
                  kind: "path",
                  path: data.recipe.id,
                })}
              >
                <span
                  class={["lesson-number", { done: status === "Demonstrated" }]}
                >
                  {#if status === "Demonstrated"}<Icon name="check" size={16} />
                  {:else}{String(chapter.start + i + 1).padStart(2, "0")}{/if}
                </span>
                <div>
                  <strong>{lesson.title}</strong>
                  <span
                    >{lesson.category === "common"
                      ? "Common Ground"
                      : lesson.category === "bridge"
                        ? "Math preparation"
                        : lesson.category === "destination"
                          ? "Your system, connected"
                          : "Learning mechanisms"} · {lesson.minutes} min</span
                  >
                </div>
                <small>{status}</small><Icon name="chevron" size={17} />
              </a>
            {/each}
          </div>
        </details>
      {/each}
      {#if extensions.length}<details class="path-extensions">
          <summary
            >Optional extensions and comparisons ({extensions.length})</summary
          >
          <p>
            These lessons deepen or compare the reference design. They do not
            add requirements to this path’s completion.
          </p>
          {#each extensions as extension (extension.lesson)}{@const lesson =
              curriculum.lessons.find((l) => l.id === extension.lesson)!}
            <a
              class="extension-link"
              href={lessonHref(lesson.id, {
                kind: "path",
                path: data.recipe.id,
              })}><strong>{lesson.title}</strong><span>{extension.why}</span></a
            >
          {/each}
        </details>{/if}
    </section>
    <aside class="path-context">
      <span class="eyebrow">WHAT THIS PATH EXPLAINS</span>
      <h3>{data.recipe.question}</h3>
      <p>{data.recipe.outcome}</p>
      <h4>The reference system</h4>
      <p>{data.recipe.reference}</p>
      <h4>Where this path leads</h4>
      <a
        href={lessonHref(data.recipe.destination, {
          kind: "path",
          path: data.recipe.id,
        })}
        >{curriculum.lessons.find((l) => l.id === data.recipe.destination)!
          .title}</a
      >
      <hr />
      <h4>A foundation you keep</h4>
      <p>
        Compatible objective evidence is shared across paths. A new system adds
        its own application and synthesis.
      </p>
      <h4>Already know some of this?</h4>
      <p>
        Read any lesson as a preview. The “Already know some of this?” selector
        above lets you choose a named lesson and check an idea you already
        understand.
      </p>
      {#if related.length}<h4>Connected paths</h4>
        <p>
          Shared core objectives are the same learning evidence, not duplicate
          assignments. Remaining counts reflect your current progress.
        </p>
        <ul class="related-paths">
          {#each related as item (item.recipe.id)}<li>
              <a href={`/paths/${item.recipe.id}/`}>{item.recipe.title}</a><span
                >{item.shared} shared core objectives · {item.remaining} still to
                learn there</span
              >
            </li>{/each}
        </ul>
      {/if}
      <div class="draft-note">
        <Icon name="info" size={17} />
        <p>
          Private prototype with draft instruction. Progress is personal-study
          evidence, not a reviewed school credential. Time estimates have not
          been measured in learner pilots.
        </p>
      </div>
    </aside>
  </div>
</div>

<style>
  .path-intro > div {
    min-width: 0;
  }
  .path-progress {
    display: block;
    width: 100%;
    height: 0.55rem;
    margin: -0.3rem 0 1.4rem;
    accent-color: #427655;
  }
  .carried-evidence {
    font-size: 0.85rem;
    line-height: 1.7;
    padding: 0.8rem 1rem;
    border-left: 3px solid #638757;
    background: #f0f5e8;
  }
  .placement-entry {
    margin-top: 1.3rem;
    padding-top: 1rem;
    border-top: 1px solid #d8dfd1;
  }
  .placement-entry summary {
    font-size: 0.9rem;
    font-weight: 600;
    color: #31543c;
    cursor: pointer;
  }
  .placement-entry p {
    font-size: 0.85rem;
    line-height: 1.7;
  }
  .placement-entry label {
    display: grid;
    gap: 0.5rem;
    margin: 0.9rem 0;
    font-size: 0.85rem;
  }
  .placement-entry select {
    width: 100%;
    min-width: 0;
    max-width: 100%;
    border: 1px solid #9cad92;
    border-radius: 6px;
    background: #fffefa;
    color: #294433;
    padding: 0.7rem;
  }
  .next-lesson-note {
    margin: 1rem 0 0;
    font-size: 0.8rem;
    color: var(--muted);
    line-height: 1.6;
  }
  .chapter-toolbar {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.5rem;
  }
  .chapter-toolbar p {
    flex: 1;
    font-size: 0.8rem;
    margin: 0;
    line-height: 1.7;
  }
  .chapter-toolbar button {
    flex-shrink: 0;
  }
  .chapter-credit-note {
    font-size: 0.75rem;
    line-height: 1.7;
    margin: 0.7rem 0 1.3rem;
    color: var(--muted);
  }
  .path-chapter {
    background: #fff;
    border: 1px solid #dce5d1;
    border-radius: 9px;
    margin: 0 0 1rem;
  }
  .path-chapter > summary {
    padding: 1.2rem;
    cursor: pointer;
  }
  .chapter-heading {
    display: inline-grid;
    gap: 0.5rem;
    width: calc(100% - 1.4rem);
    vertical-align: top;
    padding-left: 0.35rem;
  }
  .chapter-heading > strong {
    font-size: 1.05rem;
    line-height: 1.5;
  }
  .chapter-kicker {
    font-size: 0.72rem;
    color: #5c704f;
  }
  .chapter-description {
    font-size: 0.78rem;
    line-height: 1.7;
    color: #59664f;
  }
  .chapter-counts {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.72rem;
    line-height: 1.6;
  }
  .chapter-next {
    background: #e8f0df;
    color: #3f5f32;
    border-radius: 4px;
    padding: 0.1rem 0.45rem;
    font-weight: 600;
  }
  .chapter-lessons {
    border-top: 1px solid #dce5d1;
    padding: 0 0.8rem;
  }
  .chapter-lessons .syllabus-row:last-child {
    border-bottom: 0;
  }
  .chapter-lessons .syllabus-row > div {
    min-width: 0;
    overflow-wrap: anywhere;
  }
  @media (max-width: 620px) {
    .chapter-toolbar {
      align-items: flex-start;
      flex-direction: column;
      gap: 0.6rem;
    }
    .path-chapter > summary {
      padding: 1rem 0.8rem;
    }
    .chapter-heading > strong {
      font-size: 1rem;
    }
    .chapter-lessons {
      padding: 0 0.6rem;
    }
    .chapter-lessons .syllabus-row {
      gap: 0.6rem;
    }
    .chapter-lessons .syllabus-row small {
      flex-shrink: 0;
    }
  }
</style>
