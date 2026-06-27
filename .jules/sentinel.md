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
## 2025-02-27 - [Critical] Unvalidated URI Scheme in Browser Automation

**Vulnerability:** The `navigate` tool in Browser MCP allowed arbitrary URLs to be passed directly to the browser. This permitted dangerous URI schemes such as `file://` (leading to Local File Inclusion / directory traversal), `javascript:` (Cross-Site Scripting within the browser context), and `data:` or `about:`.

**Learning:** When building tools for headless/automated browsers, treating user-supplied strings as safe URLs is highly dangerous. Browsers will readily execute or expose sensitive data if provided with internal schemes.

**Prevention:**
1. Always implement strict URL validation using an allowlist approach (only `http:` and `https:`).
2. Before validating against the allowlist, explicitly block or handle dangerous schemes (like `javascript:`, `file:`, `data:`, `about:`) and ensure the string is trimmed and lowercased to prevent bypasses.
3. Use the robust `URL` constructor to correctly parse and extract the protocol for validation, rather than relying on simple string matching.
