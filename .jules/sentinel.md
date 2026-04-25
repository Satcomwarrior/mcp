## 2026-02-23 - [Critical] Command Injection in Port Management

**Vulnerability:** A Command Injection vulnerability was found in `src/utils/port.ts` within the `killProcessOnPort` function. The `port` argument was directly interpolated into a shell command string (`execSync`) without validation. While typed as `number`, runtime input (e.g., from untrusted config or bypass) could inject malicious commands like `"3000; rm -rf /"`.

**Learning:** TypeScript types (`number`) do not guarantee runtime safety for sensitive operations like `execSync`. Always validate inputs that reach shell commands, even if they appear to be typed safely.

**Prevention:**
1.  **Strict Input Validation:** Added `validatePort` to strictly check for integers and valid port range (0-65535).
2.  **Use Safer APIs:** Where possible, use `execFile` or `spawn` which treat arguments as data, not code. In this case, validation was the chosen fix as `execSync` with shell features (pipes, `findstr`) was required for the specific logic.

## 2026-02-23 - [HIGH] Insecure Server Binding

**Vulnerability:** The local WebSocket server in `src/ws.ts` and port checking logic in `src/utils/port.ts` bind to the default address (`0.0.0.0` or `::`), exposing the services on all network interfaces instead of restricting them to localhost.

**Learning:** Node.js HTTP/WebSocket server constructors without an explicit host bind to `::` by default. This makes the local tooling accessible to devices on the same local network, which can be a severe risk without authentication.

**Prevention:** Always specify `host: '127.0.0.1'` when starting servers or running local networking tooling meant only for internal/local consumption.
