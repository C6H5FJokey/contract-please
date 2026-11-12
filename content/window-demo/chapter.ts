import type { Chapter } from "../../src/model.js";

export const windowDemo: Chapter = {
  id: "window-demo",
  revision: 1,
  title: "卧室窗户",
  subtitle: "调查流程测试",
  setting: "房屋交付 · 测试场景",
  contact: { name: "周姐", role: "房东", mark: "周" },
  initialFiles: ["contract"],
  contract: "contract",
  start: "opening",
  topics: {
    window: {
      label: "卧室窗户",
      start: "ask_window",
      amendments: ["repair"],
      followUps: [{ after: "repair", start: "after_repair" }],
    },
  },
  clauseTopics: { delivery: "window" },
  floorPlan: {
    image: "./window-demo/plan.png",
    alt: "测试户型图。卧室在左侧，卧室的窗户沿上方外墙。",
    hotspots: [{
      id: "window",
      label: "卧室窗户",
      x: 29,
      y: 18,
      observation: "我看到窗框下沿有水渍，墙漆也有一小块起泡。",
      files: ["observation"],
      topic: "window",
    }],
  },
  documents: {
    contract: {
      name: "租赁合同",
      detail: "调查流程测试用",
      sections: [{
        id: "delivery",
        label: "房屋交付",
        lines: [{ id: "condition", text: "卧室窗户按现状交付。" }],
      }],
    },
    observation: {
      name: "看房记录",
      detail: "我在卧室窗边记下的情况",
      sections: [{
        label: "卧室窗户",
        lines: [{ id: "stain", text: "窗框下沿可见水渍，邻近墙漆起泡。" }],
      }],
    },
  },
  proofs: {
    window: {
      anchor: "reply",
      steps: ["window_thought"],
      accepts: [{ lines: ["observation.stain"], go: "window_offer" }],
      wrong: "window_wrong",
      back: [{ go: "ask_window" }],
      defer: { text: "先搁一搁", go: "window_defer" },
    },
  },
  deadlocks: {},
  amendments: {
    repair: {
      title: "交付前检查窗框",
      edited: "我可以在收房时和房东一起核对窗框。",
      open: "合同里仍写着按现状交付。",
      lesson: "水渍能说明值得检查。渗水原因要等检查后才能确认。",
      edits: [{
        document: "contract",
        line: "condition",
        text: "交付前由出租人检查卧室窗框的水渍原因，处理后与承租人共同验收。",
      }],
    },
  },
  endings: {
    sign: { title: "已签署当前版本", detail: "我把当前这份合同存下来。" },
    leave: { title: "未签署合同", detail: "我先回去想想。" },
  },
};
