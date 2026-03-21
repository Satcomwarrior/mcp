## 2026-02-23 - Regex Compilation Optimization
**Learning:** Extracting regex literals to module-level constants in `src/utils/eth.ts` significantly improved performance for simple validation checks (`isValidEthAddress` improved by ~50%, 39ms -> 20ms for 100k iterations). However, complex matching regexes (`parseTradingPair`) showed negligible performance improvement, likely due to execution cost dominating compilation cost or internal caching mechanisms.
**Action:** Prioritize extracting simple validation regexes used in high-frequency paths (like `test()` calls). Always benchmark to confirm impact, as complexity of the regex and usage pattern (test vs match) affects the optimization gain.

## 2026-03-22 - Intl.NumberFormat Instantiation Overhead
**Learning:** Instantiating `new Intl.NumberFormat()` is an exceptionally expensive operation in V8. Repeated instantiation inside loops (e.g., formatting many prices) can cause severe performance bottlenecks (~18.9s for 100k iterations).
**Action:** Always cache and reuse `Intl.NumberFormat` instances via a module-level `Map` when repeatedly formatting values. When doing so, implement a maximum cache size limit (e.g., `MAX_CACHE_SIZE = 100`) and an eviction strategy to prevent unbounded memory growth and potential memory leaks if flooded with untrusted or random currency codes.
