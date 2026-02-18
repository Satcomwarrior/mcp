## 2025-05-23 - Map vs Array Lookup
**Learning:** The server implementation uses arrays for `tools` and `resources` storage, leading to O(n) lookups in request handlers. While manageable for small sets, this becomes a bottleneck as the number of tools grows.
**Action:** Prefer `Map` for keyed lookups in request handlers (O(1)) to ensure consistent performance regardless of set size. Ensure duplicate handling mirrors `Array.find` (first match wins) when converting.

## 2025-05-23 - Tool Limitations
**Learning:** The `read_file` tool may truncate output for larger files (>1000 chars) without explicit warning.
**Action:** Always verify full file content using `cat` or `tail` in `run_in_bash_session` before modifying code based on partial reads.
