import { campaign } from "./chapters.js";
import type { ChapterEntry, Save } from "./model.js";
import { openNegotiation } from "./negotiation.js";

const completionKey = "contract-please:completed-chapters";
export const saveKey = (id: string) => `contract-please:negotiation:${id}`;
export const chapterUrl = (id: string) => `?chapter=${encodeURIComponent(id)}`;

function savedChapter(storage: Storage, id: string): Save | undefined {
  try {
    const raw = storage.getItem(saveKey(id));
    return raw ? JSON.parse(raw) : undefined;
  } catch { return undefined; }
}

export function restoreChapter(storage: Storage, { chapter, story }: ChapterEntry) {
  const saved = savedChapter(storage, chapter.id);
  if (!saved) return undefined;
  try {
    return { game: openNegotiation(chapter, story, saved), readThrough: saved.readThrough };
  } catch { return undefined; }
}

function readEnding(saved: NonNullable<ReturnType<typeof restoreChapter>>) {
  const view = saved.game.view();
  return view.phase === "ended" && (saved.readThrough === undefined || saved.readThrough >= (view.events.at(-1)?.id ?? 0));
}

export function chapterProgress(storage: Storage) {
  let saved: unknown;
  try { saved = JSON.parse(storage.getItem(completionKey) ?? "[]"); }
  catch { /* Storage may be unavailable. */ }
  const completed = new Set<string>();
  const statuses = new Map<string, "new" | "reviewable" | "inProgress">();
  for (const entry of campaign) {
    const id = entry.chapter.id;
    if (Array.isArray(saved) && saved.includes(id)) completed.add(id);
    const restored = restoreChapter(storage, entry);
    const ended = restored && readEnding(restored);
    statuses.set(id, ended ? "reviewable" : restored ? "inProgress" : "new");
    if (ended) completed.add(id);
  }
  return { completed, statuses };
}

export function completedChapters(storage: Storage) {
  return chapterProgress(storage).completed;
}

export function chapterUnlocked(id: string, completed: ReadonlySet<string>) {
  const index = campaign.findIndex(entry => entry.chapter.id === id);
  return index >= 0 && campaign.slice(0, index).every(entry => completed.has(entry.chapter.id));
}

export function completeChapter(storage: Storage, id: string) {
  const completed = completedChapters(storage);
  if (!campaign.some(entry => entry.chapter.id === id)) return completed;
  completed.add(id);
  try { storage.setItem(completionKey, JSON.stringify([...completed])); }
  catch { /* Play continues without storage. */ }
  return completed;
}
