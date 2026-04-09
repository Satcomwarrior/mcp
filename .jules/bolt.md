## 2026-02-23 - Regex Compilation Optimization
**Learning:** Extracting regex literals to module-level constants in `src/utils/eth.ts` significantly improved performance for simple validation checks (`isValidEthAddress` improved by ~50%, 39ms -> 20ms for 100k iterations). However, complex matching regexes (`parseTradingPair`) showed negligible performance improvement, likely due to execution cost dominating compilation cost or internal caching mechanisms.
**Action:** Prioritize extracting simple validation regexes used in high-frequency paths (like `test()` calls). Always benchmark to confirm impact, as complexity of the regex and usage pattern (test vs match) affects the optimization gain.

## 2024-05-18 - Intl.NumberFormat Caching
**Learning:** Instantiating new `Intl.NumberFormat` objects inside frequently called formatting functions (like `formatPrice`) is a significant performance bottleneck. In this codebase, creating new instances repeatedly caused processing to take ~31,482ms for 100k iterations.
**Action:** Always cache `Intl.NumberFormat` instances using a `Map` keyed by relevant formatting options (e.g., `${currency}-${maxDecimals}`). Doing so provided a ~42x speedup (down to ~736ms for 100k iterations).
