<script lang="ts">
  import "../app.css";
  import "katex/dist/katex.min.css";
  import { onMount, type Snippet } from "svelte";
  import { page } from "$app/state";
  import { afterNavigate, beforeNavigate, replaceState } from "$app/navigation";
  import { originFromLessonUrl, originFromLocation } from "$lib/navigation";
  import { curriculum } from "$lib/content";
  import {
    historyDetours,
    lessonTrail,
    savedDetours,
    type LessonTrail,
  } from "$lib/lesson-detours";
  import { Learner, setLearner } from "$lib/learner.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import SearchSuggestions from "$lib/components/SearchSuggestions.svelte";
  let { children }: { children: Snippet } = $props();
  const learner = setLearner(new Learner());
  let menu = $state(false);
  let searchInput = $state<HTMLInputElement | undefined>();
  const section = $derived(
    page.url.pathname.startsWith("/learn/")
      ? "The classroom"
      : page.url.pathname.startsWith("/paths/")
        ? "Your learning path"
        : page.url.pathname.startsWith("/progress")
          ? "Your progress"
          : page.url.pathname.startsWith("/library")
            ? "The library"
            : "Your learning journey",
  );
  const nav = [
    { name: "Explore paths", href: "/", icon: "home" },
    { name: "The curriculum", href: "/library/?view=curriculum", icon: "map" },
    { name: "My progress", href: "/progress/", icon: "chart" },
    { name: "Lesson library", href: "/library/", icon: "book" },
    { name: "Glossary", href: "/library/?view=glossary", icon: "layers" },
  ];
  function active(href: string) {
    return (
      href === page.url.pathname + (learner.hydrated ? page.url.search : "") ||
      (href === "/" && page.url.pathname.startsWith("/paths/"))
    );
  }
  function shortcut(event: KeyboardEvent) {
    if (
      event.key === "/" &&
      !(event.target instanceof HTMLInputElement) &&
      !(event.target instanceof HTMLTextAreaElement)
    ) {
      event.preventDefault();
      searchInput?.focus();
    }
    if (event.key === "Escape" && menu) {
      menu = false;
      document.getElementById("menu-toggle")?.focus();
    }
  }
  beforeNavigate(({ from, to, type }) => {
    if (
      !learner.hydrated ||
      type === "popstate" ||
      to?.route.id !== "/learn/[id]"
    )
      return;
    const origin =
      originFromLessonUrl(to.url) ??
      (from ? originFromLocation(from.url) : undefined);
    if (origin && to.params?.id) learner.enterLesson(to.params.id, origin);
  });
  const tabTrailKey = "learn-ai-side-lesson";
  function rememberedTrail(): unknown {
    try {
      const saved = sessionStorage.getItem(tabTrailKey);
      if (saved === null) return undefined;
      const record = JSON.parse(saved);
      return record?.url === page.url.href ? record.trail : null;
    } catch {
      return undefined;
    }
  }
  function rememberTrail(trail: LessonTrail | null, url = page.url.href) {
    try {
      if (trail)
        sessionStorage.setItem(tabTrailKey, JSON.stringify({ url, trail }));
      else sessionStorage.removeItem(tabTrailKey);
    } catch {
      // History still supports in-app Back/Forward when tab storage is unavailable.
    }
  }
  function restoreTrail(initial = false) {
    if (!learner.hydrated) return;
    if (page.route.id !== "/learn/[id]" || !page.params.id) {
      rememberTrail(null);
      return;
    }
    const id = page.params.id;
    const frames =
      historyDetours(
        // SvelteKit clears page.state on full reload. Recover this tab's current
        // entry before consulting the shared progress record from older sessions.
        page.state.lessonTrail ?? (initial ? rememberedTrail() : undefined),
        id,
        learner.data.resetAt,
        curriculum,
      ) ??
      (initial && !originFromLessonUrl(page.url)
        ? savedDetours(learner.data, id, curriculum)
        : []);
    learner.setDetours(frames);
    const trail = lessonTrail(id, frames, learner.data.resetAt);
    const restoredUrl = new URL(page.url);
    if (page.url.searchParams.get("check") === "1") {
      const lesson = curriculum.lessons.find((lesson) => lesson.id === id)!;
      const scene = lesson.routes.core.find(
        (sceneId) =>
          lesson.scenes.find((scene) => scene.id === sceneId)?.type ===
          "assessment",
      );
      if (scene && !page.state.lessonTrail)
        learner.savePosition(id, lesson.routes.core[0], {
          mode: "slides",
          depth: "core",
          scene,
        });
      // The link requests an entry point once. A later refresh must respect
      // the learner's saved position if they return to the explanation.
      restoredUrl.searchParams.delete("check");
    }
    replaceState(restoredUrl, { ...page.state, lessonTrail: trail });
    rememberTrail(trail, restoredUrl.href);
  }
  afterNavigate(() => restoreTrail());
  onMount(() => {
    void learner.init().then(() => {
      const origin = originFromLessonUrl(page.url);
      if (origin && page.route.id === "/learn/[id]" && page.params.id)
        learner.enterLesson(page.params.id, origin);
      restoreTrail(true);
    });
    return () => learner.dispose();
  });
