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
## 2025-02-23 - URL Protocol Validation in Headless Browsers
**Vulnerability:** The `navigate` tool accepted arbitrary URLs without protocol validation, allowing `javascript:`, `file:`, and other dangerous URIs.
**Learning:** Failing to validate URL protocols enables critical vulnerabilities like Local File Inclusion (LFI) via `file://` or Cross-Site Scripting (XSS) via `javascript:` URIs. Using Node's URL parser can be tricky with domains like `localhost:3000` as it parses `localhost:` as the protocol, requiring careful handling when strictly enforcing allowlists.
**Prevention:** Strictly enforce a protocol allowlist (`http:`, `https:`) and explicitly block dangerous URI schemes using string matching on trimmed, lowercase URLs.
