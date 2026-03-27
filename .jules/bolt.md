## 2026-02-23 - Regex Compilation Optimization
**Learning:** Extracting regex literals to module-level constants in `src/utils/eth.ts` significantly improved performance for simple validation checks (`isValidEthAddress` improved by ~50%, 39ms -> 20ms for 100k iterations). However, complex matching regexes (`parseTradingPair`) showed negligible performance improvement, likely due to execution cost dominating compilation cost or internal caching mechanisms.
**Action:** Prioritize extracting simple validation regexes used in high-frequency paths (like `test()` calls). Always benchmark to confirm impact, as complexity of the regex and usage pattern (test vs match) affects the optimization gain.

## 2026-03-26 - Snapshot Text Extraction Optimization
**Learning:** Extracting text from `ToolResult` snapshots using chained array methods (`.filter().map().join('\n')`) creates unnecessary intermediate allocations. Replacing this with a single-pass `for` loop that avoids these allocations yields up to a ~3.5x speedup, making a significant difference in tools that frequently parse large snapshots.
**Action:** Use the centralized, optimized `getSnapshotText` utility from `src/utils/aria-snapshot.ts` for all snapshot text extraction instead of manually filtering and mapping arrays. Always consider single-pass loops over chained array methods for critical path string building.
