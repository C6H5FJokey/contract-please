import test from "node:test";
import assert from "node:assert/strict";
import { cases } from "../dist/data.js";
import { directions, reviews } from "../dist/comparisons.js";
import {
  newGame,
  act,
  sourceAt,
  sourceLines,
  getQuote,
  finish,
  report,
  validGame,
  readSave,
  SAVE_VERSION,
} from "../dist/engine.js";

function ask(game, clause, direction) {
  return act({ ...game, selectedClause: clause }, { type: "ask", direction })
    .game;
}

function cite(game, source, fragment, version = game.selectedVersion) {
  const line = sourceLines(sourceAt(game, source, version)).find((item) =>
    item.text.includes(fragment),
  );
  assert.ok(line, `Missing quote in ${source}: ${fragment}`);
  assert.ok(getQuote(game, line.key), `Inaccessible quote: ${line.key}`);
  return act(game, { type: "quote", key: line.key }).game;
}

function raise(game, issue, request = "amend") {
  game = act(game, { type: "clear-quotes" }).game;
  for (const [anchor] of reviews[game.caseId].comparisons[issue].groups) {
    game = cite(game, anchor.source, anchor.fragment, 0);
  }
  return act(game, { type: "challenge", request }).game;
}

function salaryBasisComparison() {
  let game = ask(newGame("boshi"), "salary", "calculation");
  game = cite(game, "file:payroll", "完成当月两次周六布撤展");
  game = cite(game, "file:payroll", "正常工时固定工资为 6,800 元");
  return cite(game, "clause:salary", "税前月度薪酬标准为 8,000 元");
}

test("screenshot comparison explains the conditional 8,000 without treating it as an explicit fixed wage promise", () => {
  const original = salaryBasisComparison();
  const explained = act(original, {
    type: "challenge",
    request: "explain",
  }).game;
  assert.match(explained.messages.at(-1).text, /6,800 元.*1,200 元.*两次周六/);
  assert.deepEqual(explained.findings, []);
  assert.deepEqual(explained.revisions, []);
  const clarified = act(original, {
    type: "challenge",
    request: "clarify",
  }).game;
  assert.match(
    sourceAt(clarified, "clause:salary").text,
    /固定税前工资为 6,800 元/,
  );
  assert.equal(report(finish(clarified, "sign")).income, 6800);
  const negotiated = act(original, {
    type: "challenge",
    request: "amend",
  }).game;
  assert.match(negotiated.messages.at(-1).text, /调整薪资报价/);
  assert.deepEqual(negotiated.revisions, []);
});

test("submitted quotes remain editable and can be reused from the conversation after reopening the save", () => {
  const original = salaryBasisComparison();
  const submitted = act(original, {
    type: "challenge",
    request: "clarify",
  }).game;
  assert.deepEqual(submitted.quotes, original.quotes);
  const index = submitted.messages.length - 2;
  assert.deepEqual(submitted.messages[index].quoteKeys, original.quotes);
  const cleared = act(submitted, { type: "clear-quotes" }).game;
  assert.deepEqual(cleared.quotes, []);
  const loaded = readSave(
    JSON.stringify({ version: SAVE_VERSION, game: cleared, completed: {} }),
  ).game;
  assert.deepEqual(
    act(loaded, { type: "reuse-quotes", index }).game.quotes,
    original.quotes,
  );
  delete loaded.messages[index].quoteKeys;
  assert.deepEqual(
    act(loaded, { type: "reuse-quotes", index }).game.quotes,
    original.quotes,
  );
});

for (const scenario of cases) {
  test(`${scenario.id} has reachable quote combinations and consistent revisions`, () => {
    const review = reviews[scenario.id];
    let game = newGame(scenario.id);
    for (const [clause, routes] of Object.entries(review.routes)) {
      assert.ok(scenario.clauses.some((item) => item.id === clause));
      for (const [direction, files] of Object.entries(routes)) {
        assert.ok(directions.some((item) => item.id === direction));
        for (const id of files)
          assert.ok(scenario.evidence.some((item) => item.id === id));
        game = ask(game, clause, direction);
      }
    }
    for (const issue of scenario.issues) {
      const rule = review.comparisons[issue.id];
      assert.ok(rule.groups.length >= 2 && rule.groups.length <= 3);
      for (const anchor of rule.groups.flat()) {
        assert.ok(
          sourceLines(sourceAt(game, anchor.source, 0)).some((item) =>
            item.text.includes(anchor.fragment),
          ),
        );
      }
      game = raise(game, issue.id);
    }
    assert.ok(validGame(game));
    assert.equal(game.revisions.length, scenario.issues.length);
    assert.ok(
      report(finish(game, "sign")).issues.every((item) => item.amended),
    );
    assert.equal(finish(game, "reject").decision, "reject");
  });
}

