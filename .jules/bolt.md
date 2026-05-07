## 2026-02-23 - Regex Compilation Optimization
**Learning:** Extracting regex literals to module-level constants in `src/utils/eth.ts` significantly improved performance for simple validation checks (`isValidEthAddress` improved by ~50%, 39ms -> 20ms for 100k iterations). However, complex matching regexes (`parseTradingPair`) showed negligible performance improvement, likely due to execution cost dominating compilation cost or internal caching mechanisms.
**Action:** Prioritize extracting simple validation regexes used in high-frequency paths (like `test()` calls). Always benchmark to confirm impact, as complexity of the regex and usage pattern (test vs match) affects the optimization gain.
## 2026-02-24 - Intl.NumberFormat Caching Optimization
**Learning:** Instantiating `Intl.NumberFormat` on every call is a significant performance bottleneck (e.g., in `formatPrice`). Caching instances by their configuration keys yields a ~28x speedup (from ~1100ms down to ~39ms for 10k iterations).
**Action:** Always cache `Intl.NumberFormat` instances in a module-level `Map` when formatting is done in loops or high-frequency utility functions.
