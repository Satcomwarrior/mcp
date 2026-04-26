## 2026-02-23 - [Critical] Command Injection in Port Management

**Vulnerability:** A Command Injection vulnerability was found in `src/utils/port.ts` within the `killProcessOnPort` function. The `port` argument was directly interpolated into a shell command string (`execSync`) without validation. While typed as `number`, runtime input (e.g., from untrusted config or bypass) could inject malicious commands like `"3000; rm -rf /"`.

**Learning:** TypeScript types (`number`) do not guarantee runtime safety for sensitive operations like `execSync`. Always validate inputs that reach shell commands, even if they appear to be typed safely.

**Prevention:**
1.  **Strict Input Validation:** Added `validatePort` to strictly check for integers and valid port range (0-65535).
2.  **Use Safer APIs:** Where possible, use `execFile` or `spawn` which treat arguments as data, not code. In this case, validation was the chosen fix as `execSync` with shell features (pipes, `findstr`) was required for the specific logic.
## 2026-02-23 - [High] Local Server Network Exposure

**Vulnerability:** The `WebSocketServer` in `src/ws.ts` and `net.createServer` in `src/utils/port.ts` were bound to the default all-interfaces address (`::` or `0.0.0.0`), unintentionally exposing the local MCP server to external network access.

**Learning:** Node.js network servers bind to all interfaces by default. This is a significant risk for local developer tools that should only be accessible via `127.0.0.1`.

**Prevention:** Always explicitly pass `host: "127.0.0.1"` when instantiating `WebSocketServer` or calling `server.listen()` for local tools.
