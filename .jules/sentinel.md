## 2026-02-23 - [Critical] Command Injection in Port Management

**Vulnerability:** A Command Injection vulnerability was found in `src/utils/port.ts` within the `killProcessOnPort` function. The `port` argument was directly interpolated into a shell command string (`execSync`) without validation. While typed as `number`, runtime input (e.g., from untrusted config or bypass) could inject malicious commands like `"3000; rm -rf /"`.

**Learning:** TypeScript types (`number`) do not guarantee runtime safety for sensitive operations like `execSync`. Always validate inputs that reach shell commands, even if they appear to be typed safely.

**Prevention:**
1.  **Strict Input Validation:** Added `validatePort` to strictly check for integers and valid port range (0-65535).
2.  **Use Safer APIs:** Where possible, use `execFile` or `spawn` which treat arguments as data, not code. In this case, validation was the chosen fix as `execSync` with shell features (pipes, `findstr`) was required for the specific logic.

## 2024-05-24 - [High] Insecure WebSocket Server Network Binding

**Vulnerability:** The `WebSocketServer` in `src/ws.ts` was initialized only with a `port` and no `host`. In Node.js, network server creation utilities default to binding to all network interfaces (`::` or `0.0.0.0`). This unintentionally exposed the local WebSocket server to external networks.

**Learning:** When using Node.js network servers for local tools, omitting the host binds to all interfaces by default, which can lead to unintended exposure. `net.createServer().listen(port)` without an explicit host binds to the IPv6 'all interfaces' address `::` by default.

**Prevention:** Always explicitly pass `'127.0.0.1'` as the host argument when checking ports (`server.listen(port, '127.0.0.1')`) or starting local servers (`new WebSocketServer({ port, host: '127.0.0.1' })`) to avoid unintended external exposure.
