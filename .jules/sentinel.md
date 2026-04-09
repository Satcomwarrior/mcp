## 2026-02-23 - [Critical] Command Injection in Port Management

**Vulnerability:** A Command Injection vulnerability was found in `src/utils/port.ts` within the `killProcessOnPort` function. The `port` argument was directly interpolated into a shell command string (`execSync`) without validation. While typed as `number`, runtime input (e.g., from untrusted config or bypass) could inject malicious commands like `"3000; rm -rf /"`.

**Learning:** TypeScript types (`number`) do not guarantee runtime safety for sensitive operations like `execSync`. Always validate inputs that reach shell commands, even if they appear to be typed safely.

**Prevention:**
1.  **Strict Input Validation:** Added `validatePort` to strictly check for integers and valid port range (0-65535).
2.  **Use Safer APIs:** Where possible, use `execFile` or `spawn` which treat arguments as data, not code. In this case, validation was the chosen fix as `execSync` with shell features (pipes, `findstr`) was required for the specific logic.

## 2025-02-24 - [High] Network Server External Exposure

**Vulnerability:** The local `WebSocketServer` in `src/ws.ts` and the `net.createServer()` port checking utility in `src/utils/port.ts` were created without explicitly specifying a host address. In Node.js, this defaults to binding to all available network interfaces (`0.0.0.0` or `::`), exposing the unauthenticated local Model Context Protocol (MCP) server to the external network.

**Learning:** When initializing network servers (e.g., HTTP, WebSocket, TCP) intended strictly for local communication, omitting the host parameter inadvertently widens the attack surface.

**Prevention:** Always explicitly pass `'127.0.0.1'` (or `'localhost'`) as the host argument when calling `.listen(port, host)` or initializing server options (e.g., `new WebSocketServer({ port, host: '127.0.0.1' })`) to enforce strict local-only binding.