test("directions provide overlapping materials with no turn budget", () => {
  let game = newGame("boshi");
  for (let index = 0; index < 25; index++) game = ask(game, "term", "scope");
  assert.equal(game.evidence.length, 0);
  game = ask(game, "salary", "conditions");
  assert.deepEqual(game.evidence, ["payroll", "roster"]);
  game = ask(game, "hours", "calculation");
  assert.deepEqual(game.evidence, ["payroll", "roster"]);
  assert.equal(finish(game, "sign").decision, "sign");
});

test("obtaining the right document does not validate irrelevant quoted text", () => {
  let game = ask(newGame("boshi"), "salary", "calculation");
  game = cite(game, "interview", "固定税前");
  game = cite(game, "file:payroll", "每月 10 日发放");
  game = act(game, { type: "challenge", request: "amend" }).game;
  assert.deepEqual(game.findings, []);
  assert.deepEqual(game.revisions, []);
  assert.equal(getQuote(newGame("boshi"), "file:payroll|0|0"), null);
});

test("clarifying the fixed wage changes text but leaves the promise and weekend dispute unresolved", () => {
  let game = ask(newGame("boshi"), "salary", "calculation");
  game = raise(game, "basePay", "clarify");
  assert.match(sourceAt(game, "clause:salary").text, /6,800/);
  const result = report(finish(game, "sign"));
  assert.equal(result.income, 6800);
  assert.equal(result.issues[0].clarified, true);
  assert.equal(result.issues[0].amended, false);
  assert.equal(result.issues[1].raised, false);
});

test("pay and overtime changes compose in either order and update the actual attachment", () => {
  for (const order of [
    ["basePay", "overtime"],
    ["overtime", "basePay"],
  ]) {
    let game = ask(newGame("boshi"), "salary", "conditions");
    for (const issue of order) game = raise(game, issue, "clarify");
    for (const issue of order) game = raise(game, issue);
    const attachment = sourceAt(game, "file:payroll").text;
    assert.match(attachment, /固定工资为 7,400/);
    assert.match(attachment, /加班待遇按实际工时依法另行结算/);
    assert.doesNotMatch(attachment, /完成当月两次/);
    assert.match(sourceAt(game, "clause:hours").text, /按实际工时记录/);
    assert.match(sourceAt(game, "file:payroll", 0).text, /6,800/);
    assert.equal(report(finish(game, "sign")).income, 7400);
    assert.equal(
      finish({ ...game, selectedVersion: 0 }, "sign").phase,
      "playing",
    );
  }
});

test("tax-before and estimated net figures get an explanation without a fake conflict", () => {
  let game = ask(newGame("yuanxu"), "salary", "calculation");
  game = cite(game, "clause:salary", "固定税前工资");
  game = cite(game, "file:payroll", "预计实发");
  game = act(game, { type: "challenge", request: "amend" }).game;
  assert.match(game.messages.at(-1).text, /是税前固定工资/);
  assert.equal(game.revisions.length, 0);
  assert.equal(report(finish(game, "sign")).issues.length, 0);
});

test("an entity mismatch needs the responsibility line as well as the two company names", () => {
  let game = ask(newGame("yuchuan"), "party", "responsibility");
  game = cite(game, "clause:party", "与川商务咨询");
  game = cite(game, "file:manager", "由与川数字招聘");
  assert.equal(
    act(game, { type: "challenge", request: "amend" }).game.revisions.length,
    0,
  );
  game = cite(game, "file:entities", "各业务单位自行协调");
  game = act(game, { type: "challenge", request: "amend" }).game;
  assert.equal(game.revisions.length, 1);
  assert.match(sourceAt(game, "clause:party").text, /甲方为与川数字/);
});

test("save roundtrip keeps drafted quotes and archived versions; old and broken saves recover", () => {
  let game = ask(newGame("boshi"), "salary", "calculation");
  game = raise(game, "basePay", "clarify");
  game = cite(game, "file:payroll", "固定工资为 6,800 元", 0);
  const payload = { version: SAVE_VERSION, game, completed: {} };
  assert.deepEqual(readSave(JSON.stringify(payload)), { game, completed: {} });
  assert.equal(readSave(JSON.stringify({ ...payload, version: 1 })), null);
  assert.equal(readSave("{"), null);
  assert.equal(validGame({ ...game, quotes: ["file:missing|0|0"] }), false);
});

test("legacy saves keep their contract progress after optional features are removed", () => {
  let game = ask(newGame("boshi"), "salary", "calculation");
  game = raise(game, "basePay", "clarify");
  const legacy = {
    ...game,
    priority: "weekend",
    marks: ["salary"],
    backup: true,
    messages: [
      ...game.messages,
      {
        person: "招聘平台",
        text: "另一家公司的面试已预约在七天后。",
        type: "system",
      },
    ],
  };
  const payload = { version: SAVE_VERSION, game: legacy, completed: {} };
  const loaded = readSave(JSON.stringify(payload)).game;
  assert.deepEqual(loaded, game);
  assert.equal(report(finish(loaded, "reject")).title, "你谢绝了这份邀约。");
});
