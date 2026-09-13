import { error } from "@sveltejs/kit";
import { recipes } from "$lib/content";
export function entries() {
  return recipes.map((r) => ({ id: r.id }));
}
export function load({ params }: { params: { id: string } }) {
  const recipe = recipes.find((r) => r.id === params.id);
  if (!recipe) error(404, "This learning path is not available.");
  return { recipe };
}
