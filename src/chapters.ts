import { boshi } from "../content/boshi-pay/chapter.js";
import boshiStory from "../content/boshi-pay/story.ink";
import { windowDemo } from "../content/window-demo/chapter.js";
import windowStory from "../content/window-demo/story.ink";

export const mainChapter = { chapter: boshi, story: boshiStory };
export const demoChapter = { chapter: windowDemo, story: windowStory };
const released = [mainChapter];
const available = INCLUDE_DEMO ? [...released, demoChapter] : released;

export function findChapter(id: string | null) {
  return available.find(entry => entry.chapter.id === id) ?? mainChapter;
}
