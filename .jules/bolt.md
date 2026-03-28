## 2026-02-23 - Regex Compilation Optimization
**Learning:** Extracting regex literals to module-level constants in `src/utils/eth.ts` significantly improved performance for simple validation checks (`isValidEthAddress` improved by ~50%, 39ms -> 20ms for 100k iterations). However, complex matching regexes (`parseTradingPair`) showed negligible performance improvement, likely due to execution cost dominating compilation cost or internal caching mechanisms.
**Action:** Prioritize extracting simple validation regexes used in high-frequency paths (like `test()` calls). Always benchmark to confirm impact, as complexity of the regex and usage pattern (test vs match) affects the optimization gain.

## 2026-02-24 - Keyword Search Optimization with RegExp
**Learning:** Replacing `Array.some` keyword search loops (especially those containing repeated `.toLowerCase()` calls) with a module-level pre-compiled case-insensitive `RegExp` yields up to a ~3-4x performance speedup by avoiding object instantiation and repeated string allocation overhead.
**Action:** Always prefer pre-compiled `RegExp` objects over iterating through string arrays for finding substring matches in strings, particularly when checking line-by-line in a loop.
