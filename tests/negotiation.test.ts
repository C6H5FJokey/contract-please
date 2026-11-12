import assert from "node:assert/strict";
import { test } from "node:test";
import { Story } from "inkjs";
import { openNegotiation } from "../src/negotiation.js";
import { createPlayback } from "../src/playback.js";
import { mainChapter, demoChapter } from "../src/chapters.js";
import type { GameEvent, Reference, Save } from "../src/model.js";

const { chapter: boshi, story } = mainChapter;
const start = () => openNegotiation(boshi, story);
type Game = ReturnType<typeof start>;
function eventText(event: GameEvent | undefined) {
  assert.ok(event && "text" in event);
  return event.text;
}
const openTopic = (game: Game, id: string) => {
  const events = game.act({ type: "openTopic", from: "clause", id });
  assert.ok(events, `Topic should be available: ${id}`);
  return events;
};
const choose = (game: Game, ...ids: string[]) => {
  for (const id of ids) assert.ok(game.act({ type: "choose", id }), `Choice should be available: ${id}`);
};
const ref = (document: string, line: string, version = 1): Reference => ({ document, line, version });
const fixedPair = [ref("interview", "fixed"), ref("payroll", "fixed")];
const weekendLine = (version = 1) => [ref("payroll", "extra", version)];
const wrongFixed = [ref("contract", "quote"), ref("payroll", "fixed")];
const present = (game: Game, refs: Reference[]) => {
  const events = refs.flatMap(ref => {
    const delta = game.act({ type: "cite", ref });
    assert.ok(delta, "The quote should be selectable at this step");
    return delta;
  });
  const submission = events.find(event => event.kind === "submission");
  assert.ok(submission);
  return submission;
};
const latest = (game: Game, id: string) => game.view().documents.filter(doc => doc.id === id).at(-1);
const lines = (game: Game, id: string) => latest(game, id)!.sections.flatMap(section => section.lines).map(line => line.text);

test("an exposed contradiction can be noticed before the material is available", () => {
  const game = start();
  assert.equal(game.act({ type: "cite", ref: fixedPair[0] }), null);
  openTopic(game, "salary");
  choose(game, "confirm");
  assert.ok(game.view().proof);
  assert.equal(latest(game, "payroll"), undefined);
  assert.equal(game.act({ type: "cite", ref: fixedPair[1] }), null);
  assert.ok(game.act({ type: "defer" }));
  assert.equal(game.view().patience, 5);
  assert.equal(game.view().proof, null);
  choose(game, "lines", "confirm");
  assert.ok(present(game, fixedPair.slice().reverse()).accepted);
});

test("each confirmation reveals the next thought without grading, and the first quote can be revised after reload", () => {
  let game = start();
  openTopic(game, "salary");
  choose(game, "lines", "confirm");
  const first = game.act({ type: "cite", ref: wrongFixed[0] });
  assert.ok(first);
  assert.equal(first.length, 1);
  assert.equal(first[0].kind, "thought");
  assert.match(first[0].text, /^（那面试时.*我得.*。）$/);
  assert.equal(game.view().stats.submissions, 0);
  assert.equal(game.view().patience, 5);
  game = openNegotiation(boshi, story, game.save());
  assert.equal(game.view().review.activeTopic, "salary");
  assert.equal(game.view().proof?.confirmed[0].line, "quote");
  assert.equal(game.act({ type: "cite", ref: wrongFixed[0] }), null);
  assert.ok(game.act({ type: "revise", index: 0 }));
  assert.equal(game.view().proof?.confirmed.length, 0);
  const correct = present(game, fixedPair.slice().reverse());
  assert.ok(correct.accepted);
  const response = game.view().events.find(event => event.id === correct.id + 1);
  assert.ok(response?.kind === "message");
  assert.equal(response.who, "player");
  assert.match(response.text, /固定八千.*正常工时.*六千八/);
});

test("silence after confirming one line is free and the next attempt starts at its first step", () => {
  const game = start();
  openTopic(game, "salary");
  choose(game, "lines", "confirm");
  assert.ok(game.act({ type: "cite", ref: fixedPair[1] }));
  const reply = game.act({ type: "defer" });
  assert.ok(reply);
  assert.ok(reply.some(event => event.kind === "thought" && event.text.startsWith("（我先")));
  assert.equal(game.view().patience, 5);
  assert.equal(game.view().stats.submissions, 0);
  assert.equal(game.view().review.activeTopic, "salary");
  choose(game, "confirm");
  assert.equal(game.view().proof?.confirmed.length, 0);
});

