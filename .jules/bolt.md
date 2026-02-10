## 2026-02-04 - Infinite Recursion in Server Close
**Learning:** The `server.close` method in `src/server.ts` was recursively calling itself because it was assigned to `server.close` without capturing the original method properly. This caused a stack overflow when closing the server.
**Action:** Always capture the original method (e.g., using `bind`) before overwriting it when extending functionality.
