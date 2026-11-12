import { findChapter } from "./chapters/index.js";
import { openNegotiation } from "./negotiation.js";
import { createPlayback } from "./playback.js";

const $ = id => document.getElementById(id);
const chapter = findChapter(new URLSearchParams(location.search).get("chapter"));
const timeline = $("timeline");
const chat = timeline.closest(".chat");
const composer = $("composer");
const sheet = $("sheet");
const board = document.querySelector(".board");
const modal = $("modal");
const saveKey = `contract-please:negotiation:${chapter.id}`;
const startOfLog = timeline.firstElementChild;
const currentFileKey = (id, version) => `${id}:${version}`;
const quoteKey = ref => `${ref.document}:${ref.line}`;
const quoteRef = ({ document, version, line }) => ({ document, version, line });
const asThought = text => `（${text}）`;
const node = (tag, className, text) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
};
function button(text, handler, className = "") {
  const result = node("button", className, text);
  result.type = "button";
  result.addEventListener("click", handler);
  return result;
}

function load() {
  try {
    const saved = localStorage.getItem(saveKey);
    if (saved) {
      const progress = JSON.parse(saved);
      return { game: openNegotiation(chapter, progress), restored: true, readThrough: progress.readThrough };
    }
  } catch { /* A bad or obsolete save opens a new session. */ }
  return { game: openNegotiation(chapter), restored: false };
}

let { game, restored, readThrough } = load();
let view = game.view();
let delivered, unread, docId, docVersion, picked, reused, displayPatience, waitRow, resultRow, skipButton;
let playing = false;
let fileReview;
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

for (const [id, label] of Object.entries({
  "case-title": chapter.title, "case-subtitle": chapter.subtitle, "case-setting": chapter.setting,
  avatar: chapter.contact.mark, contact: chapter.contact.name, "contact-role": chapter.contact.role,
})) $(id).textContent = label;

function switchPane(pane) {
  board.dataset.pane = pane;
  $("tab-docs").setAttribute("aria-pressed", String(pane === "docs"));
  $("tab-chat").setAttribute("aria-pressed", String(pane === "chat"));
}
$("tab-docs").addEventListener("click", () => switchPane("docs"));
$("tab-chat").addEventListener("click", () => switchPane("chat"));

const atBottom = () => timeline.scrollHeight - timeline.clientHeight - timeline.scrollTop < 46;
const scrollToEnd = () => { timeline.scrollTop = timeline.scrollHeight; };
function log(element) {
  const follow = atBottom();
  timeline.append(element);
  if (follow) scrollToEnd();
}

function visibleFiles() {
  return view.documents.filter(file => delivered.has(currentFileKey(file.id, file.version)));
}

function openFile(id, version = null) {
  const files = visibleFiles().filter(file => file.id === id);
  if (!files.length) return;
  docId = id;
  docVersion = version === files.at(-1).version ? null : version;
  unread.delete(id);
  switchPane("docs");
  renderDocuments(true);
}

function updateQuotes() {
  const confirmed = view.proof?.confirmed ?? [];
  sheet.querySelectorAll("[data-quote]").forEach(element => {
    const isPicked = picked && quoteKey(picked) === element.dataset.quote &&
      picked.version === Number(element.dataset.version);
    const used = confirmed.find(ref => quoteKey(ref) === element.dataset.quote);
    element.setAttribute("aria-pressed", String(Boolean(isPicked || used?.version === Number(element.dataset.version))));
    element.disabled = Boolean(used);
  });
  const footer = $("doc-footer");
  footer.classList.toggle("file-review", Boolean(fileReview));
  footer.hidden = !fileReview && (!view.proof || playing);
  footer.replaceChildren();
  if (fileReview) {
    footer.append(button("看完了，继续", finishFileReview, "primary mobile-only"));
  } else if (!footer.hidden) {
    footer.append(node("span", "", `第 ${confirmed.length + 1} / ${view.proof.count} 段 · ${picked ? "已圈选" : "待圈选"}`),
      button("返回交涉", () => { switchPane("chat"); scrollToEnd(); }, "quiet mobile-only"));
  }
  if (footer.hidden) sheet.classList.remove("quote-target");
}

