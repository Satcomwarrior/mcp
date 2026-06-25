#!/usr/bin/env node
import { createServer } from "node:http";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];
type JsonObject = { [key: string]: JsonValue };

type JsonRpcRequest = {
  jsonrpc?: "2.0";
  id?: string | number | null;
  method: string;
  params?: Record<string, unknown>;
};

type ValidationRecord = {
  date: string;
  result: string;
  notes?: string;
  evidence?: string[];
};

type CodeEntry = {
  id: string;
  title: string;
  summary: string;
  language?: string;
  kind?: string;
  status: "candidate" | "adapted" | "tested" | "production" | "deprecated" | string;
  trust_level: "unknown" | "reviewed-not-tested" | "runs-locally" | "ci-validated" | "production-proven" | string;
  tags: string[];
  source?: Record<string, unknown>;
  interfaces?: Record<string, unknown>;
  reuse_notes?: string[];
  code?: Record<string, unknown> | string;
  validation?: ValidationRecord[];
  risks?: string[];
  created_at: string;
  updated_at: string;
};

type CodeDb = {
  schema_version: string;
  library_name: string;
  purpose: string;
  created_at: string;
  updated_at: string;
  entries: CodeEntry[];
};

const thisFile = fileURLToPath(import.meta.url);
const thisDir = path.dirname(thisFile);
const projectRoot = ["src", "dist"].includes(path.basename(thisDir)) ? path.dirname(thisDir) : process.cwd();
const dbPath = process.env.CODE_COLLECTIVE_DB || path.join(projectRoot, "library", "db.json");
const port = Number(process.env.PORT || process.env.CODE_COLLECTIVE_PORT || 8790);

function nowIso(): string {
  return new Date().toISOString();
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || `entry-${Date.now()}`;
}

function normalize(value: unknown): string {
  return String(value ?? "").toLowerCase();
}

async function loadDb(): Promise<CodeDb> {
  const raw = await readFile(dbPath, "utf8");
  return JSON.parse(raw) as CodeDb;
}

async function saveDb(db: CodeDb): Promise<void> {
  db.updated_at = nowIso();
  await mkdir(path.dirname(dbPath), { recursive: true });
  const tmp = `${dbPath}.tmp`;
  await writeFile(tmp, `${JSON.stringify(db, null, 2)}\n`, "utf8");
  await rename(tmp, dbPath);
}

function allText(entry: CodeEntry): string {
  return [
    entry.id,
    entry.title,
    entry.summary,
    entry.language,
    entry.kind,
    entry.status,
    entry.trust_level,
    ...(entry.tags || []),
    JSON.stringify(entry.source ?? {}),
    JSON.stringify(entry.interfaces ?? {}),
    JSON.stringify(entry.reuse_notes ?? []),
    JSON.stringify(entry.code ?? {}),
    JSON.stringify(entry.risks ?? []),
  ]
    .map(normalize)
    .join(" ");
}

