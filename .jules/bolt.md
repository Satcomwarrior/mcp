## 2026-02-23 - Regex Compilation Optimization
**Learning:** Extracting regex literals to module-level constants in `src/utils/eth.ts` significantly improved performance for simple validation checks (`isValidEthAddress` improved by ~50%, 39ms -> 20ms for 100k iterations). However, complex matching regexes (`parseTradingPair`) showed negligible performance improvement, likely due to execution cost dominating compilation cost or internal caching mechanisms.
**Action:** Prioritize extracting simple validation regexes used in high-frequency paths (like `test()` calls). Always benchmark to confirm impact, as complexity of the regex and usage pattern (test vs match) affects the optimization gain.
## 2026-02-23 - Intl.NumberFormat Caching
**Learning:** Instantiating `Intl.NumberFormat` repeatedly in a loop is a massive performance bottleneck. In this codebase's `src/utils/trading.ts` utility, formatting 10,000 prices dropped from ~4166ms to ~60ms (~69x speedup) simply by caching the formatter instance using a `Map` keyed by the currency and decimal configuration.
**Action:** Always look for internal JavaScript globalization or formatting objects (like `Intl.NumberFormat`, `Intl.DateTimeFormat`) being created inside functions that are called frequently or in loops. Cache them aggressively using appropriate unique keys.

## 2024-10-22 - Lazy regex deduplication for Aria snapshots
**Learning:** Aria snapshots (e.g., `snapshotText`) produce exceptionally large text buffers. Using eager regex evaluation `String.prototype.match(/g/)` followed by whole-array deduplication and slicing causes transient memory allocations and CPU waste when only a subset of matches is needed.
**Action:** Use lazy iterators like `matchAll()` combined with a `Set` to track unique values and break early when the Set's size reaches the desired limit.
