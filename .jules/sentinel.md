## 2026-02-23 - [Critical] Command Injection in Port Management

**Vulnerability:** A Command Injection vulnerability was found in `src/utils/port.ts` within the `killProcessOnPort` function. The `port` argument was directly interpolated into a shell command string (`execSync`) without validation. While typed as `number`, runtime input (e.g., from untrusted config or bypass) could inject malicious commands like `"3000; rm -rf /"`.

**Learning:** TypeScript types (`number`) do not guarantee runtime safety for sensitive operations like `execSync`. Always validate inputs that reach shell commands, even if they appear to be typed safely.

**Prevention:**
1.  **Strict Input Validation:** Added `validatePort` to strictly check for integers and valid port range (0-65535).
2.  **Use Safer APIs:** Where possible, use `execFile` or `spawn` which treat arguments as data, not code. In this case, validation was the chosen fix as `execSync` with shell features (pipes, `findstr`) was required for the specific logic.

## 2026-04-12 - [Critical] Information Leakage in Tool Execution
**Vulnerability:** The MCP tool execution handler (`CallToolRequestSchema` in `src/server.ts`) directly returned raw error strings (`String(error)`) to the client. This exposes the application to potential information leakage, such as internal paths, stack traces, or database schema details.
**Learning:** Fail securely. Always catch errors and return generic, non-descriptive error messages to clients while securely logging the actual error details on the server side.
**Prevention:** Never use `String(error)` or `error.message` directly in client-facing API responses. Establish a standard practice of logging the detailed error and responding with a safe, predefined error string.

## 2026-04-12 - [Critical] Unintended Network Exposure via Default Host Binding
**Vulnerability:** Node.js network utilities (`net.createServer().listen(port)` and `ws` `WebSocketServer({ port })`) default to binding to all available network interfaces (`0.0.0.0` or `::`). In `src/ws.ts` and `src/utils/port.ts`, this inadvertently exposed the local MCP server to the external network.
**Learning:** Always be explicit with network bindings. Do not rely on default host behaviors when starting local servers or checking ports, as defaults often favor accessibility over security.
**Prevention:** Always explicitly pass `'127.0.0.1'` as the `host` argument when creating local servers (`new WebSocketServer({ port, host: '127.0.0.1' })` or `server.listen(port, '127.0.0.1')`) to restrict access to the local machine.
