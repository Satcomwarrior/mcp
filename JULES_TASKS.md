# Jules Task Templates

Use these labels and commands to trigger Jules automations.

## Workflow Labels

| Label | Trigger | What Jules Does |
|---|---|---|
| `bug` | Issue labeled `bug` | Diagnoses root cause, implements fix, adds regression test |
| `jules-hold` | Manual only | Do NOT auto-trigger — requires manual review |

## What Automations Are Active

### 1. Bugfixing (`jules-bugfix.yml`)
Label an issue `bug` and Jules will:
- Analyze the issue title and body
- Trace the root cause through the codebase
- Implement a targeted fix
- Add regression tests
- Open a pull request

### 2. Weekly Cleanup (`jules-cleanup.yml`)
Runs every Monday at 11 PM PDT. Jules will:
- Remove dead code, unused imports, and commented-out blocks
- Identify and refactor duplicated code
- Improve naming clarity
- Clean up stale comments
- Only opens PRs with real improvements

### 3. Script Hardening (`jules-harden.yml`)
Runs every Monday at 9 PM PDT. Jules will:
- Add timeouts and retries to network calls
- Add input validation with clear error messages
- Handle edge cases (empty files, missing dirs, null values)
- Add structured logging
- Replace unsafe defaults with safe fallbacks
- Fix race conditions in async operations
- Add exponential backoff retry logic

### 4. CI Failure Auto-Fix (`jules-ci-fix.yml`)
Triggers automatically when CI fails. Jules will:
- Download and analyze the failure logs
- Identify root cause
- Implement a fix
- Open a PR that makes CI pass

## Direct API Usage

```bash
curl -X POST https://jules.googleapis.com/v1alpha/sessions \
  -H "Content-Type: application/json" \
  -H "X-Goog-Api-Key: $JULES_API_KEY" \
  -d '{
    "title": "Harden browser-agent.js",
    "prompt": "Improve reliability without changing the browser control interface.",
    "sourceContext": {
      "source": "sources/github/Satcomwarrior/mcp",
      "githubRepoContext": {"startingBranch": "main"}
    },
    "automationMode": "AUTO_CREATE_PR"
  }'
```

## Jules API Key Secret

The key is stored as `JULES_API_KEY` in repo secrets.
Do NOT commit the raw key anywhere.
