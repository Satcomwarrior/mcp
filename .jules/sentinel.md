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
## 2026-08-14 - URL Parsing Quirks in Node.js
**Vulnerability:** Headless browser navigation tools missing protocol allowlists can be exploited via dangerous URIs (e.g., `javascript:` for XSS, `file:` for LFI).
**Learning:** Node.js `URL` constructor parses strings like `localhost:3000` using `localhost:` as the protocol, which can complicate simple string-based protocol validation or `includes('://')` checks.
**Prevention:** Strictly parse the URL using the `URL` object, inspect the `.protocol` property explicitly, allow only `http:` and `https:`, and carefully handle fallback parsing (e.g., prepending `http://`) for URLs missing a scheme.
