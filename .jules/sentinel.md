## 2026-02-23 - [Critical] Command Injection in Port Management

**Vulnerability:** A Command Injection vulnerability was found in `src/utils/port.ts` within the `killProcessOnPort` function. The `port` argument was directly interpolated into a shell command string (`execSync`) without validation. While typed as `number`, runtime input (e.g., from untrusted config or bypass) could inject malicious commands like `"3000; rm -rf /"`.

**Learning:** TypeScript types (`number`) do not guarantee runtime safety for sensitive operations like `execSync`. Always validate inputs that reach shell commands, even if they appear to be typed safely.

**Prevention:**
1.  **Strict Input Validation:** Added `validatePort` to strictly check for integers and valid port range (0-65535).
2.  **Use Safer APIs:** Where possible, use `execFile` or `spawn` which treat arguments as data, not code. In this case, validation was the chosen fix as `execSync` with shell features (pipes, `findstr`) was required for the specific logic.

## 2026-02-24 - [High] Insecure Network Binding Exposing Local Server

**Vulnerability:** The local `WebSocketServer` and the temporary port-checking `net.createServer()` instance were omitting the `host` parameter. In Node.js, omitting this defaults to binding on all available network interfaces (`0.0.0.0` or `::`), exposing internal tool processes to unauthorized external networks.

**Learning:** When using Node.js network servers like `ws`'s `WebSocketServer` or `net.createServer()` for local communication, they implicitly bind to `0.0.0.0`. This is a common footgun that unintentionally exposes servers designed only for local loopback access.

**Prevention:** Always explicitly bind local-only servers to `host: "127.0.0.1"`. For `WebSocketServer`, pass it in the options object: `new WebSocketServer({ port, host: "127.0.0.1" })`. For `net.Server`, supply it to the listen method: `server.listen(port, "127.0.0.1")`.
