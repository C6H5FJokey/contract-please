import http from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../dist/", import.meta.url));
const types: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/plain; charset=utf-8",
};
const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(
      new URL(req.url ?? "/", "http://localhost").pathname,
    );
    const target = path.resolve(
      root,
      "." + (pathname === "/" ? "/index.html" : pathname),
    );
    const relative = path.relative(root, target);
    if (relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
      res.writeHead(403).end();
      return;
    }
    const body = await readFile(target);
    res.writeHead(200, {
      "Content-Type": types[path.extname(target)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(body);
  } catch {
    res.writeHead(404).end("Not found");
  }
});
const port = Number(process.env.CONTRACT_PLEASE_PORT ?? 4173);
server.listen(port, "127.0.0.1", () =>
  console.log(`Local: http://127.0.0.1:${port}`),
);
