## 2026-02-23 - Regex Compilation Optimization
**Learning:** Extracting regex literals to module-level constants in `src/utils/eth.ts` significantly improved performance for simple validation checks (`isValidEthAddress` improved by ~50%, 39ms -> 20ms for 100k iterations). However, complex matching regexes (`parseTradingPair`) showed negligible performance improvement, likely due to execution cost dominating compilation cost or internal caching mechanisms.
**Action:** Prioritize extracting simple validation regexes used in high-frequency paths (like `test()` calls). Always benchmark to confirm impact, as complexity of the regex and usage pattern (test vs match) affects the optimization gain.

## 2026-04-27 - Intl.NumberFormat Instantiation Bottleneck
**Learning:** Instantiating `Intl.NumberFormat` repeatedly inside formatting functions like `formatPrice` is a massive performance bottleneck. In local benchmarks, creating 100k instances took ~20 seconds.
**Action:** Always cache `Intl.NumberFormat` instances in a module-level `Map` keyed by configuration options (e.g., currency, decimals). This simple optimization yields up to a ~58x speedup by avoiding expensive native object creation on every call.
