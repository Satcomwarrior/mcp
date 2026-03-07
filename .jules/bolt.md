## 2026-02-23 - Regex Compilation Optimization
**Learning:** Extracting regex literals to module-level constants in `src/utils/eth.ts` significantly improved performance for simple validation checks (`isValidEthAddress` improved by ~50%, 39ms -> 20ms for 100k iterations). However, complex matching regexes (`parseTradingPair`) showed negligible performance improvement, likely due to execution cost dominating compilation cost or internal caching mechanisms.
**Action:** Prioritize extracting simple validation regexes used in high-frequency paths (like `test()` calls). Always benchmark to confirm impact, as complexity of the regex and usage pattern (test vs match) affects the optimization gain.

## 2026-03-07 - Intl.NumberFormat Instantiation Optimization
**Learning:** Instantiating `new Intl.NumberFormat()` is an exceptionally expensive operation in V8. In `src/utils/trading.ts`, caching instances in a module-level `Map` keyed by currency code resulted in a massive ~60x speedup for formatting loops (from ~21 seconds to ~336ms for 300k iterations).
**Action:** Always cache and reuse `Intl.NumberFormat` and `Intl.DateTimeFormat` instances when formatting data repeatedly or inside loops, rather than creating new ones per call.
