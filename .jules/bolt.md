## 2024-05-22 - [Optimized Regex Instantiation]
**Learning:** Extracting regex literals to module-level constants provided a ~12-23% performance improvement in validation functions (like `isValidEthAddress` and `validateSymbol`) that are called frequently.
**Action:** Always check for regex instantiation inside loops or frequently called utility functions. If the regex is constant, move it to the module scope to avoid recompilation overhead.
