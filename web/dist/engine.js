import { cases } from "./data.js";
import { directions, requests, reviews } from "./comparisons.js";

export const SAVE_VERSION = 2;
export const getCase = (id) => cases.find((item) => item.id === id);

export function newGame(caseId) {
  const scenario = getCase(caseId);
  if (!scenario) throw new Error("Unknown case");
  return {
    caseId,
    evidence: [],
    revisions: [],
    findings: [],
    quotes: [],
    selectedVersion: 0,
    selectedClause: null,
    phase: "playing",
    decision: null,
    messages: [
      { person: `HR ${scenario.hr}`, text: scenario.opening, type: "npc" },
    ],
  };
}

function originalSource(game, id) {
  const scenario = getCase(game.caseId);
  if (id === "interview")
    return { name: "面试聊天", text: reviews[game.caseId].interview };
  const [kind, key] = id.split(":");
  if (kind === "file") return scenario.evidence.find((item) => item.id === key);
  if (kind === "clause") {
    const clause = scenario.clauses.find((item) => item.id === key);
    if (clause) return { name: clause.label, text: clause.text };
  }
}

export function sourceAt(game, id, version = game.selectedVersion) {
  const original = originalSource(game, id);
  if (!original || version < 0 || version > game.revisions.length) return null;
  if (id === "interview")
    return { id, ...original, original: original.text, version: 0 };
  let text = original.text;
  const [kind, key] = id.split(":");
  const review = reviews[game.caseId];
  for (const revision of game.revisions.slice(0, version)) {
    const issue = getCase(game.caseId).issues.find(
      (item) => item.id === revision.issue,
    );
    const rule = review.comparisons[revision.issue];
    if (revision.kind === "amend") {
      if (kind === "clause") text = issue.changes?.[key] ?? text;
      if (kind === "file") text = rule.attachments?.[key] ?? text;
    }
    const patches =
      revision.kind === "amend" ? rule.patches : rule.clarification.patches;
    for (const patch of patches ?? []) {
      if (patch.source !== id) continue;
      const before = text.includes(patch.before)
        ? patch.before
        : patch.alternative;
      if (before) text = text.replace(before, patch.after);
    }
  }
  return { id, name: original.name, text, original: original.text, version };
}

export function contractAt(game) {
  return getCase(game.caseId).clauses.map((clause) => {
    const source = sourceAt(game, `clause:${clause.id}`);
    return {
      ...clause,
      original: source.original,
      text: source.text,
      changed: source.text !== source.original,
    };
  });
}

export function sourceLines(source) {
  return (source.text.match(/[^。！？\n]+[。！？]?/g) ?? []).map(
    (text, index) => ({
      key: `${source.id}|${source.version}|${index}`,
      source: source.id,
      name: source.name,
      version: source.version,
      text: text.trim(),
    }),
  );
}

export function getQuote(game, key) {
  if (typeof key !== "string") return null;
  const match = /^([a-zA-Z:]+)\|(\d+)\|(\d+)$/.exec(key);
  if (!match) return null;
  const [, id, version, index] = match;
  if (id.startsWith("file:") && !game.evidence.includes(id.slice(5)))
    return null;
  const source = sourceAt(game, id, Number(version));
  return source ? (sourceLines(source)[Number(index)] ?? null) : null;
}

function receiveFiles(game, files) {
  const scenario = getCase(game.caseId);
  for (const id of files) {
    const evidence = scenario.evidence.find((item) => item.id === id);
    if (!game.evidence.includes(id)) game.evidence.push(id);
    const version = game.revisions.length;
    const source = sourceAt(game, `file:${id}`, version);
    const reply =
      source.text === source.original
        ? evidence.reply
        : `这份材料已经更新，请核对 v${version + 1} 随附的内容。`;
    game.messages.push({
      person: evidence.person,
      text: reply,
      evidenceId: id,
      type: "npc",
    });
  }
}

function matches(groups, quotes) {
  return groups.every((alternatives) =>
    alternatives.some(({ source, fragment }) =>
      quotes.some(
        (entry) => entry.source === source && entry.text.includes(fragment),
      ),
    ),
  );
}

function submittedQuoteKeys(game, entry) {
  if (
    !Array.isArray(entry?.citations) ||
    entry.citations.length < 2 ||
    entry.citations.length > 3
  )
    return null;
  const matchesCitation = (line, item) =>
    line && line.name === item?.name && line.text === item?.text;
  if (
    Array.isArray(entry.quoteKeys) &&
    entry.quoteKeys.length === entry.citations.length &&
    new Set(entry.quoteKeys).size === entry.quoteKeys.length &&
    entry.quoteKeys.every((key, index) =>
      matchesCitation(getQuote(game, key), entry.citations[index]),
    )
  )
    return entry.quoteKeys;

  // Earlier saves recorded the submitted text without source references.
  const scenario = getCase(game.caseId);
  const ids = [
    "interview",
    ...scenario.clauses.map((item) => `clause:${item.id}`),
    ...game.evidence.map((id) => `file:${id}`),
  ];
  const lines = ids.flatMap((id) =>
    Array.from({ length: game.revisions.length + 1 }, (_, version) =>
      sourceLines(sourceAt(game, id, version)),
    ).flat(),
  );
  const keys = entry.citations.map(
    (item) => lines.find((line) => matchesCitation(line, item))?.key,
  );
  return keys.every(Boolean) && new Set(keys).size === keys.length
    ? keys
    : null;
}

