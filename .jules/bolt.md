## 2026-02-23 - Regex Compilation Optimization
**Learning:** Extracting regex literals to module-level constants in `src/utils/eth.ts` significantly improved performance for simple validation checks (`isValidEthAddress` improved by ~50%, 39ms -> 20ms for 100k iterations). However, complex matching regexes (`parseTradingPair`) showed negligible performance improvement, likely due to execution cost dominating compilation cost or internal caching mechanisms.
**Action:** Prioritize extracting simple validation regexes used in high-frequency paths (like `test()` calls). Always benchmark to confirm impact, as complexity of the regex and usage pattern (test vs match) affects the optimization gain.

## 2024-05-24 - Last character switch optimization
**Learning:** Replacing `Object.entries()` iteration and `.endsWith()` checks with a switch statement on the last character in `parseVolume` yields significant performance gains (~3.3x speedup).
**Action:** Avoid `Object.entries()` and string methods like `.endsWith()` in hot paths when a simple character lookup and switch statement can be used.
