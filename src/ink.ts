import { Story } from "inkjs";

export type Cue =
  | { kind: "contact" | "player" | "thought"; text: string }
  | { kind: "file" | "proof" | "amend" | "deadlock"; id: string }
  | { kind: "desk" };

export function parseCue(tag: string): Cue {
  if (tag === "desk") return { kind: "desk" };
  if (tag === "player" || tag === "thought") return { kind: tag, text: "" };
  const [kind, id, extra] = tag.split(":");
  if (id && extra === undefined && (kind === "file" || kind === "proof" || kind === "amend" || kind === "deadlock")) {
    return { kind, id };
  }
  throw new Error(`Unrecognized Ink cue: ${tag}`);
}

export function createDialogue(compiled: string, conditions: {
  hasFile: (id: string) => boolean;
  hasClue: (id: string) => boolean;
}) {
  const story = new Story(compiled);
  story.BindExternalFunction("has_file", conditions.hasFile, true);
  story.BindExternalFunction("has_clue", conditions.hasClue, true);
  story.BindExternalFunction("in_game", () => true, true);

  function* read(): Generator<Cue> {
    let lines = 0;
    while (story.canContinue) {
      if (++lines > 500) throw new Error("Ink sequence did not reach a choice or end");
      const text = story.Continue()?.trim();
      const tags = (story.currentTags ?? []).map(parseCue);
      const speaker = tags.find(cue => cue.kind === "player" || cue.kind === "thought");
      if (text) {
        const kind = speaker?.kind;
        yield { kind: kind === "player" || kind === "thought" ? kind : "contact", text };
      }
      yield* tags.filter(cue => cue.kind !== "player" && cue.kind !== "thought");
    }
  }

  function go(knot: string) {
    if (!story.KnotContainerWithName(knot)) throw new Error(`Missing Ink knot: ${knot}`);
    story.ChoosePathString(knot);
    return read();
  }

  function choices() {
    const ids = new Set<string>();
    return story.currentChoices.map(({ text, tags }, index) => {
      const match = tags?.length === 1 ? /^choice:([\w-]+)$/.exec(tags[0]) : null;
      if (!match || ids.has(match[1])) throw new Error(`Ink choice needs a unique # choice:ID: ${text}`);
      ids.add(match[1]);
      return { id: match[1], text: text.trim(), index };
    });
  }

  return {
    go,
    choices,
    choose(index: number) { story.ChooseChoiceIndex(index); return read(); },
    fragment(knot: string) {
      const before = story.state.ToJson();
      try {
        const cues = [...go(knot)];
        if (choices().length || cues.some(cue => !["contact", "player", "thought", "file"].includes(cue.kind))) {
          throw new Error(`Ink fragment must end without choices or transitions: ${knot}`);
        }
        return cues;
      } finally {
        story.state.LoadJson(before);
      }
    },
  };
}
