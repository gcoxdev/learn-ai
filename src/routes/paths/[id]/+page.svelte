<script lang="ts">
  import { goto } from "$app/navigation";
  import { curriculum } from "$lib/content";
  import { planPath, mastered } from "$lib/engine";
  import { getLearner } from "$lib/learner.svelte";
  import type { Recipe, Lesson } from "$lib/model";
  import Icon from "$lib/components/Icon.svelte";
  import PathArt from "$lib/components/PathArt.svelte";
  import { lessonHref } from "$lib/navigation";
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
  const next = $derived(
    current.lessons.find((l) =>
      l.objectives.some((id) => current.remaining.includes(id)),
    ),
  );
  const minutes = $derived(
    current.lessons
      .filter((l) => l.objectives.some((id) => current.remaining.includes(id)))
      .reduce((sum, l) => sum + l.minutes, 0),
  );
  function state(lesson: Lesson) {
    const required = curriculum.objectives.filter(
      (o) => lesson.objectives.includes(o.id) && o.scope === "core",
    );
    if (required.every((o) => mastered(o, learner.data.attempts)))
      return "Demonstrated";
    if (!required.some((o) => current.required.includes(o.id)))
      return "Preparation not assigned";
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
        <span><strong>{full.lessons.length}</strong> draft lessons</span><span
          ><strong>{current.mastered.length}</strong> objectives carried forward</span
        ><span
          ><strong>{Math.round(minutes / 5) * 5}</strong> estimated minutes remaining</span
        >
      </div>
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
      {#each full.lessons as lesson, i (lesson.id)}{@const status =
          state(lesson)}<a
          class="syllabus-row"
          href={lessonHref(lesson.id, {
            kind: "path",
            path: data.recipe.id,
          })}
          ><span class={["lesson-number", { done: status === "Demonstrated" }]}
            >{#if status === "Demonstrated"}<Icon
                name="check"
                size={16}
              />{:else}{String(i + 1).padStart(2, "0")}{/if}</span
          >
          <div>
            <strong>{lesson.title}</strong><span
              >{lesson.category === "common"
                ? "Common Ground"
                : lesson.category === "bridge"
                  ? "Math preparation"
                  : lesson.category === "destination"
                    ? "Your system, connected"
                    : "Learning mechanisms"} · {lesson.minutes} min</span
            >
          </div>
          <small>{status}</small><Icon name="chevron" size={17} /></a
        >{/each}
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
      <h4>Explore or place out</h4>
      <p>
        Read any lesson as a preview, or use its knowledge check to demonstrate
        an idea you already understand.
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
