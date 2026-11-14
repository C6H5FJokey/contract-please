import { campaign, findChapter } from "./chapters.js";
import { chapterProgress, chapterUnlocked, chapterUrl } from "./progress.js";

const params = new URLSearchParams(location.search);
const requested = params.get("chapter");
const entry = findChapter(requested);
const { completed, statuses } = chapterProgress(localStorage);

if (entry && (entry.status === "demo" || chapterUnlocked(entry.chapter.id, completed))) {
  document.getElementById("lobby")!.hidden = true;
  document.getElementById("workspace")!.hidden = false;
  document.getElementById("mast-actions")!.hidden = false;
  document.title = `${entry.chapter.title} | 来，签合同`;
  void import("./app.js").then(({ mountNegotiation }) => mountNegotiation(entry));
} else {
  addEventListener("pageshow", event => { if (event.persisted) location.reload(); });
  if (requested !== null) {
    params.delete("chapter");
    const search = params.toString();
    history.replaceState(null, "", location.pathname + (search ? `?${search}` : "") + location.hash);
  }
  const list = document.getElementById("chapter-list")!;
  const continueLink = document.querySelector<HTMLAnchorElement>("#lobby-continue")!;
  const continueLabel = document.getElementById("lobby-continue-label")!;
  const cards = campaign.map((entry, index) => {
    const { chapter } = entry;
    const unlocked = chapterUnlocked(chapter.id, completed);
    const done = completed.has(chapter.id);
    const reviewable = statuses.get(chapter.id) === "reviewable";
    const inProgress = statuses.get(chapter.id) === "inProgress";
    const item = document.createElement("li");
    const card = document.createElement(unlocked ? "a" : "div");
    card.className = `invitation${unlocked ? "" : " locked"}`;
    if (card instanceof HTMLAnchorElement) card.href = chapterUrl(chapter.id);
    const mark = document.createElement("span");
    mark.className = "invitation-mark";
    mark.textContent = chapter.title.slice(0, 1);
    mark.setAttribute("aria-hidden", "true");
    const name = document.createElement("span");
    name.className = "invitation-name";
    const number = document.createElement("small");
    number.textContent = `CASE ${String(index + 1).padStart(2, "0")} · 第 ${index + 1} 章`;
    const title = document.createElement("strong");
    title.textContent = chapter.title;
    const role = document.createElement("span");
    role.textContent = chapter.setting;
    name.append(number, title, role);
    const status = document.createElement("span");
    status.className = "invitation-status";
    status.textContent = unlocked
      ? (inProgress ? "审阅中" : reviewable ? "已结案" : done ? "已结案" : "待审阅")
      : "尚未解锁";
    const action = document.createElement("span");
    action.className = "invitation-action";
    action.textContent = unlocked ? "↗" : "—";
    action.setAttribute("aria-hidden", "true");
    card.setAttribute("aria-label", unlocked ? `${chapter.title}，${status.textContent}，打开邀约` : `${chapter.title}，完成第 ${index} 章后解锁`);
    card.append(mark, name, status, action);
    item.append(card);
    list.append(item);
    return { id: chapter.id, title: chapter.title, unlocked, done, inProgress, reviewable };
  });
  document.getElementById("chapter-progress")!.textContent = `${cards.filter(card => card.done).length} / ${cards.length} 已结案`;
  const next = cards.find(card => card.unlocked && card.inProgress) ??
    cards.find(card => card.unlocked && !card.done) ?? cards.at(-1);
  if (next) {
    continueLink.href = chapterUrl(next.id);
    continueLabel.textContent = next.inProgress ? `继续审阅 ${next.title}`
      : next.reviewable ? `查看结案 ${next.title}` : `打开${next.title}的邀约`;
    continueLink.hidden = false;
  }
}
