## 2026-02-23 - [Critical] Command Injection in Port Management

**Vulnerability:** A Command Injection vulnerability was found in `src/utils/port.ts` within the `killProcessOnPort` function. The `port` argument was directly interpolated into a shell command string (`execSync`) without validation. While typed as `number`, runtime input (e.g., from untrusted config or bypass) could inject malicious commands like `"3000; rm -rf /"`.

**Learning:** TypeScript types (`number`) do not guarantee runtime safety for sensitive operations like `execSync`. Always validate inputs that reach shell commands, even if they appear to be typed safely.

**Prevention:**
1.  **Strict Input Validation:** Added `validatePort` to strictly check for integers and valid port range (0-65535).
2.  **Use Safer APIs:** Where possible, use `execFile` or `spawn` which treat arguments as data, not code. In this case, validation was the chosen fix as `execSync` with shell features (pipes, `findstr`) was required for the specific logic.

## 2026-02-24 - [Critical] WebSocket Server Exposed to External Networks
**Vulnerability:** The `WebSocketServer` in `src/ws.ts` was instantiated with only a `{ port }` configuration. By default, Node.js network servers bind to all available interfaces (`0.0.0.0` or `::`), exposing the browser automation tools to external network access if a firewall does not block it.
**Learning:** Explicitly passing a `host: '127.0.0.1'` configuration is critical when deploying local development servers or local tools. Without it, the default behavior exposes the server globally on the local network.
**Prevention:** Always explicitly define the `host` parameter for any network server configuration (e.g., Express, WebSockets, net.createServer). For local-only access, strictly enforce binding to `127.0.0.1`.
