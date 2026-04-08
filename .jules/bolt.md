## 2026-02-23 - Regex Compilation Optimization
**Learning:** Extracting regex literals to module-level constants in `src/utils/eth.ts` significantly improved performance for simple validation checks (`isValidEthAddress` improved by ~50%, 39ms -> 20ms for 100k iterations). However, complex matching regexes (`parseTradingPair`) showed negligible performance improvement, likely due to execution cost dominating compilation cost or internal caching mechanisms.
**Action:** Prioritize extracting simple validation regexes used in high-frequency paths (like `test()` calls). Always benchmark to confirm impact, as complexity of the regex and usage pattern (test vs match) affects the optimization gain.

## 2026-02-23 - Dictionary Lookup over Object.entries for Suffix Matching
**Learning:** Replacing `Object.entries()` iteration and `.endsWith()` checks in hot paths with module-level constant lookup using the last character of the string yields significant performance gains (~3.5x speedup). This avoids object allocation for the entries array and repeated string matching overhead.
**Action:** When validating or parsing specific suffixes from strings, extract the mapping to a module-level constant and use direct dictionary lookup (e.g., `mapping[string[string.length - 1]]`) instead of iterating over entries.
