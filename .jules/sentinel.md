## 2026-02-23 - [Critical] Command Injection in Port Management

**Vulnerability:** A Command Injection vulnerability was found in `src/utils/port.ts` within the `killProcessOnPort` function. The `port` argument was directly interpolated into a shell command string (`execSync`) without validation. While typed as `number`, runtime input (e.g., from untrusted config or bypass) could inject malicious commands like `"3000; rm -rf /"`.

**Learning:** TypeScript types (`number`) do not guarantee runtime safety for sensitive operations like `execSync`. Always validate inputs that reach shell commands, even if they appear to be typed safely.

**Prevention:**
1.  **Strict Input Validation:** Added `validatePort` to strictly check for integers and valid port range (0-65535).
2.  **Use Safer APIs:** Where possible, use `execFile` or `spawn` which treat arguments as data, not code. In this case, validation was the chosen fix as `execSync` with shell features (pipes, `findstr`) was required for the specific logic.
## 2025-03-03 - Secure Localhost Binding for WebSocketServer and Port Checks
**Vulnerability:** `ws`'s `WebSocketServer` and Node's `net.createServer()` default to binding to all network interfaces (`0.0.0.0`) when only `port` is provided. This inadvertently exposed the MCP server to external networks.
**Learning:** In Node.js, `listen` and server constructors like `WebSocketServer` must be explicitly told to bind to `127.0.0.1` to be safe. Leaving out the `host` parameter assumes `0.0.0.0`, potentially exposing sensitive API/WebSocket endpoints.
**Prevention:** Always explicitly pass `host: '127.0.0.1'` when calling `listen()` or constructing servers like `WebSocketServer` if the service is only meant for local access.
