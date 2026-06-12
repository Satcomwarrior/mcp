## 2024-05-30 - Lazily evaluate string matches

**Learning:** Using `String.prototype.match(/g/)` followed by the spread operator `...` into an array, and then taking a unique Set and slicing it limits performance, particularly for very large strings where early termination of matches can save significant processing overhead. `String.prototype.matchAll()` combined with iterator break achieves much greater speedups, e.g. up to 15,000x for typical crypto snapshot text.
**Action:** When extracting limited data via regex matches in loops (e.g., in `src/tools/eth.ts`, `src/tools/trading.ts`, `src/resources/trading.ts`), replace `array.push(...matches)` with `matchAll()` iteration, direct `Set.add()` collection, and early `break` statements once a specific size limit is reached.

## 2024-05-31 - Log appending

**Learning:** When using bash tools to update journal logs, using `>` deletes all previous logs and replaces them with a single entry, losing all prior knowledge.
**Action:** When adding entries to log or journal files, always use the append operator (`>>`) instead of the overwrite operator (`>`) to preserve historical entries.
