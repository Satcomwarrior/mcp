## 2026-02-23 - [Critical] Command Injection in Port Management

**Vulnerability:** A Command Injection vulnerability was found in `src/utils/port.ts` within the `killProcessOnPort` function. The `port` argument was directly interpolated into a shell command string (`execSync`) without validation. While typed as `number`, runtime input (e.g., from untrusted config or bypass) could inject malicious commands like `"3000; rm -rf /"`.

**Learning:** TypeScript types (`number`) do not guarantee runtime safety for sensitive operations like `execSync`. Always validate inputs that reach shell commands, even if they appear to be typed safely.

**Prevention:**
1.  **Strict Input Validation:** Added `validatePort` to strictly check for integers and valid port range (0-65535).
2.  **Use Safer APIs:** Where possible, use `execFile` or `spawn` which treat arguments as data, not code. In this case, validation was the chosen fix as `execSync` with shell features (pipes, `findstr`) was required for the specific logic.

## 2026-04-06 - [High] Insecure Network Binding in Node.js Servers

**Vulnerability:** A default network binding vulnerability was found in `src/ws.ts` and `src/utils/port.ts`. When creating a server in Node.js (like `ws`'s `WebSocketServer` or `net.createServer()`) without explicitly specifying a host, it defaults to binding to all network interfaces (`0.0.0.0` or `::`). This unintentionally exposes the unauthenticated local tool endpoints to the entire external network, allowing potential unauthorized access.

**Learning:** Node.js server creation utilities have insecure default behaviors regarding host binding. Never rely on default host bindings for local services.

**Prevention:**
1. **Explicit Binding:** Always explicitly pass `host: '127.0.0.1'` as the host argument when checking ports or starting local servers to restrict access to localhost only.
