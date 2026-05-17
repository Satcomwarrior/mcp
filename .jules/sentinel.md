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
## 2026-02-23 - [Critical] SSRF and Local File Inclusion in Navigation Tool

**Vulnerability:** The `navigate` tool in `src/tools/common.ts` accepted unvalidated URLs from users, passing them directly to the browser via the `browser_navigate` command. This lack of validation opened the door to Server-Side Request Forgery (SSRF) and Local File Inclusion (LFI) via dangerous protocols like `file://` (reading local files) or `javascript:` (executing arbitrary scripts).

**Learning:** Zod's `z.string().url()` only verifies syntax, not semantic safety. It allows dangerous schemes like `file://` by default. Relying solely on schema validation for URLs is insufficient to prevent SSRF or LFI.

**Prevention:**
1. **Explicit Protocol Validation:** Always parse external URLs using `new URL()` and explicitly verify `url.protocol` against an allowlist (e.g., `['http:', 'https:']`).
2. **Handle Default Schemes:** Browser-like inputs often omit protocols (e.g., `localhost:3000`). Prepend a default scheme (`https://`) before parsing to prevent errors and ensure accurate protocol extraction.
3. **Safe Parsing:** Wrap `new URL()` instantiation in a `try...catch` block to handle malformed URLs securely without crashing the application.
