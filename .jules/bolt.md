## 2026-02-23 - Regex Compilation Optimization
**Learning:** Extracting regex literals to module-level constants in `src/utils/eth.ts` significantly improved performance for simple validation checks (`isValidEthAddress` improved by ~50%, 39ms -> 20ms for 100k iterations). However, complex matching regexes (`parseTradingPair`) showed negligible performance improvement, likely due to execution cost dominating compilation cost or internal caching mechanisms.
**Action:** Prioritize extracting simple validation regexes used in high-frequency paths (like `test()` calls). Always benchmark to confirm impact, as complexity of the regex and usage pattern (test vs match) affects the optimization gain.

## 2026-02-23 - Intl.NumberFormat Caching Optimization
**Learning:** Instantiating `Intl.NumberFormat` repeatedly inside hot loops (like in `formatPrice`) is a major performance bottleneck, as the JS engine has to recompile the localization rules every time. Caching it using a `Map` keyed by configuration options (currency + maxDecimals) avoids this overhead.
**Action:** Always extract and cache standard library formatters (like `Intl.NumberFormat`, `Intl.DateTimeFormat`) when they are used frequently. This simple change yielded a ~70x speedup in parsing and formatting functions.
