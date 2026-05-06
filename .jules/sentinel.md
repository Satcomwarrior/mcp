## 2026-02-23 - [Critical] Command Injection in Port Management

**Vulnerability:** A Command Injection vulnerability was found in `src/utils/port.ts` within the `killProcessOnPort` function. The `port` argument was directly interpolated into a shell command string (`execSync`) without validation. While typed as `number`, runtime input (e.g., from untrusted config or bypass) could inject malicious commands like `"3000; rm -rf /"`.

**Learning:** TypeScript types (`number`) do not guarantee runtime safety for sensitive operations like `execSync`. Always validate inputs that reach shell commands, even if they appear to be typed safely.

**Prevention:**
1.  **Strict Input Validation:** Added `validatePort` to strictly check for integers and valid port range (0-65535).
2.  **Use Safer APIs:** Where possible, use `execFile` or `spawn` which treat arguments as data, not code. In this case, validation was the chosen fix as `execSync` with shell features (pipes, `findstr`) was required for the specific logic.

## 2026-02-23 - [Critical] Server Binding to All Interfaces
**Vulnerability:** Node.js local network servers (`WebSocketServer` and `net.createServer`) were instantiated without an explicit `host` parameter, causing them to bind to all network interfaces (`::` or `0.0.0.0`) by default. This exposed the unauthenticated browser automation endpoint to the external network.
**Learning:** Local automation endpoints must never rely on default host bindings in Node.js, as the default behavior exposes the port to any machine on the same network.
**Prevention:** Always explicitly provide the `host: '127.0.0.1'` configuration parameter when instantiating local network servers to restrict access to the local machine.
