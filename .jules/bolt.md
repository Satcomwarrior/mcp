## 2026-02-23 - Regex Compilation Optimization
**Learning:** Extracting regex literals to module-level constants in `src/utils/eth.ts` significantly improved performance for simple validation checks (`isValidEthAddress` improved by ~50%, 39ms -> 20ms for 100k iterations). However, complex matching regexes (`parseTradingPair`) showed negligible performance improvement, likely due to execution cost dominating compilation cost or internal caching mechanisms.
**Action:** Prioritize extracting simple validation regexes used in high-frequency paths (like `test()` calls). Always benchmark to confirm impact, as complexity of the regex and usage pattern (test vs match) affects the optimization gain.

## 2026-03-07 - Combined Regex Pattern Optimization
**Learning:** Combining multiple regex patterns into a single `RegExp` using alternation (`|`) and non-capturing groups (`(?:)`) reduced execution time by ~27% in `src/tools/trading.ts` (1596ms -> 1156ms for 200 iterations over 100k chars). The improvement comes from scanning the large string once per combined regex instead of multiple times for each individual pattern.
**Action:** When extracting multiple data points from the same large text block, prefer combining regex patterns into a single pass where possible, especially if the text is large and patterns are disjoint or order-independent.
