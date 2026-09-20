<script lang="ts">
  import { afterNavigate } from "$app/navigation";
  import { curriculum } from "$lib/content";
  import { libraryHref, rankLessons } from "$lib/library-search";
  import { lessonHref } from "$lib/navigation";
  import Icon from "./Icon.svelte";

  let { input = $bindable() }: { input?: HTMLInputElement } = $props();
  let form: HTMLFormElement;
  let query = $state("");
  let open = $state(false);
  const matches = $derived(
    query.trim() ? rankLessons(curriculum.lessons, query) : [],
  );
  const suggestions = $derived(matches.slice(0, 6));
  const visible = $derived(open && query.trim().length > 0);
  const searchHref = $derived(libraryHref({ view: "lessons", query }));

  afterNavigate(() => {
    open = false;
  });

  function keyboard(event: KeyboardEvent) {
    if (event.key === "Escape" && visible) {
      event.preventDefault();
      event.stopPropagation();
      input?.focus();
      open = false;
      return;
    }
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    if (!query.trim()) return;
    if (!visible) {
      // Open first; the next arrow or Tab enters the native links.
      open = true;
      event.preventDefault();
      return;
    }
    const links = Array.from(
      form.querySelectorAll<HTMLAnchorElement>(".suggestion-panel a"),
    );
    if (!links.length) return;
    event.preventDefault();
    const index = links.findIndex((link) => link === event.target);
    const next =
      index < 0
        ? event.key === "ArrowDown"
          ? 0
          : links.length - 1
        : index + (event.key === "ArrowDown" ? 1 : -1);
    if (next < 0 || next >= links.length) input?.focus();
    else links[next].focus();
  }

  function leave(event: FocusEvent) {
    if (
      !(event.relatedTarget instanceof Node) ||
      !form.contains(event.relatedTarget)
    )
      open = false;
  }
</script>

<form
  bind:this={form}
  action="/library/"
  method="GET"
  class="global-search"
  role="search"
  onfocusout={leave}
  onsubmit={() => {
    open = false;
  }}
>
  <Icon name="search" size={17} />
  <input
    bind:this={input}
    bind:value={query}
    name="q"
    type="search"
    aria-label="Search lessons and concepts"
    aria-controls={visible ? "lesson-search-suggestions" : undefined}
    aria-describedby="lesson-search-help"
    placeholder="Search a concept…"
    autocomplete="off"
    maxlength="500"
    onkeydown={keyboard}
    onfocus={() => {
      open = true;
    }}
    oninput={() => {
      open = true;
    }}
  />
  <kbd>/</kbd>
  <span id="lesson-search-help" class="search-help"
    >Enter searches the library. Use the arrow keys or Tab to explore
    suggestions. Escape closes suggestions.</span
  >
  {#if visible}
    <nav
      id="lesson-search-suggestions"
      class="suggestion-panel"
      aria-label="Search suggestions"
    >
      <p class="suggestion-count" role="status">
        {#if matches.length}{matches.length} matching {matches.length === 1
            ? "lesson"
            : "lessons"}{:else}No matching lessons yet.{/if}
      </p>
      {#if suggestions.length}
        <ul>
          {#each suggestions as lesson (lesson.id)}
            <li>
              <a
                href={lessonHref(lesson.id, {
                  kind: "library",
                  view: "lessons",
                  query,
                })}
                onkeydown={keyboard}
                onclick={() => {
                  open = false;
                }}
              >
                <span>{lesson.title}</span>
                <small>{lesson.slot} · {lesson.minutes} min estimate</small>
              </a>
            </li>
          {/each}
        </ul>
      {:else}
        <p class="search-empty">
          Try a term such as learning, data, or gradient.
        </p>
      {/if}
      <a
        class="all-results"
        href={searchHref}
        onkeydown={keyboard}
        onclick={() => {
          open = false;
        }}>Search the full library <Icon name="arrow" size={15} /></a
      >
    </nav>
  {/if}
</form>

<style>
  .global-search {
    position: relative;
    min-width: 0;
  }
  .search-help {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
  .suggestion-panel {
    position: absolute;
    z-index: 30;
    top: calc(100% + 10px);
    right: 0;
    width: min(26rem, calc(100vw - 6rem));
    max-height: min(34rem, 75dvh);
    overflow: auto;
    padding: 8px;
    border: 1px solid #d8e2cc;
    border-radius: 9px;
    background: #fff;
    box-shadow: 0 12px 28px #29452b20;
    color: var(--ink);
  }
  .suggestion-count,
  .search-empty {
    margin: 0;
    padding: 10px;
    color: #627354;
    font-size: 11px;
    line-height: 1.5;
  }
  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  li a {
    display: grid;
    gap: 5px;
    padding: 11px 10px;
    border-radius: 5px;
  }
  li a span {
    font-size: 12px;
    line-height: 1.4;
  }
  li a small {
    color: #627354;
    font-size: 10px;
  }
  a:hover,
  a:focus-visible {
    background: #eff4e9;
  }
  .all-results {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 13px 10px;
    border-top: 1px solid #d8e2cc;
    color: #315b38;
    font-size: 12px;
  }
</style>
