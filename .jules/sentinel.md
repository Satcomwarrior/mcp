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
## 2024-05-24 - [Critical] Unvalidated URL Protocols in Browser Navigation
**Vulnerability:** The MCP `navigate` tool accepted arbitrary URLs and passed them directly to the browser automation context without protocol validation. This allowed dangerous URI schemes like `file://` (enabling Local File Inclusion/LFI) and `javascript:` (enabling Cross-Site Scripting/XSS RCE).
**Learning:** When building tools for browser automation (e.g., MCP navigate tools), target URLs must be strictly validated to explicitly allow only safe protocols (`http:`, `https:`).
**Prevention:** Implement strict URL parsing and protocol validation on all user-supplied navigation targets. Specifically, check for and block dangerous schemes (like `javascript:`, `file:`, `data:`, `about:`) before prepending default schemes, and verify the final parsed URL uses `http:` or `https:`.