function pickQuote(quote) {
  picked = quote;
  sheet.classList.remove("quote-target");
  updateQuotes();
  renderComposer();
}

function focusQuotation() {
  switchPane("docs");
  sheet.classList.add("quote-target");
  const lines = [...sheet.querySelectorAll(".quote-line:enabled")];
  const bounds = sheet.getBoundingClientRect();
  const target = lines.find(line => {
    const box = line.getBoundingClientRect();
    return box.top >= bounds.top && box.bottom <= bounds.bottom;
  }) ?? lines[0];
  if (target) {
    target.focus({ preventScroll: true });
    target.scrollIntoView({ block: "nearest", inline: "nearest" });
  } else sheet.focus({ preventScroll: true });
}

function previousTexts(versions, current) {
  const history = new Map();
  const previous = new Map();
  for (const version of versions) {
    for (const { lines } of version.sections) {
      for (const line of lines) {
        const old = previous.get(line.id);
        if (old && old.text !== line.text) {
          if (!history.has(line.id)) history.set(line.id, []);
          history.get(line.id).push(old);
        }
        previous.set(line.id, { text: line.text, version: version.version });
      }
    }
    if (version === current) break;
  }
  return history;
}

function renderDocuments(resetScroll = false) {
  const scroll = sheet.scrollTop;
  const available = visibleFiles();
  const tabs = $("file-tabs");
  const files = [...new Map(available.map(file => [file.id, file])).values()];
  $("doc-count").textContent = `${files.length} 份文件`;
  tabs.replaceChildren(...files.map(file => {
    const tab = button(file.name, () => openFile(file.id), "file-tab");
    tab.setAttribute("aria-pressed", String(docId === file.id));
    if (unread.has(file.id)) tab.classList.add("unread");
    return tab;
  }));
  const versions = available.filter(file => file.id === docId);
  const latest = versions.at(-1);
  const current = versions.find(file => file.version === docVersion) ?? latest;
  if (!current) return;
  const replaced = previousTexts(versions, current);
  const heading = node("div", "sheet-heading");
  const caption = node("div");
  caption.append(node("p", "eyebrow", current.detail), node("h3", "", current.name));
  heading.append(caption);
  if (versions.length > 1) {
    const select = node("select", "version");
    select.setAttribute("aria-label", "文件版本");
    for (const version of versions.slice().reverse()) {
      const option = node("option", "", `第 ${version.version} 版${version === latest ? " · 当前" : " · 旧稿"}`);
      option.value = version.version;
      option.selected = version === current;
      select.append(option);
    }
    select.addEventListener("change", () => openFile(docId, Number(select.value)));
    heading.append(select);
  } else heading.append(node("span", "version", "第 1 版"));
  const content = node("article", "paper");
  content.append(heading);
  for (const section of current.sections) {
    const block = node("section", "term");
    const topic = current.id === chapter.contract && current === latest
      ? view.review?.topics.find(item => item.id === section.id)
      : null;
    const heading = node("h4", topic ? "topic-heading" : "", topic ? undefined : section.label);
    if (topic) {
      if (view.review.choosing && !playing) {
        const start = button("", () => dispatch({ type: "openTopic", id: topic.id }), "topic-start");
        const indicators = node("span", "topic-indicators");
        if (topic.amended) indicators.append(node("span", "topic-indicator amended", "已改稿"));
        indicators.append(node("span", "topic-indicator", topic.amended ? "继续谈 →" : "从这条谈 →"));
        start.append(node("span", "", section.label), indicators);
        heading.append(start);
      } else {
        heading.append(node("span", "", section.label));
        const indicators = node("span", "topic-indicators");
        if (topic.amended) indicators.append(node("span", "topic-indicator amended", "已改稿"));
        if (topic.id === view.review.activeTopic) indicators.append(node("span", "topic-indicator", "本轮话题"));
        heading.append(indicators);
      }
    }
    block.append(heading);
    for (const line of section.lines) {
      const edits = replaced.get(line.id);
      if (edits) {
        for (const old of edits) {
          const deleted = node("p", "deleted-line");
          deleted.append(node("span", "revision-label", `第 ${old.version} 版 · 已替换`),
            node("del", "", old.text));
          block.append(deleted);
        }
      }
      if (view.proof && !playing) {
        const ref = { document: current.id, version: current.version, line: line.id, text: line.text, name: current.name };
        const key = quoteKey(ref);
        const control = button(line.text, () => {
          pickQuote(picked && quoteKey(picked) === key && picked.version === current.version ? null : ref);
        }, "quote-line");
        control.dataset.quote = key;
        control.dataset.version = current.version;
        if (edits) control.classList.add("revised-line");
        block.append(control);
      } else if (edits) {
        const revised = node("p", "revised-line");
        revised.append(node("ins", "", line.text));
        block.append(revised);
      } else block.append(node("p", "", line.text));
    }
    content.append(block);
  }
  sheet.replaceChildren(content);
  sheet.scrollTop = resetScroll ? 0 : scroll;
  updateQuotes();
}

