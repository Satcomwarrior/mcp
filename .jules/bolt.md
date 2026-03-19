## 2026-02-23 - Regex Compilation Optimization
**Learning:** Extracting regex literals to module-level constants in `src/utils/eth.ts` significantly improved performance for simple validation checks (`isValidEthAddress` improved by ~50%, 39ms -> 20ms for 100k iterations). However, complex matching regexes (`parseTradingPair`) showed negligible performance improvement, likely due to execution cost dominating compilation cost or internal caching mechanisms.
**Action:** Prioritize extracting simple validation regexes used in high-frequency paths (like `test()` calls). Always benchmark to confirm impact, as complexity of the regex and usage pattern (test vs match) affects the optimization gain.

## 2026-02-23 - Caching Intl.NumberFormat
**Learning:** Instantiating `new Intl.NumberFormat()` is extremely slow in Node.js/V8. Caching instances per currency drastically improves performance (e.g., from ~5s to ~60ms for 30k formats). However, we must implement a max cache limit (e.g., 1000) to prevent unbounded memory growth from malicious/unsupported currencies, and we must handle the exception by caching `null` to avoid repeatedly throwing on unsupported codes.
**Action:** When using `Intl.NumberFormat` in high-frequency paths, always instantiate a single instance and reuse it, but secure the cache against unbound growth and repeated instantiation failures.
