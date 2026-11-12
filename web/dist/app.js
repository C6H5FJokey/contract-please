import { cases } from "./data.js";
import { directions, requests, reviews } from "./comparisons.js";
import {
  SAVE_VERSION,
  getCase,
  newGame,
  contractAt,
  sourceAt,
  sourceLines,
  getQuote,
  act,
  finish,
  report,
  readSave,
} from "./engine.js";

const app = document.querySelector("#app");
const modal = document.querySelector("#modal");
const saveKey = "trap-contract-save";
let game = null;
let completed = {};
let screen = "lobby";
let sideTab = "chat";
let direction = "";
let requestId = "explain";
let storageAvailable = true;
let notice = "";
let modalOrigin = null;
let toastTimer;

const escape = (text) =>
  String(text).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

try {
  const raw = localStorage.getItem(saveKey);
  const saved = raw ? readSave(raw) : null;
  if (saved) {
    game = saved.game;
    completed = saved.completed;
  } else if (raw || localStorage.getItem("before-six-save")) {
    notice = "新版按原文对照推进。请重新开启一份邀约。";
  }
} catch {
  storageAvailable = false;
  notice = "浏览器未开放本地存储，本次进度只保留在当前页面。";
}

function save() {
  try {
    localStorage.setItem(
      saveKey,
      JSON.stringify({ version: SAVE_VERSION, game, completed }),
    );
  } catch {
    storageAvailable = false;
  }
}

function toast(text) {
  if (!text) return;
  const node = document.querySelector("#toast");
  node.textContent = text;
  node.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove("show"), 3200);
}

function header(inGame = false) {
  const controls = inGame
    ? `<span class="save-indicator"><i></i>${storageAvailable ? "本机自动保存" : "仅当前会话"}</span><button class="quiet" data-action="home">邀约档案 ↗</button>`
    : '<button class="quiet" data-action="help">游玩说明 ↗</button>';
  return `<header class="topbar"><a href="#" class="wordmark" data-action="home" aria-label="回到邀约页"><span class="brand-square">签</span>陷阱合同</a><div class="top-actions">${controls}</div></header>`;
}

function renderLobby() {
  document.title = "陷阱合同 · 合同审阅推理游戏";
  const resume = game
    ? `<button class="primary continue" data-action="resume">${game.phase === "report" ? "查看上次复盘" : "继续审阅"}<span>${getCase(game.caseId).company} →</span></button>`
    : '<button class="primary continue" data-start="boshi">打开第一份邀约 <span>→</span></button>';
  const invitations = cases
    .map(
      (c, index) => `
    <button class="invitation ${index === 0 ? "featured" : ""}" data-start="${c.id}">
      <span class="company-monogram">${c.company.slice(0, 1)}</span>
      <span class="invitation-info"><span class="invitation-company">${c.company}<span class="case-industry">${c.industry}</span></span><strong>${c.role}</strong><span class="hook">${c.hook}</span></span>
      <span class="invitation-end"><strong>${c.offer}</strong><span>${completed[c.id] ? "已复盘 · 再审一次" : "查看合同"} ↗</span></span>
    </button>`,
    )
    .join("");
  app.innerHTML = `${header()}<section class="lobby">
    <div class="intro"><span class="eyebrow">单人合同推理游戏</span><h1>陷阱<em>合同</em></h1>
    <p class="intro-copy">面试说的待遇，和签字页上的一样吗？<br>追问细节，圈出对不上的原文，再决定签不签。</p>
    ${resume}
    <p class="local-note">自由审阅 · 进度保存在本机</p>${notice ? `<p class="storage-notice" role="status">${escape(notice)}</p>` : ""}</div>
    <section class="invitation-board" aria-label="选择邀约"><div class="board-head"><h2>你的邀约</h2><span>${Object.keys(completed).length} / ${cases.length} 已复盘</span></div>${invitations}</section>
    </section><footer class="site-footer"><span>改编自公开劳动争议案例 · 人物、公司与剧情均为虚构</span><span>6 份邀约</span></footer>`;
}

