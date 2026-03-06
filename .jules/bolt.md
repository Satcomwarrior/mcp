## 2026-02-23 - Regex Compilation Optimization
**Learning:** Extracting regex literals to module-level constants in `src/utils/eth.ts` significantly improved performance for simple validation checks (`isValidEthAddress` improved by ~50%, 39ms -> 20ms for 100k iterations). However, complex matching regexes (`parseTradingPair`) showed negligible performance improvement, likely due to execution cost dominating compilation cost or internal caching mechanisms.
**Action:** Prioritize extracting simple validation regexes used in high-frequency paths (like `test()` calls). Always benchmark to confirm impact, as complexity of the regex and usage pattern (test vs match) affects the optimization gain.

## 2026-03-05 - Array.some() vs Pre-compiled RegExp.test()
**Learning:** In text parsing where you're checking lines against a list of keywords, converting an `Array.some()` loop combined with `String.toLowerCase()` (which causes allocations) into a single pre-compiled case-insensitive Regular Expression check using `RegExp.test()` offers ~4x performance gain, specifically reducing text scanning overhead.
**Action:** Default to using regex `/(?:word1|word2)/i.test(string)` rather than `["word1", "word2"].some(w => string.toLowerCase().includes(w))` when checking for multiple keywords on potentially long strings or frequent iterations.
