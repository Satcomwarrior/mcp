## 2026-02-23 - [Critical] Command Injection in Port Management

**Vulnerability:** A Command Injection vulnerability was found in `src/utils/port.ts` within the `killProcessOnPort` function. The `port` argument was directly interpolated into a shell command string (`execSync`) without validation. While typed as `number`, runtime input (e.g., from untrusted config or bypass) could inject malicious commands like `"3000; rm -rf /"`.

**Learning:** TypeScript types (`number`) do not guarantee runtime safety for sensitive operations like `execSync`. Always validate inputs that reach shell commands, even if they appear to be typed safely.

**Prevention:**
1.  **Strict Input Validation:** Added `validatePort` to strictly check for integers and valid port range (0-65535).
2.  **Use Safer APIs:** Where possible, use `execFile` or `spawn` which treat arguments as data, not code. In this case, validation was the chosen fix as `execSync` with shell features (pipes, `findstr`) was required for the specific logic.

## 2024-05-18 - [Critical] Unintended Network Exposure in WebSocketServer

**Vulnerability:** The WebSocketServer in `src/ws.ts` was instantiated with `new WebSocketServer({ port })` without specifying a `host`. By default, Node.js and the `ws` library bind to `0.0.0.0` or `::` (all network interfaces), potentially exposing local automation tools and context to external networks.
**Learning:** Default server configurations often prioritize accessibility over security. Always explicitly bind local-only services to `127.0.0.1` (localhost) to enforce strict network boundaries.
**Prevention:**
1. **Explicit Host Binding:** Ensure all local servers (like `WebSocketServer` and `net.Server`) explicitly include `host: "127.0.0.1"` in their configuration.
2. **Matching Port Checks:** When checking port availability (`src/utils/port.ts`), verify the specific interface (`127.0.0.1`) that the application intends to bind to, ensuring consistency between availability checks and actual server behavior.
