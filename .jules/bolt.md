## 2026-02-23 - Regex Compilation Optimization
**Learning:** Extracting regex literals to module-level constants in `src/utils/eth.ts` significantly improved performance for simple validation checks (`isValidEthAddress` improved by ~50%, 39ms -> 20ms for 100k iterations). However, complex matching regexes (`parseTradingPair`) showed negligible performance improvement, likely due to execution cost dominating compilation cost or internal caching mechanisms.
**Action:** Prioritize extracting simple validation regexes used in high-frequency paths (like `test()` calls). Always benchmark to confirm impact, as complexity of the regex and usage pattern (test vs match) affects the optimization gain.

## 2025-03-10 - Intl.NumberFormat Instantiation Optimization
**Learning:** Instantiating `new Intl.NumberFormat()` is an exceptionally slow operation in V8. Repeatedly creating these objects inside formatting loops causes significant performance degradation. Caching and reusing a single instance for the same currency and decimal combination yields an enormous performance boost (~55x speedup for 40k operations).
**Action:** Always cache and reuse `Intl.NumberFormat` instances using a module-level `Map` rather than instantiating them on every function call.
