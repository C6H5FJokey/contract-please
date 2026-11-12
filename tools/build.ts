import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build, type Plugin } from "esbuild";
import { Compiler } from "inkjs/full";
import { boshi } from "../content/boshi-pay/chapter.js";
import { windowDemo } from "../content/window-demo/chapter.js";
import { parseCue } from "../src/ink.js";
import type { Chapter } from "../src/model.js";

const root = fileURLToPath(new URL("../", import.meta.url));
const mode = process.argv[2];
const includeDemo = mode === "dev";
const released = [boshi];
const demos = [windowDemo];
const chapters = [...released, ...demos];
const compiled = new Map<string, string>();

function validate(chapter: Chapter, source: string, story: ReturnType<Compiler["Compile"]>) {
  const need = (condition: unknown, message: string) => {
    if (!condition) throw new Error(`${chapter.id}: ${message}`);
  };
  const knot = (id: string) => need(story.KnotContainerWithName(id), `missing Ink knot ${id}`);
  const file = (id: string) => need(Object.hasOwn(chapter.documents, id), `missing file ${id}`);
  const amend = (id: string) => need(Object.hasOwn(chapter.amendments, id), `missing amendment ${id}`);
  const topic = (id: string) => need(Object.hasOwn(chapter.topics, id), `missing topic ${id}`);
  const lines = new Set<string>();
  for (const [id, doc] of Object.entries(chapter.documents)) {
    for (const section of doc.sections) {
      for (const line of section.lines) {
        const key = `${id}.${line.id}`;
        need(!lines.has(key), `duplicate line ${key}`);
        lines.add(key);
      }
    }
  }
  const line = (key: string) => need(lines.has(key), `missing line ${key}`);
  file(chapter.contract);
  chapter.initialFiles.forEach(file);
  for (const id of [chapter.start, "end_topic", "stale", "refused", "resume", "refused_leave", "finish_sign", "finish_leave"]) knot(id);
  for (const [section, id] of Object.entries(chapter.clauseTopics)) {
    need(chapter.documents[chapter.contract].sections.some(item => item.id === section), `missing clause ${section}`);
    topic(id);
  }
  for (const value of Object.values(chapter.topics)) {
    knot(value.start);
    value.amendments?.forEach(amend);
    for (const route of value.followUps ?? []) {
      amend(route.after);
      knot(route.start);
    }
  }
  const hotspots = new Set<string>();
  for (const spot of chapter.floorPlan?.hotspots ?? []) {
    need(!hotspots.has(spot.id), `duplicate hotspot ${spot.id}`);
    hotspots.add(spot.id);
    need([spot.x, spot.y].every(n => Number.isFinite(n) && n >= 0 && n <= 100), `invalid position for ${spot.id}`);
    if (spot.topic) topic(spot.topic);
    spot.files?.forEach(file);
  }
  if (chapter.floorPlan) {
    need(/^\.\/[\w-]+\/[\w.-]+\.(png|jpg|jpeg|webp)$/.test(chapter.floorPlan.image),
      "floor plan image must be a relative asset path, such as ./chapter-id/plan.png");
    need(chapter.floorPlan.image.startsWith(`./${chapter.id}/`), "floor plan image must belong to its chapter");
  }
  function back(routes: { go: string; ifFile?: string }[]) {
    need(routes.length && !routes.at(-1)?.ifFile, "return route needs a fallback");
    for (const route of routes) {
      knot(route.go);
      if (route.ifFile) file(route.ifFile);
    }
  }
  for (const rule of Object.values(chapter.proofs)) {
    need(rule.steps.length, "proof has no steps");
    rule.steps.forEach(knot);
    knot(rule.wrong);
    knot(rule.defer.go);
    back(rule.back);
    for (const answer of [...rule.accepts, ...(rule.mistakes ?? [])]) {
      need(new Set(answer.lines).size === rule.steps.length && answer.lines.length === rule.steps.length, "proof answer has wrong number of distinct lines");
      answer.lines.forEach(line);
      knot(answer.go);
      if (answer.unlessAmended) amend(answer.unlessAmended);
    }
  }
  Object.values(chapter.deadlocks).forEach(back);
  for (const { edits } of Object.values(chapter.amendments)) {
    for (const edit of edits) {
      line(`${edit.document}.${edit.line}`);
      if (edit.unlessAmended) amend(edit.unlessAmended);
    }
  }
  for (const entry of source.split(/\r?\n/)) {
    const text = entry.trim();
    if (text.startsWith("//")) continue;
    if (/^[*+]\s/.test(text)) {
      need(/# choice:[\w-]+\s*\]/.test(text), `missing choice ID in ${text}`);
      continue;
    }
    for (const match of text.matchAll(/\b(has_file|has_clue)\("([^"]+)"\)/g)) {
      if (match[1] === "has_file") file(match[2]);
      else need(hotspots.has(match[2]), `missing clue ${match[2]}`);
    }
    for (const tag of text.split("#").slice(1)) {
      const cue = parseCue(tag.trim());
      if (cue.kind === "file") file(cue.id);
      if (cue.kind === "amend") amend(cue.id);
      if (cue.kind === "proof") need(Object.hasOwn(chapter.proofs, cue.id), `missing proof ${cue.id}`);
      if (cue.kind === "deadlock") need(Object.hasOwn(chapter.deadlocks, cue.id), `missing deadlock ${cue.id}`);
    }
  }
}

for (const chapter of chapters) {
  const file = join(root, "content", chapter.id, "story.ink");
  const source = await readFile(file, "utf8");
  const compiler = new Compiler(source);
  let story;
  try {
    story = compiler.Compile();
  } catch (error) {
    throw new Error(`${chapter.id}: ${compiler.errors.join("\n")}`, { cause: error });
  }
  validate(chapter, source, story);
  const json = story.ToJson();
  if (typeof json !== "string") throw new Error(`No compiled JSON for ${file}`);
  compiled.set(file, json);
}

const ink: Plugin = {
  name: "compiled-ink",
  setup(builder) {
    builder.onLoad({ filter: /\.ink$/ }, ({ path }) => {
      const contents = compiled.get(path);
      if (!contents) throw new Error(`Unregistered Ink script: ${path}`);
      return { contents, loader: "text" };
    });
  },
};

if (mode === "test") {
  const files = (await readdir(join(root, "tests"))).filter(name => name.endsWith(".test.ts"));
  await build({
    absWorkingDir: root,
    entryPoints: files.map(file => `tests/${file}`),
    outdir: ".cache/tests",
    platform: "node",
    format: "esm",
    outExtension: { ".js": ".mjs" },
    bundle: true,
    packages: "external",
    plugins: [ink],
    define: { INCLUDE_DEMO: "true" },
  });
} else if (mode === "dev" || mode === "production") {
  // root is the parent of the .cache directory containing this build script.
  const dist = join(root, "dist");
  await rm(dist, { recursive: true, force: true });
  await mkdir(dist, { recursive: true });
  await cp(join(root, "public"), dist, { recursive: true });
  await build({
    absWorkingDir: root,
    entryPoints: ["src/app.ts"],
    outfile: "dist/app.js",
    platform: "browser",
    format: "esm",
    bundle: true,
    minifySyntax: !includeDemo,
    plugins: [ink],
    define: { INCLUDE_DEMO: String(includeDemo) },
    banner: { js: "/* Contract, Please · C6H5FJokey. Code: MIT. Original story and art: CC BY 4.0. See LICENSE-MIT.txt, CONTENT-LICENSE.md and INKJS-LICENSE.txt. */" },
  });
  for (const chapter of includeDemo ? chapters : released) {
    if (!chapter.floorPlan) continue;
    const relative = chapter.floorPlan.image;
    const target = join(dist, relative);
    await mkdir(dirname(target), { recursive: true });
    await cp(join(root, "content", relative), target);
  }
  const inkLicense = await readFile(join(root, "node_modules/inkjs/LICENSE.md"), "utf8");
  await writeFile(join(dist, "INKJS-LICENSE.txt"), inkLicense);
  await cp(join(root, "LICENSE"), join(dist, "LICENSE-MIT.txt"));
  await cp(join(root, "content/LICENSE.md"), join(dist, "CONTENT-LICENSE.md"));
} else if (mode !== "validate") {
  throw new Error(`Unknown build mode: ${mode}`);
}
