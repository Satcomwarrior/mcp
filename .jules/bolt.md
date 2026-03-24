## 2026-03-24 - NumberFormat Instantiation Overhead
**Learning:** Instantiating `new Intl.NumberFormat()` is exceptionally expensive in V8. A high-frequency utility like `formatPrice` running 100k iterations takes ~25s vs ~0.4s when cached. However, unbounded caching of formatters keyed by string (like currency codes) can cause memory leaks if flooded with untrusted or random keys.
**Action:** Always cache `Intl.NumberFormat` or similar `Intl` API instances at the module level when used in loops or frequent API calls. Crucially, implement a maximum cache size limit (e.g., evicting oldest entries or an LRU cache) to bound memory growth.

## 2026-02-23 - Regex Compilation Optimization
**Learning:** Extracting regex literals to module-level constants in `src/utils/eth.ts` significantly improved performance for simple validation checks (`isValidEthAddress` improved by ~50%, 39ms -> 20ms for 100k iterations). However, complex matching regexes (`parseTradingPair`) showed negligible performance improvement, likely due to execution cost dominating compilation cost or internal caching mechanisms.
**Action:** Prioritize extracting simple validation regexes used in high-frequency paths (like `test()` calls). Always benchmark to confirm impact, as complexity of the regex and usage pattern (test vs match) affects the optimization gain.
