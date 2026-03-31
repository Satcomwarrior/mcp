## 2026-02-23 - Regex Compilation Optimization
**Learning:** Extracting regex literals to module-level constants in `src/utils/eth.ts` significantly improved performance for simple validation checks (`isValidEthAddress` improved by ~50%, 39ms -> 20ms for 100k iterations). However, complex matching regexes (`parseTradingPair`) showed negligible performance improvement, likely due to execution cost dominating compilation cost or internal caching mechanisms.
**Action:** Prioritize extracting simple validation regexes used in high-frequency paths (like `test()` calls). Always benchmark to confirm impact, as complexity of the regex and usage pattern (test vs match) affects the optimization gain.

## 2026-03-31 - Snapshot String Concatenation Optimization
**Learning:** Extracting text from `ToolResult` snapshot arrays using chained `.filter().map().join('\n')` creates multiple intermediate array allocations which adds significant garbage collection pressure when called repeatedly.
**Action:** Replace functional array chaining with a single-pass `for` loop and direct string concatenation (`+=`) in performance-critical paths. This pattern provides a consistent ~3x - 4x speedup with lower memory footprint.
