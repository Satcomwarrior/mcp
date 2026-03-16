## 2026-02-23 - [Critical] Command Injection in Port Management

**Vulnerability:** A Command Injection vulnerability was found in `src/utils/port.ts` within the `killProcessOnPort` function. The `port` argument was directly interpolated into a shell command string (`execSync`) without validation. While typed as `number`, runtime input (e.g., from untrusted config or bypass) could inject malicious commands like `"3000; rm -rf /"`.

**Learning:** TypeScript types (`number`) do not guarantee runtime safety for sensitive operations like `execSync`. Always validate inputs that reach shell commands, even if they appear to be typed safely.

**Prevention:**
1.  **Strict Input Validation:** Added `validatePort` to strictly check for integers and valid port range (0-65535).
2.  **Use Safer APIs:** Where possible, use `execFile` or `spawn` which treat arguments as data, not code. In this case, validation was the chosen fix as `execSync` with shell features (pipes, `findstr`) was required for the specific logic.

## 2023-10-25 - [Critical] Unintentional External Network Exposure in WebSocketServer

**Vulnerability:** The `WebSocketServer` in `src/ws.ts` was instantiated with only a `port` argument (`new WebSocketServer({ port })`). In Node.js, network servers (including `net.Server`, `http.Server`, and `ws.WebSocketServer`) default to binding to all available network interfaces (`0.0.0.0` or `::`) if the `host` is not explicitly specified. This unintentionally exposed the Model Context Protocol (MCP) WebSocket server to the external network, potentially allowing unauthorized external access to browser automation tools.

**Learning:** When creating local services intended only for internal use, always explicitly bind to `127.0.0.1` (or `::1` for IPv6). Never rely on default binding behaviors, as they often default to public exposure (`0.0.0.0`).

**Prevention:**
1. **Explicit Binding:** Updated `new WebSocketServer({ port })` to `new WebSocketServer({ port, host: "127.0.0.1" })`.
2. **Consistent Checking:** Updated `server.listen(port)` in `isPortInUse` (`src/utils/port.ts`) to `server.listen(port, "127.0.0.1")` to accurately reflect the interface being used.