function scoreEntry(entry: CodeEntry, query: string, tags: string[]): number {
  let score = 0;
  const text = allText(entry);
  const lowerTags = new Set((entry.tags || []).map(normalize));

  for (const tag of tags) {
    if (lowerTags.has(normalize(tag))) score += 6;
  }

  for (const token of normalize(query).split(/\s+/).filter(Boolean)) {
    if (entry.id.toLowerCase().includes(token)) score += 4;
    else if (entry.title.toLowerCase().includes(token)) score += 3;
    else if (text.includes(token)) score += 1;
  }

  return score;
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${field} is required`);
  return value.trim();
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String).map((item) => item.trim()).filter(Boolean) : [];
}

function summarize(entry: CodeEntry, score?: number) {
  return {
    id: entry.id,
    title: entry.title,
    summary: entry.summary,
    language: entry.language,
    kind: entry.kind,
    status: entry.status,
    trust_level: entry.trust_level,
    tags: entry.tags,
    score,
  };
}

async function searchCode(args: Record<string, unknown>) {
  const query = String(args.query ?? "");
  const tags = stringArray(args.tags);
  const language = normalize(args.language);
  const status = normalize(args.status);
  const trustLevel = normalize(args.trust_level);
  const limitRaw = Number(args.limit ?? 10);
  const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 100) : 10;
  const db = await loadDb();

  const results = db.entries
    .map((entry) => ({ entry, score: scoreEntry(entry, query, tags) }))
    .filter(({ entry, score }) => {
      if (query || tags.length) {
        if (score <= 0) return false;
      }
      if (language && normalize(entry.language) !== language) return false;
      if (status && normalize(entry.status) !== status) return false;
      if (trustLevel && normalize(entry.trust_level) !== trustLevel) return false;
      return true;
    })
    .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title))
    .slice(0, limit)
    .map(({ entry, score }) => summarize(entry, score));

  return { count: results.length, results };
}

async function getCodeEntry(args: Record<string, unknown>) {
  const id = requireString(args.id, "id");
  const db = await loadDb();
  const entry = db.entries.find((candidate) => candidate.id === id);
  if (!entry) throw new Error(`Entry not found: ${id}`);
  return entry;
}

async function addCodeEntry(args: Record<string, unknown>) {
  const payload = (args.entry && typeof args.entry === "object" ? args.entry : args) as Record<string, unknown>;
  const title = requireString(payload.title, "title");
  const summary = requireString(payload.summary, "summary");
  const id = String(payload.id || slugify(title));
  const tags = stringArray(payload.tags);
  const allowOverwrite = Boolean(args.allow_overwrite || payload.allow_overwrite);
  const db = await loadDb();
  const existingIndex = db.entries.findIndex((entry) => entry.id === id);

  if (existingIndex >= 0 && !allowOverwrite) {
    throw new Error(`Entry already exists: ${id}`);
  }

  const timestamp = nowIso();
  const entry: CodeEntry = {
    id,
    title,
    summary,
    language: typeof payload.language === "string" ? payload.language : undefined,
    kind: typeof payload.kind === "string" ? payload.kind : undefined,
    status: typeof payload.status === "string" ? payload.status : "candidate",
    trust_level: typeof payload.trust_level === "string" ? payload.trust_level : "unknown",
    tags,
    source: typeof payload.source === "object" && payload.source ? (payload.source as Record<string, unknown>) : undefined,
    interfaces: typeof payload.interfaces === "object" && payload.interfaces ? (payload.interfaces as Record<string, unknown>) : undefined,
    reuse_notes: stringArray(payload.reuse_notes),
    code: typeof payload.code === "object" || typeof payload.code === "string" ? (payload.code as CodeEntry["code"]) : undefined,
    validation: Array.isArray(payload.validation) ? (payload.validation as ValidationRecord[]) : [],
    risks: stringArray(payload.risks),
    created_at: existingIndex >= 0 ? db.entries[existingIndex].created_at : timestamp,
    updated_at: timestamp,
  };

  if (existingIndex >= 0) db.entries[existingIndex] = entry;
  else db.entries.push(entry);

  await saveDb(db);
  return { saved: true, entry: summarize(entry) };
}

async function updateCodeEntry(args: Record<string, unknown>) {
  const id = requireString(args.id, "id");
  const patch = (args.patch && typeof args.patch === "object" ? args.patch : {}) as Partial<CodeEntry>;
  const db = await loadDb();
  const index = db.entries.findIndex((entry) => entry.id === id);
  if (index < 0) throw new Error(`Entry not found: ${id}`);

  const current = db.entries[index];
  const updated: CodeEntry = {
    ...current,
    ...patch,
    id: current.id,
    tags: patch.tags ? stringArray(patch.tags) : current.tags,
    updated_at: nowIso(),
  };

  db.entries[index] = updated;
  await saveDb(db);
  return { updated: true, entry: summarize(updated) };
}

async function recordValidation(args: Record<string, unknown>) {
  const id = requireString(args.id, "id");
  const result = requireString(args.result, "result");
  const db = await loadDb();
  const entry = db.entries.find((candidate) => candidate.id === id);
  if (!entry) throw new Error(`Entry not found: ${id}`);

  const validation: ValidationRecord = {
    date: typeof args.date === "string" ? args.date : nowIso().slice(0, 10),
    result,
    notes: typeof args.notes === "string" ? args.notes : undefined,
    evidence: stringArray(args.evidence),
  };

  entry.validation = [...(entry.validation || []), validation];
  if (typeof args.status === "string") entry.status = args.status;
  if (typeof args.trust_level === "string") entry.trust_level = args.trust_level;
  entry.updated_at = nowIso();

  await saveDb(db);
  return { recorded: true, entry: summarize(entry), validation };
}

async function listTags() {
  const db = await loadDb();
  const tags = [...new Set(db.entries.flatMap((entry) => entry.tags || []))].sort((a, b) => a.localeCompare(b));
  return { tags };
}

async function listSources() {
  const db = await loadDb();
  const sources = db.entries.map((entry) => ({ id: entry.id, source: entry.source ?? null }));
  return { sources };
}

async function exportCodeLibrary() {
  return loadDb();
}

function toolDefinitions() {
  return {
    tools: [
      {
        name: "search_code",
        description: "Search reusable code and algorithm entries by query, tags, language, status, or trust level.",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string" },
            tags: { type: "array", items: { type: "string" } },
            language: { type: "string" },
            status: { type: "string" },
            trust_level: { type: "string" },
            limit: { type: "number" }
          }
        }
      },
      {
        name: "get_code_entry",
        description: "Fetch one full reusable code entry by id.",
        inputSchema: {
          type: "object",
          properties: { id: { type: "string" } },
          required: ["id"]
        }
      },
      {
        name: "add_code_entry",
        description: "Add a reusable code, algorithm, schema, integration, or workflow entry to the persistent database.",
        inputSchema: {
          type: "object",
          properties: {
            entry: { type: "object" },
            allow_overwrite: { type: "boolean" }
          }
        }
      },
      {
        name: "update_code_entry",
        description: "Patch metadata on an existing code entry.",
        inputSchema: {
          type: "object",
          properties: {
            id: { type: "string" },
            patch: { type: "object" }
          },
          required: ["id", "patch"]
        }
      },
      {
        name: "record_validation",
        description: "Append validation evidence and optionally update status or trust level.",
        inputSchema: {
          type: "object",
          properties: {
            id: { type: "string" },
            result: { type: "string" },
            notes: { type: "string" },
            evidence: { type: "array", items: { type: "string" } },
            status: { type: "string" },
            trust_level: { type: "string" }
          },
          required: ["id", "result"]
        }
      },
      {
        name: "list_tags",
        description: "List all tags currently used in the code collective.",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "list_sources",
        description: "List source repositories/projects represented in the code collective.",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "export_code_library",
        description: "Return the full persistent code library database.",
        inputSchema: { type: "object", properties: {} }
      }
    ]
  };
}

async function callTool(name: string, args: Record<string, unknown>) {
  let result: unknown;
  if (name === "search_code") result = await searchCode(args);
  else if (name === "get_code_entry") result = await getCodeEntry(args);
  else if (name === "add_code_entry") result = await addCodeEntry(args);
  else if (name === "update_code_entry") result = await updateCodeEntry(args);
  else if (name === "record_validation") result = await recordValidation(args);
  else if (name === "list_tags") result = await listTags();
  else if (name === "list_sources") result = await listSources();
  else if (name === "export_code_library") result = await exportCodeLibrary();
  else throw new Error(`Unknown tool: ${name}`);

  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
}

async function listResources() {
  const db = await loadDb();
  return {
    resources: [
      {
        uri: "code-collective://db",
        name: "Code Collective Database",
        description: db.purpose,
        mimeType: "application/json"
      },
      ...db.entries.map((entry) => ({
        uri: `code-collective://entries/${entry.id}`,
        name: entry.title,
        description: `${entry.language || "unknown"} | ${entry.status} | ${entry.trust_level}`,
        mimeType: "application/json"
      }))
    ]
  };
}

