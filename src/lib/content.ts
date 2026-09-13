import data from "./generated/curriculum.json";
import type { Curriculum } from "./model";

export const curriculum = data as Curriculum;
export const lessons = curriculum.lessons;
export const objectives = curriculum.objectives;
export const recipes = curriculum.recipes;
export const getLesson = (id: string) => lessons.find((l) => l.id === id);
