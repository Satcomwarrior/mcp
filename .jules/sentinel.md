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
## 2026-02-23 - [Critical] SSRF and LFI via Unvalidated Navigation URLs

**Vulnerability:** A critical Server-Side Request Forgery (SSRF) and Local File Inclusion (LFI) vulnerability was found in `src/tools/common.ts` within the `navigate` tool handler. The `url` argument was passed directly to the automation browser without any scheme or protocol validation. This allowed an agent to be manipulated into navigating to `file://` URIs to read sensitive local files on the host machine, or `javascript:` URIs to execute arbitrary code within the browser context.

**Learning:** When building tools that control headless browsers, trusting the LLM or user-provided URL string is extremely dangerous. Browsers inherently support many powerful and potentially dangerous URI schemes beyond just HTTP/HTTPS.

**Prevention:**
1.  **Strict Scheme Validation:** Always explicitly deny known dangerous prefixes (like `javascript:`, `file:`, `data:`, `about:`).
2.  **Parser Enforced Allowlists:** Use a robust URL parser (like the WHATWG `URL` constructor in Node.js) to enforce an allowlist of safe protocols (e.g., strictly `http:` and `https:`). Never rely solely on string matching, as parsers may interpret malformed strings differently than a simple regex.
3.  **Default Protocols:** If a URL lacks a scheme, prepend a default safe scheme (`http://`) before parsing to prevent the parser from misinterpreting a domain (e.g., `localhost:3000`) as a scheme (`localhost:`).
