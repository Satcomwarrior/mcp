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
## 2025-02-28 - URL Validation Bypass via Control Characters
**Vulnerability:** URL protocol validation using regex/allowlists can be bypassed by prepending C0 control characters (e.g., `\x01javascript:alert(1)`) if only `String.trim()` is used.
**Learning:** The WHATWG URL standard (`new URL()`) strips leading and trailing C0 control characters. `String.trim()` misses these control characters. As a result, custom regex validation might fail to see the `javascript:` protocol, but `new URL()` successfully parses it as a valid javascript scheme, leading to XSS or LFI risks in navigation tools.
**Prevention:** Aggressively strip both whitespace and C0 control characters (e.g., using `.replace(/^[\s\x00-\x1F]+|[\s\x00-\x1F]+$/g, "")`) on user-provided URLs before applying protocol allowlists or passing them to `new URL()`.
