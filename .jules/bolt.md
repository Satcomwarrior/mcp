## 2025-02-27 - Map vs Array Lookups
**Learning:** In scenarios where `tools` or `resources` collections exceed hundreds of items, linear `Array.find` scans become a measurable bottleneck (e.g., ~123ms vs ~4ms for 1000 items).
**Action:** When implementing or refactoring collection lookups that occur frequently (like on every request), prefer `Map` (O(1)) over `Array.find` (O(n)), while ensuring duplicate key handling preserves the 'first match wins' behavior by checking `!map.has(key)` before setting.