function renderFiles(c) {
  const review = reviews[c.id];
  const files = c.evidence.filter(
    (file) =>
      game.evidence.includes(file.id) || review.directory.includes(file.id),
  );
  return `<section class="inquiry-list"><h3>可核对的材料</h3>
    <button class="inquiry received" data-source="interview"><span class="mini-file"></span><span><strong>面试聊天</strong><small>招聘时的书面沟通</small></span><span class="inquiry-cost">查看 ↗</span></button>
    ${files
      .map((file) => {
        const received = game.evidence.includes(file.id);
        return `<button class="inquiry ${received ? "received" : ""}" ${received ? `data-source="file:${file.id}"` : `data-file="${file.id}"`}>
        <span class="mini-file"></span><span><strong>${file.name}</strong><small>${file.person}</small></span><span class="inquiry-cost">${received ? "查看 ↗" : "索取"}</span></button>`;
      })
      .join("")}
    </section>`;
}

function renderContract(c) {
  const version = game.selectedVersion;
  const current = version === game.revisions.length;
  const title =
    c.id === "chijian" &&
    !game.revisions
      .slice(0, version)
      .some((revision) => revision.kind === "amend")
      ? "岗位实践协议"
      : "劳动合同";
  const options = Array.from(
    { length: game.revisions.length + 1 },
    (_, index) =>
      `<option value="${index}" ${version === index ? "selected" : ""}>v${index + 1} · ${index === game.revisions.length ? "现行稿" : "历史稿"}</option>`,
  ).join("");
  const clauses = contractAt(game)
    .map((clause, index) => {
      const selected = game.selectedClause === clause.id;
      const body = clause.changed
        ? `<del>${clause.original}</del><ins>${clause.text}</ins>`
        : clause.text;
      return `<div class="clause-wrap ${selected ? "selected" : ""} ${clause.changed ? "revised" : ""}">
      <button class="clause" data-clause="${clause.id}" aria-pressed="${selected}"><span class="clause-number">${String(index + 1).padStart(2, "0")}</span><span><span class="clause-label">${clause.label}${clause.changed ? '<span class="revision-label">已修订</span>' : ""}</span><span class="clause-text">${body}</span></span></button>
      <button class="cite-clause" data-source="clause:${clause.id}" aria-label="引用${clause.label}原文">引用</button>
    </div>`;
    })
    .join("");
  return `<section class="document-area" id="contract"><div class="document-toolbar"><span><span class="document-dot"></span> 合同节选</span><label>版本 <select id="version" aria-label="选择合同版本">${options}</select></label></div>
    <article class="paper"><div class="paper-header"><span>${c.company} · 人事文件</span><span>签署前审阅</span></div><h1>${title}</h1><p class="paper-subtitle">${c.role}</p><div class="contract-instruction">点击条款可以向 HR 追问。点「引用」圈出想对照的原文。</div><div class="clauses">${clauses}</div></article>
    <div class="decision-bar"><span>${current ? "" : "正在查看历史版本"}</span><div><button class="quiet reject" data-decision="reject">谢绝这份邀约</button>${current ? `<button class="primary" data-decision="sign">签署现行稿 v${version + 1} ↗</button>` : '<button class="primary" data-action="current-version">回到现行稿 ↗</button>'}</div></div></section>`;
}

function renderMessages() {
  return `<div class="side-content" id="chat-panel" role="tabpanel" aria-labelledby="chat-tab"><div class="messages" aria-live="polite">${game.messages
    .map(
      (entry, index) => `
    <div class="message ${escape(entry.type)}"><span>${escape(entry.person)}</span><p>${escape(entry.text)}</p>
    ${Array.isArray(entry.citations) ? `<ul class="chat-citations">${entry.citations.map((item) => `<li>${escape(item.name)}<q>${escape(item.text)}</q></li>`).join("")}</ul><button class="message-file" data-reuse-quotes="${index}">用这组原文继续 ↗</button>` : ""}
    ${entry.evidenceId ? `<button class="message-file" data-source="file:${escape(entry.evidenceId)}">查看附件 ↗</button>` : ""}
    ${entry.revision ? `<button class="message-file" data-revision="${Number(entry.revision)}">查看书面改稿 v${Number(entry.revision) + 1} ↗</button>` : ""}
    </div>`,
    )
    .join("")}</div></div>`;
}

