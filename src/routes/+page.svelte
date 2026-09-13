<script lang="ts">
  import { curriculum, recipes, getLesson } from "$lib/content";
  import { getLearner } from "$lib/learner.svelte";
  import { mastered, planPath } from "$lib/engine";
  import { lessonHref } from "$lib/navigation";
  import Icon from "$lib/components/Icon.svelte";
  import PathArt from "$lib/components/PathArt.svelte";
  const learner = getLearner();
  const resume = $derived(
    learner.data.lastLesson ? getLesson(learner.data.lastLesson) : undefined,
  );
  const count = $derived(
    curriculum.objectives.filter((o) => mastered(o, learner.data.attempts))
      .length,
  );
  const shared = ["ai-systems", "history", "learning-update"];
</script>

<svelte:head><title>Learn AI — Start with curiosity</title></svelte:head>
<div class="page-content home-page">
  <section class="home-hero">
    <div>
      <div class="eyebrow hero-eyebrow"><span></span>START WITH CURIOSITY</div>
      <h1>Big ideas.<br /><em>Made understandable.</em></h1>
      <p>
        Learn how AI really works, from the first principles to the systems
        shaping our world. One connected idea at a time.
      </p>
      <div class="hero-points">
        <span><Icon name="check" size={15} />No math background needed</span
        ><span><Icon name="check" size={15} />Go as deep as you like</span>
      </div>
    </div>
    <div class="hero-art" aria-hidden="true">
      <svg viewBox="0 0 380 300" fill="none"
        ><circle
          cx="190"
          cy="143"
          r="115"
          stroke="#d5dcd0"
          stroke-dasharray="3 8"
        /><circle cx="190" cy="143" r="79" stroke="#d5dcd0" /><path
          d="M79 114 143 69l88 18 70 91-95 61-103-35-24-90Z"
          stroke="#90a38a"
        /><path
          d="m143 69 63 170M79 114l222 64M103 204 231 87M190 143l-47-74M190 143l16 96"
          stroke="#bcc9b4"
        /><circle cx="190" cy="143" r="42" fill="#193c32" /><path
          d="M190 121v44m-22-22h44m-37-15 30 30m-30 0 30-30"
          stroke="#d6eba4"
          stroke-width="3"
          stroke-linecap="round"
        />{#each [{ x: 79, y: 114 }, { x: 143, y: 69 }, { x: 231, y: 87 }, { x: 301, y: 178 }, { x: 206, y: 239 }, { x: 103, y: 204 }] as dot (dot.x)}<circle
            cx={dot.x}
            cy={dot.y}
            r="8"
            fill="#f7f7ee"
            stroke="#658563"
            stroke-width="2"
          />{/each}<rect
          x="0"
          y="233"
          width="144"
          height="34"
          rx="7"
          fill="#fff"
          stroke="#e0e3d9"
        /><text x="15" y="255" fill="#486046">foundations → possibilities</text
        ><rect
          x="251"
          y="34"
          width="114"
          height="34"
          rx="7"
          fill="#e4eadc"
        /><text x="267" y="56" fill="#486046">everything connects</text></svg
      >
    </div>
  </section>
  {#if resume}<a
      class="resume-strip"
      href={lessonHref(
        resume.id,
        learner.data.positions[resume.id]?.origin ?? { kind: "home" },
      )}
      ><span class="resume-icon"><Icon name="play" /></span>
      <div>
        <span class="eyebrow">PICK UP WHERE YOU LEFT OFF</span><strong
          >{resume.title}</strong
        >
      </div>
      <span class="resume-progress"
        >{count} objective{count === 1 ? "" : "s"} demonstrated</span
      ><Icon name="arrow" /></a
    >{/if}
  <section class="path-section">
    <div class="section-heading">
      <div>
        <span class="eyebrow">01 / CHOOSE YOUR DIRECTION</span>
        <h2>What are you curious about?</h2>
      </div>
      <span class="section-aside">Choose a system. We’ll connect the dots.</span
      >
    </div>
    <div class="path-grid">
      {#each recipes as recipe (recipe.id)}{@const plan = planPath(
          curriculum,
          recipe,
          [],
        )}<a class="path-card" href={`/paths/${recipe.id}/`}
          ><PathArt type={recipe.id} />
          <div class="path-card-body">
            <div class="path-card-top">
              <span class={["topic-icon", recipe.color]}
                ><Icon
                  name={recipe.id === "language" ? "chat" : "image"}
                  size={21}
                /></span
              ><span class="small-badge">GUIDED DRAFT COURSE</span>
            </div>
            <h3>{recipe.title}</h3>
            <p>
              {recipe.id === "language"
                ? "How does a model turn a few words into a whole response?"
                : "How does a model turn random noise into an image?"}
            </p>
            <div class="path-meta">
              <span
                ><Icon name="book" size={15} />{plan.lessons.length} lessons</span
              ><span><Icon name="layers" size={15} />Foundations first</span>
            </div>
            <div class="path-card-footer">
              <span>Explore this path</span><Icon name="arrow" size={20} />
            </div>
          </div></a
        >{/each}
    </div>
    <p class="scope-caption">
      <span class="status-dot"></span>Two guided courses, with shared
      foundations. Explore all 38 modules, math side lessons, and projects in
      the
      <a href="/library/?view=curriculum">full draft curriculum</a>.
    </p>
  </section>
  <section class="foundation-section">
    <div class="section-heading">
      <div>
        <span class="eyebrow">02 / A LITTLE COMMON GROUND</span>
        <h2>Different paths. Shared foundations.</h2>
      </div>
      <a href="/library/" class="inline-link"
        >Browse the library <Icon name="arrow" size={16} /></a
      >
    </div>
    <div class="foundation-grid">
      {#each shared as id, i (id)}{@const lesson = getLesson(id)!}<a
          class="foundation-card"
          href={lessonHref(id, { kind: "home" })}
          ><span class="foundation-number">0{i + 1}</span>
          <div>
            <h3>{lesson.title}</h3>
            <p>
              {id === "ai-systems"
                ? "Get a clear picture of what AI is—and the questions worth asking."
                : id === "history"
                  ? "Meet the research traditions that brought us here."
                  : "Change a weight. Watch a prediction improve. See why."}
            </p>
            <span
              >{lesson.minutes} min <span aria-hidden="true">·</span>
              {id === "learning-update"
                ? "Interactive experiment"
                : "Shared foundation"}</span
            >
          </div>
          <Icon name="arrow" size={17} /></a
        >{/each}
    </div>
  </section>
  <section class="learning-promise">
    <span class="promise-symbol" aria-hidden="true">↗</span>
    <div>
      <h3>Your understanding carries forward.</h3>
      <p>
        What you demonstrate in one path counts in the next. Explore a new
        system without repeating foundations you already know.
      </p>
    </div>
    <a class="button secondary" href="/library/#how-it-works"
      >How it works <Icon name="arrow" size={16} /></a
    >
  </section>
</div>
