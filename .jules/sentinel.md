## 2026-02-23 - [Critical] Command Injection in Port Management

**Vulnerability:** A Command Injection vulnerability was found in `src/utils/port.ts` within the `killProcessOnPort` function. The `port` argument was directly interpolated into a shell command string (`execSync`) without validation. While typed as `number`, runtime input (e.g., from untrusted config or bypass) could inject malicious commands like `"3000; rm -rf /"`.

**Learning:** TypeScript types (`number`) do not guarantee runtime safety for sensitive operations like `execSync`. Always validate inputs that reach shell commands, even if they appear to be typed safely.

**Prevention:**
1.  **Strict Input Validation:** Added `validatePort` to strictly check for integers and valid port range (0-65535).
2.  **Use Safer APIs:** Where possible, use `execFile` or `spawn` which treat arguments as data, not code. In this case, validation was the chosen fix as `execSync` with shell features (pipes, `findstr`) was required for the specific logic.

## 2026-02-23 - [Critical] SSRF via Unrestricted URL Navigation Tool

**Vulnerability:** The `navigate` tool in `src/tools/common.ts` accepted an untrusted URL string from the client and passed it directly to the browser automation layer. The URL was structurally validated by a schema but its protocol was never checked. This allowed a malicious user/model to navigate the server's browser to local files (e.g., `file:///etc/passwd`) or execute scripts via `javascript:` URIs, leading to Severe Server-Side Request Forgery (SSRF) and Local File Inclusion (LFI).

**Learning:** URL format validation (checking if it looks like a URL) is fundamentally different from Protocol validation. Tool endpoints that direct server-side resources to fetch or navigate to URIs must strictly allow-list safe protocols (`http:`, `https:`).

**Prevention:** Always parse untrusted URLs using the native `URL` constructor and validate `parsedUrl.protocol` against an explicit allowlist (e.g., `['http:', 'https:']`) before passing the URI to any execution or fetching context.

## 2026-02-23 - [High] Insecure Network Binding in Automation Servers

**Vulnerability:** The project instantiated internal Node.js servers (a `net.Server` for port checking in `src/utils/port.ts` and a `WebSocketServer` for MCP connections in `src/ws.ts`) without explicitly specifying a host. By default, Node.js binds to `0.0.0.0` (all IPv4 interfaces), unnecessarily exposing these internal automation/management endpoints to the external network and local LAN.

**Learning:** Default behavior in Node.js networking libraries often prioritizes convenience (binding to all interfaces) over security. Internal services should never be routable from the outside unless explicitly required.

**Prevention:** Always explicitly pass `'127.0.0.1'` or `'::1'` as the `host` argument when calling `server.listen()` or creating server instances (like `new WebSocketServer({ port, host: '127.0.0.1' })`) for internal tools.