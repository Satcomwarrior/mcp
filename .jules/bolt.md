## 2026-02-23 - Regex Compilation Optimization
**Learning:** Extracting regex literals to module-level constants in `src/utils/eth.ts` significantly improved performance for simple validation checks (`isValidEthAddress` improved by ~50%, 39ms -> 20ms for 100k iterations). However, complex matching regexes (`parseTradingPair`) showed negligible performance improvement, likely due to execution cost dominating compilation cost or internal caching mechanisms.
**Action:** Prioritize extracting simple validation regexes used in high-frequency paths (like `test()` calls). Always benchmark to confirm impact, as complexity of the regex and usage pattern (test vs match) affects the optimization gain.

## 2026-05-09 - Intl.NumberFormat Instantiation Overhead
**Learning:** Repeatedly instantiating `Intl.NumberFormat` in formatting loops (e.g., in `formatPrice`) is a major performance bottleneck in V8/Node.js. Caching the formatter instances using a `Map` keyed by configuration options (currency and decimal places) reduced formatting time for 40,000 calls from ~3500ms to ~85ms (~41x speedup).
**Action:** Always cache `Intl.*` object instances (NumberFormat, DateTimeFormat) when they are called frequently in a loop or rapid succession, instead of recreating them on every invocation.
