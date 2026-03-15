## 2026-02-23 - [Critical] Command Injection in Port Management

**Vulnerability:** A Command Injection vulnerability was found in `src/utils/port.ts` within the `killProcessOnPort` function. The `port` argument was directly interpolated into a shell command string (`execSync`) without validation. While typed as `number`, runtime input (e.g., from untrusted config or bypass) could inject malicious commands like `"3000; rm -rf /"`.

**Learning:** TypeScript types (`number`) do not guarantee runtime safety for sensitive operations like `execSync`. Always validate inputs that reach shell commands, even if they appear to be typed safely.

**Prevention:**
1.  **Strict Input Validation:** Added `validatePort` to strictly check for integers and valid port range (0-65535).
2.  **Use Safer APIs:** Where possible, use `execFile` or `spawn` which treat arguments as data, not code. In this case, validation was the chosen fix as `execSync` with shell features (pipes, `findstr`) was required for the specific logic.

## 2026-02-23 - [High] Insecure Network Binding in WebSocket Server

**Vulnerability:** The WebSocketServer in `src/ws.ts` was instantiated with only a `port` option (`new WebSocketServer({ port })`). By default, Node.js servers and libraries like `ws` will bind to `0.0.0.0` (all available network interfaces) if a `host` is not explicitly provided. This unintentionally exposed the internal Model Context Protocol (MCP) server to the external network, potentially allowing unauthorized access to local browser automation tools from outside the machine.

**Learning:** When developing local-only services or tools (like an MCP server that shouldn't be publicly accessible), relying on default binding configurations is dangerous as defaults often prioritize broad accessibility (`0.0.0.0`) over security (`127.0.0.1`).

**Prevention:** Always explicitly define the `host` option when creating network servers (e.g., `new WebSocketServer({ port, host: '127.0.0.1' })`) to guarantee they are only accessible from the loopback interface unless external access is strictly required and properly secured.
