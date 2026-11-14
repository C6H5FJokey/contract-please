import { boshi } from "./boshi-pay/chapter.js";
import { yuchuan } from "./yuchuan/chapter.js";
import { windowDemo } from "./window-demo/chapter.js";
import type { Chapter, ChapterStatus } from "../src/model.js";

export const chapterCatalog: readonly { chapter: Chapter; status: ChapterStatus }[] = [
  { chapter: boshi, status: "released" },
  { chapter: yuchuan, status: "released" },
  { chapter: windowDemo, status: "demo" },
];
