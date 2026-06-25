#!/usr/bin/env node
import { createServer, type IncomingMessage } from "node:http";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

type RequestMessage = { id?: string | number | null; method: string; params?: Record<string, unknown> };
type Validation = { date: string; result: string; notes?: string; evidence?: string[] };
type Entry = {
  id: string;
  title: string;
  summary: string;
  language?: string;
  kind?: string;
  status: string;
  trust_level: string;
  tags: string[];
  source?: Record<string, unknown>;
  interfaces?: Record<string, unknown>;
  reuse_notes?: string[];
  code?: Record<string, unknown> | string;
  validation?: Validation[];
  risks?: string[];
  created_at: string;
  updated_at: string;
};
type Db = { schema_version: string; library_name: string; purpose: string; created_at: string; updated_at: string; entries: Entry[] };

const here = path.dirname(fileURLToPath(import.meta.url));
const root = ["src", "dist"].includes(path.basename(here)) ? path.dirname(here) : process.cwd();
const dbPath = process.env.CODE_COLLECTIVE_DB || path.join(root, "library", "db.json");
const port = Number(process.env.PORT || process.env.CODE_COLLECTIVE_PORT || 8790);

const now = () => new Date().toISOString();
const norm = (value: unknown) => String(value ?? "").toLowerCase();
const arr = (value: unknown) => Array.isArray(value) ? value.map(String).map((v) => v.trim()).filter(Boolean) : [];
const need = (value: unknown, field: string) => {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${field} is required`);
  return value.trim();
};
const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || `entry-${Date.now()}`;

async function readDb(): Promise<Db> {
  return JSON.parse(await readFile(dbPath, "utf8")) as Db;
}

async function writeDb(db: Db) {
  db.updated_at = now();
  await mkdir(path.dirname(dbPath), { recursive: true });
  const tmp = `${dbPath}.tmp`;
  await writeFile(tmp, `${JSON.stringify(db, null, 2)}\n`, "utf8");
  await rename(tmp, dbPath);
}

function compact(entry: Entry, score?: number) {
  return { id: entry.id, title: entry.title, summary: entry.summary, language: entry.language, kind: entry.kind, status: entry.status, trust_level: entry.trust_level, tags: entry.tags, score };
}

function text(entry: Entry) {
  return [entry.id, entry.title, entry.summary, entry.language, entry.kind, entry.status, entry.trust_level, ...(entry.tags || []), JSON.stringify(entry.source || {}), JSON.stringify(entry.interfaces || {}), JSON.stringify(entry.reuse_notes || []), JSON.stringify(entry.code || {}), JSON.stringify(entry.risks || [])].map(norm).join(" ");
}

function score(entry: Entry, query: string, tags: string[]) {
  let points = 0;
  const haystack = text(entry);
  const entryTags = new Set(entry.tags.map(norm));
  for (const tag of tags) if (entryTags.has(norm(tag))) points += 6;
  for (const token of norm(query).split(/\s+/).filter(Boolean)) {
    if (entry.id.toLowerCase().includes(token)) points += 4;
    else if (entry.title.toLowerCase().includes(token)) points += 3;
    else if (haystack.includes(token)) points += 1;
  }
  return points;
}

async function searchCode(args: Record<string, unknown>) {
  const query = String(args.query || "");
  const tags = arr(args.tags);
  const language = norm(args.language);
  const status = norm(args.status);
  const trust = norm(args.trust_level);
  const limit = Math.min(Math.max(Number(args.limit || 10), 1), 100);
  const db = await readDb();
  const results = db.entries
    .map((entry) => ({ entry, score: score(entry, query, tags) }))
    .filter(({ entry, score }) => (!(query || tags.length) || score > 0) && (!language || norm(entry.language) === language) && (!status || norm(entry.status) === status) && (!trust || norm(entry.trust_level) === trust))
    .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title))
    .slice(0, limit)
    .map(({ entry, score }) => compact(entry, score));
  return { count: results.length, results };
}

async function getEntry(args: Record<string, unknown>) {
  const id = need(args.id, "id");
  const db = await readDb();
  const entry = db.entries.find((item) => item.id === id);
  if (!entry) throw new Error(`Entry not found: ${id}`);
  return entry;
}

async function addEntry(args: Record<string, unknown>) {
  const input = (args.entry && typeof args.entry === "object" ? args.entry : args) as Record<string, unknown>;
  const title = need(input.title, "title");
  const summary = need(input.summary, "summary");
  const id = String(input.id || slug(title));
  const db = await readDb();
  const existing = db.entries.findIndex((item) => item.id === id);
  if (existing >= 0 && !args.allow_overwrite) throw new Error(`Entry already exists: ${id}`);
  const stamp = now();
  const entry: Entry = {
    id,
    title,
    summary,
    language: typeof input.language === "string" ? input.language : undefined,
    kind: typeof input.kind === "string" ? input.kind : undefined,
    status: typeof input.status === "string" ? input.status : "candidate",
    trust_level: typeof input.trust_level === "string" ? input.trust_level : "unknown",
    tags: arr(input.tags),
    source: typeof input.source === "object" && input.source ? input.source as Record<string, unknown> : undefined,
    interfaces: typeof input.interfaces === "object" && input.interfaces ? input.interfaces as Record<string, unknown> : undefined,
    reuse_notes: arr(input.reuse_notes),
    code: typeof input.code === "object" || typeof input.code === "string" ? input.code as Entry["code"] : undefined,
    validation: Array.isArray(input.validation) ? input.validation as Validation[] : [],
    risks: arr(input.risks),
    created_at: existing >= 0 ? db.entries[existing].created_at : stamp,
    updated_at: stamp
  };
  if (existing >= 0) db.entries[existing] = entry;
  else db.entries.push(entry);
  await writeDb(db);
  return { saved: true, entry: compact(entry) };
}

async function updateEntry(args: Record<string, unknown>) {
  const id = need(args.id, "id");
  const patch = (args.patch && typeof args.patch === "object" ? args.patch : {}) as Partial<Entry>;
  const db = await readDb();
  const index = db.entries.findIndex((item) => item.id === id);
  if (index < 0) throw new Error(`Entry not found: ${id}`);
  db.entries[index] = { ...db.entries[index], ...patch, id, tags: patch.tags ? arr(patch.tags) : db.entries[index].tags, updated_at: now() };
  await writeDb(db);
  return { updated: true, entry: compact(db.entries[index]) };
}

async function validateEntry(args: Record<string, unknown>) {
  const id = need(args.id, "id");
  const result = need(args.result, "result");
  const db = await readDb();
  const entry = db.entries.find((item) => item.id === id);
  if (!entry) throw new Error(`Entry not found: ${id}`);
  const record = { date: typeof args.date === "string" ? args.date : now().slice(0, 10), result, notes: typeof args.notes === "string" ? args.notes : undefined, evidence: arr(args.evidence) };
  entry.validation = [...(entry.validation || []), record];
  if (typeof args.status === "string") entry.status = args.status;
  if (typeof args.trust_level === "string") entry.trust_level = args.trust_level;
  entry.updated_at = now();
  await writeDb(db);
  return { recorded: true, entry: compact(entry), validation: record };
}

async function tags() {
  const db = await readDb();
  return { tags: [...new Set(db.entries.flatMap((entry) => entry.tags))].sort() };
}

async function sources() {
  const db = await readDb();
  return { sources: db.entries.map((entry) => ({ id: entry.id, source: entry.source || null })) };
}

function tools() {
  return { tools: [
    { name: "search_code", description: "Search reusable code and algorithm entries.", inputSchema: { type: "object", properties: { query: { type: "string" }, tags: { type: "array", items: { type: "string" } }, language: { type: "string" }, status: { type: "string" }, trust_level: { type: "string" }, limit: { type: "number" } } } },
    { name: "get_code_entry", description: "Fetch one full reusable code entry by id.", inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] } },
    { name: "add_code_entry", description: "Add a reusable code, algorithm, schema, integration, or workflow entry.", inputSchema: { type: "object", properties: { entry: { type: "object" }, allow_overwrite: { type: "boolean" } } } },
    { name: "update_code_entry", description: "Patch metadata on an existing entry.", inputSchema: { type: "object", properties: { id: { type: "string" }, patch: { type: "object" } }, required: ["id", "patch"] } },
    { name: "record_validation", description: "Append validation evidence and optionally promote status/trust.", inputSchema: { type: "object", properties: { id: { type: "string" }, result: { type: "string" }, notes: { type: "string" }, evidence: { type: "array", items: { type: "string" } }, status: { type: "string" }, trust_level: { type: "string" } }, required: ["id", "result"] } },
    { name: "list_tags", description: "List all tags.", inputSchema: { type: "object", properties: {} } },
    { name: "list_sources", description: "List represented sources.", inputSchema: { type: "object", properties: {} } },
    { name: "export_code_library", description: "Return the full database.", inputSchema: { type: "object", properties: {} } }
  ] };
}

async function call(name: string, args: Record<string, unknown>) {
  const result = name === "search_code" ? await searchCode(args)
    : name === "get_code_entry" ? await getEntry(args)
    : name === "add_code_entry" ? await addEntry(args)
    : name === "update_code_entry" ? await updateEntry(args)
    : name === "record_validation" ? await validateEntry(args)
    : name === "list_tags" ? await tags()
    : name === "list_sources" ? await sources()
    : name === "export_code_library" ? await readDb()
    : (() => { throw new Error(`Unknown tool: ${name}`); })();
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
}

async function resources() {
  const db = await readDb();
  return { resources: [{ uri: "code-collective://db", name: "Code Collective Database", description: db.purpose, mimeType: "application/json" }, ...db.entries.map((entry) => ({ uri: `code-collective://entries/${entry.id}`, name: entry.title, description: `${entry.language || "unknown"} | ${entry.status} | ${entry.trust_level}`, mimeType: "application/json" }))] };
}

