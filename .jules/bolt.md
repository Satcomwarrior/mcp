## 2026-02-23 - Regex Compilation Optimization
**Learning:** Extracting regex literals to module-level constants in `src/utils/eth.ts` significantly improved performance for simple validation checks (`isValidEthAddress` improved by ~50%, 39ms -> 20ms for 100k iterations). However, complex matching regexes (`parseTradingPair`) showed negligible performance improvement, likely due to execution cost dominating compilation cost or internal caching mechanisms.
**Action:** Prioritize extracting simple validation regexes used in high-frequency paths (like `test()` calls). Always benchmark to confirm impact, as complexity of the regex and usage pattern (test vs match) affects the optimization gain.

## $(date +%Y-%m-%d) - Array.some Keyword Matching Optimization
**Learning:** Replaced an `Array.some` loop that continuously invoked `.toLowerCase()` on snapshot lines and keywords with a module-level pre-compiled `RegExp.test()` using pipe alternations (e.g., `/balance|equity/i`). This pattern avoids massive object instantiation and string allocation overhead in hot text-processing loops, yielding roughly ~3-4x speedup.
**Action:** When searching large blocks of text line-by-line for static keyword sets, always pre-compile the keywords into a single case-insensitive RegExp instead of using array iteration.
