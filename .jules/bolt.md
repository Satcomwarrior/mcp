## 2026-02-10 - Infinite Recursion in Server Shutdown
**Learning:** Overriding `server.close` without binding the original method caused infinite recursion.
**Action:** Always capture the original method using `.bind(server)` before overriding.
