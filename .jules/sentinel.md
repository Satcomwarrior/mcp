## 2026-02-23 - [Critical] Command Injection in Port Management

**Vulnerability:** A Command Injection vulnerability was found in `src/utils/port.ts` within the `killProcessOnPort` function. The `port` argument was directly interpolated into a shell command string (`execSync`) without validation. While typed as `number`, runtime input (e.g., from untrusted config or bypass) could inject malicious commands like `"3000; rm -rf /"`.

**Learning:** TypeScript types (`number`) do not guarantee runtime safety for sensitive operations like `execSync`. Always validate inputs that reach shell commands, even if they appear to be typed safely.

**Prevention:**
1.  **Strict Input Validation:** Added `validatePort` to strictly check for integers and valid port range (0-65535).
2.  **Use Safer APIs:** Where possible, use `execFile` or `spawn` which treat arguments as data, not code. In this case, validation was the chosen fix as `execSync` with shell features (pipes, `findstr`) was required for the specific logic.

## 2026-02-23 - [Critical] Insecure Network Binding in WebSocket Server

**Vulnerability:** The `WebSocketServer` in `src/ws.ts` and the `isPortInUse` check in `src/utils/port.ts` were implicitly binding to all network interfaces (`0.0.0.0` or `::`) by only specifying the port. This inadvertently exposed the local automation server, which executes potentially sensitive commands, to external network access.
**Learning:** Node.js network servers bind to 'all interfaces' by default if a host is not explicitly provided. For local tools and automation servers, this creates a significant security risk by exposing them to the local network.
**Prevention:** Always explicitly bind local-only servers to `host: '127.0.0.1'` (or `localhost`) to enforce strict local access boundaries and prevent external network exposure.
