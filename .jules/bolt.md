## 2026-02-23 - Regex Compilation Optimization
**Learning:** Extracting regex literals to module-level constants in `src/utils/eth.ts` significantly improved performance for simple validation checks (`isValidEthAddress` improved by ~50%, 39ms -> 20ms for 100k iterations). However, complex matching regexes (`parseTradingPair`) showed negligible performance improvement, likely due to execution cost dominating compilation cost or internal caching mechanisms.
**Action:** Prioritize extracting simple validation regexes used in high-frequency paths (like `test()` calls). Always benchmark to confirm impact, as complexity of the regex and usage pattern (test vs match) affects the optimization gain.

## 2024-05-15 - Array Allocation Optimization
**Learning:** Chained array methods (`.filter().map().join()`) create significant overhead due to intermediate memory allocations. In `getSnapshotText`, a single-pass `for` loop with string concatenation (`+=`) avoided these allocations, resulting in a ~4.5x performance speedup.
**Action:** Always use the centralized `getSnapshotText` utility from `src/utils/aria-snapshot.ts` to extract text from `ToolResult` snapshots to minimize object instantiation and overhead.
