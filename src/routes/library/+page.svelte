<script lang="ts">
  import { page } from "$app/state";
  import { afterNavigate, goto } from "$app/navigation";
  import { curriculum } from "$lib/content";
  import { vocabulary } from "$lib/vocabulary";
  import { getLearner } from "$lib/learner.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import { lessonHref } from "$lib/navigation";
  import {
    archetypeOptions,
    evidenceOptions,
    filterLessons,
    lessonEvidence,
    libraryHref,
    paginateLessons,
    readLibraryState,
    timeOptions,
    type LibraryState,
  } from "$lib/library-search";
  const learner = getLearner();
  let draft = $state.raw<LibraryState | null>(null);
  const filters = $derived(
    draft ??
      (learner.hydrated
        ? readLibraryState(page.url.searchParams)
        : readLibraryState(new URLSearchParams())),
  );
  const view = $derived(filters.view);
  const search = $derived(filters.query);
  const query = $derived(search.trim().toLowerCase());
  const evidence = $derived(lessonEvidence(curriculum, learner.data.attempts));
  const lessons = $derived(
    filterLessons(curriculum.lessons, filters, evidence),
  );
  const results = $derived(paginateLessons(lessons, filters.page));
  const activeFilters = $derived(
    Boolean(
      search ||
      filters.moduleFilter ||
      filters.time ||
      filters.archetype ||
      filters.evidence,
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
  afterNavigate(({ type }) => {
    if (type !== "goto") draft = null;
  });

  function update(changes: Partial<LibraryState>) {
    const next = { ...filters, ...changes, page: undefined };
    // Render immediately while Kit commits the URL. A later edit supersedes
    // this navigation, so only the latest completion may clear its draft.
    draft = next;
    const settled = () => {
      if (draft === next) draft = null;
    };
    void goto(libraryHref(next), {
      replaceState: true,
      keepFocus: true,
      noScroll: true,
    }).then(settled, settled);
  }
  function facet(name: string, value: string) {
    const params = new URL(libraryHref(filters), page.url).searchParams;
    value ? params.set(name, value) : params.delete(name);
    update(readLibraryState(params));
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
      {#each [["lessons", "Lessons"], ["curriculum", "Full curriculum"], ["glossary", "Glossary"]] as tab (tab[0])}<a
          class={["button ghost small", view === tab[0] && "active"]}
          href={libraryHref({
            ...filters,
            view: tab[0] as LibraryState["view"],
            page: undefined,
          })}
          aria-current={view === tab[0] ? "page" : undefined}>{tab[1]}</a
        >{/each}
    </nav>
    <label class="filter-input"
      ><Icon name="search" size={17} /><input
        aria-label="Filter library"
        placeholder="Find an idea…"
        maxlength="500"
        value={search}
        oninput={(event) => update({ query: event.currentTarget.value })}
      /></label
    >
  </div>
  {#if view === "lessons"}
    <div class="library-facets" role="group" aria-label="Filter draft lessons">
      <label
        >Module
        <select
          aria-label="Module"
          value={filters.moduleFilter ?? ""}
          onchange={(event) => facet("module", event.currentTarget.value)}
        >
          <option value="">All modules</option>
          {#each curriculum.catalog as module (module.id)}
            <option value={module.id}>{module.id} · {module.title}</option>
          {/each}
          <option value="bridges">Math and programming side lessons</option>
          <option value="advanced">Advanced previews</option>
        </select>
      </label>
      <label
        >Estimated time
        <select
          aria-label="Estimated time"
          value={filters.time ?? ""}
          onchange={(event) => facet("time", event.currentTarget.value)}
        >
          <option value="">Any length</option>
          {#each timeOptions as option (option.value)}<option
              value={option.value}>{option.label}</option
            >{/each}
        </select>
      </label>
      <label
        >Lesson type
        <select
          aria-label="Lesson type"
          value={filters.archetype ?? ""}
          onchange={(event) => facet("archetype", event.currentTarget.value)}
        >
          <option value="">All types</option>
          {#each archetypeOptions as option (option.value)}<option
              value={option.value}>{option.label}</option
            >{/each}
        </select>
      </label>
      <label
        >Evidence
        <select
          aria-label="Evidence"
          value={filters.evidence ?? ""}
          onchange={(event) => facet("evidence", event.currentTarget.value)}
        >
          <option value="">All evidence states</option>
          {#each evidenceOptions as option (option.value)}<option
              value={option.value}>{option.label}</option
            >{/each}
        </select>
      </label>
    </div>
  {/if}
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
                      ...filters,
                      view: "curriculum",
                      query: search,
                      module: module.id,
                    })}
                    >{title}
                    <span class="small-badge"
                      >{learner.data.lastLesson === lesson.id
                        ? "LAST VISITED"
                        : "OPEN"}</span
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
              ...filters,
              view: "glossary",
              query: search,
            })}>See it in context <Icon name="arrow" size={15} /></a
          >
        </article>{/each}
    </div>
  {:else}
    <div class="library-result-bar">
      <p role="status" aria-live="polite">
        {#if lessons.length}Showing {results.start + 1}–{results.start +
            results.lessons.length} of {lessons.length} draft lessons{:else}0
          draft lessons{/if}
      </p>
      {#if activeFilters}<button
          class="button ghost small"
          onclick={() =>
            update({
              query: "",
              moduleFilter: undefined,
              time: undefined,
              archetype: undefined,
              evidence: undefined,
            })}>Clear filters</button
        >{/if}
    </div>
    <p class="scope-caption">
      Core knowledge checks track personal study. Formal mathematics extensions
      and the A01 MoE preview are uncredited practice. Project artifacts need
      separate self or peer review.
    </p>
    <div class="library-grid">
      {#each results.lessons as lesson (lesson.id)}<a
          class="library-card"
          href={lessonHref(lesson.id, {
            kind: "library",
            ...filters,
            page: results.page > 1 ? results.page : undefined,
          })}
          ><span class="eyebrow">{lesson.slot} · {lesson.category}</span>
          <h3>{lesson.title}</h3>
          <p>{lesson.summary}</p>
          <span class="lesson-evidence"
            >{evidenceOptions.find(
              (option) => option.value === evidence.get(lesson.id),
            )?.label}</span
          >
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
    {#if results.pages > 1}
      <nav class="library-pagination" aria-label="Lesson library pages">
        {#if results.page > 1}<a
            class="button secondary small"
            href={libraryHref({ ...filters, page: results.page - 1 })}
            >Previous page</a
          >{/if}
        <span>Page {results.page} of {results.pages}</span>
        {#if results.page < results.pages}<a
            class="button secondary small"
            href={libraryHref({ ...filters, page: results.page + 1 })}
            >Next page</a
          >{/if}
      </nav>
    {/if}
  {/if}
  {#if (view === "curriculum" ? modules : view === "glossary" ? glossary : lessons).length === 0}<div
      class="empty-state"
    >
      <h2>No matching ideas yet.</h2>
      <p>
        Try a broader term such as “learning”, “data”, or “gradient”{view ===
        "lessons"
          ? ", or clear a filter."
          : "."}
      </p>
    </div>{/if}
</div>

<style>
  .library-facets {
    display: grid;
    grid-template-columns: minmax(0, 1.5fr) repeat(3, minmax(0, 1fr));
    gap: 14px;
    margin-bottom: 20px;
  }
  .library-facets label {
    display: grid;
    gap: 8px;
    min-width: 0;
    color: var(--muted);
    font-size: 12px;
  }
  .library-facets select {
    width: 100%;
    min-width: 0;
    min-height: 42px;
    padding: 8px 10px;
    border: 1px solid #d8e2cc;
    border-radius: 6px;
    background: white;
    color: var(--ink);
    font: inherit;
    text-overflow: ellipsis;
  }
  .library-result-bar {
    display: flex;
    gap: 16px;
    align-items: center;
    justify-content: space-between;
    min-height: 44px;
    margin-bottom: 8px;
    font-size: 12px;
  }
  .library-result-bar p {
    margin: 0;
  }
  .lesson-evidence {
    display: block;
    margin-top: 14px;
    color: #48643d;
    font-size: 10px;
  }
  .library-pagination {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 18px;
    margin-top: 28px;
    font-size: 12px;
  }
  @media (max-width: 1000px) {
    .library-facets {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  @media (max-width: 420px) {
    .library-facets {
      grid-template-columns: minmax(0, 1fr);
    }
    .library-result-bar {
      align-items: flex-start;
    }
  }
</style>
