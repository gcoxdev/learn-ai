import { error } from "@sveltejs/kit";
import { lessons, getLesson } from "$lib/content";
export function entries() {
  return lessons.map((l) => ({ id: l.id }));
}
export function load({ params }: { params: { id: string } }) {
  const lesson = getLesson(params.id);
  if (!lesson) error(404, "This lesson is not available in the prototype yet.");
  return { lesson };
}