function renderComparison() {
  const entries = game.quotes.map((key) => getQuote(game, key));
  const request = requests.find((item) => item.id === requestId);
  return `<div id="compare-panel" role="tabpanel" aria-labelledby="compare-tab"><form id="challenge" class="challenge-form">
    <div class="comparison-header"><p class="comparison-note">引用两到三段原文，提交后可以继续调整。</p>${entries.length ? '<button type="button" class="quiet clear-quotes" data-action="clear-quotes">清空引用</button>' : ""}</div>
    <ol class="quote-tray">${entries.map((entry) => `<li><span>${entry.name}${entry.source !== "interview" ? ` · v${entry.version + 1}` : ""}</span><button type="button" class="quiet remove-quote" data-quote="${entry.key}" aria-label="移除这段引用">×</button><q>${entry.text}</q></li>`).join("")}</ol>
    ${entries.length === 0 ? '<p class="no-attachments">从合同、面试聊天或附件中圈选一句。</p>' : ""}
    <label for="request">你希望对方怎么处理？</label><select id="request" name="request" aria-describedby="request-detail">${requests.map((item) => `<option value="${item.id}" ${item.id === requestId ? "selected" : ""}>${item.text}</option>`).join("")}</select>
    <p class="request-detail" id="request-detail">${request.detail}</p>
    <button class="submit-challenge" ${entries.length < 2 ? "disabled" : ""}>提交这组对照 <span>→</span></button>
    </form></div>`;
}

function renderGame() {
  const c = getCase(game.caseId);
  const selected = c.clauses.find(
    (clause) => clause.id === game.selectedClause,
  );
  document.title = `${c.company} · 陷阱合同`;
  app.innerHTML = `${header(true)}<div class="session-strip"><div><span class="eyebrow">正在审阅</span><strong>${c.company} <span class="muted">/</span> ${c.role}</strong></div><button class="quiet" data-action="help">游玩说明 ↗</button></div>
    <nav class="mobile-nav" aria-label="页面跳转"><a href="#materials">材料</a><a href="#contract">合同</a><a href="#negotiation">交涉</a></nav>
    <section class="workspace">
      <aside class="case-sidebar" id="materials"><div class="position-card"><span class="eyebrow">招聘报价</span><h2>${c.offer}</h2><p class="offer-hook">${c.hook}</p><p>${c.intro}</p></div>
        ${renderFiles(c)}
      </aside>
      ${renderContract(c)}
      <aside class="negotiation" id="negotiation"><div class="conversation-head"><span class="avatar">${c.hr.slice(0, 1)}</span><div><strong>${c.hr}</strong><span>人力资源 · ${c.company}</span></div></div>
        <form id="ask" class="ask-form"><label for="direction">${selected ? `追问「${selected.label}」` : "先选择一条合同条款"}</label><div><select id="direction" name="direction" required ${selected ? "" : "disabled"}><option value="">选择追问方向</option>${directions.map((item) => `<option value="${item.id}" ${direction === item.id ? "selected" : ""}>${item.text}</option>`).join("")}</select><button class="primary" ${selected ? "" : "disabled"}>发送</button></div></form>
        <div class="side-tabs" role="tablist" aria-label="交涉"><button id="chat-tab" role="tab" aria-controls="chat-panel" aria-selected="${sideTab === "chat"}" data-tab="chat">交涉记录</button><button id="compare-tab" role="tab" aria-controls="compare-panel" aria-selected="${sideTab === "compare"}" data-tab="compare">原文对照 <span>${game.quotes.length || ""}</span></button></div>
        ${sideTab === "chat" ? renderMessages() : renderComparison()}
      </aside>
    </section>${game.quotes.length ? `<button class="comparison-jump" data-action="compare">原文对照 · ${game.quotes.length} 段 ↗</button>` : ""}`;
  const messages = app.querySelector(".side-content");
  if (messages) messages.scrollTop = messages.scrollHeight;
}

