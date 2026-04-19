## 2026-02-23 - [Critical] Command Injection in Port Management

**Vulnerability:** A Command Injection vulnerability was found in `src/utils/port.ts` within the `killProcessOnPort` function. The `port` argument was directly interpolated into a shell command string (`execSync`) without validation. While typed as `number`, runtime input (e.g., from untrusted config or bypass) could inject malicious commands like `"3000; rm -rf /"`.

**Learning:** TypeScript types (`number`) do not guarantee runtime safety for sensitive operations like `execSync`. Always validate inputs that reach shell commands, even if they appear to be typed safely.

**Prevention:**
1.  **Strict Input Validation:** Added `validatePort` to strictly check for integers and valid port range (0-65535).
2.  **Use Safer APIs:** Where possible, use `execFile` or `spawn` which treat arguments as data, not code. In this case, validation was the chosen fix as `execSync` with shell features (pipes, `findstr`) was required for the specific logic.

## 2026-02-23 - [Critical] Insecure Network Server Binding

**Vulnerability:** The local WebSocket server (`ws.ts`) and port checker (`utils/port.ts`) were listening on all network interfaces by omitting the `host` parameter, potentially exposing the local tool to external network attacks.
**Learning:** By default, Node.js (`net.createServer`) and `ws` (`WebSocketServer`) bind to `::` (all interfaces, IPv6) or `0.0.0.0` (all interfaces, IPv4) when only a port is specified. This is dangerous for local tools.
**Prevention:** Always explicitly set `host: "127.0.0.1"` when creating network servers that are intended to be local-only.
