## 2026-02-11 - Server Recursion and Workspace Testing
**Learning:** Found a critical recursion bug in `server.close` where overriding the method without binding the original caused infinite recursion. This likely crashed the server on shutdown.
**Action:** Always capture `this.method.bind(this)` when overriding a class method with a wrapper that calls the original.

**Learning:** Testing workspace-dependent code in an isolated environment requires extensive mocking of `@repo/*` packages via `tsconfig.json` paths and a custom test runner setup, as `pnpm install` fails.
**Action:** Use a temporary `test_env` with local mocks and `tsx` with custom `tsconfig.json` to verify logic when full installation isn't possible.

**Learning:** `killProcessOnPort` logic in `src/utils/port.ts` is aggressive and can hang tests if not mocked, especially if the port logic relies on external commands like `lsof` or `netstat` that might behave unexpectedly in restricted environments.
**Action:** Mock network/process utilities when running unit/performance tests to avoid side effects and timeouts.
