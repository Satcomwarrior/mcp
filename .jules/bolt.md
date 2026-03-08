## 2026-02-23 - Regex Compilation Optimization
**Learning:** Extracting regex literals to module-level constants in `src/utils/eth.ts` significantly improved performance for simple validation checks (`isValidEthAddress` improved by ~50%, 39ms -> 20ms for 100k iterations). However, complex matching regexes (`parseTradingPair`) showed negligible performance improvement, likely due to execution cost dominating compilation cost or internal caching mechanisms.
**Action:** Prioritize extracting simple validation regexes used in high-frequency paths (like `test()` calls). Always benchmark to confirm impact, as complexity of the regex and usage pattern (test vs match) affects the optimization gain.

## 2026-02-23 - Intl.NumberFormat Instantiation Bottleneck
**Learning:** `new Intl.NumberFormat()` is a highly expensive operation in Node.js/V8. Instantiating it inside frequently called functions (like `formatPrice` used in loops for rendering or parsing) causes massive performance degradation.
**Action:** Always cache `Intl.NumberFormat` instances using a module-level `Map` keyed by locale and options (e.g., currency, fraction digits) when they are called repeatedly. This pattern yields a >60x speedup in isolated benchmarks and drastically reduces garbage collection overhead.
