## 2026-02-23 - [Critical] Command Injection in Port Management

**Vulnerability:** A Command Injection vulnerability was found in `src/utils/port.ts` within the `killProcessOnPort` function. The `port` argument was directly interpolated into a shell command string (`execSync`) without validation. While typed as `number`, runtime input (e.g., from untrusted config or bypass) could inject malicious commands like `"3000; rm -rf /"`.

**Learning:** TypeScript types (`number`) do not guarantee runtime safety for sensitive operations like `execSync`. Always validate inputs that reach shell commands, even if they appear to be typed safely.

**Prevention:**
1.  **Strict Input Validation:** Added `validatePort` to strictly check for integers and valid port range (0-65535).
2.  **Use Safer APIs:** Where possible, use `execFile` or `spawn` which treat arguments as data, not code. In this case, validation was the chosen fix as `execSync` with shell features (pipes, `findstr`) was required for the specific logic.

## 2026-02-23 - [High] Insecure Network Binding in Local Server

**Vulnerability:** The local WebSocket server (`src/ws.ts`) and the port checking utility (`src/utils/port.ts`) were not explicitly binding to `127.0.0.1` (localhost). By default in Node.js, `net.createServer().listen(port)` and `new WebSocketServer({ port })` bind to `0.0.0.0` (all available network interfaces). This unintentionally exposed the MCP server to external networks, potentially allowing unauthorized users on the same network to access the browser automation endpoints.

**Learning:** When using Node.js network servers like `ws`'s `WebSocketServer` or `net.createServer` for local tools, the default behavior of binding to all interfaces must be explicitly overridden. Always bind to `host: '127.0.0.1'` to prevent exposing the server to external networks.

**Prevention:**
1.  **Explicit Host Binding:** Ensure `host: "127.0.0.1"` is explicitly provided in `WebSocketServer` configuration and `server.listen` calls.
