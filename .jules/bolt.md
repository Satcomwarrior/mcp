## 2026-02-23 - Regex Compilation Optimization
**Learning:** Extracting regex literals to module-level constants in `src/utils/eth.ts` significantly improved performance for simple validation checks (`isValidEthAddress` improved by ~50%, 39ms -> 20ms for 100k iterations). However, complex matching regexes (`parseTradingPair`) showed negligible performance improvement, likely due to execution cost dominating compilation cost or internal caching mechanisms.
**Action:** Prioritize extracting simple validation regexes used in high-frequency paths (like `test()` calls). Always benchmark to confirm impact, as complexity of the regex and usage pattern (test vs match) affects the optimization gain.

## 2024-04-12 - Intl.NumberFormat Caching
**Learning:** Instantiating `Intl.NumberFormat` repeatedly in a hot path like `formatPrice` is a significant performance bottleneck.
**Action:** Always cache `Intl.NumberFormat` instances using a `Map` keyed by configuration options (currency and decimal places) to avoid redundant allocation overhead.
