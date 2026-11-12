import { createDossier } from "./dossier.js";

const MAX_PATIENCE = 5;
const lineKey = quote => `${quote.document}.${quote.line}`;
const sameLines = (expected, quotes) =>
  expected.length === quotes.length &&
  expected.every(id => quotes.some(q => lineKey(q) === id));

export function openNegotiation(chapter, saved) {
  const dossier = createDossier(chapter.documents);
  const history = [];
  const events = [];
  const applied = [];
  const stats = { submissions: 0, wrong: 0, deadlocks: 0, continues: 0 };
  let nodeId, checkpoint, outcome, activeTopic;
  let confirmed = [];
  let phase = "active";
  let patience = MAX_PATIENCE;
  const review = chapter.review;
  const topics = review ? chapter.documents[chapter.contract].sections.map(section => ({
    id: section.id,
    label: section.label,
    ...review.topics[section.id],
  })) : [];

  const add = (kind, data) => events.push({ id: events.length + 1, kind, ...data });
  const speak = (lines = [], who = "contact") => {
    for (const text of lines) add("message", { who, text });
  };
  const think = text => { if (text) add("thought", { text: `（${text}）` }); };
  const file = (document, revised = false) => {
    if (document) add("file", { document: document.id, version: document.version, name: document.name, revised });
  };
  const here = () => chapter.nodes[nodeId];
  const atDesk = () => Boolean(review && nodeId === review.node);
  const claim = () => here().proof?.anchor === "reply" ? here().say.at(-1) : undefined;
  const choices = () => (here().choices ?? []).filter(choice =>
    !choice.ifOpen || !applied.includes(choice.ifOpen));
  const destination = back => back.find(route => !route.ifFile ||
    dossier.documents().some(document => document.id === route.ifFile)).go;

  function moveTo(id) {
    nodeId = id;
    confirmed = [];
    if (atDesk()) activeTopic = undefined;
  }

  function enter(id) {
    moveTo(id);
    const node = here();
    if (!node) throw new Error(`Unknown dialogue node: ${id}`);
    const seen = node.files?.every(id => dossier.documents().some(document => document.id === id));
    speak(seen && node.revisit ? node.revisit : node.say);
    for (const doc of node.files ?? []) file(dossier.publish(doc));
    if (node.amend && !applied.includes(node.amend)) {
      const amendment = chapter.amendments[node.amend];
      const revised = dossier.amend(amendment.edits, applied);
      applied.push(node.amend);
      for (const doc of revised) file(doc, true);
      const previous = patience;
      patience = Math.min(MAX_PATIENCE, patience + 1);
      add("amendment", { title: amendment.title, recovered: patience - previous });
    }
    think(node.thought);
    if (node.proof) think(node.proof.steps[0]);
    if (node.deadlock) setback("deadlocks", node.deadlock);
    else if (node.go) enter(node.go);
  }

  function setback(counter, back) {
    stats[counter]++;
    patience--;
    checkpoint = destination(back);
    add("setback", { counter, patience });
    if (patience === 0) {
      phase = "refused";
      speak(chapter.refusal.say);
      think(chapter.refusal.thought);
    } else {
      moveTo(checkpoint);
    }
  }

  function finish(result, afterRefusal = false) {
    phase = "ended";
    outcome = result;
    if (!afterRefusal) {
      const ending = chapter.endings[result];
      speak([ending.player], "player");
      speak(ending.say);
      for (const doc of ending.files ?? []) file(dossier.publish(doc));
    } else {
      speak([chapter.refusal.leave], "player");
    }
  }

  function resolveProof(quotes) {
    const proof = here().proof;
    const stale = quotes.some(q => !q.current);
    const answer = !stale && proof.accepts.find(item => sameLines(item.lines, quotes));
    confirmed = [];
    stats.submissions++;
    add("submission", { quotes, accepted: Boolean(answer), claim: claim() });
    if (answer) {
      speak(answer.say, "player");
      enter(proof.success);
    } else {
      const mistake = proof.mistakes?.find(item =>
        (!item.unlessAmended || !applied.includes(item.unlessAmended)) && sameLines(item.lines, quotes));
      speak(stale ? [chapter.stale] : (mistake?.say ?? proof.wrong));
      setback("wrong", proof.back);
    }
  }

  function dispatch(command) {
    const start = events.length;
    if (phase === "ended" || !command || typeof command !== "object") return null;
    if (phase === "refused") {
      if (command.type === "continue") {
        speak([chapter.refusal.resume], "player");
        stats.continues++;
        patience = MAX_PATIENCE;
        phase = "active";
        moveTo(checkpoint);
        speak(chapter.refusal.return);
      } else if (command.type === "finish" && command.result === "leave") {
        finish("leave", true);
      } else return null;
    } else if (command.type === "openTopic" && atDesk()) {
      const topic = topics.find(item => item.id === command.id);
      if (!topic?.start) return null;
      activeTopic = topic;
      const followUp = topic.followUps?.find(route => applied.includes(route.after));
      const opening = followUp ?? topic;
      speak([opening.player], "player");
      enter(opening.start);
    } else if (command.type === "endTopic" && activeTopic && !here().proof) {
      speak([review.pause], "player");
      enter(review.node);
    } else if (command.type === "choose") {
      const choice = choices().find(item => item.id === command.id);
      if (!choice) return null;
      speak([choice.text], "player");
      enter(choice.go);
    } else if (command.type === "defer" && here().proof) {
      const { defer, back } = here().proof;
      if (defer.player) speak([defer.player], "player");
      think(defer.thought);
      speak(defer.say);
      moveTo(destination(back));
    } else if (command.type === "cite" && here().proof) {
      const quote = dossier.quote(command.ref);
      if (!quote || confirmed.some(other => lineKey(other) === lineKey(quote))) return null;
      confirmed.push(quote);
      if (confirmed.length === here().proof.steps.length) resolveProof(confirmed);
      else think(here().proof.steps[confirmed.length]);
    } else if (command.type === "revise" && here().proof) {
      if (!Number.isInteger(command.index) || command.index < 0 || command.index >= confirmed.length) return null;
      confirmed = confirmed.slice(0, command.index);
      think(here().proof.steps[confirmed.length]);
    } else if (command.type === "finish" && ["sign", "leave"].includes(command.result)) {
      finish(command.result);
    } else return null;
    history.push(structuredClone(command));
    return structuredClone(events.slice(start));
  }

  for (const id of chapter.initialFiles) dossier.publish(id);
  enter(chapter.start);
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
      choices: phase === "active" ? choices().map(({ id, text }) => ({ id, text })) : [],
      review: review ? {
        choosing: phase === "active" && atDesk(),
        activeTopic: phase !== "ended" ? activeTopic?.id : undefined,
        canEndTopic: phase === "active" && Boolean(activeTopic) && !here().proof,
        topics: topics.map(topic => ({
          id: topic.id,
          label: topic.label,
          amended: topic.amendments?.some(id => applied.includes(id)) ?? false,
        })),
      } : null,
      proof: phase === "active" && here().proof ? {
        count: here().proof.steps.length, confirmed, defer: here().proof.defer.text,
      } : null,
    }),
    act: dispatch,
    save: () => structuredClone({ chapter: chapter.id, revision: chapter.revision, commands: history }),
  };
}
