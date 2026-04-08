## 2026-02-23 - [Critical] Command Injection in Port Management

**Vulnerability:** A Command Injection vulnerability was found in `src/utils/port.ts` within the `killProcessOnPort` function. The `port` argument was directly interpolated into a shell command string (`execSync`) without validation. While typed as `number`, runtime input (e.g., from untrusted config or bypass) could inject malicious commands like `"3000; rm -rf /"`.

**Learning:** TypeScript types (`number`) do not guarantee runtime safety for sensitive operations like `execSync`. Always validate inputs that reach shell commands, even if they appear to be typed safely.

**Prevention:**
1.  **Strict Input Validation:** Added `validatePort` to strictly check for integers and valid port range (0-65535).
2.  **Use Safer APIs:** Where possible, use `execFile` or `spawn` which treat arguments as data, not code. In this case, validation was the chosen fix as `execSync` with shell features (pipes, `findstr`) was required for the specific logic.

## 2026-04-08 - [Critical] Unintended Network Exposure via Port Binding

**Vulnerability:** A Local Privilege Escalation / Unintended Network Exposure vulnerability was found in `src/ws.ts` and `src/utils/port.ts`. `WebSocketServer({ port })` and `net.createServer().listen(port)` default to binding to all interfaces (`0.0.0.0` or `::`), unintentionally exposing the local WebSocket server or port checks to external network traffic.
**Learning:** Default behavior for node network utilities is to bind to all interfaces. Relying on default bindings without explicitly passing `"127.0.0.1"` is a common security pitfall.
**Prevention:**
1.  **Strict Host Binding:** Always pass `host: "127.0.0.1"` to `WebSocketServer`.
2.  **Explicit Host Params:** Always pass `"127.0.0.1"` to `server.listen(port, "127.0.0.1")`.
