## 2026-02-23 - Regex Compilation Optimization
**Learning:** Extracting regex literals to module-level constants in `src/utils/eth.ts` significantly improved performance for simple validation checks (`isValidEthAddress` improved by ~50%, 39ms -> 20ms for 100k iterations). However, complex matching regexes (`parseTradingPair`) showed negligible performance improvement, likely due to execution cost dominating compilation cost or internal caching mechanisms.
**Action:** Prioritize extracting simple validation regexes used in high-frequency paths (like `test()` calls). Always benchmark to confirm impact, as complexity of the regex and usage pattern (test vs match) affects the optimization gain.

## 2025-04-19 - Intl.NumberFormat Instantiation Bottleneck
**Learning:** Instantiating `Intl.NumberFormat` repeatedly in hot paths is a significant performance bottleneck (taking ~13ms per 100 iterations). Caching instances using a Map keyed by configuration options (like currency and decimal places) yields up to a ~60x performance speedup.
**Action:** Always cache `Intl.NumberFormat` and other similar `Intl` objects when used inside loops or frequently called formatting utilities.