function renderReport() {
  const c = getCase(game.caseId);
  const result = report(game);
  const signed = game.decision === "sign";
  document.title = `${c.company} · 复盘 · 陷阱合同`;
  const entries = result.issues
    .map((issue) => {
      const status = issue.amended
        ? "已改进书面稿"
        : issue.clarified
          ? "写清了原条件"
          : issue.raised
            ? "提过异议，仍按原条件"
            : "本次未指出";
      return `<section class="review-item"><span class="status-pill ${issue.amended ? "good" : ""}">${status}</span><h3>${issue.title}</h3>
      <ul class="report-quotes">${issue.examples.map((entry) => `<li><span>${entry.name}</span><q>${entry.text}</q></li>`).join("")}</ul>
      <p>${issue.amended ? issue.reply : issue.consequence}</p><p class="lesson">${issue.lesson}</p></section>`;
    })
    .join("");
  app.innerHTML = `${header(true)}<section class="report-page"><div class="report-intro"><span class="eyebrow">${c.company} · 邀约复盘</span><div class="result-seal">${signed ? "已签署" : "已谢绝"}</div><h1>${result.title}</h1><p>${result.lead}</p></div>
    <div class="report-metrics"><div><span>你的决定</span><strong>${signed ? `签署 v${game.selectedVersion + 1}` : "谢绝"}</strong></div><div><span>岗位固定税前工资</span><strong>¥${result.income.toLocaleString("zh-CN")}</strong></div><div><span>周六轮值</span><strong>${c.weekends} 次 / 月</strong></div></div>
    <div class="report-columns"><article><h2>${signed ? "合同里的冲突" : "如果签下这份合同"}</h2>${entries || `<section class="review-item"><span class="status-pill good">材料口径一致</span><h3>税前工资和预计实发可以同时成立</h3><p>7,600 元是税前固定工资，6,850 元是估扣后预计到账。${c.good}</p></section>`}
    <details class="final-contract"><summary>查看最终合同 v${game.selectedVersion + 1}</summary>${contractAt(
      game,
    )
      .map((clause) => `<h3>${clause.label}</h3><p>${clause.text}</p>`)
      .join(
        "",
      )}${c.evidence.map((file) => `<h3>${file.name}</h3><p>${sourceAt(game, `file:${file.id}`).text}</p>`).join("")}</details></article>
    <aside class="behind-scenes"><h2>公司想要什么</h2><p>${c.motive}</p><hr><h3>真实案例出处</h3>${c.sources.map((source) => `<a href="${source.url}" target="_blank" rel="noopener noreferrer">${source.name}<span>↗</span></a>`).join("")}<p class="source-note">公司、条款和签约后果为虚构改编。</p></aside></div>
    <div class="report-actions"><button class="quiet" data-start="${c.id}">重新审阅这份合同</button><button class="primary" data-action="home">查看其他邀约 →</button></div></section>`;
}

function render() {
  if (screen === "lobby" || !game) renderLobby();
  else if (game.phase === "report") renderReport();
  else renderGame();
}

function showModal(html) {
  modalOrigin = document.activeElement;
  modal.innerHTML = `<button class="modal-close" data-action="close" aria-label="关闭">×</button>${html}`;
  modal.showModal();
}

function closeModal() {
  modal.close();
  if (modalOrigin?.isConnected) modalOrigin.focus();
}

function showSource(id) {
  const source = sourceAt(game, id);
  if (
    !source ||
    (id.startsWith("file:") && !game.evidence.includes(id.slice(5)))
  )
    return;
  const lines = sourceLines(source);
  const label =
    id === "interview"
      ? "招聘沟通记录"
      : `随合同版本 v${source.version + 1} 查看`;
  showModal(`<span class="eyebrow">${label}</span><h2>${source.name}</h2><p class="modal-hint">点一句加入原文对照，再点一次取消。</p>
    <div class="source-lines">${lines.map((entry) => `<button class="source-line" data-quote="${entry.key}" aria-pressed="${game.quotes.includes(entry.key)}"><span>${entry.text}</span><span aria-hidden="true" class="quote-indicator">${game.quotes.includes(entry.key) ? "✓" : "+"}</span></button>`).join("")}</div>
    <div class="modal-actions source-actions"><span id="quote-count">已引用 ${game.quotes.length} 段</span><button class="primary" data-action="close">完成引用 →</button></div>`);
}

function startCase(id) {
  game = newGame(id);
  screen = "game";
  sideTab = "chat";
  direction = "";
  requestId = "explain";
  save();
  render();
  window.scrollTo(0, 0);
}

function perform(action) {
  const result = act(game, action);
  game = result.game;
  save();
  render();
  toast(result.notice);
}

function toggleQuote(target) {
  const key = target.dataset.quote;
  const result = act(game, { type: "quote", key });
  game = result.game;
  sideTab = "compare";
  save();
  render();
  if (modal.open) {
    modalOrigin = document.getElementById("compare-tab");
    const active = game.quotes.includes(key);
    target.setAttribute("aria-pressed", active);
    target.querySelector(".quote-indicator").textContent = active ? "✓" : "+";
    modal.querySelector("#quote-count").textContent =
      `已引用 ${game.quotes.length} 段`;
  }
  toast(result.notice);
}