test("the monthly total is not a fixed wage; the failed submission is saved with its exact quotes", () => {
  let game = start();
  openTopic(game, "salary");
  choose(game, "lines", "confirm");
  const submission = present(game, wrongFixed);
  assert.equal(submission.accepted, false);
  assert.match(eventText(game.view().events.find(event => event.id === submission.id + 1)), /一个是总数，一个是明细/);
  assert.equal(game.view().patience, 4);
  const previous = game.view();
  game = openNegotiation(boshi, story, JSON.parse(JSON.stringify(game.save())));
  assert.deepEqual(game.view(), previous);
  choose(game, "confirm");
  assert.deepEqual(present(game, submission.quotes).quotes, submission.quotes);
  assert.equal(game.view().patience, 3);
});

test("only a written amendment recovers one point and it updates both files", () => {
  const game = start();
  openTopic(game, "salary");
  choose(game, "lines", "insist", "insist", "confirm");
  assert.ok(present(game, fixedPair).accepted);
  assert.equal(game.view().patience, 4);
  assert.equal(latest(game, "contract")!.version, 1);
  assert.equal(game.view().review.choosing, false);
  assert.equal(game.act({ type: "openTopic", from: "clause", id: "hours" }), null);
  choose(game, "counter");
  assert.equal(game.view().patience, 4);
  choose(game, "accept");
  assert.equal(game.view().patience, 5);
  assert.equal(game.view().stats.deadlocks, 1);
  assert.match(lines(game, "contract").join(" "), /固定工资为 7,400 元/);
  assert.match(lines(game, "payroll").join(" "), /固定工资为 7,400 元/);
  assert.equal(game.view().documents.filter(doc => doc.id === "contract").length, 2);
  assert.equal(game.view().review.choosing, true);
  assert.equal(game.view().review.activeTopic, undefined);
  assert.equal(game.view().review.topics.find(item => item.id === "salary")?.amended, true);
  assert.equal(game.view().choices.length, 0);
  assert.match(eventText(openTopic(game, "salary")[0]), /改过的报酬/);
  assert.equal(game.view().review.choosing, true);
  assert.deepEqual(game.view().amendments, ["fixed"]);
  openTopic(game, "hours");
});

test("a single quote can directly rebut the latest statement; a roster is not a settlement rule", () => {
  const game = start();
  openTopic(game, "hours");
  choose(game, "roster", "lines", "roster", "one");
  assert.ok(latest(game, "roster"));
  assert.equal(game.view().proof?.count, 1);
  assert.equal(present(game, [ref("roster", "saturday")]).accepted, false);
  assert.match(eventText(game.view().events.at(-2)), /只写了你哪天要到/);
  choose(game, "one");
  const correct = present(game, weekendLine());
  assert.ok(correct.accepted);
  assert.ok(correct.claim);
  assert.match(correct.claim, /去一场就算一场/);
  assert.equal(correct.quotes.length, 1);
  const response = game.view().events.find(event => event.id === correct.id + 1);
  assert.ok(response?.kind === "message");
  assert.equal(response.who, "player");
  assert.match(response.text, /做满两次才发.*第二场临时取消.*拿不到钱/);
  choose(game, "check", "accept");
  assert.equal(game.view().patience, 5);
  assert.equal(game.view().stats.submissions, 2);
  assert.match(lines(game, "contract").join(" "), /不设最低轮值次数/);
  assert.match(latest(game, "contract")!.sections.find(section => section.id === "hours")!.lines[1].text, /实际工时.*另行结算/);
  assert.match(lines(game, "roster").join(" "), /须到场/);
});

test("the campus card is available from the start and follows the normal proof rules", () => {
  const game = start();
  assert.equal(latest(game, "campusCard")?.name, "校园一卡通");

  openTopic(game, "hours");
  choose(game, "one");
  const submission = present(game, [ref("campusCard", "card")]);
  assert.equal(submission.accepted, false);
  assert.match(eventText(game.view().events.find(event => event.id === submission.id + 1)), /工资还是打银行卡/);
  assert.equal(game.view().patience, 4);
  assert.equal(game.view().review.activeTopic, "hours");
  assert.ok(game.view().choices.some(choice => choice.id === "one"));
});

test("an old quote changed by an amendment remains in the archive but cannot prove the new version", () => {
  const game = start();
  openTopic(game, "salary");
  choose(game, "lines", "confirm");
  present(game, fixedPair);
  choose(game, "accept");
  openTopic(game, "hours");
  choose(game, "one");
  const stale = present(game, weekendLine());
  assert.equal(stale.accepted, false);
  assert.match(stale.quotes[0].text, /计入招聘所列的 8,000/);
  assert.match(eventText(game.view().events.at(-2)), /上一版/);
  choose(game, "one");
  assert.ok(present(game, weekendLine(2)).accepted);
  choose(game, "accept");
  assert.equal(game.view().patience, 5);
});

