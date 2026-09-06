# PR Salvage Ledger

This file records useful work discovered while closing stale or duplicate pull requests so branch cleanup does not erase ideas that are not yet fully represented on `main`.

## ETH balance bounded extraction residue

### Source PRs

The broader `getEthBalance` optimization idea appears in several stale variants, including:

- #343
- #348
- #351
- #330

Related regex-only variants and the bounded-regex consolidation include #332 and #364.

### What is already preserved on `main`

`src/utils/bounded-regex.ts` provides `takeRegexMatches()`, which clones a regular expression with the global flag when necessary, lazily iterates with `matchAll()`, and stops after a requested limit. `src/tools/eth.ts` uses it for USD extraction, ETH pair price/volume/change, DeFi APY/liquidity/staking, and transaction-status-style bounded searches.

PR #364 explicitly left the intentionally broader balance/token collection unchanged, so the source PRs above must not be described as fully superseded in that specific respect.

### What is not yet fully preserved

The primary `getEthBalance` `balancePatterns` loop on `main` still uses `snapshotText.match(pattern)`. That eagerly evaluates all matches before later Set deduplication and the final 10-item limit.

Several closed PRs attempted to make this path lazy by collecting matches directly into a Set and breaking once the Set reached 10. The performance idea is useful, but those implementations must not be restored verbatim because early stopping can change observable output when early matches are duplicates or when later patterns would contribute additional unique values.

### Safe recovery contract

Any replacement should be rebuilt from current `main` and must:

1. Characterize existing `getEthBalance` behavior before changing production code.
2. Preserve first-occurrence ordering of unique balance strings across balance patterns.
3. Preserve the final maximum of 10 unique balances.
4. Avoid stopping early in a way that loses later unique values because earlier matches were duplicates.
5. Preserve `includeTokens` behavior and ETH exclusion from ERC-20 token results.
6. Avoid mutating caller `RegExp` instances.
7. Add focused regression tests and pass the repository `Test` workflow before merge.

### File audit

Representative closed PRs #351, #330, and #332 were checked during cleanup. Their changed files were limited to `src/tools/eth.ts` plus `.jules/bolt.md`; they did not contain a separate dataset or unrelated production file.

The old `.jules/bolt.md` variants contained the general lesson that eager global `match()` can waste work when callers immediately cap results. That lesson is preserved here in a safer form. The old blanket prescription to break when a Set reaches the cap is intentionally not copied verbatim because it can change output semantics.

## Navigation-security duplicate family

The closed Sentinel URL-validation PR family is represented on `main` by the stricter #363 implementation. `src/tools/common.ts` sends the normalized URL returned by the shared navigation validator to the browser, rather than forwarding the raw input. This retains the important normalization/TOCTOU concern raised by several stale variants while using an HTTP(S)-only positive allowlist.

## Repository and automation audit — 2026-09-06

### Open-PR flood

At the audit snapshot the repository had 301 open pull requests. GitHub search grouped 145 open titles under the Sentinel family and 146 under the Bolt family. Those labels cover most of the backlog, but they must still be dispositioned by behavior rather than closed from title alone.

Current `main` already contains the major recurring security and performance themes repeatedly proposed by those families, including loopback-only WebSocket/port binding, shell-free process termination via `execFileSync`/`process.kill`, HTTP(S)-only normalized navigation, cached `Intl.NumberFormat`, bounded regex helpers, and the `parseVolume` hot-path cleanup.

The primary unsuperseded performance residue remains the `getEthBalance` balance-pattern loop documented above. Do not bulk-close the Bolt family until every materially different patch has either been proven present or captured here.

### Repository backup

PR #369 introduced a scheduled and push-triggered all-refs repository backup. The workflow fetches all remote branches and tags, creates and verifies a `git bundle --all`, writes SHA-256 checksums and a manifest, and retains the Actions artifact for 90 days. The first completed bundle was inspected and contained the protected recovery refs for #330, #343, #348, and #351. An independent copy was also placed outside GitHub.

### CI auto-fix provenance

The prior Jules CI auto-fix step compared `workflow_run.head_branch` against the username `Satcomwarrior`. That confused a branch name with repository/user provenance and prevented normal failing branches from invoking the fixer. PR #370 replaces that check with a same-repository provenance gate and adds per-branch concurrency.

### Dead issue-triggered bugfix workflow

Repository Issues are disabled (`has_issues=false`), while `.github/workflows/jules-bugfix.yml` is triggered only by `issues: labeled`. In the current configuration that workflow cannot fire. Do not rely on it for automated bugfix dispatch. Resolve deliberately by either enabling repository Issues or redesigning the workflow around a supported trigger such as `workflow_dispatch`/`repository_dispatch` with explicit inputs and equivalent provenance controls.

### CI coverage

The dependency-free Test workflow previously syntax-checked only three selected TypeScript files. PR #370 expands syntax validation to every `src/**/*.ts` file while retaining the focused Node tests.

A true package install/typecheck/build gate is not yet enabled because this standalone repository is not independently installable: root `package.json` declares multiple `workspace:*` dev dependencies (`@r2r/messaging` and `@repo/*` packages), but this repository has no workspace manifest or those package directories. An install attempt fails at the workspace protocol before dependency resolution. The upstream BrowserMCP repository currently exposes the same package metadata, so this appears inherited rather than introduced by this fork.

Do not claim that repository-wide `tsc --noEmit` or `npm run build` is verified until one of these is done:

1. restore the required workspace packages and workspace manifest;
2. replace the workspace imports with standalone packages/local modules; or
3. move this package back into the complete monorepo and run CI there.

## Cleanup rule

A closed PR may be deleted as a branch only after either:

- its meaningful behavior/data is demonstrably present on `main`, or
- any unique useful residue is captured in this ledger (or a newer tracking artifact) with enough detail to reconstruct it safely.

Do not equate "closed" with "worthless" or "fully superseded" without checking changed files and current-main behavior.