function showDecision(decision) {
  const signed = decision === "sign";
  const title = signed
    ? `签署现行稿 v${game.selectedVersion + 1}？`
    : "谢绝这份邀约？";
  const detail = signed
    ? `已收到 ${game.evidence.length} 份附件。签署后，剧情按现行书面稿中的条件展开。`
    : "谢绝后将按现行合同显示复盘。";
  showModal(
    `<span class="eyebrow">${getCase(game.caseId).company} · 最后确认</span><h2>${title}</h2><p>${detail}</p><div class="modal-actions"><button class="quiet" data-action="close">继续审阅</button><button class="primary" data-confirm-decision="${decision}">${signed ? "确认签署" : "确认谢绝"} →</button></div>`,
  );
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("button,a[data-action]");
  if (!target) return;
  const data = target.dataset;
  if (data.action === "home" || data.action === "resume") {
    event.preventDefault();
    screen = data.action === "home" ? "lobby" : "game";
    if (screen === "game") sideTab = game.quotes.length ? "compare" : "chat";
    render();
    window.scrollTo(0, 0);
  }
  if (data.action === "close") closeModal();
  if (data.action === "help")
    showModal(
      '<span class="eyebrow">玩法</span><h2>把对不上的话放在一起</h2><ol class="help-list"><li>点合同条款，选一个方向向 HR 追问。</li><li>打开面试聊天、合同原文或附件，圈选两到三句。</li><li>在「原文对照」提交它们，要求解释或改稿。</li><li>核对现行合同和附件，再决定签署还是谢绝。</li></ol><button class="primary" data-action="close">开始审阅 →</button>',
    );
  if (data.start) {
    if (game?.phase === "playing")
      showModal(
        `<h2>开始新的审阅？</h2><p>当前「${getCase(game.caseId).company}」的未完成进度将由新局替换。</p><div class="modal-actions"><button class="quiet" data-action="close">返回</button><button class="primary" data-confirm-start="${data.start}">开始新局 →</button></div>`,
      );
    else startCase(data.start);
  }
  if (data.confirmStart) {
    closeModal();
    startCase(data.confirmStart);
  }
  if (data.clause) {
    game.selectedClause = data.clause;
    direction = "";
    save();
    render();
    if (window.innerWidth < 950)
      document.querySelector("#negotiation").scrollIntoView();
    document.querySelector("#direction").focus({ preventScroll: true });
  }
  if (data.file) {
    sideTab = "chat";
    perform({ type: "request-file", id: data.file });
  }
  if (data.source) showSource(data.source);
  if (data.quote) toggleQuote(target);
  if (data.reuseQuotes !== undefined) {
    sideTab = "compare";
    perform({ type: "reuse-quotes", index: Number(data.reuseQuotes) });
    document.querySelector("#compare-tab").focus();
  }
  if (data.action === "clear-quotes") {
    requestId = "explain";
    perform({ type: "clear-quotes" });
  }
  if (data.tab) {
    sideTab = data.tab;
    render();
    document.getElementById(`${sideTab}-tab`).focus();
  }
  if (data.action === "compare") {
    sideTab = "compare";
    render();
    document.querySelector("#negotiation").scrollIntoView();
  }
  if (data.revision || data.action === "current-version") {
    game.selectedVersion = data.revision
      ? Number(data.revision)
      : game.revisions.length;
    save();
    render();
    document.querySelector("#contract").scrollIntoView();
  }
  if (data.decision) showDecision(data.decision);
  if (data.confirmDecision) {
    closeModal();
    game = finish(game, data.confirmDecision);
    if (game.phase === "report")
      completed[game.caseId] = { decision: game.decision };
    save();
    render();
    window.scrollTo(0, 0);
  }
});

document.addEventListener("change", (event) => {
  if (event.target.id === "version") {
    game.selectedVersion = Number(event.target.value);
    save();
    render();
  }
  if (event.target.id === "direction") direction = event.target.value;
  if (event.target.id === "request") {
    requestId = event.target.value;
    document.getElementById("request-detail").textContent = requests.find(
      (item) => item.id === requestId,
    ).detail;
  }
});

document.addEventListener("submit", (event) => {
  const form = event.target;
  if (!["ask", "challenge"].includes(form.id)) return;
  event.preventDefault();
  const values = new FormData(form);
  sideTab = "chat";
  perform(
    form.id === "ask"
      ? { type: "ask", direction: values.get("direction") }
      : { type: "challenge", request: values.get("request") },
  );
});

render();
