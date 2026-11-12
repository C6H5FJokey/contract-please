import { createDossier } from "./dossier.js";
import { createDialogue, type Cue } from "./ink.js";
import type {
  Chapter, Command, DocumentVersion, EventData, GameEvent, Outcome, Phase,
  Proof, Quote, ReturnRoute, Save,
} from "./model.js";

const MAX_PATIENCE = 5;
const lineKey = (quote: Quote) => `${quote.document}.${quote.line}`;
const sameLines = (expected: string[], quotes: Quote[]) =>
  expected.length === quotes.length && expected.every(id => quotes.some(q => lineKey(q) === id));

export function openNegotiation(chapter: Chapter, compiled: string, saved?: Save) {
  const dossier = createDossier(chapter.documents);
  const history: Command[] = [];
  const events: GameEvent[] = [];
  const applied: string[] = [];
  const clues = new Set<string>();
  const stats = { submissions: 0, wrong: 0, deadlocks: 0, continues: 0 };
  let checkpoint: string | undefined;
  let outcome: Outcome | undefined;
  let activeTopic: string | undefined;
  let proof: Proof | undefined;
  let claim: string | undefined;
  let choosing = false;
  let confirmed: Quote[] = [];
  let phase: Phase = "active";
  let patience = MAX_PATIENCE;
  const hotspots = chapter.floorPlan?.hotspots ?? [];
  const dialogue = createDialogue(compiled, { hasFile: dossier.has, hasClue: id => clues.has(id) });

  const add = (data: EventData) => events.push({ ...data, id: events.length + 1 });
  const file = (document: DocumentVersion | null, revised = false) => {
    if (document) add({ kind: "file", document: document.id, version: document.version, name: document.name, revised });
  };
  function destination(back: ReturnRoute[]) {
    const route = back.find(item => !item.ifFile || dossier.has(item.ifFile));
    if (!route) throw new Error("No matching return route");
    return route.go;
  }

  function emit(cues: Iterable<Cue>, quiet = false) {
    let lastReply: string | undefined;
    for (const cue of cues) {
      if (quiet && cue.kind !== "desk") continue;
      switch (cue.kind) {
        case "contact": case "player":
          add({ kind: "message", who: cue.kind, text: cue.text });
          if (cue.kind === "contact") lastReply = cue.text;
          break;
        case "thought":
          add({ kind: "thought", text: `（${cue.text}）` });
          break;
        case "file": file(dossier.publish(cue.id)); break;
        case "proof":
          proof = chapter.proofs[cue.id];
          if (!proof) throw new Error(`Unknown proof: ${cue.id}`);
          claim = proof.anchor === "reply" ? lastReply : undefined;
          emit(dialogue.fragment(proof.steps[0]));
          break;
        case "amend": {
          if (applied.includes(cue.id)) break;
          const amendment = chapter.amendments[cue.id];
          if (!amendment) throw new Error(`Unknown amendment: ${cue.id}`);
          const revised = dossier.amend(amendment.edits, applied);
          if (!revised.length) break;
          applied.push(cue.id);
          for (const document of revised) file(document, true);
          const previous = patience;
          patience = Math.min(MAX_PATIENCE, patience + 1);
          add({ kind: "amendment", title: amendment.title, recovered: patience - previous });
          break;
        }
        case "desk":
          choosing = true;
          activeTopic = undefined;
          break;
        case "deadlock":
          setback("deadlocks", chapter.deadlocks[cue.id]);
          return;
      }
    }
  }

  function run(read: () => Iterable<Cue>, quiet = false) {
    choosing = false;
    confirmed = [];
    proof = undefined;
    claim = undefined;
    emit(read(), quiet);
  }

  function setback(counter: "deadlocks" | "wrong", back: ReturnRoute[]) {
    stats[counter]++;
    patience--;
    const target = destination(back);
    checkpoint = target;
    add({ kind: "setback", counter, patience });
    if (patience === 0) {
      phase = "refused";
      emit(dialogue.fragment("refused"));
    } else {
      run(() => dialogue.go(target), true);
    }
  }

  function resolveProof(rule: Proof) {
    const stale = confirmed.some(q => !q.current);
    const answer = !stale && rule.accepts.find(item => sameLines(item.lines, confirmed));
    stats.submissions++;
    add({ kind: "submission", quotes: confirmed, accepted: Boolean(answer), claim });
    if (answer) {
      run(() => dialogue.go(answer.go));
    } else {
      const mistake = rule.mistakes?.find(item =>
        (!item.unlessAmended || !applied.includes(item.unlessAmended)) && sameLines(item.lines, confirmed));
      emit(dialogue.fragment(stale ? "stale" : (mistake?.go ?? rule.wrong)));
      setback("wrong", rule.back);
    }
  }

  function dispatch(command: Command) {
    const start = events.length;
    if (phase === "ended" || !command || typeof command !== "object") return null;
    if (phase === "refused") {
      if (command.type === "continue" && checkpoint) {
        stats.continues++;
        patience = MAX_PATIENCE;
        phase = "active";
        const target = checkpoint;
        run(() => dialogue.go(target), true);
        emit(dialogue.fragment("resume"));
      } else if (command.type === "finish" && command.result === "leave") {
        phase = "ended";
        outcome = "leave";
        emit(dialogue.fragment("refused_leave"));
      } else return null;
    } else if (command.type === "investigate" && choosing) {
      const spot = hotspots.find(item => item.id === command.id);
      if (!spot || clues.has(spot.id)) return null;
      clues.add(spot.id);
      add({ kind: "discovery", label: spot.label, text: spot.observation });
      for (const id of spot.files ?? []) file(dossier.publish(id));
    } else if (command.type === "openTopic" && choosing) {
      let id: string | undefined;
      if (command.from === "clause" && Object.hasOwn(chapter.clauseTopics, command.id)) {
        id = chapter.clauseTopics[command.id];
      } else if (command.from === "hotspot" && clues.has(command.id)) {
        id = hotspots.find(item => item.id === command.id)?.topic;
      }
      if (!id || !Object.hasOwn(chapter.topics, id)) return null;
      const topic = chapter.topics[id];
      activeTopic = id;
      const opening = topic.followUps?.find(route => applied.includes(route.after)) ?? topic;
      run(() => dialogue.go(opening.start));
    } else if (command.type === "endTopic" && activeTopic && !proof) {
      run(() => dialogue.go("end_topic"));
    } else if (command.type === "choose" && !proof && !choosing) {
      const choice = dialogue.choices().find(item => item.id === command.id);
      if (!choice) return null;
      add({ kind: "message", who: "player", text: choice.text });
      run(() => dialogue.choose(choice.index));
    } else if (command.type === "defer" && proof) {
      const back = destination(proof.back);
      emit(dialogue.fragment(proof.defer.go));
      run(() => dialogue.go(back), true);
    } else if (command.type === "cite" && proof) {
      const quote = dossier.quote(command.ref);
      if (!quote || confirmed.some(other => lineKey(other) === lineKey(quote))) return null;
      confirmed.push(quote);
      if (confirmed.length === proof.steps.length) resolveProof(proof);
      else emit(dialogue.fragment(proof.steps[confirmed.length]));
    } else if (command.type === "revise" && proof) {
      if (!Number.isInteger(command.index) || command.index < 0 || command.index >= confirmed.length) return null;
      confirmed = confirmed.slice(0, command.index);
      emit(dialogue.fragment(proof.steps[confirmed.length]));
    } else if (command.type === "finish" && (command.result === "sign" || command.result === "leave")) {
      phase = "ended";
      outcome = command.result;
      emit(dialogue.fragment(`finish_${outcome}`));
    } else return null;
    history.push(structuredClone(command));
    return structuredClone(events.slice(start));
  }

  for (const id of chapter.initialFiles) dossier.publish(id);
  run(() => dialogue.go(chapter.start));
  if (saved !== undefined) {
    if (saved?.chapter !== chapter.id || saved?.revision !== chapter.revision ||
        !Array.isArray(saved.commands) || saved.commands.some(command => dispatch(command) === null)) {
      throw new Error("Invalid negotiation save");
    }
  }

  return {
    view: () => structuredClone({
      phase, patience, maxPatience: MAX_PATIENCE, stats, events, outcome,
      documents: dossier.documents(),
      amendments: applied,
      choices: phase === "active" && !choosing && !proof
        ? dialogue.choices().map(({ id, text }) => ({ id, text })) : [],
      review: {
        choosing: phase === "active" && choosing,
        activeTopic: phase !== "ended" ? activeTopic : undefined,
        canEndTopic: phase === "active" && Boolean(activeTopic) && !proof,
        topics: Object.entries(chapter.topics).map(([id, topic]) => ({
          id, label: topic.label, amended: topic.amendments?.some(key => applied.includes(key)) ?? false,
        })),
        clues: [...clues],
      },
      proof: phase === "active" && proof ? { count: proof.steps.length, confirmed, defer: proof.defer.text } : null,
    }),
    act: dispatch,
    save: (): Save => structuredClone({ chapter: chapter.id, revision: chapter.revision, commands: history }),
  };
}
