## 2026-02-23 - Regex Compilation Optimization
**Learning:** Extracting regex literals to module-level constants in `src/utils/eth.ts` significantly improved performance for simple validation checks (`isValidEthAddress` improved by ~50%, 39ms -> 20ms for 100k iterations). However, complex matching regexes (`parseTradingPair`) showed negligible performance improvement, likely due to execution cost dominating compilation cost or internal caching mechanisms.
**Action:** Prioritize extracting simple validation regexes used in high-frequency paths (like `test()` calls). Always benchmark to confirm impact, as complexity of the regex and usage pattern (test vs match) affects the optimization gain.

## 2024-05-18 - Intl.NumberFormat Caching
**Learning:** Instantiating `Intl.NumberFormat` in V8 is exceptionally expensive. In `formatPrice`, repeatedly calling `new Intl.NumberFormat()` caused significant overhead.
**Action:** Always cache and reuse `Intl.NumberFormat` instances in loops or frequently called formatting functions using a module-level cache (e.g., `Map` keyed by currency/options). This provides a massive performance boost (~60x in this case).
