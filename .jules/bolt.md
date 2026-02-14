## 2025-02-19 - Duplicate Key Handling in Array-to-Map Optimization
**Learning:** When replacing `Array.find(item => item.key === target)` with `Map.get(target)`, the Array implementation returns the *first* match, while a naive `Map` population loop (iterating and setting) results in the *last* match winning. To preserve the original behavior exactly, one must check `!map.has(key)` before setting the value.
**Action:** Always verify duplicate key handling strategy when optimizing lookups, and use `if (!map.has(key)) map.set(key, value)` to mimic `Array.find` semantics unless explicitly deciding otherwise.

## 2025-02-19 - Verification in Broken Environments
**Learning:** In environments where dependencies (like `node_modules`) are missing or broken, verification must rely on standalone scripts that mock external dependencies. This allows testing algorithmic correctness even when integration tests cannot run.
**Action:** Create self-contained verification scripts (e.g., using `npx tsx`) that mock necessary interfaces when full build/test commands are unavailable.
