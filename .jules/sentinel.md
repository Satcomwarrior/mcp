## 2026-02-23 - [Critical] Command Injection in Port Management

**Vulnerability:** A Command Injection vulnerability was found in `src/utils/port.ts` within the `killProcessOnPort` function. The `port` argument was directly interpolated into a shell command string (`execSync`) without validation. While typed as `number`, runtime input (e.g., from untrusted config or bypass) could inject malicious commands like `"3000; rm -rf /"`.

**Learning:** TypeScript types (`number`) do not guarantee runtime safety for sensitive operations like `execSync`. Always validate inputs that reach shell commands, even if they appear to be typed safely.

**Prevention:**
1.  **Strict Input Validation:** Added `validatePort` to strictly check for integers and valid port range (0-65535).
2.  **Use Safer APIs:** Where possible, use `execFile` or `spawn` which treat arguments as data, not code. In this case, validation was the chosen fix as `execSync` with shell features (pipes, `findstr`) was required for the specific logic.

## 2025-02-23 - [Critical] Insecure Network Interface Binding in Local Servers

**Vulnerability:** Node.js network servers (`net.createServer()`, `new WebSocketServer()`) default to binding to all available network interfaces (`::` or `0.0.0.0`) when no host is explicitly provided. This exposes local services externally, which is a critical risk for internal/local development tools.

**Learning:** Omitting the `host` parameter when starting network services in Node.js creates unintentional public exposure. This pattern was identified in `src/utils/port.ts` and `src/ws.ts`.

**Prevention:** Always explicitly provide `'127.0.0.1'` as the `host` parameter when calling `.listen(port, host)` or initializing server options (e.g., `{ port, host: '127.0.0.1' }`) to enforce local-only access.