function challenge(game, request) {
  const quotes = game.quotes.map((key) => getQuote(game, key));
  const scenario = getCase(game.caseId);
  const review = reviews[game.caseId];
  const conflict = scenario.issues.find((item) =>
    matches(review.comparisons[item.id].groups, quotes),
  );
  const context =
    !conflict && review.contextual && matches(review.contextual.groups, quotes)
      ? review.contextual
      : null;
  const issue =
    conflict ?? scenario.issues.find((item) => item.id === context?.issueId);
  game.messages.push({
    person: "你",
    text: request.text,
    citations: quotes.map(({ name, text }) => ({ name, text })),
    quoteKeys: [...game.quotes],
    type: "player",
  });

  let reply;
  let revision;
  if (!issue) {
    reply =
      review.compatible && matches(review.compatible.groups, quotes)
        ? review.compatible.reply
        : "我看到了你引用的原文。先确认一下，你是说这两段在同一个人、同一个时期或同一种条件下给了不同说法吗？我们可以再对一下。";
  } else {
    const rule = review.comparisons[issue.id];
    if (conflict && !game.findings.includes(issue.id))
      game.findings.push(issue.id);
    const amended = game.revisions.some(
      (item) => item.issue === issue.id && item.kind === "amend",
    );
    if (amended) {
      reply =
        "这组原文对应的是我们刚才谈过的条件。最新书面稿已经调整过，你可以直接对照现行稿和附件。";
    } else if (request.id === "amend" && conflict) {
      reply = issue.reply;
      revision = { issue: issue.id, kind: "amend" };
    } else if (
      request.id === "clarify" &&
      rule.clarification &&
      !game.revisions.some((item) => item.issue === issue.id)
    ) {
      reply = rule.clarification.reply;
      revision = { issue: issue.id, kind: "clarify" };
    } else {
      reply = context
        ? request.id === "amend"
          ? context.negotiationReply
          : context.reply
        : rule.explanation;
    }
  }
  if (revision) {
    game.revisions.push(revision);
    game.selectedVersion = game.revisions.length;
  }
  game.messages.push({
    person: `HR ${scenario.hr}`,
    text: reply,
    revision: revision ? game.selectedVersion : null,
    type: "npc",
  });
  return revision ? "收到书面改稿" : "已收到回复";
}

export function act(game, action) {
  if (game.phase !== "playing") return { game, notice: "这份邀约已复盘。" };
  const next = structuredClone(game);
  const scenario = getCase(game.caseId);
  const review = reviews[game.caseId];
  if (action.type === "ask") {
    const direction = directions.find((item) => item.id === action.direction);
    const clause = scenario.clauses.find(
      (item) => item.id === game.selectedClause,
    );
    if (!clause || !direction) return { game, notice: "先选择想追问的条款。" };
    next.messages.push({
      person: "你",
      text: `关于「${clause.label}」，${direction.text}`,
      type: "player",
    });
    const files = review.routes[clause.id]?.[direction.id];
    if (files) receiveFiles(next, files);
    else
      next.messages.push({
        person: `HR ${scenario.hr}`,
        text: `这项目前按合同执行。${sourceAt(game, `clause:${clause.id}`, game.revisions.length).text}`,
        type: "npc",
      });
    return { game: next, notice: files ? "对方发来了相关材料" : "已收到回复" };
  }
  if (action.type === "request-file" && review.directory.includes(action.id)) {
    if (game.evidence.includes(action.id))
      return { game, notice: "材料已在文件夹里。" };
    const evidence = scenario.evidence.find((item) => item.id === action.id);
    next.messages.push({
      person: "你",
      text: `请把《${evidence.name}》发我看一下。`,
      type: "player",
    });
    receiveFiles(next, [action.id]);
    return { game: next, notice: "对方发来了附件" };
  }
  if (action.type === "quote" && getQuote(game, action.key)) {
    if (next.quotes.includes(action.key))
      next.quotes = next.quotes.filter((key) => key !== action.key);
    else if (next.quotes.length === 3)
      return {
        game,
        notice: "一项质疑可引用三段。可以移除一段，或清空后另起一组。",
      };
    else next.quotes.push(action.key);
    return { game: next };
  }
  if (action.type === "clear-quotes") {
    next.quotes = [];
    return { game: next };
  }
  if (action.type === "reuse-quotes") {
    const keys = submittedQuoteKeys(game, game.messages[action.index]);
    if (!keys) return { game, notice: "这条记录的原文无法重新定位。" };
    next.quotes = [...keys];
    return { game: next, notice: "已把这组原文放回对照" };
  }
  if (action.type === "challenge") {
    const request = requests.find((item) => item.id === action.request);
    if (!request || game.quotes.length < 2)
      return { game, notice: "先从材料里引用至少两段具体原文。" };
    const notice = challenge(next, request);
    return { game: next, notice };
  }
  return { game, notice: "这项操作已经完成。" };
}

