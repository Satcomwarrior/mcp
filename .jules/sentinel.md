## 2026-01-31 - Command Injection in Utility Function
**Vulnerability:** Command Injection in `killProcessOnPort` utility. The function used `execSync` with a `port` argument directly concatenated into the shell command string. Although typed as `number`, runtime execution with a malicious string (e.g. via `any` cast or untrusted input source) allowed arbitrary code execution.
**Learning:** TypeScript types are a compile-time guarantee only. Internal utility functions that perform dangerous operations (like `execSync`) must validate inputs at runtime, as they might be called from contexts where type safety is compromised.
**Prevention:**
1. Validate inputs at runtime (e.g., `Number.isInteger(port)`).
2. Avoid `execSync` with shell syntax where possible, or strictly sanitize all interpolated variables.
3. Treat "internal" utilities with the same security rigor as public API endpoints if they handle dangerous operations.