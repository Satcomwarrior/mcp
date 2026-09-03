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
## 2025-02-14 - SSRF and Protocol Abuse in Browser Navigation
**Vulnerability:** The browser `navigate` tool accepted unvalidated URL inputs, allowing dangerous protocols like `javascript:`, `file:`, and `data:` to be sent directly to the headless browser via sockets.
**Learning:** Raw input strings should never be passed unparsed directly to local automation boundaries. Relying purely on the browser context blocklists is insufficient. Checking protocols requires manual scheme handling (`http://`) before URL parsing to avoid Node URL parsing quirks for schema-less URLs (e.g. `localhost:3000` is parsed with protocol `localhost:`).
**Prevention:** Strictly enforce an allowlist for URL schemes (`http:`, `https:`) in a `navigate` or navigation handler. Always parse the URL using `new URL()`, validate the protocol, and pass the fully resolved and normalized URL string (`parsedUrl.href`) downstream, rather than the raw user input, to prevent Time-of-Check-to-Time-of-Use (TOCTOU) and normalization evasion.
