## 2026-02-23 - [Critical] Command Injection in Port Management

**Vulnerability:** A Command Injection vulnerability was found in `src/utils/port.ts` within the `killProcessOnPort` function. The `port` argument was directly interpolated into a shell command string (`execSync`) without validation. While typed as `number`, runtime input (e.g., from untrusted config or bypass) could inject malicious commands like `"3000; rm -rf /"`.

**Learning:** TypeScript types (`number`) do not guarantee runtime safety for sensitive operations like `execSync`. Always validate inputs that reach shell commands, even if they appear to be typed safely.

**Prevention:**
1.  **Strict Input Validation:** Added `validatePort` to strictly check for integers and valid port range (0-65535).
2.  **Use Safer APIs:** Where possible, use `execFile` or `spawn` which treat arguments as data, not code. In this case, validation was the chosen fix as `execSync` with shell features (pipes, `findstr`) was required for the specific logic.

## 2026-02-23 - [Critical] SSRF/LFI in Browser Navigate Tool

**Vulnerability:** A critical SSRF (Server-Side Request Forgery) and LFI (Local File Inclusion) vulnerability was found in `src/tools/common.ts` within the `navigate` tool. The user-provided URL was passed directly to `sendSocketMessage("browser_navigate", { url })` without verifying the protocol scheme. This allowed navigating the browser to dangerous schemes like `file:///`, `javascript:`, or `data:`, potentially exposing local files or executing arbitrary scripts.

**Learning:** Relying purely on Zod's `url` validation is insufficient, as it only ensures the string is syntactically a URL. It does not enforce scheme security.

**Prevention:** Always parse the URL explicitly (e.g., using `new URL()`) and validate the `protocol` property against a strict allowlist (e.g., `["http:", "https:"]`) when accepting URLs for browser navigation or external requests.
