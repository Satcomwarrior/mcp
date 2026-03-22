## 2026-02-23 - Regex Compilation Optimization
**Learning:** Extracting regex literals to module-level constants in `src/utils/eth.ts` significantly improved performance for simple validation checks (`isValidEthAddress` improved by ~50%, 39ms -> 20ms for 100k iterations). However, complex matching regexes (`parseTradingPair`) showed negligible performance improvement, likely due to execution cost dominating compilation cost or internal caching mechanisms.
**Action:** Prioritize extracting simple validation regexes used in high-frequency paths (like `test()` calls). Always benchmark to confirm impact, as complexity of the regex and usage pattern (test vs match) affects the optimization gain.

## 2024-03-23 - Intl.NumberFormat Caching and Unbounded Memory Leaks
**Learning:** Instantiating `new Intl.NumberFormat()` is extremely expensive in V8. Caching instances provides massive performance improvements (up to ~60x faster). However, when implementing cache structures (like `Map`) for parameters that could be user-provided (e.g., currency codes), unbounded memory growth can lead to severe memory leaks.
**Action:** Always implement a strict size limit when caching expensive objects like `Intl.NumberFormat`. Check the `Map.prototype.size` and use `Map.prototype.delete(map.keys().next().value)` to efficiently evict the oldest entries and cap memory usage.
