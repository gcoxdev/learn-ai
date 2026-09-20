<script lang="ts">
  import { page } from "$app/state";
  import { curriculum } from "$lib/content";
  import { vocabulary } from "$lib/vocabulary";
  import { getLearner } from "$lib/learner.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import { lessonHref } from "$lib/navigation";
  const learner = getLearner();
  const view = $derived(
    learner.hydrated
      ? (page.url.searchParams.get("view") ?? "lessons")
      : "lessons",
  );
  let filter = $state<{ url: string; value: string } | null>(null);
  const search = $derived(
    learner.hydrated
      ? filter?.url === page.url.href
        ? filter.value
        : (page.url.searchParams.get("q") ?? "")
      : "",
  );
  const query = $derived(search.trim().toLowerCase());
  const lessons = $derived(
    curriculum.lessons.filter((l) =>
      `${l.title} ${l.summary} ${l.slot}`.toLowerCase().includes(query),
    ),
  );
  const modules = $derived(
    curriculum.catalog.filter((m) =>
      `${m.id} ${m.title} ${m.lessons.join(" ")}`.toLowerCase().includes(query),
    ),
  );
  const terms = vocabulary.map((t) => [t.term, t.definition, t.lesson]);
  const glossary = $derived(
    terms.filter((t) => `${t[0]} ${t[1]}`.toLowerCase().includes(query)),
  );
  function published(slot: string) {
    return curriculum.lessons.find((l) => l.slot === slot);
  }
</script>

<svelte:head><title>The library · Learn AI</title></svelte:head>
<div class="page-content">
  <div class="page-title">
    <span class="eyebrow">FOLLOW YOUR CURIOSITY</span>
    <h1>A place for every connection.</h1>
    <p>
      Explore the full draft curriculum, find a definition, or return to the
      next connection in your learning.
    </p>
  </div>
  <div class="library-controls">
    <nav class="segmented" aria-label="Library views">
      {#each [["lessons", "Draft lessons"], ["curriculum", "Full curriculum"], ["glossary", "Glossary"]] as tab (tab[0])}<a
          class={["button ghost small", view === tab[0] && "active"]}
          href={`/library/?view=${tab[0]}`}
          aria-current={view === tab[0] ? "page" : undefined}>{tab[1]}</a
        >{/each}
    </nav>
    <label class="filter-input"
      ><Icon name="search" size={17} /><input
        aria-label="Filter library"
        placeholder="Find an idea…"
        value={search}
        oninput={(event) =>
          (filter = { url: page.url.href, value: event.currentTarget.value })}
      /></label
    >
  </div>
  {#if view === "curriculum"}
    <p class="scope-caption">
      {curriculum.catalog.length} modules · {curriculum.catalog.reduce(
        (n, m) => n + m.lessons.length,
        0,
      )}
      main lessons · 23 math and programming side lessons. Every lesson has an initial
      draft with explanations and knowledge checks.
    </p>
    <div class="curriculum-list">
      {#each modules as module (module.id)}<details
          id={module.id}
          class="curriculum-module"
          open={page.url.hash === `#${module.id}`}
        >
          <summary
            ><span>{module.id}</span>{module.title}<small
              >{module.lessons.length} draft lessons</small
            ></summary
          >
          <ol>
            {#each module.lessons as title, index (title)}{@const lesson =
                published(`${module.id}.${index + 1}`)}
              <li>
                {#if lesson}<a
                    href={lessonHref(lesson.id, {
                      kind: "library",
                      view: "curriculum",
                      query: search,
                      module: module.id,
                    })}
                    >{title}
                    <span class="small-badge"
                      >{learner.data.lastLesson === lesson.id
                        ? "LAST VISITED"
                        : "DRAFT AVAILABLE"}</span
                    ></a
                  >{:else}<span>{title}</span>
                  <small class="muted">Unavailable</small>{/if}
              </li>{/each}
          </ol>
        </details>{/each}
    </div>
  {:else if view === "glossary"}
    <div class="glossary-grid">
      {#each glossary as term (term[0])}<article class="glossary-entry">
          <h3>{term[0]}</h3>
          <p>{term[1]}</p>
          <a
            class="inline-link"
            href={lessonHref(term[2], {
              kind: "library",
              view: "glossary",
              query: search,
            })}>See it in context <Icon name="arrow" size={15} /></a
          >
        </article>{/each}
    </div>
  {:else}
    <p class="scope-caption">
      {lessons.length} draft lessons · Core knowledge checks track personal study.
      Formal mathematics extensions and the A01 MoE preview are uncredited practice.
      Project artifacts need separate self or peer review.
    </p>
    <div class="library-grid">
      {#each lessons as lesson (lesson.id)}<a
          class="library-card"
          href={lessonHref(lesson.id, {
            kind: "library",
            view: "lessons",
            query: search,
          })}
          ><span class="eyebrow">{lesson.slot} · {lesson.category}</span>
          <h3>{lesson.title}</h3>
          <p>{lesson.summary}</p>
          <footer>
            <span>{lesson.minutes} min estimate</span><span
              >{learner.data.bookmarks.includes(lesson.id)
                ? "Saved lesson"
                : "Explore lesson"}
              <Icon name="arrow" size={15} /></span
            >
          </footer></a
        >{/each}
    </div>
  {/if}
  {#if (view === "curriculum" ? modules : view === "glossary" ? glossary : lessons).length === 0}<div
      class="empty-state"
    >
      <h2>No matching ideas yet.</h2>
      <p>Try a broader term such as “learning”, “data”, or “gradient”.</p>
    </div>{/if}
  <section id="how-it-works" class="how-it-works">
    <span class="eyebrow">HOW LEARNING WORKS</span>
    <h2>Small steps. Lasting understanding.</h2>
    <div class="how-grid">
      <article>
        <h3>Start with a system.</h3>
        <p>
          Choose a system such as video, speech, robotics, or prediction. Your
          path starts with shared foundations and builds toward modern system
          lifecycles.
        </p>
      </article>
      <article>
        <h3>Take a math side lesson.</h3>
        <p>
          Open an explanation when you need it, then return to your saved place.
          The gradient lesson also includes an optional formal mathematics view.
        </p>
      </article>
      <article>
        <h3>Carry your evidence forward.</h3>
        <p>
          Two varied, fresh, unassisted checks demonstrate each core objective.
          The same compatible evidence counts across paths. Simply reading a
          lesson does not award mastery.
        </p>
      </article>
    </div>
    <p class="draft-note">
      This private prototype contains the initial curriculum draft. Its content
      and assessments are drafts awaiting independent subject and teaching
      review. Estimates are editorial, not measured learner times.
    </p>
  </section>
</div>