test("changing the order of the negotiations produces the same final contract and confirmation sheet", () => {
  const fixedFirst = start();
  openTopic(fixedFirst, "salary");
  choose(fixedFirst, "lines", "confirm");
  present(fixedFirst, fixedPair);
  choose(fixedFirst, "accept");
  openTopic(fixedFirst, "hours");
  choose(fixedFirst, "one");
  present(fixedFirst, weekendLine(2));
  choose(fixedFirst, "accept");

  const weekendFirst = start();
  openTopic(weekendFirst, "hours");
  choose(weekendFirst, "lines", "one");
  present(weekendFirst, weekendLine());
  choose(weekendFirst, "accept");
  openTopic(weekendFirst, "salary");
  choose(weekendFirst, "confirm");
  assert.ok(present(weekendFirst, fixedPair).accepted, "Unchanged lines from an earlier version are still usable");
  choose(weekendFirst, "accept");
  for (const id of ["contract", "payroll"]) assert.deepEqual(lines(fixedFirst, id), lines(weekendFirst, id));
  assert.equal(weekendFirst.view().patience, 5);
  assert.deepEqual(weekendFirst.view().choices, []);
});

test("reopening an amended topic can produce a second revision without replaying the original dispute", () => {
  const game = start();
  openTopic(game, "hours");
  choose(game, "lines", "one");
  for (let attempt = 0; attempt < 2; attempt++) {
    assert.equal(present(game, [ref("interview", "extra")]).accepted, false);
    choose(game, "one");
  }
  assert.ok(present(game, weekendLine()).accepted);
  choose(game, "accept");
  assert.equal(game.view().patience, 4);
  openTopic(game, "hours");
  assert.deepEqual(game.view().choices.map(choice => choice.id), ["request", "later"]);
  choose(game, "request", "accept");
  assert.equal(game.view().patience, 5);
  assert.deepEqual(game.view().amendments, ["weekend", "timeRecords"]);
  const records = game.view().documents.filter(doc => doc.id === "contract").map(doc =>
    doc.sections.find(section => section.id === "hours")!.lines.find(line => line.id === "record")!.text);
  assert.equal(new Set(records).size, 3);
  assert.match(records[2], /提供本人明细/);
  openTopic(game, "hours");
  assert.equal(game.view().review.choosing, true);
  assert.deepEqual(game.view().amendments, ["weekend", "timeRecords"]);
});

test("attachment playback waits after a batch even with reduced motion or a skip request", async () => {
  const log: (string | number)[] = [];
  let resume: (() => void) | undefined;
  const playback = createPlayback({
    show: event => { log.push(event.id); return undefined; },
    waiting: () => {},
    reviewFiles: event => new Promise(resolve => { resume = resolve; log.push(`review ${event.id}`); }),
    onIdle: () => log.push("idle"),
    reduced: () => true,
  });
  const pending = playback.play([{ id: 1, kind: "file", document: "contract", version: 2, name: "合同", revised: true }, { id: 2, kind: "file", document: "attachment", version: 2, name: "附件", revised: true }, { id: 3, kind: "thought", text: "看完了。" }]);
  playback.skip();
  assert.deepEqual(log, [1, 2, "review 2"]);
  assert.ok(resume);
  resume();
  await pending;
  assert.deepEqual(log, [1, 2, "review 2", 3, "idle"]);
});

test("at zero, only leave or a full-patience continuation is available; continuing retains the dossier and transcript", () => {
  let game = start();
  openTopic(game, "salary");
  choose(game, "lines", "confirm");
  present(game, fixedPair);
  choose(game, "accept");
  openTopic(game, "hours");
  for (let index = 0; index < 5; index++) {
    choose(game, "one");
    present(game, weekendLine());
  }
  assert.equal(game.view().phase, "refused");
  assert.equal(game.view().patience, 0);
  assert.match(eventText(game.view().events.at(-2)), /签署流程停一下/);
  assert.equal(game.act({ type: "choose", id: "one" }), null);
  assert.equal(game.act({ type: "openTopic", from: "clause", id: "term" }), null);
  assert.equal(game.act({ type: "finish", result: "sign" }), null);
  const saved = game.save();
  const refused = game.view();
  game = openNegotiation(boshi, story, saved);
  assert.deepEqual(game.view(), refused);
  assert.ok(game.act({ type: "continue" }));
  const resumed = game.view();
  assert.equal(resumed.patience, 5);
  assert.equal(resumed.stats.continues, 1);
  assert.equal(resumed.review.activeTopic, "hours");
  assert.deepEqual(resumed.documents, refused.documents);
  assert.deepEqual(resumed.amendments, ["fixed"]);
  assert.deepEqual(resumed.events.slice(0, refused.events.length), refused.events);
  for (let index = 0; index < 5; index++) choose(game, "roster", "cancel", "insist");
  assert.equal(game.view().patience, 0);
  assert.ok(game.act({ type: "continue" }));
  assert.equal(game.view().stats.continues, 2);
  assert.ok(game.act({ type: "finish", result: "sign" }));
  assert.equal(game.view().outcome, "sign");
  assert.equal(game.view().stats.continues, 2);
});

