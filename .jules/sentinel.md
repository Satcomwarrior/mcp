## 2026-02-14 - Command Injection in `killProcessOnPort`
**Vulnerability:** The `killProcessOnPort` utility function in `src/utils/port.ts` accepted a `port` argument without validation and interpolated it directly into a shell command passed to `execSync`. This allowed for Command Injection if an attacker could control the `port` input (e.g., passing `"8080; rm -rf /"`).
**Learning:** Even if a function argument is typed as `number` in TypeScript, runtime inputs can be manipulated or bypassed (e.g., via `any` casts or external JSON input), leading to critical vulnerabilities when used in sensitive sinks like `exec` or `execSync`.
**Prevention:**
1.  **Strict Input Validation:** Always validate inputs at runtime, especially before using them in shell commands. Ensure numbers are integers and within expected ranges.
2.  **Avoid Shell Interpolation:** Where possible, use `spawn` with an arguments array instead of `exec` to avoid shell interpretation.
3.  **Least Privilege:** Ensure the process running the code does not have unnecessary permissions.
4.  **Async/Non-blocking:** Use asynchronous alternatives (`exec`, `spawn`) instead of synchronous ones (`execSync`) to prevent blocking the event loop, which can be a DoS vector.
