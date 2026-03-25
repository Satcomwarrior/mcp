## 2026-02-23 - [Critical] Command Injection in Port Management

**Vulnerability:** A Command Injection vulnerability was found in `src/utils/port.ts` within the `killProcessOnPort` function. The `port` argument was directly interpolated into a shell command string (`execSync`) without validation. While typed as `number`, runtime input (e.g., from untrusted config or bypass) could inject malicious commands like `"3000; rm -rf /"`.

**Learning:** TypeScript types (`number`) do not guarantee runtime safety for sensitive operations like `execSync`. Always validate inputs that reach shell commands, even if they appear to be typed safely.

**Prevention:**
1.  **Strict Input Validation:** Added `validatePort` to strictly check for integers and valid port range (0-65535).
2.  **Use Safer APIs:** Where possible, use `execFile` or `spawn` which treat arguments as data, not code. In this case, validation was the chosen fix as `execSync` with shell features (pipes, `findstr`) was required for the specific logic.

## 2025-03-01 - [High] Insecure Network Binding in Local Servers

**Vulnerability:** The local `WebSocketServer` in `ws.ts` and the port checking server in `port.ts` were missing an explicit `host` parameter when binding to a port. In Node.js, `net.createServer().listen(port)` and `new WebSocketServer({ port })` default to binding to all available network interfaces (`0.0.0.0` or `::`). This unintentionally exposed the servers to external networks, allowing potential local network SSRF or unauthorized access to the tools and resources.
**Learning:** Node.js networking primitives fail open to maximum exposure (`0.0.0.0`) rather than secure defaults (`127.0.0.1`). Explicit configuration is required for local-only servers.
**Prevention:** Always explicitly pass `host: "127.0.0.1"` when instantiating `WebSocketServer` or calling `server.listen()` for services intended only for local use.
