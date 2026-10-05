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
## 2026-02-23 - [Medium] WHATWG URL C0 Control Character Trimming Evasion

**Vulnerability:** The WHATWG URL standard (`new URL()`) actively ignores and strips C0 control characters (e.g., `\x01`) at the beginning and end of a URL. Standard JavaScript `String.trim()` only removes whitespace. Relying on `.trim()` for URL sanitization prior to applying explicit protocol enforcement allowlists (e.g., checking if the URL starts with `javascript:`) can lead to normalization evasion and XSS.
**Learning:** Never rely exclusively on `.trim()` when validating URLs that will be subsequently parsed by `new URL()`. Control characters missed by `.trim()` can trick custom regexes or substring checks, while `new URL()` happily strips them and processes the malicious scheme.
**Prevention:** Aggressively strip both whitespace and C0 control characters (e.g., using `.replace(/^[\s\x00-\x1F]+|[\s\x00-\x1F]+$/g, "")`) before applying security validations to URL inputs.
