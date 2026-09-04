## 2026-02-23 - [Critical] Command Injection in Port Management

**Vulnerability:** A Command Injection vulnerability was found in `src/utils/port.ts` within the `killProcessOnPort` function. The `port` argument was directly interpolated into a shell command string (`execSync`) without validation. While typed as `number`, runtime input (e.g., from untrusted config or bypass) could inject malicious commands like `"3000; rm -rf /"`.

**Learning:** TypeScript types (`number`) do not guarantee runtime safety for sensitive operations like `execSync`. Always validate inputs that reach shell commands, even if they appear to be typed safely.

**Prevention:**
1.  **Strict Input Validation:** Added `validatePort` to strictly check for integers and valid port range (0-65535).
2.  **Use Safer APIs:** Where possible, use `execFile` or `spawn` which treat arguments as data, not code. In this case, validation was the chosen fix as `execSync` with shell features (pipes, `findstr`) was required for the specific logic.
## 2024-05-13 - [Default Server Binding Exposing Automation Endpoints]
**Vulnerability:** Node.js `net.createServer()` and `WebSocketServer` bind to all network interfaces (`::` or `0.0.0.0`) by default if no host is specified, exposing local automation endpoints to external networks.
**Learning:** Internal tools relying on default Node.js host binding can become remote code execution vectors.
**Prevention:** Always explicitly provide the `host: '127.0.0.1'` configuration parameter when instantiating local network servers.
## 2023-09-03 - Protocol Validation & Schema-less URL Parsing in Node.js
**Vulnerability:** XSS and LFI vulnerabilities via headless browser navigation to dangerous schemes (`javascript:`, `file:`, `data:`).
**Learning:** Node's `URL` constructor parses schema-less URLs with ports (e.g., `localhost:3000`) by treating the host as the protocol (`localhost:`). This makes regex-based protocol extraction brittle. Attackers can bypass naive normalization by mixing casing or leading spaces.
**Prevention:** Strictly trim whitespace and lowercase strings before validation. Manually prepend default schemes for schema-less URLs to ensure safe and predictable parsing by the `URL` constructor. Pass the strictly parsed `parsedUrl.href` downstream to prevent TOCTOU evasion.
