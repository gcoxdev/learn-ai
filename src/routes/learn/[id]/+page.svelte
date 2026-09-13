<script lang="ts">
  import LessonPlayer from "$lib/components/LessonPlayer.svelte";
  import type { Lesson } from "$lib/model";
  let { data }: { data: { lesson: Lesson } } = $props();
</script>

<svelte:head><title>{data.lesson.title} — Learn AI</title></svelte:head>
{#key data.lesson.id}<LessonPlayer lesson={data.lesson} />{/key}
