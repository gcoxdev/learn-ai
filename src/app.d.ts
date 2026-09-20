import type { LessonTrail } from "$lib/lesson-detours";

declare global {
  namespace App {
    interface PageState {
      lessonTrail?: LessonTrail;
    }
  }
}

export {};
