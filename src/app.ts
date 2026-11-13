import { campaign } from "./chapters.js";
import { openNegotiation } from "./negotiation.js";
import { createPlayback } from "./playback.js";
import { chapterUrl, completeChapter, completedChapters, restoreChapter, saveKey } from "./progress.js";
import type { ChapterEntry, Command, DocumentVersion, GameEvent, Hotspot, Reference, Save } from "./model.js";

const $ = <T extends HTMLElement = HTMLElement>(id: string) => {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing page element: ${id}`);
  return element as T;
};
export function mountNegotiation(entry: ChapterEntry) {
  const { chapter, story } = entry;
  const timeline = $("timeline");
  const chat = timeline.closest<HTMLElement>(".chat")!;
  const composer = $("composer");
  const sheet = $("sheet");
  const board = document.querySelector<HTMLElement>(".board")!;
  const modal = $<HTMLDialogElement>("modal");
  const storageKey = saveKey(chapter.id);
  const chapterIndex = campaign.findIndex(entry => entry.chapter.id === chapter.id);
  const nextChapter = chapterIndex < 0 ? undefined : campaign[chapterIndex + 1]?.chapter;
  const startOfLog = timeline.firstElementChild!;
  const currentFileKey = (id: string, version: number) => `${id}:${version}`;
  const quoteKey = (ref: Reference) => `${ref.document}:${ref.line}`;
  const quoteRef = ({ document, version, line }: Reference): Reference => ({ document, version, line });
  const asThought = (text: string) => `（${text}）`;
  const node = <T extends keyof HTMLElementTagNameMap>(tag: T, className = "", text?: string) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };
  function button(text: string, handler: () => void, className = "") {
    const result = node("button", className, text);
    result.type = "button";
    result.addEventListener("click", handler);
    return result;
  }

  function load() {
    const saved = restoreChapter(localStorage, entry);
    if (saved) return { ...saved, restored: true };
    return { game: openNegotiation(chapter, story), restored: false, readThrough: undefined };
  }

  let { game, restored, readThrough } = load();
  let view = game.view();
  type Selection = Reference & { text: string; name: string };
  let delivered: Set<string>, unread: Set<string>, docId: string, docVersion: number | null;
  let picked: Selection | null, reused: Selection[], displayPatience: number;
  let waitRow: HTMLButtonElement | undefined, resultRow: HTMLElement | undefined, playbackButton: HTMLButtonElement | undefined;
  let showPlan = false;
  let selectedSpot: Hotspot | undefined;
  let playing = false;
  let playbackPause: { kind: "line" | "files"; through: number; resolve: () => void } | undefined;
  let reviewRequested: "finish" | "files" | undefined;
  const speakers = new Set<string>();
  const speakerContact = (id = chapter.defaultSpeaker) => id ? chapter.speakers?.[id] ?? chapter.contact : chapter.contact;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

  for (const [id, label] of Object.entries({
    "case-title": chapter.title, "case-setting": chapter.setting,
    avatar: chapter.contact.mark, contact: chapter.contact.name, "contact-role": chapter.contact.role,
  })) $(id).textContent = label;

  function switchPane(pane: "docs" | "chat") {
    board.dataset.pane = pane;
    $("tab-docs").setAttribute("aria-pressed", String(pane === "docs"));
    $("tab-chat").setAttribute("aria-pressed", String(pane === "chat"));
  }
  $("tab-docs").addEventListener("click", () => switchPane("docs"));
  $("tab-chat").addEventListener("click", () => switchPane("chat"));

  const atBottom = () => timeline.scrollHeight - timeline.clientHeight - timeline.scrollTop < 46;
  const scrollToEnd = () => { timeline.scrollTop = timeline.scrollHeight; };
  function log(element: HTMLElement) {
    const follow = atBottom();
    timeline.append(element);
    if (follow) scrollToEnd();
  }

  function visibleFiles() {
    return view.documents.filter(file => delivered.has(currentFileKey(file.id, file.version)));
  }

  function openFile(id: string, version: number | null = null) {
    const files = visibleFiles().filter(file => file.id === id);
    const latest = files.at(-1);
    if (!latest) return;
    showPlan = false;
    docId = id;
    docVersion = version === latest.version ? null : version;
    unread.delete(id);
    switchPane("docs");
    renderDocuments(true);
  }

  function locateFile(id: string, line?: string) {
    openFile(id);
    if (line) {
      const entry = Array.from(sheet.querySelectorAll<HTMLElement>("[data-line]")).find(item => item.dataset.line === line);
      entry?.scrollIntoView({ block: "nearest" });
    }
  }

  function updateQuotes() {
    const confirmed = view.proof?.confirmed ?? [];
    sheet.querySelectorAll<HTMLButtonElement>("[data-quote]").forEach(element => {
      const isPicked = picked && quoteKey(picked) === element.dataset.quote &&
        picked.version === Number(element.dataset.version);
      const used = confirmed.find(ref => quoteKey(ref) === element.dataset.quote);
      element.setAttribute("aria-pressed", String(Boolean(isPicked || used?.version === Number(element.dataset.version))));
      element.disabled = Boolean(used);
    });
    const footer = $("doc-footer");
    const reviewingFiles = playbackPause?.kind === "files";
    footer.classList.toggle("file-review", reviewingFiles);
    footer.hidden = !reviewingFiles && (!view.proof || playing);
    footer.replaceChildren();
    if (reviewingFiles) {
      footer.append(button("看完了，继续", resumePlayback, "primary mobile-only"));
    } else if (!footer.hidden && view.proof) {
      footer.append(node("span", "", `第 ${confirmed.length + 1} / ${view.proof.count} 段 · ${picked ? "已圈选" : "待圈选"}`),
        button("返回交涉", () => { switchPane("chat"); scrollToEnd(); }, "quiet mobile-only"));
    }
    if (footer.hidden) sheet.classList.remove("quote-target");
  }

  function pickQuote(quote: Selection | null) {
    picked = quote;
    sheet.classList.remove("quote-target");
    updateQuotes();
    renderComposer();
  }

  function focusQuotation() {
    if (showPlan) openFile(chapter.contract);
    switchPane("docs");
    sheet.classList.add("quote-target");
    const lines = [...sheet.querySelectorAll<HTMLButtonElement>(".quote-line:enabled")];
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

  function previousTexts(versions: DocumentVersion[], current: DocumentVersion) {
    type LineVersion = { text: string; version: number };
    const history = new Map<string, LineVersion[]>();
    const previous = new Map<string, LineVersion>();
    for (const version of versions) {
      for (const { lines } of version.sections) {
        for (const line of lines) {
          const old = previous.get(line.id);
          if (old && old.text !== line.text) {
            const replaced = history.get(line.id) ?? [];
            replaced.push(old);
            history.set(line.id, replaced);
          }
          previous.set(line.id, { text: line.text, version: version.version });
        }
      }
      if (version === current) break;
    }
    return history;
  }

  function openPlan() {
    showPlan = true;
    switchPane("docs");
    renderDocuments(true);
  }

  function renderFloorPlan() {
    const plan = chapter.floorPlan;
    if (!plan) return;
    const paper = node("article", "paper");
    paper.append(node("h3", "", "户型图"));
    const map = node("div", "floor-plan");
    const picture = node("img");
    picture.src = plan.image;
    picture.alt = plan.alt;
    map.append(picture);
    const spot = selectedSpot;
    const info = node("div", "inspection");
    for (const point of plan.hotspots) {
      const mark = button(point.label, () => {
        selectedSpot = point;
        if (!view.review.clues.includes(point.id) && view.review.choosing && !playing) {
          dispatch({ type: "investigate", id: point.id });
        } else {
          renderFloorPlan();
        }
        sheet.querySelector<HTMLElement>(".inspection")?.focus({ preventScroll: true });
      }, "hotspot");
      mark.style.left = `${point.x}%`;
      mark.style.top = `${point.y}%`;
      mark.setAttribute("aria-pressed", String(point.id === spot?.id));
      mark.disabled = !view.review.clues.includes(point.id) && (!view.review.choosing || playing);
      map.append(mark);
    }
    paper.append(map, info);
    if (spot && view.review.clues.includes(spot.id)) {
      info.tabIndex = -1;
      info.append(node("p", "", asThought(spot.observation)));
      if (spot.topic && view.review.choosing && !playing) {
        info.append(button("就这处问房东", () => dispatch({ type: "openTopic", from: "hotspot", id: spot.id }), "primary"));
      }
    }
    sheet.replaceChildren(paper);
  }

  function renderDocuments(resetScroll = false) {
    const scroll = sheet.scrollTop;
    const available = visibleFiles();
    const tabs = $("file-tabs");
    const files = [...new Map(available.map(file => [file.id, file])).values()];
    $("doc-count").textContent = `${files.length} 份文件`;
    tabs.replaceChildren(...files.map(file => {
      const tab = button(file.name, () => openFile(file.id), "file-tab");
      tab.setAttribute("aria-pressed", String(!showPlan && docId === file.id));
      if (unread.has(file.id)) tab.classList.add("unread");
      return tab;
    }));
    if (chapter.floorPlan) {
      const tab = button("户型图", () => openPlan(), "file-tab");
      tab.setAttribute("aria-pressed", String(showPlan));
      tabs.append(tab);
      if (showPlan) {
        renderFloorPlan();
        sheet.scrollTop = resetScroll ? 0 : scroll;
        updateQuotes();
        return;
      }
    }
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
        option.value = String(version.version);
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
        ? view.review.topics.find(item => section.id && item.id === chapter.clauseTopics[section.id])
        : undefined;
      const heading = node("h4", topic ? "topic-heading" : "", topic ? undefined : section.label);
      if (topic) {
        if (section.id && view.review.choosing && !playing) {
          const id = section.id;
          const start = button("", () => dispatch({ type: "openTopic", from: "clause", id }), "topic-start");
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
        const paragraph = node("div", "document-line");
        paragraph.dataset.line = line.id;
        const edits = replaced.get(line.id);
        if (edits) {
          for (const old of edits) {
            const deleted = node("p", "deleted-line");
            deleted.append(node("span", "revision-label", `第 ${old.version} 版 · 已替换`),
              node("del", "", old.text));
            paragraph.append(deleted);
          }
        }
        if (view.proof && !playing) {
          const ref = { document: current.id, version: current.version, line: line.id, text: line.text, name: current.name };
          const key = quoteKey(ref);
          const control = button(line.text, () => {
            pickQuote(picked && quoteKey(picked) === key && picked.version === current.version ? null : ref);
          }, "quote-line");
          control.dataset.quote = key;
          control.dataset.version = String(current.version);
          if (edits) control.classList.add("revised-line");
          paragraph.append(control);
        } else if (edits) {
          const revised = node("p", "revised-line");
          revised.append(node("ins", "", line.text));
          paragraph.append(revised);
        } else paragraph.append(node("p", "", line.text));
        block.append(paragraph);
      }
      content.append(block);
    }
    if (current.id === chapter.signing?.directory && current === latest) {
      const versions = node("section", "term");
      versions.append(node("h4", "", "本次签署所用版本"));
      versions.append(signingFileList([chapter.contract, ...chapter.signing.attachments]));
      content.append(versions);
    }
    sheet.replaceChildren(content);
    sheet.scrollTop = resetScroll ? 0 : scroll;
    updateQuotes();
  }

  function announce(text: string) { $("announce").textContent = text; }

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

  function renderEvent(event: GameEvent, text = "text" in event ? event.text : undefined, replay = false) {
    let row: HTMLElement | undefined;
    if (event.kind === "message") {
      const own = event.who === "player";
      row = node("article", `message ${own ? "own" : "incoming"}`);
      if (event.speaker) speakers.add(event.speaker);
      const contact = speakerContact(event.speaker);
      const label = own ? "你" : chapter.speakers ? `${contact.name}（${contact.role}）` : contact.name;
      row.append(node("p", "speaker", label));
      const bubble = node("p", "bubble", text);
      row.append(bubble);
      log(row);
      if (text !== event.text) bubble.classList.add("streaming");
      return (updated: string) => {
        const follow = atBottom();
        bubble.textContent = updated;
        if (updated === event.text) bubble.classList.remove("streaming");
        if (follow) scrollToEnd();
      };
    }
    if (event.kind === "file") {
      for (const version of view.documents) {
        if (version.id === event.document && version.version <= event.version) {
          delivered.add(currentFileKey(version.id, version.version));
        }
      }
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
        item.append(node("cite", "", `${speakerContact(event.speaker).name} · 本轮原话`), node("p", "", event.claim));
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
    } else if (event.kind === "discovery") {
      row = node("p", "thought", asThought(event.text));
    } else if (event.kind === "locate") {
      if (!replay) locateFile(event.document, event.line);
    } else if (event.kind === "review") {
      if (!replay) reviewRequested = event.mode;
    }
    if (row) log(row);
    return undefined;
  }

  function renderWaiting(text?: string) {
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
    waitForNextLine(event) {
      announce(event.text);
      return pausePlayback("line", event.id);
    },
    reviewFiles(event) {
      announce("文件已送达。看完后选择继续。");
      return pausePlayback("files", event.id);
    },
    reduced: () => reduceMotion.matches,
    onIdle() {
      playing = false;
      readThrough = view.events.at(-1)?.id ?? 0;
      saveProgress();
      if (view.phase === "ended") completeChapter(localStorage, chapter.id);
      displayPatience = view.patience;
      sync();
      const last = view.events.at(-1);
      if (last?.kind === "thought" || (last?.kind === "message" && last.who === "contact")) announce(last.text);
      if (reviewRequested) {
        const mode = reviewRequested;
        reviewRequested = undefined;
        if (mode === "finish") showFinishDialog();
        else confirm("当前签署文件", "已收到的文件列出现行版本。", [], reviewSummary());
      }
    },
  });

  chat.addEventListener("click", event => {
    if (!playing || playbackPause?.kind === "files" || !(event.target instanceof Element) ||
        event.target.closest("button, a, input, select, textarea, summary")) return;
    if (window.getSelection()?.isCollapsed === false) return;
    resumePlayback();
  });

  function saveProgress() {
    try { localStorage.setItem(storageKey, JSON.stringify({ ...game.save(), readThrough } satisfies Save)); }
    catch { /* Play continues without storage. */ }
  }

  function pausePlayback(kind: "line" | "files", through: number) {
    return new Promise<void>(resolve => {
      playbackPause = { kind, through, resolve };
      renderComposer();
      if (kind === "files") updateQuotes();
    });
  }

  function resumePlayback() {
    if (!playbackPause) {
      playback.skip();
      return;
    }
    const { kind, through, resolve } = playbackPause;
    playbackPause = undefined;
    readThrough = through;
    saveProgress();
    if (kind === "files") {
      switchPane("chat");
      updateQuotes();
    }
    renderComposer();
    scrollToEnd();
    resolve();
  }

  function availableReuse() {
    const proof = view.proof;
    if (!proof) return [];
    return reused.filter(quote => !proof.confirmed.some(ref => quoteKey(ref) === quoteKey(quote)));
  }

  function nextReused() {
    if (!view.proof) return null;
    const available = availableReuse();
    return (reused.length === view.proof.count || available.length === 1) ? available[0] ?? null : null;
  }

  function dispatch(command: Command, previous: Selection | null = null) {
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
      showPlan = false;
    }
    if (command.type === "continue") displayPatience = view.patience;
    saveProgress();
    playing = true;
    if (command.type !== "investigate") switchPane("chat");
    sync();
    scrollToEnd();
    void playback.play(delta);
  }

  function renderComposer() {
    const reviewingFiles = playbackPause?.kind === "files";
    chat.classList.toggle("can-advance", playing && !reviewingFiles);
    if (reviewingFiles) {
      const row = node("div", "review-actions");
      row.append(button("看完了，继续", resumePlayback, "primary"));
      composer.replaceChildren(node("p", "minor", "可以先打开附件，读完再继续。"), row);
      scrollToEnd();
      return;
    }
    if (playing) {
      if (!playbackButton) playbackButton = button("", resumePlayback, "skip");
      const next = playbackPause?.kind === "line";
      playbackButton.textContent = next ? "下一句" : "立即显示";
      playbackButton.classList.toggle("primary", next);
      playbackButton.classList.toggle("quiet", !next);
      if (!composer.contains(playbackButton)) composer.replaceChildren(playbackButton);
      return;
    }
    composer.replaceChildren();
    const addAction = (text: string, command: Command, style = "reply") => composer.append(button(text, () => dispatch(command), style));
    if (view.phase === "refused") {
      addAction("再谈一次 · 耐心回到 5", { type: "continue" });
      addAction("接受婉拒，放弃合同", { type: "finish", result: "leave" });
    } else if (view.phase === "ended") {
      composer.append(button("查看当前合同", () => openFile(chapter.contract), "reply"));
      const row = node("div", "review-actions");
      row.append(button("章节首页", () => { location.href = "./"; }, "quiet"));
      if (nextChapter) row.append(button(`进入下一章 ${nextChapter.title}`, () => {
        location.href = chapterUrl(nextChapter.id);
      }, "primary"));
      composer.append(row);
    } else if (view.proof) {
      renderProof();
    } else if (view.review?.choosing) {
      const row = node("div", "review-actions");
      row.append(button("去合同选话题", () => {
        openFile(chapter.contract);
        sheet.focus({ preventScroll: true });
      }, "primary"));
      if (chapter.floorPlan) row.append(button("看户型图", openPlan, "quiet"));
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
    if (!view.proof) return;
    const { confirmed, count, defer, canSubmit } = view.proof;
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
    row.append(button(defer, () => dispatch({ type: "defer" }), "quiet"));
    if (canSubmit) row.append(button("用已确认原文发出对照", () => dispatch({ type: "submitProof" }), picked ? "quiet" : "primary"));
    if (picked || !canSubmit) row.append(submit);
    composer.append(row);
  }

  function renderResult() {
    if (playing || view.phase !== "ended" || !view.outcome || resultRow) return;
    const ending = chapter.endings[view.outcome];
    resultRow = node("article", "ending");
    resultRow.append(node("p", "eyebrow", "交涉结案"), node("h3", "", ending.title), node("p", "", asThought(ending.detail)));
    const counts = node("dl", "counts");
    for (const [label, value] of [
      ["书面修改", view.amendments.length], ["举证失误", view.stats.wrong],
      ["交涉僵局", view.stats.deadlocks], ["续关", view.stats.continues],
    ]) {
      const stat = node("div");
      stat.append(node("dt", "", String(label)), node("dd", "", String(value)));
      counts.append(stat);
    }
    resultRow.append(counts);
    for (const [id, amendment] of Object.entries(chapter.amendments)) {
      const applied = view.amendments.includes(id);
      const item = node("section", "recap");
      item.append(node("h4", "", `${applied ? "已修改" : "未修改"} · ${amendment.title}`),
        node("p", "", asThought(applied ? amendment.edited : amendment.open)), node("p", "minor", asThought(amendment.lesson)));
      if (view.outcome === "sign") {
        const available = visibleFiles();
        for (const ref of amendment.recap ?? []) {
          const doc = available.filter(file => file.id === ref.document).at(-1);
          if (doc) item.append(button(`回看${doc.name}`, () => locateFile(doc.id, ref.line), "text-action"));
        }
      }
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
    const participants = chapter.speakers ? [
      speakerContact().name, ...Array.from(speakers, id => speakerContact(id).name),
    ].join("、") : chapter.contact.role;
    $("contact-role").textContent = topic ? `${participants} · ${topic.label}` : participants;
    board.classList.toggle("can-reuse", Boolean(view.proof) && !playing);
    $("finish").hidden = view.phase !== "active";
    $<HTMLButtonElement>("finish").disabled = playing;
    $<HTMLButtonElement>("restart").disabled = playing;
    if (follow) scrollToEnd();
  }

  function confirm(title: string, detail: string, actions: [string, () => void, string][], summary?: HTMLElement, returnToContract = false) {
    const heading = node("h2", "", title);
    heading.id = "modal-title";
    const controls = node("div", "modal-actions");
    const cancel = button(returnToContract ? "回去继续核对" : "返回", () => {
      modal.close();
      if (returnToContract) openFile(chapter.contract);
    }, "quiet");
    cancel.autofocus = true;
    controls.append(cancel);
    for (const [label, action, style] of actions) {
      controls.append(button(label, () => { modal.close(); action(); }, style));
    }
    modal.replaceChildren(heading, node("p", "", detail), controls);
    if (summary) modal.insertBefore(summary, controls);
    modal.showModal();
  }

  function showFinishDialog() {
    confirm("现在结束审阅？", "签署以当前书面版本为准。还没写进合同的口头答复不会改变条款。", [
      ["放弃合同", () => dispatch({ type: "finish", result: "leave" }), "quiet"],
      ["签署当前版本", () => dispatch({ type: "finish", result: "sign" }), "primary"],
    ], chapter.signing ? reviewSummary() : undefined, Boolean(chapter.signing));
  }

  function reviewSummary() {
    const list = node("ul", "signing-summary");
    const files = visibleFiles();
    const current = (id: string) => files.filter(file => file.id === id).at(-1);
    for (const section of current(chapter.contract)?.sections ?? []) {
      const entry = node("li");
      entry.append(node("strong", "", section.label));
      entry.append(...section.lines.map(line => node("p", "", line.text)));
      list.append(entry);
    }
    for (const { document, lines } of chapter.signing?.highlights ?? []) {
      const file = current(document);
      const entry = node("li");
      entry.append(node("strong", "", file?.name ?? chapter.documents[document].name));
      if (file) {
        for (const line of file.sections.flatMap(section => section.lines)) {
          if (lines.includes(line.id)) entry.append(node("p", "", line.text));
        }
      } else entry.append(node("p", "", "尚未取得。"));
      list.append(entry);
    }
    if (chapter.signing) {
      const item = node("li");
      item.append(node("strong", "", "签署文件目录"),
        signingFileList([chapter.contract, chapter.signing.directory, ...chapter.signing.attachments]));
      list.append(item);
    }
    return list;
  }

  function signingFileList(ids: string[]) {
    const current = new Map(visibleFiles().map(file => [file.id, file]));
    const list = node("ul", "signing-files");
    for (const id of ids) {
      const file = current.get(id);
      list.append(node("li", "", file ? `${file.name}（第 ${file.version} 版）` : `${chapter.documents[id].name}（尚未取得）`));
    }
    return list;
  }
  $("finish").addEventListener("click", showFinishDialog);
  $("restart").addEventListener("click", () => {
    confirm("重新打开这份邀约？", "当前交涉记录和改稿会清空。", [
      ["重新开始", () => {
        if (completedChapters(localStorage).has(chapter.id)) completeChapter(localStorage, chapter.id);
        try { localStorage.removeItem(storageKey); } catch { /* Storage may be unavailable. */ }
        game = openNegotiation(chapter, story);
        view = game.view();
        start(false);
      }, "primary"],
    ]);
  });

  function start(replay: boolean) {
    delivered = new Set(chapter.initialFiles.map(id => currentFileKey(id, 1)));
    unread = new Set();
    docId = chapter.contract;
    docVersion = null;
    showPlan = false;
    selectedSpot = undefined;
    picked = null;
    reused = [];
    displayPatience = view.maxPatience;
    resultRow = waitRow = undefined;
    reviewRequested = undefined;
    speakers.clear();
    switchPane("chat");
    timeline.replaceChildren(startOfLog);
    sheet.scrollTop = 0;
    if (replay) {
      // Saves from before file review played the entire history on load.
      const restoredThrough = typeof readThrough === "number" && Number.isInteger(readThrough)
        ? readThrough : view.events.at(-1)?.id ?? 0;
      const pending = view.events.filter(event => event.id > restoredThrough);
      for (const event of view.events) {
        if (event.id > restoredThrough) break;
        renderEvent(event, undefined, true);
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
}
