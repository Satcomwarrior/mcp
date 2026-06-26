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
## 2026-02-23 - [Critical] Local File Inclusion via Unvalidated Navigation URL

**Vulnerability:** The browser automation `navigate` tool accepted raw URLs without validating the protocol. This allowed navigation to potentially dangerous URIs like `file:///etc/passwd` or `javascript:alert(1)`, enabling Local File Inclusion (LFI) and execution of unauthorized Javascript (XSS).
**Learning:** Tools integrating with headless browsers must strictly enforce protocol allowlists on URLs before navigating. Attempting to parse raw strings can lead to unexpected vulnerabilities if the protocol is not verified. Furthermore, the `new URL()` constructor can unexpectedly parse URLs like `localhost:3000` with `localhost:` as the protocol unless a default schema like `http://` is provided.
**Prevention:**
1. Prepend `http://` for schemaless URLs.
2. Explictly wrap `new URL()` in a `try...catch` block.
3. Validate that the `.protocol` property is strictly `http:` or `https:`. If not, fail securely with an appropriate error message and prevent the navigation.
