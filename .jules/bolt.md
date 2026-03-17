## 2026-02-23 - Regex Compilation Optimization
**Learning:** Extracting regex literals to module-level constants in `src/utils/eth.ts` significantly improved performance for simple validation checks (`isValidEthAddress` improved by ~50%, 39ms -> 20ms for 100k iterations). However, complex matching regexes (`parseTradingPair`) showed negligible performance improvement, likely due to execution cost dominating compilation cost or internal caching mechanisms.
**Action:** Prioritize extracting simple validation regexes used in high-frequency paths (like `test()` calls). Always benchmark to confirm impact, as complexity of the regex and usage pattern (test vs match) affects the optimization gain.

## 2026-03-18 - Intl.NumberFormat Instantiation Bottleneck
**Learning:** Instantiating `new Intl.NumberFormat()` is exceptionally expensive in V8/Node.js. In a benchmark formatting 100k prices, recreating the formatter per call took ~7150ms, while caching and reusing instances took ~130ms (a ~55x speedup). Memory limits are necessary when caching untrusted inputs, and errors for unsupported locales/currencies must be caught to cache `null` instead of repeatedly throwing errors.
**Action:** Always cache `Intl.NumberFormat` instances using a module-level `Map` when formatting functions are used in high-frequency loops. Include a max cache size and handle instantiation errors securely.
