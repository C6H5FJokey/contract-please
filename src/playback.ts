import type { FileEvent, GameEvent } from "./model.js";

interface PlaybackOptions {
  show: (event: GameEvent, text?: string) => ((text: string) => void) | undefined;
  waiting: (text?: string) => void;
  reviewFiles: (event: FileEvent) => Promise<void>;
  onIdle: () => void;
  reduced: () => boolean;
}
type Schedule = (callback: () => void, delay: number) => void;

export function createPlayback({ show, waiting, reviewFiles, onIdle, reduced }: PlaybackOptions) {
  let skipCurrent: (() => void) | undefined;

  function interruptible(work: (later: Schedule, end: () => void) => void) {
    return new Promise<void>(resolve => {
      let timer: ReturnType<typeof setTimeout>;
      const end = () => {
        clearTimeout(timer);
        skipCurrent = undefined;
        resolve();
      };
      skipCurrent = () => end();
      work((fn, ms) => { timer = setTimeout(fn, ms); }, end);
    });
  }

  async function play(events: GameEvent[]) {
    for (const [index, event] of events.entries()) {
      const incoming = event.kind === "message" && event.who === "contact";
      const attachment = event.kind === "file";
      const animate = !reduced();
      let jumped = false;
      if (animate && (incoming || attachment)) {
        waiting(attachment ? "正在发送文件…" : "对方正在输入…");
        await interruptible((later, end) => {
          const skip = skipCurrent;
          skipCurrent = () => { jumped = true; skip?.(); };
          later(end, attachment ? 570 : 340);
        });
        waiting();
      }
      if (incoming && animate && !jumped) {
        const setText = show(event, "");
        const chars = Array.from(event.text);
        let count = 0;
        await interruptible((later, end) => {
          const step = () => {
            count = Math.min(count + 1, chars.length);
            setText?.(chars.slice(0, count).join(""));
            if (count === chars.length) end();
            else later(step, /[。？！…]/.test(chars[count - 1]) ? 85 : 22);
          };
          step();
        });
        setText?.(event.text);
      } else {
        show(event);
      }
      // Deliver consecutive files together so a revision can be reviewed as a set.
      if (attachment && events[index + 1]?.kind !== "file") await reviewFiles(event);
    }
    onIdle();
  }

  return { play, skip: () => skipCurrent?.() };
}
