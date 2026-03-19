## 2026-02-23 - [Critical] Command Injection in Port Management

**Vulnerability:** A Command Injection vulnerability was found in `src/utils/port.ts` within the `killProcessOnPort` function. The `port` argument was directly interpolated into a shell command string (`execSync`) without validation. While typed as `number`, runtime input (e.g., from untrusted config or bypass) could inject malicious commands like `"3000; rm -rf /"`.

**Learning:** TypeScript types (`number`) do not guarantee runtime safety for sensitive operations like `execSync`. Always validate inputs that reach shell commands, even if they appear to be typed safely.

**Prevention:**
1.  **Strict Input Validation:** Added `validatePort` to strictly check for integers and valid port range (0-65535).
2.  **Use Safer APIs:** Where possible, use `execFile` or `spawn` which treat arguments as data, not code. In this case, validation was the chosen fix as `execSync` with shell features (pipes, `findstr`) was required for the specific logic.
## 2023-10-24 - Command Injection and Server Exposure
**Vulnerability:** `execSync` was used with string interpolation and shell features (`|`, `xargs`, `findstr`) to kill processes on a port. Additionally, `server.listen(port)` did not specify a host, binding to all interfaces (`0.0.0.0`) during port checks, exposing the temporary server externally.
**Learning:** Shell commands with interpolated variables (even integers) are risky and can lead to command injection if upstream validation fails or changes. `execSync` spawns a shell which is unnecessary and unsafe. Furthermore, `net.createServer().listen(port)` defaults to all interfaces.
**Prevention:** Always use `execFileSync` with an array of arguments to execute commands directly without a shell, and parse output manually in Node.js instead of relying on shell pipes. Always explicitly specify `127.0.0.1` when checking ports or starting local servers to prevent external exposure.
