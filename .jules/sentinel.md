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
## 2024-05-13 - [HIGH] Unvalidated URL Protocols in Headless Browser Automation

**Vulnerability:** The `navigate` tool accepted arbitrary URLs without validating their protocols, allowing dangerous schemes like `javascript:` for XSS or `file:` for Local File Inclusion (LFI).
**Learning:** Headless browser automation must always strictly validate target URLs to explicitly allow only safe protocols (`http:`, `https:`). Trimming whitespace and using lowercase checks are necessary to prevent bypasses.
**Prevention:** Always enforce a strict protocol allowlist (`http:`, `https:`) and safely prepend a default scheme if none is provided. Reject any string starting with `javascript:`, `file:`, `data:`, or `about:`.
