## 2026-02-23 - [Critical] Command Injection in Port Management

**Vulnerability:** A Command Injection vulnerability was found in `src/utils/port.ts` within the `killProcessOnPort` function. The `port` argument was directly interpolated into a shell command string (`execSync`) without validation. While typed as `number`, runtime input (e.g., from untrusted config or bypass) could inject malicious commands like `"3000; rm -rf /"`.

**Learning:** TypeScript types (`number`) do not guarantee runtime safety for sensitive operations like `execSync`. Always validate inputs that reach shell commands, even if they appear to be typed safely.

**Prevention:**
1.  **Strict Input Validation:** Added `validatePort` to strictly check for integers and valid port range (0-65535).
2.  **Use Safer APIs:** Where possible, use `execFile` or `spawn` which treat arguments as data, not code. In this case, validation was the chosen fix as `execSync` with shell features (pipes, `findstr`) was required for the specific logic.
## 2026-05-11 - Explicit Loopback Binding for Node.js Network Servers
**Vulnerability:** The WebSocket server in `src/ws.ts` and the port check in `src/utils/port.ts` lacked an explicit host definition.
**Learning:** By default, Node.js `net.createServer().listen()` and `WebSocketServer` bind to all available network interfaces (`::` or `0.0.0.0`) if the host is omitted. This inadvertently exposed local automation endpoints and testing ports to external networks, introducing a high-risk attack surface in an MCP server environment.
**Prevention:** Always explicitly define `host: '127.0.0.1'` (or `127.0.0.1` as a positional argument) when instantiating local network servers or checking local ports to ensure they are strictly confined to the loopback interface.