function announce(text) { $("announce").textContent = text; }

function renderPatience() {
  const bar = $("patience");
  bar.setAttribute("aria-label", `对方耐心 ${displayPatience} / ${view.maxPatience}`);
  const hearts = node("span", "hearts");
  hearts.setAttribute("aria-hidden", "true");
  for (let index = 0; index < view.maxPatience; index++) {
    hearts.append(node("span", index < displayPatience ? "full" : "empty", index < displayPatience ? "♥" : "♡"));
  }
  bar.replaceChildren(node("span", "minor", "耐心"), hearts);
}

function renderEvent(event, text = event.text, replay = false) {
  let row;
  if (event.kind === "message") {
    const own = event.who === "player";
    row = node("article", `message ${own ? "own" : "incoming"}`);
    row.append(node("p", "speaker", own ? "你" : chapter.contact.name));
    const bubble = node("p", "bubble", text);
    row.append(bubble);
    log(row);
    if (text !== event.text) bubble.classList.add("streaming");
    return updated => {
      const follow = atBottom();
      bubble.textContent = updated;
      if (updated === event.text) bubble.classList.remove("streaming");
      if (follow) scrollToEnd();
    };
  }
  if (event.kind === "file") {
    delivered.add(currentFileKey(event.document, event.version));
    if (!replay && event.document !== docId) unread.add(event.document);
    row = node("div", "file-message");
    const attachment = button("", () => openFile(event.document, event.version), "file-card");
    const info = node("span", "file-info");
    info.append(node("strong", "", event.name), node("small", "", `${event.revised ? "书面改稿" : "收到文件"} · 第 ${event.version} 版`));
    const icon = node("span", "file-icon", event.revised ? "改" : "件");
    icon.setAttribute("aria-hidden", "true");
    attachment.append(icon, info, node("span", "file-open", "打开 →"));
    row.append(attachment);
    if (!replay) {
      renderDocuments();
      announce(`${event.revised ? "收到改稿" : "收到文件"}：${event.name}`);
    }
  } else if (event.kind === "submission") {
    row = node("article", "submission");
    const heading = node("div", "submission-heading");
    const reuse = button("沿用引用", () => {
      if (playing || !view.proof) return;
      reused = event.quotes;
      pickQuote(nextReused());
      scrollToEnd();
    }, "text-action reuse");
    heading.append(node("strong", "", "原文对照记录"),
      node("span", `result-tag ${event.accepted ? "matched" : ""}`, event.accepted ? "对照成立" : "对照未成立"),
      reuse);
    row.append(heading);
    if (event.claim) {
      const item = node("blockquote");
      item.append(node("cite", "", `${chapter.contact.name} · 本轮原话`), node("p", "", event.claim));
      row.append(item);
    }
    for (const quote of event.quotes) {
      const item = node("blockquote");
      item.append(node("cite", "", `${quote.name} · 第 ${quote.version} 版`), node("p", "", quote.text));
      row.append(item);
    }
  } else if (event.kind === "setback") {
    displayPatience = event.patience;
    if (!replay) renderPatience();
    row = node("p", "log-note setback", event.counter === "wrong" ? "对照未成立 · 耐心 −1" : "交涉陷入僵局 · 耐心 −1");
  } else if (event.kind === "amendment") {
    displayPatience += event.recovered;
    if (!replay) renderPatience();
    row = node("p", "log-note amendment", `改稿已收到 · ${event.title}${event.recovered ? " · 耐心 +1" : ""}`);
  } else if (event.kind === "thought") {
    row = node("p", "thought", event.text);
  }
  if (row) log(row);
}