async function readResource(uri: string) {
  if (uri === "code-collective://db") return { contents: [{ uri, mimeType: "application/json", text: JSON.stringify(await readDb(), null, 2) }] };
  const prefix = "code-collective://entries/";
  if (uri.startsWith(prefix)) return { contents: [{ uri, mimeType: "application/json", text: JSON.stringify(await getEntry({ id: uri.slice(prefix.length) }), null, 2) }] };
  throw new Error(`Unknown resource: ${uri}`);
}

async function handle(req: RequestMessage): Promise<unknown> {
  const params = req.params || {};
  if (req.method === "initialize") return { protocolVersion: "2024-11-05", capabilities: { tools: {}, resources: {} }, serverInfo: { name: "code-collective-mcp", version: "0.1.0" } };
  if (req.method === "tools/list") return tools();
  if (req.method === "tools/call") return call(String(params.name), (params.arguments as Record<string, unknown>) || {});
  if (req.method === "resources/list") return resources();
  if (req.method === "resources/read") return readResource(String(params.uri));
  if (req.method === "notifications/initialized") return undefined;
  if (req.method === "ping") return {};
  throw new Error(`Unsupported method: ${req.method}`);
}

const response = (id: RequestMessage["id"], result: unknown, error?: string) => error ? { jsonrpc: "2.0", id, error: { code: -32000, message: error } } : { jsonrpc: "2.0", id, result };

