## 2025-02-17 - Broken Dependency Resolution
**Learning:** In the `/app` subdirectory of the monorepo, `pnpm` workspace dependencies and `node_modules` are completely missing. This breaks standard execution of `tsx`, `tsup`, and `tsc` if any dependency is used.
**Action:** Always verify code changes by creating logic-only verification scripts that mock all external dependencies, as imports will fail at runtime. `tsx` may succeed if imports are unused (optimized away), masking the issue.

## 2025-02-17 - Recursive Server Close
**Learning:** Overriding `server.close` on an instance without binding the original method causes infinite recursion if `await server.close()` is called within the override.
**Action:** Always capture the original method using `.bind(server)` before overriding it on the instance.
