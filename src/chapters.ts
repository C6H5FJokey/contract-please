import entries from "game-chapters";

export const campaign = entries.filter(entry => entry.status !== "demo");

export function findChapter(id: string | null) {
  return entries.find(entry => entry.chapter.id === id);
}
