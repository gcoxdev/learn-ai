<script lang="ts">
  import { goto } from "$app/navigation";
  import { tick } from "svelte";
  import katex from "katex";
  import { curriculum, getLesson } from "$lib/content";
  import { getLearner } from "$lib/learner.svelte";
  import { mastered } from "$lib/engine";
  import {
    defaultOrigin,
    lessonHref,
    nextLesson,
    returnDestination,
  } from "$lib/navigation";
  import type { Lesson, Scene } from "$lib/model";
  import Icon from "./Icon.svelte";
  import QuestionCard from "./QuestionCard.svelte";
  import GradientLab from "./GradientLab.svelte";
  import MechanismLab from "./MechanismLab.svelte";
  import Assessment from "./Assessment.svelte";
  import AttentionLab from "./AttentionLab.svelte";
  let { lesson }: { lesson: Lesson } = $props();
  const learner = getLearner();
  const position = $derived(learner.position(lesson.id, lesson.routes.core[0]));
  const route = $derived(
    position.depth === "mathematics" && lesson.routes.mathematics.length
      ? lesson.routes.mathematics
      : lesson.routes.core,
  );
  const scenes = $derived(
    route.map((id) => lesson.scenes.find((s) => s.id === id)!),
  );
  const index = $derived(Math.max(0, route.indexOf(position.scene)));
  const current = $derived(scenes[index]);
  const origin = $derived(position.origin ?? defaultOrigin);
  const destination = $derived(returnDestination(origin));
  const following = $derived(
    nextLesson(curriculum, lesson, origin, learner.data),
  );
  const finalScene = $derived(scenes.at(-1)!);
  const scopeObjectives = $derived(
    curriculum.objectives.filter(
      (o) => lesson.objectives.includes(o.id) && o.scope === "core",
    ),
  );
  const done = $derived(
    scopeObjectives.every((o) => mastered(o, learner.data.attempts)),
  );
  const returnTarget = $derived(
    lesson.category === "bridge" ? learner.data.detours.at(-1) : undefined,
  );
  const prep = $derived(
    [
      ...new Set(
        scopeObjectives.flatMap((o) =>
          o.prerequisites
            .filter(
              (g) =>
                !g.anyOf.some((id) =>
                  mastered(
                    curriculum.objectives.find((p) => p.id === id)!,
                    learner.data.attempts,
                  ),
                ),
            )
            .map(
              (g) =>
                curriculum.objectives.find((p) => p.id === g.anyOf[0])!.lesson,
            ),
        ),
      ),
    ].filter((id) => id !== lesson.id),
  );
  function patch(change: Parameters<typeof learner.savePosition>[2]) {
    learner.savePosition(lesson.id, lesson.routes.core[0], change);
  }
  async function goTo(id: string) {
    patch({ scene: id, activeQuestion: undefined });
    await tick();
    document
      .getElementById(position.mode === "text" ? `scene-${id}` : "lesson-stage")
      ?.focus();
  }
  async function bridge(id: string, scene: Scene) {
    patch({ scene: scene.id });
    learner.pushDetour(lesson.id, scene.id);
    await goto(`/learn/${id}/`);
  }
  async function returnFromBridge() {
    const childId = lesson.id;
    const target = learner.popDetour();
    if (target) {
      await goto(`/learn/${target.lesson}/`);
      await tick();
      (
        document.getElementById(`bridge-${target.scene}-${childId}`) ??
        document.getElementById("lesson-stage")
      )?.focus();
    }
  }
  function checkKnowledge() {
    const scene = lesson.scenes.find((s) => s.type === "assessment")!;
    patch({ mode: "slides", scene: scene.id });
  }
  function switchDepth() {
    const next = position.depth === "core" ? "mathematics" : "core";
    const nextRoute =
      next === "core" ? lesson.routes.core : lesson.routes.mathematics;
    patch({
      depth: next,
      scene: nextRoute.includes(current.id) ? current.id : "s05-slope",
      activeQuestion: undefined,
    });
  }
  function equation(latex: string) {
    return katex.renderToString(latex, {
      output: "htmlAndMathml",
      throwOnError: false,
      trust: false,
      displayMode: true,
    });
  }
</script>

