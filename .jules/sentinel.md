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
## 2024-05-18 - URL Protocol Validation Bypass via Control Characters
**Vulnerability:** A URL parsing bypass where dangerous URLs starting with C0 control characters (e.g., `\x01javascript:alert(1)`) were bypassing the explicit scheme regex (`/^[a-zA-Z]...:/`) due to the leading whitespace being ignored by `.trim()`. However, `new URL()` automatically strips these leading control characters, resulting in the dangerous URL being successfully parsed.
**Learning:** `String.prototype.trim()` only removes standard whitespace, but the WHATWG URL standard (used by `new URL()`) strips a broader set of characters, including all C0 control characters (`\x00-\x1F`). This discrepancy between validation logic and parsing logic leads to dangerous bypasses.
**Prevention:** When building custom validation logic or normalizing URLs before passing them to `new URL()`, aggressively strip both whitespace and C0 control characters using a regex like `.replace(/^[\s\x00-\x1F]+|[\s\x00-\x1F]+$/g, "")` instead of just `.trim()`.
