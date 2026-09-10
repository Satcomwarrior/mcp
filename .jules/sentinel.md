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
## 2024-05-24 - Navigation URL Protocol Bypass
**Vulnerability:** URL normalization in `src/utils/navigation-url.ts` was susceptible to XSS/LFI via control characters bypassing whitespace trimming (`\x01javascript:alert(1)`) and Node's URL constructor treating schema-less URLs prefixed with `http://` unexpectedly.
**Learning:** `String.trim()` does not strip all control characters. Relying purely on parsed output validation without stripping control characters allows dangerous protocols like `javascript:` and `file:` to bypass naive regex schema matching.
**Prevention:** Strip control characters (`/[\x00-\x1F\s]+/g`), check for missing schemes using `!url.includes("://")`, and enforce a strict startswith blocklist on the lowercased input *before* prepending default schemes.
## 2024-05-24 - URL Scheme Detection Regression Risk
**Vulnerability:** When fixing URL protocol bypasses, replacing regex-based scheme detection (`/^[a-zA-Z][a-zA-Z\d+.-]*:/`) with a naive `!url.includes("://")` causes critical regressions. A schemeless URL containing `://` in its path or query string (e.g., `example.com?redirect=https://...`) will erroneously skip getting the required `http://` prefix and crash the `URL` constructor.
**Learning:** Naive substring matching is insufficient for detecting URL schemes because the target substring (`://`) can validly appear elsewhere in a schemeless URL.
**Prevention:** Always use precise anchoring (`^`) when validating the presence of schemes at the start of a URL string to prevent false positive matches deeper in the payload.
