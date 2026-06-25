# Code Collective MCP

A standalone MCP-accessible reusable code and algorithm library.

This project was started from storefront consolidation work, but it is intentionally separate from any one storefront, legal project, phone-agent project, or automation repo. Its job is to become the shared place where useful code, algorithms, integration patterns, schemas, prompts, command recipes, and validation notes are collected once and reused later.

## Purpose

Stop rebuilding the same code repeatedly.

Every useful code asset should be captured with enough metadata to know:

- where it came from
- whether it was copied, adapted, generated, or only referenced
- what problem it solves
- what dependencies it needs
- whether it has been tested
- what risks or limitations are known
- how to reuse it safely

## Current storage model

The first version uses a file-backed JSON database:

- `library/db.json` is the persistent database.
- MCP tools can search, read, add, update, and validate entries.
- No secrets belong in this database.

This keeps the library portable. It can later be migrated to SQLite, Postgres, Chroma, LanceDB, or another indexed store without changing the entry schema.

## MCP tools

- `search_code`: search entries by query, tags, language, status, or trust level.
- `get_code_entry`: fetch one full entry by id.
- `add_code_entry`: add a new reusable code record.
- `update_code_entry`: patch metadata on an existing entry.
- `record_validation`: append validation results and optionally promote trust/status.
- `list_tags`: list all known tags.
- `list_sources`: list known source repositories/projects.
- `export_code_library`: return the full database.

## Entry status values

- `candidate`: useful but not tested.
- `adapted`: reviewed and modified for a target project.
- `tested`: verified in a controlled environment.
- `production`: actively used in production.
- `deprecated`: no longer recommended.

## Trust levels

- `unknown`
- `reviewed-not-tested`
- `runs-locally`
- `ci-validated`
- `production-proven`

## Local use

```bash
cd code-collective
npm install
npm run build
npm run start:stdio
```

MCP client config:

```json
{
  "mcpServers": {
    "code-collective": {
      "command": "node",
      "args": ["/absolute/path/to/code-collective/dist/index.js", "stdio"]
    }
  }
}
```

## HTTP mode

```bash
npm run start:http
```

Default port: `8790`.

Health check:

```bash
curl http://localhost:8790/health
```

JSON-RPC endpoint:

```bash
curl -X POST http://localhost:8790/mcp \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

## Rules

1. Never store live credentials, API keys, private customer data, passwords, recovery phrases, or access tokens.
2. Do not mark code as `tested` unless it has actually been run.
3. Do not mark code as `production` unless it is actively deployed and working.
4. Record source and provenance every time.
5. Keep reusable logic here; keep app-specific implementation inside the target app repo.
