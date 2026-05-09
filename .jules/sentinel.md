## 2026-02-23 - [Critical] Command Injection in Port Management

**Vulnerability:** A Command Injection vulnerability was found in `src/utils/port.ts` within the `killProcessOnPort` function. The `port` argument was directly interpolated into a shell command string (`execSync`) without validation. While typed as `number`, runtime input (e.g., from untrusted config or bypass) could inject malicious commands like `"3000; rm -rf /"`.

**Learning:** TypeScript types (`number`) do not guarantee runtime safety for sensitive operations like `execSync`. Always validate inputs that reach shell commands, even if they appear to be typed safely.

**Prevention:**
1.  **Strict Input Validation:** Added `validatePort` to strictly check for integers and valid port range (0-65535).
2.  **Use Safer APIs:** Where possible, use `execFile` or `spawn` which treat arguments as data, not code. In this case, validation was the chosen fix as `execSync` with shell features (pipes, `findstr`) was required for the specific logic.
## 2024-05-28 - Local Server Network Exposure via Default Binding
**Vulnerability:** Node.js local network servers (`WebSocketServer` and `net.createServer().listen`) defaulted to binding to all interfaces (`::` or `0.0.0.0`) when no host was explicitly provided.
**Learning:** In a browser automation context where dynamic ports are checked or opened, omitting the host implicitly exposes these internal endpoints to the external network, which could allow local network attackers to connect and control the automation server.
**Prevention:** Always explicitly define the host configuration parameter (e.g., `host: "127.0.0.1"`) when instantiating local network or websocket servers in Node.js.