<div class="page-content classroom-page">
  <div class="classroom-breadcrumb">
    {#if returnTarget}<button class="inline-link" onclick={returnFromBridge}
        ><Icon name="left" size={17} />Return to {getLesson(returnTarget.lesson)
          ?.title}</button
      >{:else}<a class="inline-link" href={destination.href}
        ><Icon name="left" size={17} />{destination.label}</a
      >{/if}<span class="small-badge"
      >{lesson.category === "bridge"
        ? "MATH SIDE LESSON"
        : lesson.category === "advanced"
          ? "ADVANCED PREVIEW"
          : "DRAFT LESSON"}</span
    >
  </div>
  <div class="lesson-heading">
    <div>
      <span class="eyebrow"
        >{lesson.slot} <span aria-hidden="true">/</span>
        {lesson.category === "common"
          ? "COMMON GROUND"
          : lesson.category === "bridge"
            ? "A SMALL STEP SIDEWAYS"
            : "CONNECT THE MECHANISM"}</span
      >
      <h1>{lesson.title}</h1>
      <p>{lesson.summary}</p>
    </div>
    <button
      class="icon-button bookmark-button"
      aria-label={learner.data.bookmarks.includes(lesson.id)
        ? "Remove saved lesson"
        : "Save lesson"}
      aria-pressed={learner.data.bookmarks.includes(lesson.id)}
      disabled={!learner.hydrated}
      onclick={() => learner.bookmark(lesson.id)}
      ><Icon name="bookmark" size={23} /></button
    >
  </div>
  <div class="lesson-toolbar">
    <div class="segmented" aria-label="Reading mode">
      <button
        class={{ active: position.mode === "slides" }}
        aria-pressed={position.mode === "slides"}
        disabled={!learner.hydrated}
        onclick={() => patch({ mode: "slides" })}
        ><Icon name="layers" size={16} />Presentation</button
      ><button
        class={{ active: position.mode === "text" }}
        aria-pressed={position.mode === "text"}
        disabled={!learner.hydrated}
        onclick={() => patch({ mode: "text" })}
        ><Icon name="list" size={16} />Read as a page</button
      >
    </div>
    <div class="toolbar-right">
      {#if lesson.routes.mathematics.length}<button
          class="button ghost small"
          aria-pressed={position.depth === "mathematics"}
          disabled={!learner.hydrated}
          onclick={switchDepth}
          >{position.depth === "mathematics"
            ? "Back to core view"
            : "Include the mathematics"}</button
        >{/if}<button
        class="text-button"
        disabled={!learner.hydrated}
        onclick={checkKnowledge}
        >{done ? "View mastery" : "Check my knowledge"}<Icon
          name="arrow"
          size={15}
        /></button
      >
    </div>
  </div>
  {#if position.depth === "mathematics"}<div class="math-notice">
      <Icon name="info" size={17} />
      <p>
        The mathematics extension adds the formal calculation. Its checks are
        practice-only in this prototype; your compatible core evidence stays
        intact. <button
          class="inline-link"
          onclick={() => bridge("derivatives", current)}
          >Derivative preparation</button
        >
        ·
        <button
          class="inline-link"
          onclick={() => bridge("chain-rule", current)}>Chain rule</button
        >
      </p>
    </div>{/if}
  <div class="lesson-layout">
    <div class="lesson-main">
      {#if position.mode === "slides"}
        <article class="lesson-stage" id="lesson-stage" tabindex="-1">
          <div class="scene-kicker">
            <span
              >IDEA {String(index + 1).padStart(2, "0")} OF {scenes.length}</span
            ><span
              ><Icon name="clock" size={14} />{lesson.minutes} min lesson</span
            >
          </div>
          <h2>{current.title}</h2>
          {@render sceneContent(current)}
        </article>
        <div class="slide-navigation">
          <button
            class="button secondary"
            disabled={index === 0 || !learner.hydrated}
            onclick={() => goTo(scenes[index - 1].id)}
            ><Icon name="left" size={17} />Previous</button
          >
          <div class="scene-dots" aria-label="Scene navigation">
            {#each scenes as scene, i (scene.id)}<button
                class={{ active: i === index }}
                aria-label={`Scene ${i + 1}: ${scene.title}`}
                aria-current={i === index ? "step" : undefined}
                disabled={!learner.hydrated}
                onclick={() => goTo(scene.id)}
              ></button>{/each}
          </div>
          {#if index < scenes.length - 1}<button
              class="button primary"
              disabled={!learner.hydrated}
              onclick={() => goTo(scenes[index + 1].id)}
              >{current.type === "assessment" ? "Final thought" : "Continue"}
              <Icon name="arrow" size={17} /></button
            >{/if}
        </div>
      {:else}
        <div class="reading-page">
          {#each scenes as scene, i (scene.id)}<article
              id={`scene-${scene.id}`}
              tabindex="-1"
            >
              <span class="eyebrow">IDEA {String(i + 1).padStart(2, "0")}</span>
              <h2>{scene.title}</h2>
              {@render sceneContent(scene)}
            </article>{/each}
        </div>
      {/if}
      <div class="lesson-sources">
        <span class="eyebrow">GO TO THE SOURCE</span>
        <p>Original explanations, connected to the research.</p>
        {#each lesson.sources as source (source.url)}<a
            href={source.url}
            target="_blank"
            rel="noreferrer">{source.title}<Icon name="external" size={14} /></a
          >{/each}
      </div>
    </div>
    <aside class="lesson-outline">
      <span class="eyebrow">IN THIS LESSON</span>
      <ol>
        {#each scenes as scene, i (scene.id)}<li>
            <button
              class={{ active: i === index }}
              disabled={!learner.hydrated}
              onclick={() => goTo(scene.id)}
              ><span>{String(i + 1).padStart(2, "0")}</span
              >{scene.title}</button
            >
          </li>{/each}
      </ol>
      <div class="outline-note">
        <Icon name="spark" size={21} />
        <h3>Take the side road.</h3>
        <p>
          If a bit of math feels unfamiliar, open a side lesson. We’ll keep your
          place here.
        </p>
      </div>
      {#if prep.length && !done}<details class="preparation">
          <summary>Suggested preparation</summary>
          <p>
            You can explore freely or place out through the knowledge check.
          </p>
          {#each prep as id (id)}<a href={lessonHref(id, origin)}
              >{getLesson(id)?.title}<Icon name="chevron" size={13} /></a
            >{/each}
        </details>{/if}
    </aside>
  </div>
</div>

{#snippet sceneContent(scene: Scene)}
  {#if scene.type === "assessment"}
    <Assessment
      {lesson}
      depth={position.depth}
      onreview={(id) => goTo(id && route.includes(id) ? id : route[0])}
      onfinish={() => goTo(finalScene.id)}
    />
  {:else}
    {#if scene.activity}
      {#if scene.id === "s08-repeat" && !position.reveals.includes(scene.activity.id)}<div
          class="table-scroll"
        >
          <table>
            <caption
              >Reference run so far: input 2, target 6, learning rate 0.1</caption
            ><thead
              ><tr
                ><th>Step</th><th>Weight</th><th>Prediction</th><th>Loss</th><th
                  >Gradient</th
                ></tr
              ></thead
            ><tbody
              ><tr
                ><th scope="row">0</th><td>0</td><td>0</td><td>36</td><td
                  >−24</td
                ></tr
              ><tr
                ><th scope="row">1</th><td>2.4</td><td>4.8</td><td>1.44</td><td
                  >−4.8</td
                ></tr
              ></tbody
            >
          </table>
        </div>{/if}
      {#if position.reveals.includes(scene.activity.id)}<div class="prose">
          <p>{scene.activity.feedback}</p>
        </div>{:else}{#key scene.id}<QuestionCard
            question={scene.activity}
            practice
            responses={position.drafts[scene.activity.id] ?? {}}
            onchange={(r) =>
              learner.draft(
                lesson.id,
                lesson.routes.core[0],
                scene.activity!.id,
                r,
              )}
            onanswer={() => {
              learner.reveal(
                lesson.id,
                lesson.routes.core[0],
                scene.activity!.id,
              );
              if (scene.id === "s08-repeat")
                patch({
                  simulation: { rate: 0.1, initialWeight: 0, steps: 1 },
                });
            }}
          />{/key}{/if}
    {:else}<div class="prose">{@html scene.html}</div>{/if}
    {#if scene.id === lesson.routes.core[0] && lesson.entryChecks.length}<details
        class="entry-check"
      >
        <summary>Check these three starting skills</summary>
        <p>Short preparation checks. These are practice, not mastery gates.</p>
        {#each lesson.entryChecks as q (q.id)}{#if position.reveals.includes(q.id)}<div
              class="hint-box"
            >
              <strong>{q.prompt}</strong>
              <p>{q.feedback}</p>
            </div>{:else}<QuestionCard
              question={q}
              practice
              responses={position.drafts[q.id] ?? {}}
              onchange={(r) =>
                learner.draft(lesson.id, lesson.routes.core[0], q.id, r)}
              onanswer={() =>
                learner.reveal(lesson.id, lesson.routes.core[0], q.id)}
            />{/if}{/each}<button
          class="inline-link"
          onclick={() => bridge("arithmetic", scene)}
          >Open the arithmetic side lesson</button
        >
      </details>{/if}
    {#if scene.equation}<div class="equation-block">
        {@html equation(scene.equation.latex)}
        <p>{scene.equation.reading}</p>
        <details>
          <summary>What the symbols mean</summary>
          <dl>
            {#each Object.entries(scene.equation.symbols) as [symbol, meaning] (symbol)}<dt
              >
                {symbol}
              </dt>
              <dd>{meaning}</dd>{/each}
          </dl>
        </details>
      </div>{/if}
    {#if scene.table}<div class="table-scroll">
        <table>
          <caption>{scene.title}: worked values</caption><thead
            ><tr
              >{#each scene.table.columns as column (column)}<th
                  >{column.replaceAll("_", " ")}</th
                >{/each}</tr
            ></thead
          ><tbody
            >{#each scene.table.rows as row (JSON.stringify(row))}<tr
                >{#each row as value, c (scene.table.columns[c])}<td>{value}</td
                  >{/each}</tr
              >{/each}</tbody
          >
        </table>
      </div>{/if}
    {#if scene.simulation && (!scene.activity || position.reveals.includes(scene.activity.id))}
      {#if scene.simulation === "gradient" || scene.simulation === "loss-curve"}<GradientLab
          rate={position.simulation?.rate ?? 0.1}
          initialWeight={position.simulation?.initialWeight ?? 0}
          steps={position.simulation?.steps ?? 0}
          curveOnly={scene.simulation === "loss-curve"}
          onupdate={(simulation) => patch({ simulation })}
        />{:else if scene.simulation === "attention"}<AttentionLab
          state={position.attention}
          onupdate={(attention) => patch({ attention })}
        />{:else}<MechanismLab type={scene.simulation} />{/if}
    {/if}
    {#if scene.bridges.length}<div class="bridge-links">
        <span><Icon name="spark" size={17} />A useful side lesson</span
        >{#each scene.bridges as id (id)}<button
            id={`bridge-${scene.id}-${id}`}
            disabled={!learner.hydrated}
            onclick={() => bridge(id, scene)}
            >{getLesson(id)?.title}<Icon name="arrow" size={15} /></button
          >{/each}
      </div>{/if}
    {#if scene.type === "recap"}<div class="recap-card">
        <Icon name={done ? "check" : "book"} size={24} />
        <div>
          <strong
            >{done
              ? "This understanding carries forward."
              : "Reading and mastery are different steps."}</strong
          >
          <p>
            {done
              ? "Your compatible core evidence will be reused on other paths."
              : "Use the knowledge check to demonstrate the scoped objectives. Exploring the slides alone does not award mastery."}
          </p>
        </div>
      </div>{/if}
    {#if scene.id === finalScene.id}<section
        class="lesson-finish"
        aria-label="Lesson completion"
      >
        <span class="eyebrow">END OF LESSON</span>
        <h3>Take this idea with you.</h3>
        <p>
          {returnTarget
            ? "Your original lesson is waiting at the point where you opened this side lesson."
            : "You’ve reached the final thought. Return to where you started, or follow the next connection."}
        </p>
        <div class="button-row">
          {#if returnTarget}<button
              class="button primary"
              onclick={returnFromBridge}
              >Return to {getLesson(returnTarget.lesson)?.title}<Icon
                name="arrow"
                size={17}
              /></button
            >
          {:else}<a class="button primary" href={destination.href}
              >{destination.label}<Icon name="arrow" size={17} /></a
            >{/if}
          {#if following && !returnTarget && (origin.kind !== "path" || done)}<a
              class="button secondary"
              href={lessonHref(
                following.id,
                origin.kind === "library"
                  ? { ...origin, module: following.slot.split(".")[0] }
                  : origin,
              )}
              >Next lesson: {following.title}<Icon name="arrow" size={17} /></a
            >{/if}
        </div>
        {#if !done}<button class="text-button" onclick={checkKnowledge}
            >Revisit the knowledge check</button
          >{/if}
      </section>{/if}
  {/if}
{/snippet}
