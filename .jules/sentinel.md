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
## 2024-10-13 - URL Control Character Bypass
**Vulnerability:** URL protocol allowlists relying on `String.trim()` could be bypassed using C0 control characters (e.g. `\x01javascript:alert(1)`), which `trim()` misses but WHATWG `new URL()` automatically strips during parsing.
**Learning:** `trim()` only removes whitespace, not all non-printable characters. If input is later parsed by a tolerant URL parser, a TOCTOU-like mismatch occurs between the string validation phase and the parsing phase.
**Prevention:** Aggressively strip C0 control characters (0x00-0x1F) using regex (e.g. `.replace(/^[\s\x00-\x1F]+|[\s\x00-\x1F]+$/g, "")`) before any validation logic to align with standard URL parsing behavior.
