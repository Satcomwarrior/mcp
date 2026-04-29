## 2026-02-23 - Regex Compilation Optimization
**Learning:** Extracting regex literals to module-level constants in `src/utils/eth.ts` significantly improved performance for simple validation checks (`isValidEthAddress` improved by ~50%, 39ms -> 20ms for 100k iterations). However, complex matching regexes (`parseTradingPair`) showed negligible performance improvement, likely due to execution cost dominating compilation cost or internal caching mechanisms.
**Action:** Prioritize extracting simple validation regexes used in high-frequency paths (like `test()` calls). Always benchmark to confirm impact, as complexity of the regex and usage pattern (test vs match) affects the optimization gain.

## 2026-04-29 - Array.some and repeated toLowerCase overhead
**Learning:** In hot loops parsing text (e.g., `snapshotText.split("\n")`), combining `Array.some()` with `.toLowerCase()` on both the test string and array elements causes massive redundant string allocations and slows execution significantly (~3x slower than a regex).
**Action:** Replace arrays of keywords and `Array.some()` loops with pre-compiled, case-insensitive regular expressions (e.g., `const REGEX = /kw1|kw2/i;`) inside high-frequency string iteration paths.