async function readResource(uri: string) {
  if (uri === "code-collective://db") {
    return { contents: [{ uri, mimeType: "application/json", text: JSON.stringify(await loadDb(), null, 2) }] };
  }

  const prefix = "code-collective://entries/";
  if (uri.startsWith(prefix)) {
    const id = uri.slice(prefix.length);
    const entry = await getCodeEntry({ id });
    return { contents: [{ uri, mimeType: "application/json", text: JSON.stringify(entry, null, 2) }] };
  }

  throw new Error(`Unknown resource: ${uri}`);
}

async function handle(request: JsonRpcRequest): Promise<unknown> {
  const params = request.params ?? {};
  switch (request.method) {
    case "initialize":
      return {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {}, resources: {} },
        serverInfo: { name: "code-collective-mcp", version: "0.1.0" }
      };
    case "tools/list":
      return toolDefinitions();
    case "tools/call":
      return callTool(String(params.name), (params.arguments as Record<string, unknown>) ?? {});
    case "resources/list":
      return listResources();
    case "resources/read":
      return readResource(String(params.uri));
    case "notifications/initialized":
      return undefined;
    case "ping":
      return {};
    default:
      throw new Error(`Unsupported method: ${request.method}`);
  }
}

function makeResponse(id: JsonRpcRequest["id"], result: unknown, error?: { code: number; message: string }) {
  return error ? { jsonrpc: "2.0", id, error } : { jsonrpc: "2.0", id, result };
}

function sendStdout(id: JsonRpcRequest["id"], result: unknown, error?: { code: number; message: string }) {
  if (id === undefined) return;
  process.stdout.write(`${JSON.stringify(makeResponse(id, result, error))}\n`);
}

function startStdio() {
  let buffer = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (chunk) => {
    buffer += chunk;
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.trim()) continue;
      void (async () => {
        let request: JsonRpcRequest | null = null;
        try {
          request = JSON.parse(line) as JsonRpcRequest;
          const result = await handle(request);
          sendStdout(request.id, result);
        } catch (error) {
          sendStdout(request?.id ?? null, null, {
            code: -32000,
            message: error instanceof Error ? error.message : String(error)
          });
        }
      })();
    }
  });
}

function readBody(req: Parameters<typeof createServer>[0] extends (req: infer R, res: unknown) => unknown ? R : never): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 10_000_000) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function startHttp() {
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Headers", "content-type");
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");

      if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
      }

      if (req.method === "GET" && url.pathname === "/health") {
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ ok: true, name: "code-collective-mcp", dbPath }));
        return;
      }

      if (req.method === "GET" && url.pathname === "/export") {
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(await loadDb(), null, 2));
        return;
      }

      if (req.method === "POST" && url.pathname === "/mcp") {
        const body = await readBody(req);
        const request = JSON.parse(body || "{}");
        const result = await handle(request);
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(makeResponse(request.id, result)));
        return;
      }

      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "not found" }));
    } catch (error) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }));
    }
  });

  server.listen(port, () => {
    process.stderr.write(`code-collective-mcp listening on http://localhost:${port}\n`);
  });
}

const mode = process.argv[2] || "stdio";
if (mode === "http") startHttp();
else startStdio();
