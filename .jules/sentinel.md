## 2026-02-23 - [Critical] Command Injection in Port Management

**Vulnerability:** A Command Injection vulnerability was found in `src/utils/port.ts` within the `killProcessOnPort` function. The `port` argument was directly interpolated into a shell command string (`execSync`) without validation. While typed as `number`, runtime input (e.g., from untrusted config or bypass) could inject malicious commands like `"3000; rm -rf /"`.

**Learning:** TypeScript types (`number`) do not guarantee runtime safety for sensitive operations like `execSync`. Always validate inputs that reach shell commands, even if they appear to be typed safely.

**Prevention:**
1.  **Strict Input Validation:** Added `validatePort` to strictly check for integers and valid port range (0-65535).
2.  **Use Safer APIs:** Where possible, use `execFile` or `spawn` which treat arguments as data, not code. In this case, validation was the chosen fix as `execSync` with shell features (pipes, `findstr`) was required for the specific logic.

## 2026-02-23 - [Critical] Server Binding Exposure
**Vulnerability:** Node.js WebSocket and `net` servers omitted the `host` parameter, defaulting to listening on all interfaces (`0.0.0.0` or `::`). This exposes local automation APIs to external networks.
**Learning:** Explicitly passing `host: '127.0.0.1'` is required for any server that should only be accessed locally, as defaults prioritize external accessibility over local security.
**Prevention:** Always define `host: '127.0.0.1'` when calling `server.listen()` or instantiating a `WebSocketServer` for internal-only services.
