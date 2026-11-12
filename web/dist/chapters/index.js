import { boshi } from "./boshi.js";

export const chapters = [boshi];

export function findChapter(id) {
  return chapters.find(chapter => chapter.id === id) ?? chapters[0];
}