export function finish(game, decision) {
  if (game.phase !== "playing" || !["sign", "reject"].includes(decision))
    return game;
  if (decision === "sign" && game.selectedVersion !== game.revisions.length)
    return game;
  return {
    ...game,
    selectedVersion: game.revisions.length,
    phase: "report",
    decision,
  };
}

export function report(game) {
  const scenario = getCase(game.caseId);
  const amended = game.revisions
    .filter((item) => item.kind === "amend")
    .map((item) => item.issue);
  const clarified = game.revisions
    .filter((item) => item.kind === "clarify")
    .map((item) => item.issue);
  let income = scenario.income;
  for (const issue of scenario.issues) {
    if (amended.includes(issue.id) && issue.income) income = issue.income;
  }
  const issues = scenario.issues.map((issue) => {
    const rule = reviews[game.caseId].comparisons[issue.id];
    const examples = rule.groups.map(([anchor]) => {
      const source = sourceAt(game, anchor.source, 0);
      return sourceLines(source).find((entry) =>
        entry.text.includes(anchor.fragment),
      );
    });
    return {
      ...issue,
      examples,
      amended: amended.includes(issue.id),
      clarified: clarified.includes(issue.id),
      raised: game.findings.includes(issue.id),
    };
  });
  if (game.decision === "reject")
    return {
      issues,
      income,
      title: "你谢绝了这份邀约。",
      lead: "复盘按最后一份书面稿展示签署后的可能结果。",
    };
  const unresolved = issues.some((issue) => !issue.amended);
  return {
    issues,
    income,
    title: unresolved ? "入职后，按签下的条件执行。" : "你签下了核对过的条件。",
    lead: unresolved
      ? "看看哪些地方已经改进书面稿，哪些仍按原条件执行。"
      : scenario.good,
  };
}

const uniqueAllowed = (value, allowed) =>
  Array.isArray(value) &&
  new Set(value).size === value.length &&
  value.every((item) => allowed.includes(item));

export function validGame(game) {
  if (!game || typeof game !== "object") return false;
  const scenario = getCase(game.caseId);
  if (!scenario || !["playing", "report"].includes(game.phase)) return false;
  const issueIds = scenario.issues.map((item) => item.id);
  const clauseIds = scenario.clauses.map((item) => item.id);
  if (
    !uniqueAllowed(
      game.evidence,
      scenario.evidence.map((item) => item.id),
    ) ||
    !uniqueAllowed(game.findings, issueIds)
  )
    return false;
  if (
    !Array.isArray(game.revisions) ||
    !game.revisions.every(
      (item) =>
        item &&
        issueIds.includes(item.issue) &&
        (item.kind === "amend" ||
          (item.kind === "clarify" &&
            reviews[game.caseId].comparisons[item.issue].clarification)),
    )
  )
    return false;
  if (
    !Number.isInteger(game.selectedVersion) ||
    game.selectedVersion < 0 ||
    game.selectedVersion > game.revisions.length
  )
    return false;
  return (
    (game.selectedClause === null || clauseIds.includes(game.selectedClause)) &&
    Array.isArray(game.quotes) &&
    game.quotes.length <= 3 &&
    new Set(game.quotes).size === game.quotes.length &&
    game.quotes.every((key) => getQuote(game, key)) &&
    Array.isArray(game.messages) &&
    game.messages.every(
      (item) =>
        item &&
        typeof item.text === "string" &&
        typeof item.person === "string" &&
        (!item.citations ||
          (Array.isArray(item.citations) &&
            item.citations.every(
              (citation) =>
                citation &&
                typeof citation.name === "string" &&
                typeof citation.text === "string",
            ))) &&
        ["npc", "player", "system"].includes(item.type),
    ) &&
    (game.phase === "playing"
      ? game.decision === null
      : ["sign", "reject"].includes(game.decision))
  );
}

export function readSave(raw) {
  try {
    const parsed = JSON.parse(raw);
    if (
      parsed?.version !== SAVE_VERSION ||
      (parsed.game !== null && !validGame(parsed.game)) ||
      !parsed.completed ||
      typeof parsed.completed !== "object" ||
      Array.isArray(parsed.completed)
    )
      return null;
    const completed = Object.fromEntries(
      Object.entries(parsed.completed).filter(
        ([id, entry]) =>
          getCase(id) && entry && ["sign", "reject"].includes(entry.decision),
      ),
    );
    const game = parsed.game;
    if (game) {
      delete game.priority;
      delete game.marks;
      delete game.backup;
      game.messages = game.messages.filter(
        (item) => item.type !== "system" || item.person !== "招聘平台",
      );
    }
    return { game, completed };
  } catch {
    return null;
  }
}
