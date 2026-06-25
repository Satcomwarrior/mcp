# Repository Ownership Map

This file exists to stop repository sprawl.

Default rule: do not create a new repository when an existing repository already owns the domain. Add code to the canonical repository, extract reusable code into Code Collective, or open an issue documenting why a new repository is actually justified.

## Canonical repositories

| Domain | Canonical repository | Rule |
|---|---|---|
| Reusable code, algorithms, snippets, schemas, reusable command recipes, MCP-accessible code memory | `Satcomwarrior/mcp` under `code-collective/` | Add reusable assets here. Do not create separate code-library, snippet-db, or algorithm-vault repos. |
| Print-on-demand / merch storefront | `Satcomwarrior/mudd-monkies-store` | Storefront code, product browsing, cart, checkout, fulfillment hooks, deploy config, and store UI go here. |
| Legacy Semper High POD backend work | `Satcomwarrior/semper-high-backend` | Source material only. Extract useful patterns into Code Collective or integrate them into the storefront. |
| Mudd Monkies stock/assets | `Satcomwarrior/shop-stock-mudd-monkies` | Asset/source reference. Do not use as the live storefront. |
| Construction PDF takeoff tool | `Satcomwarrior/Mudd-monkies` | Separate product. Do not mix with merch storefront. |
| Evidence discovery / unclear Muddm work | `Satcomwarrior/Muddm` | Review before use. Do not add storefront or Code Collective work here. |
| Browser automation MCP | `Satcomwarrior/mcp` root project | Existing MCP root. Code Collective lives as a separate subproject under `code-collective/`. |
| Mobile automation MCP | `Satcomwarrior/mobile-mcp` | Separate product. Keep phone/mobile automation here. |
| Playwright/Python MCP experiments | `Satcomwarrior/playwright-plus-python-mcp` | Review/source material. Extract useful reusable patterns into Code Collective. |

## New repository gate

Before creating any new repository, answer all of these:

1. Which existing canonical repository is closest?
2. Why can the work not be a branch, folder, package, app, or service inside that repository?
3. Does the code belong in Code Collective as reusable library material instead?
4. Is this a separate deployable product or just an LLM convenience dump?
5. What existing repository becomes deprecated if the new repository is approved?

If the answer is not clear, do not create a new repository.

## Consolidation rules

- Useful snippets, algorithms, provider wrappers, schemas, commands, and repeatable workflows go into `Satcomwarrior/mcp/code-collective`.
- App-specific implementation stays in the app repository.
- Legacy repos are source material until useful code is extracted.
- A repo being easier for an LLM to dump into is not a valid reason to create it.
- Do not put private credentials or account access material in the reusable code database.
- Code is not marked `tested` until it has actually run.
- Code is not marked `production` until it is actively deployed and working.

## Current consolidation decisions

- `mudd-monkies-store` remains the canonical storefront.
- `semper-high-backend` remains source material only after useful POD workflow patterns were captured in Code Collective.
- Code Collective is not a storefront subfolder anymore. It belongs under `Satcomwarrior/mcp/code-collective`.
- Future LLM/tool work should check this file before creating or suggesting a new repository.
