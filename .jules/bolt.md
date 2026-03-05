## 2026-02-23 - Regex Compilation Optimization
**Learning:** Extracting regex literals to module-level constants in `src/utils/eth.ts` significantly improved performance for simple validation checks (`isValidEthAddress` improved by ~50%, 39ms -> 20ms for 100k iterations). However, complex matching regexes (`parseTradingPair`) showed negligible performance improvement, likely due to execution cost dominating compilation cost or internal caching mechanisms.
**Action:** Prioritize extracting simple validation regexes used in high-frequency paths (like `test()` calls). Always benchmark to confirm impact, as complexity of the regex and usage pattern (test vs match) affects the optimization gain.

## 2026-03-05 - Intl.NumberFormat Instantiation Optimization
**Learning:** `Intl.NumberFormat` instantiation is surprisingly expensive. Creating a new instance on every call to `formatPrice` resulted in severe performance bottlenecks for high-frequency operations (e.g. 17.5s for 300k iterations).
**Action:** Always cache `Intl.NumberFormat` instances in a module-level `Map` keyed by target currency when repeatedly formatting numbers or currencies. This simple optimization reduces execution time dramatically (~75x improvement).