function renderWaiting(text) {
  waitRow?.remove();
  waitRow = undefined;
  if (text) {
    waitRow = button(text, () => playback.skip(), "waiting");
    waitRow.setAttribute("aria-label", `${text} 点按立即显示`);
    log(waitRow);
  }
}

const playback = createPlayback({
  show: renderEvent,
  waiting: renderWaiting,
  reviewFiles(event) {
    return new Promise(resolve => {
      fileReview = { through: event.id, resolve };
      renderComposer();
      updateQuotes();
      announce("文件已送达。看完后选择继续。");
    });
  },
  reduced: () => reduceMotion.matches,
  onIdle() {
    playing = false;
    readThrough = view.events.at(-1)?.id ?? 0;
    saveProgress();
    displayPatience = view.patience;
    sync();
    const last = view.events.at(-1);
    if (last?.kind === "thought" || (last?.kind === "message" && last.who === "contact")) announce(last.text);
  },
});

chat.addEventListener("click", event => {
  if (!playing || fileReview || event.target.closest("button, a, input, select, textarea, summary")) return;
  if (window.getSelection()?.isCollapsed === false) return;
  playback.skip();
});

function saveProgress() {
  try { localStorage.setItem(saveKey, JSON.stringify({ ...game.save(), readThrough })); }
  catch { /* Play continues without storage. */ }
}

function finishFileReview() {
  if (!fileReview) return;
  const { through, resolve } = fileReview;
  fileReview = undefined;
  readThrough = through;
  saveProgress();
  switchPane("chat");
  renderComposer();
  updateQuotes();
  scrollToEnd();
  resolve();
}

function availableReuse() {
  if (!view.proof) return [];
  return reused.filter(quote => !view.proof.confirmed.some(ref => quoteKey(ref) === quoteKey(quote)));
}

function nextReused() {
  if (!view.proof) return null;
  const available = availableReuse();
  return (reused.length === view.proof.count || available.length === 1) ? available[0] ?? null : null;
}

function dispatch(command, previous = null) {
  if (playing) return;
  const wasChoosing = view.review?.choosing;
  const delta = game.act(command);
  if (!delta) return;
  view = game.view();
  if (command.type === "cite") picked = nextReused();
  else if (command.type === "revise") picked = previous;
  if (!view.proof) {
    picked = null;
    reused = [];
  }
  if (!wasChoosing && view.review?.choosing) {
    docId = chapter.contract;
    docVersion = null;
  }
  if (command.type === "continue") displayPatience = view.patience;
  saveProgress();
  playing = true;
  switchPane("chat");
  sync();
  scrollToEnd();
  void playback.play(delta);
}

