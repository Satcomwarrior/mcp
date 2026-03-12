## 2026-02-23 - [Critical] Command Injection in Port Management

**Vulnerability:** A Command Injection vulnerability was found in `src/utils/port.ts` within the `killProcessOnPort` function. The `port` argument was directly interpolated into a shell command string (`execSync`) without validation. While typed as `number`, runtime input (e.g., from untrusted config or bypass) could inject malicious commands like `"3000; rm -rf /"`.

**Learning:** TypeScript types (`number`) do not guarantee runtime safety for sensitive operations like `execSync`. Always validate inputs that reach shell commands, even if they appear to be typed safely.

**Prevention:**
1.  **Strict Input Validation:** Added `validatePort` to strictly check for integers and valid port range (0-65535).
2.  **Use Safer APIs:** Where possible, use `execFile` or `spawn` which treat arguments as data, not code. In this case, validation was the chosen fix as `execSync` with shell features (pipes, `findstr`) was required for the specific logic.

## 2026-02-23 - [Critical] WebSocket Server Exposed to External Networks

**Vulnerability:** The `WebSocketServer` in `src/ws.ts` was instantiated with only a `port`, defaulting to binding on `0.0.0.0`. This unintentionally exposed the MCP server to external network access, a severe security risk for a local tool dealing with browser automation.
**Learning:** By default, Node.js and many network libraries bind to all available interfaces (`0.0.0.0` or `::`) if the host is omitted. Never assume network services are restricted to `localhost` by default unless explicitly configured.
**Prevention:** Always pass an explicit `host: '127.0.0.1'` or `host: '::1'` when creating local servers (like `ws.WebSocketServer` or `http.Server`) to guarantee they are inaccessible from outside the local machine.
