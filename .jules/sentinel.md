## 2026-02-23 - [Critical] Command Injection in Port Management

**Vulnerability:** A Command Injection vulnerability was found in `src/utils/port.ts` within the `killProcessOnPort` function. The `port` argument was directly interpolated into a shell command string (`execSync`) without validation. While typed as `number`, runtime input (e.g., from untrusted config or bypass) could inject malicious commands like `"3000; rm -rf /"`.

**Learning:** TypeScript types (`number`) do not guarantee runtime safety for sensitive operations like `execSync`. Always validate inputs that reach shell commands, even if they appear to be typed safely.

**Prevention:**
1.  **Strict Input Validation:** Added `validatePort` to strictly check for integers and valid port range (0-65535).
2.  **Use Safer APIs:** Where possible, use `execFile` or `spawn` which treat arguments as data, not code. In this case, validation was the chosen fix as `execSync` with shell features (pipes, `findstr`) was required for the specific logic.

## 2026-05-10 - [CRITICAL] Fix exposed local server by binding to localhost
**Vulnerability:** `WebSocketServer` in `src/ws.ts` and `net.createServer().listen()` in `src/utils/port.ts` were binding to all interfaces (`0.0.0.0` or `::`) by default because a host string was not passed.
**Learning:** In Node.js, network servers that omit the `host` parameter will bind to all available IP interfaces (IPv4 and/or IPv6) on the system. If exposed, this allows external devices on the local network (or the public internet) to connect to sensitive internal automation servers.
**Prevention:** Always explicitly pass `host: "127.0.0.1"` or `host: "localhost"` when instantiating local network servers in Node.js to ensure they bind exclusively to the loopback interface.
