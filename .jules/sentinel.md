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
## 2025-05-14 - Fix URL Validation Control Character Bypass
**Vulnerability:** The URL normalization logic used `String.prototype.trim()` which fails to remove all control characters (e.g., \x01). This could allow bypassing scheme allowlists if the validation relies on substring matches.
**Learning:** Standard whitespace trimming is insufficient for URL sanitization in security contexts, as attackers can prepend non-printable control characters that are ignored by parsers but bypass initial string checks.
**Prevention:** Always aggressively strip control characters and whitespace using a regular expression (e.g., `/^[\x00-\x1F\s]+|[\x00-\x1F\s]+$/g`) before parsing or validating URLs.
