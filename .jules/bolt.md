## 2026-02-09 - Infinite Recursion in Server Shutdown
**Learning:** Overriding a class method (like `server.close`) without binding the original method creates an infinite recursion loop, causing stack overflow and preventing graceful shutdown. This was a critical stability bug preventing proper resource cleanup.
**Action:** Always capture the original method using `.bind(this)` before overriding it to ensure the original implementation can be called safely.
