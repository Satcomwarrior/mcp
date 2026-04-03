## 2026-02-23 - [Critical] Command Injection in Port Management

**Vulnerability:** A Command Injection vulnerability was found in `src/utils/port.ts` within the `killProcessOnPort` function. The `port` argument was directly interpolated into a shell command string (`execSync`) without validation. While typed as `number`, runtime input (e.g., from untrusted config or bypass) could inject malicious commands like `"3000; rm -rf /"`.

**Learning:** TypeScript types (`number`) do not guarantee runtime safety for sensitive operations like `execSync`. Always validate inputs that reach shell commands, even if they appear to be typed safely.

**Prevention:**
1.  **Strict Input Validation:** Added `validatePort` to strictly check for integers and valid port range (0-65535).
2.  **Use Safer APIs:** Where possible, use `execFile` or `spawn` which treat arguments as data, not code. In this case, validation was the chosen fix as `execSync` with shell features (pipes, `findstr`) was required for the specific logic.

## 2024-05-24 - [HIGH] Unsafe Default Network Binding (0.0.0.0)
**Vulnerability:** The WebSocket Server and temporary check servers were defaulting to binding on all interfaces (0.0.0.0 or ::), exposing them outside of localhost. This allows cross-site WebSocket hijacking or unauthorized access from anyone on the local network.
**Learning:** `new WebSocketServer({ port })` and `server.listen(port)` default to external binding in Node.js.
**Prevention:** Always explicitly provide the host as `"127.0.0.1"` when instantiating internal communication servers.
