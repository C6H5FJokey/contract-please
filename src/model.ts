export interface Line { id: string; text: string }
export interface Section { id?: string; label: string; lines: Line[] }
export interface Material { name: string; detail: string; sections: Section[] }
export interface DocumentVersion extends Material { id: string; version: number }
export interface Reference { document: string; version: number; line: string }
export interface Quote extends Reference { name: string; label: string; text: string; current: boolean }
export interface Edit { document: string; line: string; text: string; unlessAmended?: string }
export interface Amendment { title: string; edited: string; open: string; lesson: string; edits: Edit[] }
export type Outcome = "sign" | "leave";
export type Phase = "active" | "refused" | "ended";
export interface ReturnRoute { ifFile?: string; go: string }
export interface ProofAnswer { lines: string[]; go: string; unlessAmended?: string }
export interface Proof {
  anchor?: "reply";
  steps: string[];
  accepts: ProofAnswer[];
  mistakes?: ProofAnswer[];
  wrong: string;
  back: ReturnRoute[];
  defer: { text: string; go: string };
}
export interface Topic {
  label: string;
  start: string;
  amendments?: string[];
  followUps?: { after: string; start: string }[];
}
export interface Hotspot {
  id: string;
  label: string;
  x: number;
  y: number;
  observation: string;
  files?: string[];
  topic?: string;
}
export interface FloorPlan { image: string; alt: string; hotspots: Hotspot[] }
export interface Chapter {
  id: string;
  revision: number;
  title: string;
  setting: string;
  contact: { name: string; role: string; mark: string };
  initialFiles: string[];
  contract: string;
  start: string;
  topics: Record<string, Topic>;
  clauseTopics: Record<string, string>;
  floorPlan?: FloorPlan;
  source?: { title: string; url: string };
  documents: Record<string, Material>;
  amendments: Record<string, Amendment>;
  proofs: Record<string, Proof>;
  deadlocks: Record<string, ReturnRoute[]>;
  endings: Record<Outcome, { title: string; detail: string }>;
}

export type Command =
  | { type: "openTopic"; from: "clause" | "hotspot"; id: string }
  | { type: "investigate"; id: string }
  | { type: "choose"; id: string }
  | { type: "cite"; ref: Reference }
  | { type: "revise"; index: number }
  | { type: "finish"; result: Outcome }
  | { type: "endTopic" | "defer" | "continue" };

export interface Save {
  chapter: string;
  revision: number;
  commands: Command[];
  readThrough?: number;
}

export type EventData =
  | { kind: "message"; who: "player" | "contact"; text: string }
  | { kind: "thought"; text: string }
  | { kind: "file"; document: string; version: number; name: string; revised: boolean }
  | { kind: "amendment"; title: string; recovered: number }
  | { kind: "setback"; counter: "deadlocks" | "wrong"; patience: number }
  | { kind: "submission"; quotes: Quote[]; accepted: boolean; claim?: string }
  | { kind: "discovery"; label: string; text: string };
export type GameEvent = EventData & { id: number };
export type FileEvent = Extract<GameEvent, { kind: "file" }>;
