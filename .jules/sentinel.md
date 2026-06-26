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
## 2026-06-08 - Prevent LFI/XSS via unsafe protocols in NavigateTool
**Vulnerability:** The browser `navigate` tool accepted any URL without validating the protocol. This allowed an agent or user to pass dangerous schemes like `javascript:` (enabling Cross-Site Scripting) or `file:` (enabling Local File Inclusion and arbitrary file reads).
**Learning:** In headless browser or browser automation tools, the URL endpoint must be strictly verified. The `URL` constructor provides a secure way to parse and inspect protocols, but developers often assume the browser will handle safety, leading to direct pass-through of malicious inputs.
**Prevention:** Always validate protocols against a strict allowlist (e.g., `http:`, `https:`) before passing URLs to automation endpoints. Beware of inputs that lack a scheme (e.g., `example.com`), as pre-pending `http://` must not accidentally wrap a dangerous scheme (e.g., `http://javascript:alert(1)`).
