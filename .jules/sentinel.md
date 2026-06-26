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

## 2024-06-20 - [High] Insecure Navigation Protocol Handling

**Vulnerability:** The browser `navigate` tool lacked protocol validation for target URLs. It did not restrict navigation to safe protocols (HTTP/HTTPS) and could have inadvertently navigated to dangerous URIs like `file://` or `javascript:` when parsing raw user input, creating risks for SSRF, LFI, or XSS.

**Learning:** When building tools for browser automation, target URLs must be strictly validated. Furthermore, Node's `URL` constructor evaluates strings like 'localhost:3000' with 'localhost:' as the protocol. Before prepending `http://` to schemeless URLs, you must explicitly exclude dangerous prefix URIs to prevent them from becoming valid but malicious HTTP paths.

**Prevention:** Validate all URLs used in browser automation to strictly allow only `http:` and `https:` protocols. When adding default schemes, first check and exclude known dangerous URI schemes.
