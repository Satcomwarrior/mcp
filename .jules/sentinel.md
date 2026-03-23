## 2026-02-23 - [Critical] Command Injection in Port Management

**Vulnerability:** A Command Injection vulnerability was found in `src/utils/port.ts` within the `killProcessOnPort` function. The `port` argument was directly interpolated into a shell command string (`execSync`) without validation. While typed as `number`, runtime input (e.g., from untrusted config or bypass) could inject malicious commands like `"3000; rm -rf /"`.

**Learning:** TypeScript types (`number`) do not guarantee runtime safety for sensitive operations like `execSync`. Always validate inputs that reach shell commands, even if they appear to be typed safely.

**Prevention:**
1.  **Strict Input Validation:** Added `validatePort` to strictly check for integers and valid port range (0-65535).
2.  **Use Safer APIs:** Where possible, use `execFile` or `spawn` which treat arguments as data, not code. In this case, validation was the chosen fix as `execSync` with shell features (pipes, `findstr`) was required for the specific logic.

## 2026-03-23 - [High] Unintended Network Exposure (0.0.0.0 Binding)

**Vulnerability:** The `WebSocketServer` in `src/ws.ts` and the `net.createServer().listen()` in `src/utils/port.ts` were implicitly binding to all network interfaces (`0.0.0.0` or `::`) by default. This exposes the local development/tooling server to the entire external network, potentially allowing unauthorized external access to the browser automation tools.

**Learning:** In Node.js, network server creation utilities (like `net.createServer().listen(port)` and `new WebSocketServer({ port })`) default to binding to all available network interfaces if a host is not explicitly provided.

**Prevention:** Always explicitly pass `'127.0.0.1'` (or `'localhost'`) as the host argument when checking ports or starting local servers intended only for local use to avoid unintended external exposure.
