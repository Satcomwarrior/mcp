## 2026-02-23 - Regex Compilation Optimization
**Learning:** Extracting regex literals to module-level constants in `src/utils/eth.ts` significantly improved performance for simple validation checks (`isValidEthAddress` improved by ~50%, 39ms -> 20ms for 100k iterations). However, complex matching regexes (`parseTradingPair`) showed negligible performance improvement, likely due to execution cost dominating compilation cost or internal caching mechanisms.
**Action:** Prioritize extracting simple validation regexes used in high-frequency paths (like `test()` calls). Always benchmark to confirm impact, as complexity of the regex and usage pattern (test vs match) affects the optimization gain.

## 2026-03-01 - Avoid Array Allocation during Snapshot Parsing
**Learning:** Extracting ARIA snapshot text using chained `.filter().map().join('\n')` creates multiple intermediate arrays, severely degrading performance in hot paths like trading analysis. Refactoring to a centralized `getSnapshotText` utility using a single `for...of` loop with string concatenation (`+=`) reduces memory allocations and delivers a ~3x execution speedup.
**Action:** Always favor a single-pass loop over chained array methods when reducing generic structured data (`ToolResult.content`) into a single string to avoid unbounded heap growth and unnecessary garbage collection overhead.