function startStdio() {
  let buffer = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (chunk) => {
    buffer += chunk;
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() || "";
    for (const line of lines) if (line.trim()) void (async () => {
      let req: RequestMessage | null = null;
      try { req = JSON.parse(line) as RequestMessage; process.stdout.write(`${JSON.stringify(response(req.id, await handle(req)))}\n`); }
      catch (err) { process.stdout.write(`${JSON.stringify(response(req?.id || null, null, err instanceof Error ? err.message : String(err)))}\n`); }
    })();
  });
}

function body(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => { data += chunk; if (data.length > 10_000_000) reject(new Error("Request body too large")); });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

function startHttp() {
  createServer(async (req, res) => {
    try {
      const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
      if (req.method === "GET" && url.pathname === "/health") { res.writeHead(200, { "content-type": "application/json" }); res.end(JSON.stringify({ ok: true, dbPath })); return; }
      if (req.method === "GET" && url.pathname === "/export") { res.writeHead(200, { "content-type": "application/json" }); res.end(JSON.stringify(await readDb(), null, 2)); return; }
      if (req.method === "POST" && url.pathname === "/mcp") { const reqMsg = JSON.parse(await body(req)); res.writeHead(200, { "content-type": "application/json" }); res.end(JSON.stringify(response(reqMsg.id, await handle(reqMsg)))); return; }
      res.writeHead(404, { "content-type": "application/json" }); res.end(JSON.stringify({ error: "not found" }));
    } catch (err) { res.writeHead(500, { "content-type": "application/json" }); res.end(JSON.stringify({ error: err instanceof Error ? err.message : String(err) })); }
  }).listen(port, () => process.stderr.write(`code-collective-mcp http://localhost:${port}\n`));
}

if ((process.argv[2] || "stdio") === "http") startHttp();
else startStdio();
