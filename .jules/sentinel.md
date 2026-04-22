## 2026-02-23 - [Critical] Command Injection in Port Management

**Vulnerability:** A Command Injection vulnerability was found in `src/utils/port.ts` within the `killProcessOnPort` function. The `port` argument was directly interpolated into a shell command string (`execSync`) without validation. While typed as `number`, runtime input (e.g., from untrusted config or bypass) could inject malicious commands like `"3000; rm -rf /"`.

**Learning:** TypeScript types (`number`) do not guarantee runtime safety for sensitive operations like `execSync`. Always validate inputs that reach shell commands, even if they appear to be typed safely.

**Prevention:**
1.  **Strict Input Validation:** Added `validatePort` to strictly check for integers and valid port range (0-65535).
2.  **Use Safer APIs:** Where possible, use `execFile` or `spawn` which treat arguments as data, not code. In this case, validation was the chosen fix as `execSync` with shell features (pipes, `findstr`) was required for the specific logic.

## 2024-05-28 - [High] Insecure Default Network Binding for Local Servers

**Vulnerability:** The local WebSocket server (`src/ws.ts`) and its availability checker (`src/utils/port.ts`) were instantiating Node.js network servers without explicitly providing a `host` parameter (e.g., `new WebSocketServer({ port })` and `server.listen(port)`). This causes Node.js to bind to all available network interfaces (`0.0.0.0` or `::`) by default, unnecessarily exposing local tools to the broader local network or public internet.
**Learning:** Default behaviors in core Node.js networking libraries prioritize availability over isolation. For services intended strictly for local internal usage (like MCP servers or IPC mechanisms), omitting the host parameter creates an unintended external attack surface.
**Prevention:** Always explicitly define `host: '127.0.0.1'` (or `localhost`) when initializing local servers (e.g., `net.createServer().listen(port, '127.0.0.1')` or `new WebSocketServer({ port, host: '127.0.0.1' })`) to strictly restrict traffic to the loopback interface.
