<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { tick } from "svelte";
  import katex from "katex";
  import Diagram from "./Diagram.svelte";
  import { runnableCode } from "$lib/runnable-code";
  import { curriculum, getLesson } from "$lib/content";
  import { getLearner } from "$lib/learner.svelte";
  import { mastered, planPath } from "$lib/engine";
  import { pathChapters, chapterProgress } from "$lib/path-chapters";
  import {
    defaultOrigin,
    lessonHref,
    nextLesson,
    returnDestination,
  } from "$lib/navigation";
  import type { Lesson, Scene } from "$lib/model";
  import { historyDetours, lessonTrail } from "$lib/lesson-detours";
  import Icon from "./Icon.svelte";
  import QuestionCard from "./QuestionCard.svelte";
  import GradientLab from "./GradientLab.svelte";
  import MechanismLab from "./MechanismLab.svelte";
  import Assessment from "./Assessment.svelte";
  import LessonTools from "./LessonTools.svelte";
  import AttentionLab from "./AttentionLab.svelte";
  import WeightLab from "./WeightLab.svelte";
  import PixelLab from "./PixelLab.svelte";
  import SamplingLab from "./SamplingLab.svelte";
  import VisualActivity from "./visuals/VisualActivity.svelte";
  import { termsInText } from "$lib/vocabulary";
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
  const index = $derived(
    Math.max(
      0,
      route.indexOf(lesson.sceneAliases[position.scene] ?? position.scene),
    ),
  );
  const current = $derived(scenes[index]);
  const origin = $derived(position.origin ?? defaultOrigin);
  const pathRecipe = $derived(
    origin.kind === "path"
      ? curriculum.recipes.find((r) => r.id === origin.path)
      : undefined,
  );
  const fullPath = $derived(
    pathRecipe ? planPath(curriculum, pathRecipe, []) : undefined,
  );
  const pathGroups = $derived(fullPath ? pathChapters(fullPath.lessons) : []);
  const chapterIndex = $derived(
    pathGroups.findIndex((chapter) =>
      chapter.lessons.some((item) => item.id === lesson.id),
    ),
  );
  const chapter = $derived(pathGroups[chapterIndex]);
  const chapterEvidence = $derived(
    chapter && fullPath
      ? chapterProgress(
          chapter,
          curriculum,
          fullPath.required,
          learner.data.attempts,
        )
      : undefined,
  );
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
  const detours = $derived(
    historyDetours(
      page.state.lessonTrail,
      lesson.id,
      learner.data.resetAt,
      curriculum,
    ) ?? [],
  );
  const returnTarget = $derived(detours.at(-1));
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
  async function bridge(
    id: string,
    scene: Scene,
    control: "bridge" | "vocabulary" = "bridge",
  ) {
    if (id === lesson.id) return;
    const ancestor = detours.findIndex((frame) => frame.lesson === id);
    if (ancestor >= 0) {
      await returnFromBridge(ancestor);
      return;
    }
    patch({ scene: scene.id });
    const frames = [
      ...detours.slice(-19),
      { lesson: lesson.id, scene: scene.id, control },
    ];
    learner.setDetours(frames);
    await goto(`/learn/${id}/`, {
      state: { lessonTrail: lessonTrail(id, frames, learner.data.resetAt) },
    });
  }
  async function returnFromBridge(index = detours.length - 1) {
    const childId = lesson.id;
    const target = detours[index];
    if (target) {
      const parent = getLesson(target.lesson)!;
      const frames = detours.slice(0, index);
      learner.savePosition(parent.id, parent.routes.core[0], {
        scene: target.scene,
      });
      learner.setDetours(frames);
      await goto(`/learn/${target.lesson}/`, {
        state: {
          lessonTrail: lessonTrail(target.lesson, frames, learner.data.resetAt),
        },
      });
      await tick();
      const control =
        (target.control === "vocabulary"
          ? document.querySelector<HTMLButtonElement>(
              `[data-vocabulary-scene="${target.scene}"][data-vocabulary-lesson="${childId}"]`,
            )
          : document.getElementById(`bridge-${target.scene}-${childId}`)) ??
        document.getElementById("lesson-stage") ??
        document.getElementById(`scene-${target.scene}`);
      const disclosure = control?.closest("details");
      if (disclosure) disclosure.open = true;
      control?.focus();
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
    {#if returnTarget}<button
        class="inline-link"
        onclick={() => returnFromBridge()}
        ><Icon name="left" size={17} />Return to {getLesson(returnTarget.lesson)
          ?.title}</button
      >{:else}<a class="inline-link" href={destination.href}
        ><Icon name="left" size={17} />{destination.label}</a
      >{/if}<span class="small-badge"
      >{lesson.category === "bridge"
        ? "MATH SIDE LESSON"
        : lesson.category === "advanced"
          ? "ADVANCED PREVIEW"
          : `${lesson.archetype.toUpperCase()} · ${lesson.minutes} MIN`}</span
    >
  </div>
  {#if detours.length}<nav
      class="side-lesson-trail"
      aria-label="Side lesson trail"
    >
      <p>
        You’re exploring a side lesson. Return to any earlier step when you’re
        ready.
      </p>
      <ol>
        {#each detours as frame, i (frame.lesson)}<li>
            <button
              aria-label={`Jump back to ${getLesson(frame.lesson)?.title}`}
              onclick={() => returnFromBridge(i)}
              >{getLesson(frame.lesson)?.title}</button
            ><Icon name="arrow" size={14} />
          </li>{/each}
        <li><span aria-current="page">{lesson.title}</span></li>
      </ol>
    </nav>{/if}
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
  {#if pathRecipe && chapter && chapterEvidence}<nav
      class="lesson-momentum"
      aria-label="Learning path progress"
    >
      <a href={`/paths/${pathRecipe.id}/`}
        >{pathRecipe.title} · Chapter {chapterIndex + 1} of {pathGroups.length}</a
      >
      <span
        >{chapterEvidence.demonstrated} of {chapterEvidence.total} ideas demonstrated
        in this chapter</span
      >
      <progress
        max={chapterEvidence.total}
        value={chapterEvidence.demonstrated}
        aria-label="Demonstrated ideas in this chapter"
      ></progress>
      {#if done}<p>
          Your earlier checks already demonstrate this idea. That evidence
          counts across paths; you can revisit the lesson or continue below.
        </p>{/if}
    </nav>{/if}
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
              >Continue
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
      <LessonTools {lesson} />
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
            Explore now, or answer the questions to show what you already
            understand.
          </p>
          {#each prep as id (id)}<a href={lessonHref(id, origin)}
              >{getLesson(id)?.title}<Icon name="chevron" size={13} /></a
            >{/each}
        </details>{/if}
    </aside>
  </div>
</div>

{#snippet sceneContent(scene: Scene)}
  {@const vocabulary = termsInText(
    scene.html +
      " " +
      (scene.takeaway ?? "") +
      " " +
      (scene.type === "assessment"
        ? lesson.questions
            .filter((q) => !q.retired)
            .map((q) => q.prompt + " " + q.options.map((o) => o.text).join(" "))
            .join(" ")
        : ""),
  )}
  {#if vocabulary.length}<details class="lesson-vocabulary">
      <summary>Need a word explained? ({vocabulary.length})</summary>
      <dl>
        {#each vocabulary as term (term.id)}<dt>{term.term}</dt>
          <dd>
            {term.definition}
            {#if term.lesson !== lesson.id}<button
                class="inline-link"
                data-vocabulary-scene={scene.id}
                data-vocabulary-lesson={term.lesson}
                disabled={!learner.hydrated}
                onclick={() => bridge(term.lesson, scene, "vocabulary")}
                >Read lesson: {getLesson(term.lesson)?.title}</button
              >{/if}
          </dd>{/each}
      </dl>
    </details>{/if}
  {#if scene.type === "assessment"}
    {#if scene.takeaway}<section
        class="lesson-takeaway"
        aria-label="Lesson takeaway"
      >
        <h3>The idea to keep</h3>
        <div class="prose">{@html scene.takeaway}</div>
      </section>{/if}
    <Assessment
      {lesson}
      depth={position.depth}
      onreview={(id) => goTo(id && route.includes(id) ? id : route[0])}
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
    {:else}<div class="prose" use:runnableCode={scene.html}>
        {@html scene.html}
      </div>{/if}
    {#if scene.diagram}<Diagram diagram={scene.diagram} />{/if}
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
    {#if scene.figure && (!scene.activity || position.reveals.includes(scene.activity.id))}
      <VisualActivity
        figure={scene.figure}
        values={position.visuals?.[scene.id]?.kind === scene.figure.kind
          ? position.visuals[scene.id].values
          : {}}
        disabled={!learner.hydrated}
        onupdate={(values) =>
          patch({
            visuals: {
              ...position.visuals,
              [scene.id]: { kind: scene.figure!.kind, values },
            },
          })}
      />
    {/if}
    {#if scene.simulation && (!scene.activity || position.reveals.includes(scene.activity.id))}
      {#if scene.simulation === "pixel-encoding"}<PixelLab />
      {:else if scene.simulation === "weighted-rule"}<WeightLab />
      {:else if scene.simulation === "sampling"}<SamplingLab />
      {:else if scene.simulation === "gradient" || scene.simulation === "loss-curve"}<GradientLab
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
  {/if}
  {#if scene.id === finalScene.id}<section
      class="lesson-finish"
      aria-label="Lesson completion"
    >
      <span class="eyebrow">END OF LESSON</span>
      <h3>Continue your learning.</h3>
      <p>
        {returnTarget
          ? "Your original lesson is waiting at the point where you opened this side lesson."
          : "Return to where you started, or continue with the next connection when you are ready."}
      </p>
      <div class="button-row">
        {#if returnTarget}<button
            class="button primary"
            onclick={() => returnFromBridge()}
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
            )}>Next lesson: {following.title}<Icon name="arrow" size={17} /></a
          >{/if}
      </div>
    </section>{/if}
{/snippet}

<style>
  .lesson-momentum {
    display: grid;
    gap: 0.5rem;
    padding: 0.85rem 1rem;
    margin-bottom: 1rem;
    background: #f2f6eb;
    border: 1px solid #d5dfcd;
    border-radius: 8px;
    font-size: 0.8rem;
    line-height: 1.6;
    color: #344e39;
  }
  .lesson-momentum a {
    font-weight: 600;
    color: #31543c;
    text-underline-offset: 3px;
  }
  .lesson-momentum progress {
    width: 100%;
    height: 0.4rem;
    accent-color: #427655;
  }
  .lesson-momentum p {
    margin: 0;
  }
  .side-lesson-trail {
    margin: 0 0 1.4rem;
    padding: 0.9rem 1rem;
    border: 1px solid #cedbc5;
    border-radius: 9px;
    background: #f0f5e8;
    color: #334d32;
  }
  .side-lesson-trail p {
    margin: 0 0 0.55rem;
    font-size: 0.8rem;
    line-height: 1.6;
  }
  .side-lesson-trail ol {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem 0.65rem;
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .side-lesson-trail li {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    min-width: 0;
    max-width: 100%;
  }
  .side-lesson-trail button,
  .side-lesson-trail span {
    font: inherit;
    font-size: 0.8rem;
    line-height: 1.5;
    overflow-wrap: anywhere;
  }
  .side-lesson-trail button {
    border: 0;
    border-radius: 4px;
    background: none;
    padding: 0.4rem 0;
    color: #235239;
    text-decoration: underline;
    text-underline-offset: 3px;
    text-align: left;
    cursor: pointer;
  }
  .side-lesson-trail span {
    padding: 0.4rem 0;
    font-weight: 600;
  }
</style>
