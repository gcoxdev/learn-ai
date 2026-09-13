import { error } from "@sveltejs/kit";
import { lessons, getLesson } from "$lib/content";
export function entries() {
  return lessons.map((l) => ({ id: l.id }));
}
export function load({ params }: { params: { id: string } }) {
  const lesson = getLesson(params.id);
  if (!lesson)
    error(404, "This lesson could not be found in the draft curriculum.");
  return { lesson };
}
