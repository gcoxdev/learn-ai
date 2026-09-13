import {
  lessonOriginSchema,
  type Curriculum,
  type Lesson,
  type LessonOrigin,
  type Progress,
} from "./model";
import { planPath } from "./engine";

export const defaultOrigin: LessonOrigin = {
  kind: "library",
  view: "lessons",
  query: "",
};

// Only known classroom locations can become a return destination.
export function originFromLocation(url: URL): LessonOrigin | undefined {
  if (url.pathname === "/") return { kind: "home" };
  if (/^\/progress\/?$/.test(url.pathname)) return { kind: "progress" };
  const path = /^\/paths\/(language|images)\/?$/.exec(url.pathname)?.[1];
  if (path) return { kind: "path", path: path as "language" | "images" };
  if (!/^\/library\/?$/.test(url.pathname)) return;
  const parsed = lessonOriginSchema.safeParse({
    kind: "library",
    view: url.searchParams.get("view") ?? "lessons",
    query: (url.searchParams.get("q") ?? "").slice(0, 500),
    module: /^#M\d{2}$/.test(url.hash) ? url.hash.slice(1) : undefined,
  });
  return parsed.success ? parsed.data : undefined;
}

export function originFromLessonUrl(url: URL): LessonOrigin | undefined {
  const from = url.searchParams.get("from");
  if (!from || !from.startsWith("/") || from.startsWith("//")) return;
  try {
    const target = new URL(from, url.origin);
    if (target.origin !== url.origin) return;
    return originFromLocation(target);
  } catch {
    // A malformed return hint must not prevent the lesson from opening.
    return;
  }
}

export function returnDestination(origin: LessonOrigin) {
  if (origin.kind === "path")
    return {
      href: `/paths/${origin.path}/`,
      label: "Back to my learning path",
    };
  if (origin.kind === "progress")
    return { href: "/progress/", label: "Back to my progress" };
  if (origin.kind === "home")
    return { href: "/", label: "Back to explore paths" };
  const params = new URLSearchParams();
  if (origin.view !== "lessons") params.set("view", origin.view);
  if (origin.query) params.set("q", origin.query);
  return {
    href: `/library/${params.size ? `?${params}` : ""}${origin.module ? `#${origin.module}` : ""}`,
    label:
      origin.view === "curriculum"
        ? "Back to the curriculum"
        : origin.view === "glossary"
          ? "Back to the glossary"
          : "Back to the lesson library",
  };
}

export function lessonHref(id: string, origin?: LessonOrigin) {
  const suffix = origin
    ? `?${new URLSearchParams({ from: returnDestination(origin).href })}`
    : "";
  return `/learn/${id}/${suffix}`;
}

export function nextLesson(
  curriculum: Curriculum,
  lesson: Lesson,
  origin: LessonOrigin,
  progress: Progress,
): Lesson | undefined {
  if (origin.kind === "path") {
    const recipe = curriculum.recipes.find((r) => r.id === origin.path)!;
    const plan = planPath(curriculum, recipe, progress.attempts);
    const next = plan.lessons.find((l) =>
      l.objectives.some((id) => plan.remaining.includes(id)),
    );
    return next?.id === lesson.id ? undefined : next;
  }
  if (origin.kind !== "library" || origin.view !== "curriculum") return;
  const ordered = curriculum.lessons
    .filter((l) => l.slot.startsWith("M"))
    .toSorted((a, b) => a.slot.localeCompare(b.slot, "en", { numeric: true }));
  const index = ordered.findIndex((l) => l.id === lesson.id);
  return index < 0 ? undefined : ordered[index + 1];
}
