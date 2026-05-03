## 2026-02-23 - [Critical] Command Injection in Port Management

**Vulnerability:** A Command Injection vulnerability was found in `src/utils/port.ts` within the `killProcessOnPort` function. The `port` argument was directly interpolated into a shell command string (`execSync`) without validation. While typed as `number`, runtime input (e.g., from untrusted config or bypass) could inject malicious commands like `"3000; rm -rf /"`.

**Learning:** TypeScript types (`number`) do not guarantee runtime safety for sensitive operations like `execSync`. Always validate inputs that reach shell commands, even if they appear to be typed safely.

**Prevention:**
1.  **Strict Input Validation:** Added `validatePort` to strictly check for integers and valid port range (0-65535).
2.  **Use Safer APIs:** Where possible, use `execFile` or `spawn` which treat arguments as data, not code. In this case, validation was the chosen fix as `execSync` with shell features (pipes, `findstr`) was required for the specific logic.

## 2026-02-23 - [Critical] Default binding to all interfaces in Node.js server instantiation

**Vulnerability:** Local servers (e.g. `WebSocketServer`, `net.createServer`) instantiated without an explicit `host` configuration bind to `::` or `0.0.0.0` (all interfaces) by default. This inadvertently exposes local automation endpoints (MCP server and WebSocket) to external networks.
**Learning:** Omission of a `host` option does not restrict access to localhost. Instead, it exposes the application to any network interface present on the machine, which can lead to unauthorized access.
**Prevention:** Always explicitly define `host: "127.0.0.1"` when instantiating internal communication servers in Node.js, ensuring they are strictly bound to localhost.
