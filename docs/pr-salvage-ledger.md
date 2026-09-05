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

## Cleanup rule

A closed PR may be deleted as a branch only after either:

- its meaningful behavior/data is demonstrably present on `main`, or
- any unique useful residue is captured in this ledger (or a newer tracking artifact) with enough detail to reconstruct it safely.

Do not equate "closed" with "worthless" or "fully superseded" without checking changed files and current-main behavior.