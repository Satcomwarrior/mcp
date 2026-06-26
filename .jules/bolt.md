## 2026-02-23 - Regex Compilation Optimization
**Learning:** Extracting regex literals to module-level constants in `src/utils/eth.ts` significantly improved performance for simple validation checks (`isValidEthAddress` improved by ~50%, 39ms -> 20ms for 100k iterations). However, complex matching regexes (`parseTradingPair`) showed negligible performance improvement, likely due to execution cost dominating compilation cost or internal caching mechanisms.
**Action:** Prioritize extracting simple validation regexes used in high-frequency paths (like `test()` calls). Always benchmark to confirm impact, as complexity of the regex and usage pattern (test vs match) affects the optimization gain.
## 2026-02-23 - Intl.NumberFormat Caching
**Learning:** Instantiating `Intl.NumberFormat` repeatedly in a loop is a massive performance bottleneck. In this codebase's `src/utils/trading.ts` utility, formatting 10,000 prices dropped from ~4166ms to ~60ms (~69x speedup) simply by caching the formatter instance using a `Map` keyed by the currency and decimal configuration.
**Action:** Always look for internal JavaScript globalization or formatting objects (like `Intl.NumberFormat`, `Intl.DateTimeFormat`) being created inside functions that are called frequently or in loops. Cache them aggressively using appropriate unique keys.

## 2024-05-24 - Do not commit dummy test data files
**Learning:** Even when instructed to "measure" the impact of an optimization, creating and committing multi-megabyte mock data files (like a 5.5MB `large_snapshot.txt`) and ad-hoc benchmarking `.cjs` scripts bloats the Git history and pollutes the repository.
**Action:** Always delete temporary dummy files, test data dumps, and ad-hoc benchmark scripts (`rm test_*.cjs large_*.txt`) before requesting a code review or submitting a PR.
