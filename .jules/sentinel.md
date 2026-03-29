## 2026-02-23 - [Critical] Command Injection in Port Management

**Vulnerability:** A Command Injection vulnerability was found in `src/utils/port.ts` within the `killProcessOnPort` function. The `port` argument was directly interpolated into a shell command string (`execSync`) without validation. While typed as `number`, runtime input (e.g., from untrusted config or bypass) could inject malicious commands like `"3000; rm -rf /"`.

**Learning:** TypeScript types (`number`) do not guarantee runtime safety for sensitive operations like `execSync`. Always validate inputs that reach shell commands, even if they appear to be typed safely.

**Prevention:**
1.  **Strict Input Validation:** Added `validatePort` to strictly check for integers and valid port range (0-65535).
2.  **Use Safer APIs:** Where possible, use `execFile` or `spawn` which treat arguments as data, not code. In this case, validation was the chosen fix as `execSync` with shell features (pipes, `findstr`) was required for the specific logic.

## 2026-03-29 - [High] Insecure Network Binding in Node.js Local Servers

**Vulnerability:** The WebSocket server (`src/ws.ts`) and the port checking utility (`src/utils/port.ts`) were not explicitly binding to a host interface. In Node.js, this defaults to binding to all available network interfaces (`0.0.0.0` or `::`), unintentionally exposing local development/automation servers to the entire network rather than restricting them to the local machine (`127.0.0.1`).

**Learning:** When using Node.js network server creation utilities like `net.createServer().listen(port)` or third-party server wrappers like `ws`'s `WebSocketServer`, omitting the `host` parameter defaults to binding to all network interfaces. This can silently open up local administrative or automation endpoints to unauthorized external access.

**Prevention:** Always explicitly pass `host: "127.0.0.1"` (or `"localhost"`) when checking local ports or instantiating local servers that should not be reachable over external networks.
