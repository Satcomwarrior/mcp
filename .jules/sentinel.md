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
## 2024-05-24 - Unrestricted Protocol Navigation in Browser Automation
**Vulnerability:** The browser `navigate` tool allowed arbitrary URL protocols without validation, exposing the system to Local File Inclusion (LFI) via `file://` and Cross-Site Scripting (XSS) via `javascript:` URIs.
**Learning:** When building tools for browser automation (e.g., MCP navigate tools), target URLs must be strictly validated to explicitly allow only safe protocols (`http:`, `https:`). The native WHATWG `URL` constructor should be used securely within a `try...catch` block to handle unparseable inputs without leaking internal stack traces.
**Prevention:** Always validate URL protocols. Prepend a default scheme (e.g., `https://`) if missing before parsing. Explicitly check the `protocol` property of the parsed `URL` object against an allowlist (e.g., `['http:', 'https:']`) and throw a secure, generic error if validation fails.
