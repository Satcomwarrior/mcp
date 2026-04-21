## 2026-02-23 - Regex Compilation Optimization
**Learning:** Extracting regex literals to module-level constants in `src/utils/eth.ts` significantly improved performance for simple validation checks (`isValidEthAddress` improved by ~50%, 39ms -> 20ms for 100k iterations). However, complex matching regexes (`parseTradingPair`) showed negligible performance improvement, likely due to execution cost dominating compilation cost or internal caching mechanisms.
**Action:** Prioritize extracting simple validation regexes used in high-frequency paths (like `test()` calls). Always benchmark to confirm impact, as complexity of the regex and usage pattern (test vs match) affects the optimization gain.

## 2026-02-23 - Fast-Path Regex with Alternation
**Learning:** In hot loops processing text lines (e.g., parsing snapshot text for gas prices), checking a simple, pre-compiled regex fast-path (like `/gwei/i.test(line)`) before executing complex matching logic avoids significant overhead on non-matching lines. Furthermore, combining multiple separate regexes into a single pattern with alternations reduces matching overhead by over 10x.
**Action:** Combine alternations and add simple keyword fast-path checks using `RegExp.test()` before running complex extraction logic in string processing loops.
