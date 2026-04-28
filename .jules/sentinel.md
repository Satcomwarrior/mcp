## 2026-02-23 - [Critical] Command Injection in Port Management

**Vulnerability:** A Command Injection vulnerability was found in `src/utils/port.ts` within the `killProcessOnPort` function. The `port` argument was directly interpolated into a shell command string (`execSync`) without validation. While typed as `number`, runtime input (e.g., from untrusted config or bypass) could inject malicious commands like `"3000; rm -rf /"`.

**Learning:** TypeScript types (`number`) do not guarantee runtime safety for sensitive operations like `execSync`. Always validate inputs that reach shell commands, even if they appear to be typed safely.

**Prevention:**
1.  **Strict Input Validation:** Added `validatePort` to strictly check for integers and valid port range (0-65535).
2.  **Use Safer APIs:** Where possible, use `execFile` or `spawn` which treat arguments as data, not code. In this case, validation was the chosen fix as `execSync` with shell features (pipes, `findstr`) was required for the specific logic.

## 2026-04-28 - [HIGH] WebSocket Server Exposed to All Interfaces

**Vulnerability:** The local browser MCP server used `new WebSocketServer({ port })` which by default binds to all network interfaces (`0.0.0.0` or `::`). This exposes the browser automation socket to the external network, potentially allowing arbitrary execution in the browser from the network.
**Learning:** Always specify `host: '127.0.0.1'` when creating network servers (like `ws` or `net`) that are only intended for local inter-process communication.
**Prevention:** Explicitly pass the `host` parameter along with the `port` parameter in configuration for local servers.
