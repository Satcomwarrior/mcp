## 2026-02-23 - [Critical] Command Injection in Port Management

**Vulnerability:** A Command Injection vulnerability was found in `src/utils/port.ts` within the `killProcessOnPort` function. The `port` argument was directly interpolated into a shell command string (`execSync`) without validation. While typed as `number`, runtime input (e.g., from untrusted config or bypass) could inject malicious commands like `"3000; rm -rf /"`.

**Learning:** TypeScript types (`number`) do not guarantee runtime safety for sensitive operations like `execSync`. Always validate inputs that reach shell commands, even if they appear to be typed safely.

**Prevention:**
1.  **Strict Input Validation:** Added `validatePort` to strictly check for integers and valid port range (0-65535).
2.  **Use Safer APIs:** Where possible, use `execFile` or `spawn` which treat arguments as data, not code. In this case, validation was the chosen fix as `execSync` with shell features (pipes, `findstr`) was required for the specific logic.

## 2026-03-13 - [Critical] WebSocket Server Exposure

**Vulnerability:** A Severe security risk was identified in `src/ws.ts` where `WebSocketServer` was instantiated without specifying a `host`. By default, Node.js networking servers (`net`, `http`, `ws`) bind to all available interfaces (`0.0.0.0` or `::`). For an MCP server designed for local browser communication, this unintentionally exposed the WebSocket port to external networks, allowing potential attackers on the same network to connect and execute browser automation commands.

**Learning:** When using Node.js network servers like `ws`'s `WebSocketServer` for local tools, explicitly bind to `host: '127.0.0.1'` to prevent the default behavior of binding to all interfaces (`0.0.0.0`), which unintentionally exposes the server to external networks.

**Prevention:**
1.  **Explicit Binding:** Always specify `host: '127.0.0.1'` (or `localhost`) when creating servers meant solely for local communication.
2.  **Review Defaults:** Be aware of the default behavior of networking libraries, which often prioritize connectivity over isolation.
