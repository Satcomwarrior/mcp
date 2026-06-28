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
## 2024-10-27 - [Critical] SSRF/LFI/XSS via Unvalidated Headless Browser Navigation

**Vulnerability:** The `navigate` tool in `src/tools/common.ts` accepted arbitrary URLs and passed them directly to the headless browser. This allowed navigation to `file://` URIs (leading to Local File Inclusion), `javascript:` URIs (leading to XSS within the browser profile), and arbitrary internal addresses (SSRF).

**Learning:** When building tools that control a local browser, treating URLs as safe strings is extremely dangerous. The browser will eagerly execute dangerous protocols if instructed to navigate to them.

**Prevention:**
1.  **Strict Protocol Allowlisting:** Enforce that navigation URLs strictly use `http:` or `https:`.
2.  **String Normalization:** Trim and lowercase inputs before checking against dangerous protocol lists (`javascript:`, `file:`, etc.) to prevent bypasses like mixed-casing or leading spaces.
3.  **Default Scheme Enforcement:** If a scheme is omitted (e.g., `localhost:3000`), prepend a default scheme (`http://`) *after* ensuring it does not start with a dangerous protocol string, preventing accidental bypasses.