test("only the player can start any of the six clause topics", () => {
  const game = start();
  const ids = ["term", "role", "hours", "salary", "insurance", "copy"];
  assert.deepEqual(game.view().review.topics.map(topic => topic.id), ids);
  assert.equal(game.view().review.choosing, true);
  assert.equal(game.act({ type: "choose", id: "confirm" }), null);
  assert.equal(game.act({ type: "openTopic", from: "clause", id: "unknown" }), null);
  for (const id of ids) {
    const opened = openTopic(game, id);
    assert.ok(opened[0].kind === "message" && opened[1].kind === "message");
    assert.equal(opened[0].who, "player");
    assert.equal(opened[1].who, "contact");
    assert.equal(game.view().review.activeTopic, id);
    assert.equal(game.act({ type: "openTopic", from: "clause", id: "term" }), null);
    assert.ok(game.act({ type: "endTopic" }));
    assert.equal(game.view().review.choosing, true);
  }
  assert.equal(game.view().patience, 5);
});

test("ordinary clauses and voluntary pauses return to review without restoring patience", () => {
  const game = start();
  openTopic(game, "salary");
  choose(game, "lines", "insist", "insist");
  assert.equal(game.view().patience, 4);
  assert.ok(game.act({ type: "endTopic" }));
  for (const [id, followUp] of [["term", "dates"], ["role", "locations"], ["insurance", "records"], ["copy", "files"]]) {
    openTopic(game, id);
    choose(game, followUp);
    assert.equal(game.view().review.choosing, true);
    assert.equal(game.view().patience, 4);
  }
  assert.deepEqual(game.view().amendments, []);
  assert.ok(latest(game, "payroll"));
});

test("the player may sign the original or abandon after a refusal", () => {
  const direct = start();
  assert.ok(direct.act({ type: "finish", result: "sign" }));
  assert.equal(direct.view().outcome, "sign");
  assert.deepEqual(direct.view().amendments, []);
  assert.ok(latest(direct, "payroll"));

  const refused = start();
  openTopic(refused, "salary");
  choose(refused, "lines");
  for (let index = 0; index < 5; index++) choose(refused, "insist", "insist");
  assert.ok(refused.act({ type: "finish", result: "leave" }));
  assert.equal(refused.view().outcome, "leave");
  assert.equal(refused.act({ type: "continue" }), null);
});

test("a floor plan discovery opens a reply and supplies evidence without forcing a conversation", () => {
  const { chapter, story } = demoChapter;
  let game = openNegotiation(chapter, story);
  const hotspot = { type: "openTopic", from: "hotspot", id: "window" } as const;
  assert.equal(game.act(hotspot), null);
  openTopic(game, "delivery");
  assert.deepEqual(game.view().choices.map(choice => choice.id), ["later"]);
  choose(game, "later");
  assert.ok(game.act({ type: "investigate", id: "window" })?.some(event => event.kind === "discovery"));
  assert.equal(game.view().review.activeTopic, undefined);
  assert.equal(game.act({ type: "investigate", id: "window" }), null);
  game = openNegotiation(chapter, story, game.save());
  assert.ok(game.act(hotspot));
  choose(game, "show");
  assert.ok(present(game, [ref("observation", "stain")]).accepted);
  choose(game, "accept");
  assert.deepEqual(game.view().amendments, ["repair"]);
  assert.match(lines(game, "contract").join(" "), /共同验收/);
  assert.deepEqual(openNegotiation(chapter, story, game.save()).view(), game.view());
});

test("the standalone Ink preview can enter any of Boshi's six topics without game state", () => {
  for (const label of ["合同期限", "岗位与地点", "工作时间", "劳动报酬", "社会保险", "文本与附件"]) {
    const preview = new Story(story);
    preview.allowExternalFunctionFallbacks = true;
    while (preview.canContinue) preview.Continue();
    const choice = preview.currentChoices.find(item => item.text.includes(label));
    assert.ok(choice);
    preview.ChooseChoiceIndex(choice.index);
    assert.match(preview.Continue() ?? "", /我/);
    while (preview.canContinue) preview.Continue();
    assert.ok(preview.currentChoices.length);
  }
});
