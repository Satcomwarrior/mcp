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
## 2024-10-23 - URL Validation Bypass via C0 Control Characters
**Vulnerability:** URL validation bypass where inputs like `\x01javascript:alert(1)` successfully evades explicit protocol checks while remaining parsable by `new URL()`.
**Learning:** `String.prototype.trim()` only removes standard whitespace. The WHATWG URL standard natively strips leading/trailing C0 control characters (`\x00-\x1F`, `\x7F`) during parsing. Because `trim()` leaves control characters intact, a string prefixing a dangerous scheme with a control character will bypass a custom regex scheme check (`EXPLICIT_SCHEME.test()`), resulting in the logic falsely identifying it as a "schemeless" URL or prefixing it improperly, while `new URL()` evaluates it as the dangerous scheme.
**Prevention:** Aggressively strip both whitespace and C0 control characters (e.g., `.replace(/^[\s\x00-\x1F\x7F]+|[\s\x00-\x1F\x7F]+$/g, "")`) *before* applying custom URL scheme validation logic to ensure the regex checks exactly what the `URL` parser will evaluate.
