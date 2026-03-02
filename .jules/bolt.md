## 2026-02-23 - Regex Compilation Optimization
**Learning:** Extracting regex literals to module-level constants in `src/utils/eth.ts` significantly improved performance for simple validation checks (`isValidEthAddress` improved by ~50%, 39ms -> 20ms for 100k iterations). However, complex matching regexes (`parseTradingPair`) showed negligible performance improvement, likely due to execution cost dominating compilation cost or internal caching mechanisms.
**Action:** Prioritize extracting simple validation regexes used in high-frequency paths (like `test()` calls). Always benchmark to confirm impact, as complexity of the regex and usage pattern (test vs match) affects the optimization gain.

## 2026-03-05 - Optimized Regex Extraction
**Learning:** Using `String.prototype.match()` with a global regex on large text blocks forces full-string scanning, regardless of how few matches are actually needed (e.g. `matches.slice(0, 3)`). Implementing a custom extraction loop with `RegExp.exec()` that breaks after reaching the needed limit provides a massive performance boost (observed up to 15x faster for 3 matches in 100 repeats of text blocks).
**Action:** When only a subset of matches is required from large datasets, always prefer an `exec()` loop with a limit or a pre-filtering approach over global `.match()`. Use `extractMatches` utility.
