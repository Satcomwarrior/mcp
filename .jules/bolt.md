## 2026-02-23 - Regex Compilation Optimization
**Learning:** Extracting regex literals to module-level constants in `src/utils/eth.ts` significantly improved performance for simple validation checks (`isValidEthAddress` improved by ~50%, 39ms -> 20ms for 100k iterations). However, complex matching regexes (`parseTradingPair`) showed negligible performance improvement, likely due to execution cost dominating compilation cost or internal caching mechanisms.
**Action:** Prioritize extracting simple validation regexes used in high-frequency paths (like `test()` calls). Always benchmark to confirm impact, as complexity of the regex and usage pattern (test vs match) affects the optimization gain.

## 2023-10-25 - Intl.NumberFormat Caching Optimization
**Learning:** Instantiating `Intl.NumberFormat` repeatedly inside functions like `formatPrice` is a significant performance bottleneck (e.g., ~65x slower, 25917ms vs 393ms for 100k iterations).
**Action:** Always cache `Intl.NumberFormat` instances using a Map keyed by configuration options (currency, max decimals) to achieve substantial speed improvements, while being careful to preserve existing error handling behaviors (e.g., throwing RangeError for invalid currency codes).
