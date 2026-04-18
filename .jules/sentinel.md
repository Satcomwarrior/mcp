## 2026-02-23 - [Critical] Command Injection in Port Management

**Vulnerability:** A Command Injection vulnerability was found in `src/utils/port.ts` within the `killProcessOnPort` function. The `port` argument was directly interpolated into a shell command string (`execSync`) without validation. While typed as `number`, runtime input (e.g., from untrusted config or bypass) could inject malicious commands like `"3000; rm -rf /"`.

**Learning:** TypeScript types (`number`) do not guarantee runtime safety for sensitive operations like `execSync`. Always validate inputs that reach shell commands, even if they appear to be typed safely.

**Prevention:**
1.  **Strict Input Validation:** Added `validatePort` to strictly check for integers and valid port range (0-65535).
2.  **Use Safer APIs:** Where possible, use `execFile` or `spawn` which treat arguments as data, not code. In this case, validation was the chosen fix as `execSync` with shell features (pipes, `findstr`) was required for the specific logic.

## 2024-05-18 - [Critical] Insecure Network Binding in WebSocketServer
**Vulnerability:** The `WebSocketServer` in `src/ws.ts` and the `net.Server` in `src/utils/port.ts` were bound to local ports without explicitly specifying a host interface. This implicitly binds the servers to `0.0.0.0` or `::` (all network interfaces), making the locally intended development services accessible from external networks.
**Learning:** Default behaviors of Node.js network servers like `ws`'s `WebSocketServer` or `node:net`'s `createServer().listen(port)` will bind to all available interfaces if a host is omitted. This can inadvertently expose development tools, IPC sockets, or MCP servers to the broader network.
**Prevention:** Always explicitly define the host binding (e.g., `host: "127.0.0.1"`) for local services to restrict access exclusively to the loopback interface.