function renderComposer() {
  chat.classList.toggle("can-skip", playing && !fileReview);
  if (fileReview) {
    const row = node("div", "review-actions");
    row.append(button("看完了，继续", finishFileReview, "primary"));
    composer.replaceChildren(node("p", "minor", "可以先打开附件，读完再继续。"), row);
    scrollToEnd();
    return;
  }
  if (playing) {
    if (!skipButton) skipButton = button("立即显示", () => playback.skip(), "quiet skip");
    if (!composer.contains(skipButton)) composer.replaceChildren(node("span", "minor", "等待对方回复"), skipButton);
    return;
  }
  composer.replaceChildren();
  const addAction = (text, command, style = "reply") => composer.append(button(text, () => dispatch(command), style));
  if (view.phase === "refused") {
    addAction("再谈一次 · 耐心回到 5", { type: "continue" });
    addAction("接受婉拒，放弃合同", { type: "finish", result: "leave" });
  } else if (view.phase === "ended") {
    composer.append(button("查看当前合同", () => openFile(chapter.contract), "reply"));
  } else if (view.proof) {
    renderProof();
  } else if (view.review?.choosing) {
    const row = node("div", "review-actions");
    row.append(button("去合同选话题", () => {
      openFile(chapter.contract);
      sheet.focus({ preventScroll: true });
    }, "primary"));
    if (view.amendments.length) row.append(button("核对完毕，结束审阅", showFinishDialog, "quiet"));
    composer.append(row);
  } else if (view.choices.length || view.review?.canEndTopic) {
    for (const [index, choice] of view.choices.entries()) {
      const reply = button("", () => dispatch({ type: "choose", id: choice.id }), "reply");
      const number = node("span", "reply-num", String(index + 1).padStart(2, "0"));
      number.setAttribute("aria-hidden", "true");
      reply.append(number, node("span", "", choice.text));
      composer.append(reply);
    }
    if (view.review?.canEndTopic) {
      addAction("先结束本轮", { type: "endTopic" }, "quiet end-topic");
    }
  } else {
    composer.append(button("核对完毕，结束审阅", showFinishDialog, "primary"));
  }
  composer.scrollTop = 0;
}

function renderProof() {
  const { confirmed, count, defer } = view.proof;
  const header = node("div", "proof-header");
  header.append(node("p", "proof-kicker", `原文对照 · 第 ${confirmed.length + 1} / ${count} 段`),
    button("去文件圈选", focusQuotation, "quiet"));
  composer.append(header);
  for (const [index, quote] of confirmed.entries()) {
    const entry = button(`更换第 ${index + 1} 段 · ${quote.text}`,
      () => dispatch({ type: "revise", index }, quote), "quote-chip confirmed");
    entry.title = `${quote.name} · 第 ${quote.version} 版`;
    composer.append(entry);
  }
  if (picked) {
    const quote = node("div", "picked-quote");
    quote.append(node("div", "", `${picked.name} · 第 ${picked.version} 版`), node("p", "", picked.text));
    quote.append(button("取消圈选", () => pickQuote(null), "text-action"));
    composer.append(quote);
  }
  const alternatives = availableReuse().filter(quote => !picked || quoteKey(picked) !== quoteKey(quote) || picked.version !== quote.version);
  if (alternatives.length) {
    const reuse = node("details", "reused-quotes");
    reuse.append(node("summary", "", "从记录中选用"));
    for (const quote of alternatives) reuse.append(button(quote.text, () => pickQuote(quote), "quote-chip"));
    composer.append(reuse);
  }
  const row = node("div", "proof-actions");
  const submit = button(confirmed.length + 1 === count ? "发出对照" : "确认这一段",
    () => { if (picked) dispatch({ type: "cite", ref: quoteRef(picked) }); }, "primary");
  submit.disabled = !picked;
  row.append(button(defer, () => dispatch({ type: "defer" }), "quiet"), submit);
  composer.append(row);
}

