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
## 2024-07-04 - Strict URL Protocol Validation in Headless Browsers
**Vulnerability:** The browser navigation tool failed to strictly validate URL protocols, allowing dangerous URIs like `file:` and `javascript:` which can lead to LFI and XSS attacks.
**Learning:** In headless browser tools built for MCP, URLs passed by users must be explicitly validated and strictly limited to known safe protocols (e.g., `http:`, `https:`) because Node.js's built-in `URL` class correctly parses inputs like `localhost:3000` but evaluates them with `localhost:` as the protocol, which complicates missing protocol checks. Additionally, dangerous protocol checks must use lowercase/trimmed values to bypass obfuscation.
**Prevention:** Explicitly block dangerous protocols via `startsWith` string checks, enforce default `http:` protocols for missing schemes using robust regex (`/^[a-zA-Z][a-zA-Z\d+\-.]*:/`), and validate parsed final `URL` objects against an explicit protocol allowlist (`http:`, `https:`).