</script>

<svelte:head
  ><meta
    name="description"
    content="Understand how AI works, one connected idea at a time. Explore guided learning paths, clear explanations, and hands-on experiments."
  /></svelte:head
>
<svelte:window onkeydown={shortcut} />
<a class="skip-link" href="#main">Skip to learning content</a>
<div class="app-shell">
  <aside
    id="main-navigation"
    class={["sidebar", { open: menu }]}
    aria-label="Main navigation"
  >
    <a href="/" class="brand" onclick={() => (menu = false)}
      ><span class="brand-mark">✳</span><span
        >Learn AI<span class="brand-sub">THE OPEN CLASSROOM</span></span
      ></a
    >
    <p class="nav-heading">YOUR CLASSROOM</p>
    <nav>
      {#each nav as item (item.href)}<a
          href={item.href}
          class={{ active: active(item.href) }}
          aria-current={active(item.href) ? "page" : undefined}
          onclick={() => (menu = false)}
          ><Icon name={item.icon} /><span>{item.name}</span
          >{#if active(item.href)}<i></i>{/if}</a
        >{/each}
    </nav>
    <div class="sidebar-note">
      <span class="tiny-orbit" aria-hidden="true">↗</span>
      <h3>Every big idea starts<br />with a small question.</h3>
      <p>You don’t need a math degree.<br />Just a place to begin.</p>
      <a href="/library/#how-it-works"
        >How learning works <Icon name="arrow" size={15} /></a
      >
    </div>
    <div class="sidebar-bottom">
      <span class="status-dot"></span>
      <div>
        <strong>Private learning preview</strong><span
          >Draft content · personal progress</span
        >
      </div>
    </div>
  </aside>
  <div class="workspace">
    <header class="topbar">
      <div class="breadcrumb">
        <button
          class="icon-button mobile-menu"
          id="menu-toggle"
          aria-controls="main-navigation"
          aria-label="Toggle navigation"
          aria-expanded={menu}
          onclick={() => (menu = !menu)}><Icon name="menu" /></button
        ><span>Classroom</span><Icon name="chevron" size={13} /><strong
          >{section}</strong
        >
      </div>
      <SearchSuggestions bind:input={searchInput} />
      <a
        class="profile-button"
        href="/progress/"
        aria-label="Your learning progress"><Icon name="chart" size={20} /></a
      >
    </header>
    {#if learner.saveStatus === "unavailable"}<div
        class="storage-alert"
        role="alert"
      >
        <Icon name="info" size={17} /><span
          >Progress is not being saved. Your current session is still usable.</span
        ><button onclick={() => learner.exportProgress()}
          >Export progress</button
        >
      </div>{/if}
    <main
      id="main"
      tabindex="-1"
      inert={!learner.hydrated}
      aria-busy={!learner.hydrated}
    >
      {@render children()}
    </main>
    <footer class="app-footer">
      <a href="/about/">About this classroom</a><a href="/progress/"
        >{learner.saveStatus === "loading"
          ? "Loading local progress…"
          : learner.saveStatus === "saving"
            ? "Saving…"
            : learner.saveStatus === "saved"
              ? "Progress saved in this browser"
              : "Progress stays in this session"}</a
      >
    </footer>
  </div>
</div>
