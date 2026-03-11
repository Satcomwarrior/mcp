## 2026-02-23 - Regex Compilation Optimization
**Learning:** Extracting regex literals to module-level constants in `src/utils/eth.ts` significantly improved performance for simple validation checks (`isValidEthAddress` improved by ~50%, 39ms -> 20ms for 100k iterations). However, complex matching regexes (`parseTradingPair`) showed negligible performance improvement, likely due to execution cost dominating compilation cost or internal caching mechanisms.
**Action:** Prioritize extracting simple validation regexes used in high-frequency paths (like `test()` calls). Always benchmark to confirm impact, as complexity of the regex and usage pattern (test vs match) affects the optimization gain.

## 2026-02-23 - Intl.NumberFormat Instantiation Optimization
**Learning:** Instantiating `new Intl.NumberFormat()` is an exceptionally expensive operation in V8. Repeated instantiation within formatting loops (like `formatPrice`) causes significant performance bottlenecks (~6000ms for 100k iterations).
**Action:** Always cache and reuse `Intl.NumberFormat` instances via a module-level `Map` (keyed by locale/currency/options) instead of creating them per-call. This simple caching strategy provides a ~40-60x speedup (~150ms for 100k iterations).