function renderResult() {
  if (playing || view.phase !== "ended" || resultRow) return;
  const ending = chapter.endings[view.outcome];
  resultRow = node("article", "ending");
  resultRow.append(node("p", "eyebrow", "交涉结案"), node("h3", "", ending.title), node("p", "", asThought(ending.detail)));
  const counts = node("dl", "counts");
  for (const [label, value] of [
    ["书面修改", view.amendments.length], ["举证失误", view.stats.wrong],
    ["交涉僵局", view.stats.deadlocks], ["续关", view.stats.continues],
  ]) {
    const stat = node("div");
    stat.append(node("dt", "", label), node("dd", "", String(value)));
    counts.append(stat);
  }
  resultRow.append(counts);
  for (const [id, amendment] of Object.entries(chapter.amendments)) {
    const applied = view.amendments.includes(id);
    const item = node("section", "recap");
    item.append(node("h4", "", `${applied ? "已修改" : "未修改"} · ${amendment.title}`),
      node("p", "", asThought(applied ? amendment.edited : amendment.open)), node("p", "minor", asThought(amendment.lesson)));
    resultRow.append(item);
  }
  if (chapter.source) {
    const source = node("a", "source", chapter.source.title);
    source.href = chapter.source.url;
    source.target = "_blank";
    source.rel = "noopener noreferrer";
    resultRow.append(source);
  }
  log(resultRow);
}

function sync() {
  const follow = atBottom();
  renderPatience();
  renderDocuments();
  renderComposer();
  renderResult();
  const topic = view.review?.topics.find(item => item.id === view.review.activeTopic);
  $("contact-role").textContent = topic ? `${chapter.contact.role} · ${topic.label}` : chapter.contact.role;
  board.classList.toggle("can-reuse", Boolean(view.proof) && !playing);
  $("finish").hidden = view.phase !== "active";
  $("finish").disabled = playing;
  $("restart").disabled = playing;
  if (follow) scrollToEnd();
}

function confirm(title, detail, actions) {
  const heading = node("h2", "", title);
  heading.id = "modal-title";
  const controls = node("div", "modal-actions");
  const cancel = button("返回", () => modal.close(), "quiet");
  cancel.autofocus = true;
  controls.append(cancel);
  for (const [label, action, style] of actions) {
    controls.append(button(label, () => { modal.close(); action(); }, style));
  }
  modal.replaceChildren(heading, node("p", "", detail), controls);
  modal.showModal();
}

function showFinishDialog() {
  confirm("现在结束审阅？", "签署以当前书面版本为准。还没写进合同的口头答复不会改变条款。", [
    ["放弃合同", () => dispatch({ type: "finish", result: "leave" }), "quiet"],
    ["签署当前版本", () => dispatch({ type: "finish", result: "sign" }), "primary"],
  ]);
}
$("finish").addEventListener("click", showFinishDialog);
$("restart").addEventListener("click", () => {
  confirm("重新打开这份邀约？", "当前交涉记录和改稿会清空。", [
    ["重新开始", () => {
      try { localStorage.removeItem(saveKey); } catch { /* Storage may be unavailable. */ }
      game = openNegotiation(chapter);
      view = game.view();
      start(false);
    }, "primary"],
  ]);
});

function start(replay) {
  delivered = new Set(chapter.initialFiles.map(id => currentFileKey(id, 1)));
  unread = new Set();
  docId = chapter.contract;
  docVersion = null;
  picked = null;
  reused = [];
  displayPatience = view.maxPatience;
  resultRow = waitRow = undefined;
  switchPane("chat");
  timeline.replaceChildren(startOfLog);
  sheet.scrollTop = 0;
  if (replay) {
    // Saves from before file review played the entire history on load.
    const restoredThrough = Number.isInteger(readThrough) ? readThrough : view.events.at(-1)?.id ?? 0;
    const pending = view.events.filter(event => event.id > restoredThrough);
    for (const event of view.events) {
      if (event.id > restoredThrough) break;
      renderEvent(event, event.text, true);
    }
    playing = pending.length > 0;
    if (!playing) displayPatience = view.patience;
    sync();
    scrollToEnd();
    if (playing) void playback.play(pending);
  } else {
    readThrough = 0;
    playing = true;
    sync();
    void playback.play(view.events);
  }
}
start(restored);
