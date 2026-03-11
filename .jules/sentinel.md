## 2026-02-23 - [Critical] Command Injection in Port Management

**Vulnerability:** A Command Injection vulnerability was found in `src/utils/port.ts` within the `killProcessOnPort` function. The `port` argument was directly interpolated into a shell command string (`execSync`) without validation. While typed as `number`, runtime input (e.g., from untrusted config or bypass) could inject malicious commands like `"3000; rm -rf /"`.

**Learning:** TypeScript types (`number`) do not guarantee runtime safety for sensitive operations like `execSync`. Always validate inputs that reach shell commands, even if they appear to be typed safely.

**Prevention:**
1.  **Strict Input Validation:** Added `validatePort` to strictly check for integers and valid port range (0-65535).
2.  **Use Safer APIs:** Where possible, use `execFile` or `spawn` which treat arguments as data, not code. In this case, validation was the chosen fix as `execSync` with shell features (pipes, `findstr`) was required for the specific logic.

## 2026-02-23 - [High] Server-Side Request Forgery (SSRF) and Local File Inclusion (LFI) in Browser Navigation

**Vulnerability:** The `navigate` tool in `src/tools/common.ts` allowed any string URL to be passed directly to the browser extension (`browser_navigate`) without protocol validation. While the Zod schema restricted the input to a string, it did not enforce safe protocols. This allowed an attacker to craft malicious inputs like `file:///etc/passwd` to read local files, or `javascript:alert(1)` to execute cross-site scripting (XSS) in the context of the connected browser.

**Learning:** URL string validation via types or schemas (like Zod's `url()`) only verifies structure, not protocol safety. To prevent SSRF/LFI vulnerabilities, untrusted URLs should be parsed using the `URL` constructor and the `protocol` property explicitly validated against an allowlist.

**Prevention:**
1.  **Explicit Protocol Validation:** Implemented a strict `validateUrl` function in `src/utils/url.ts` that enforces the use of `http:` or `https:` protocols via the `URL` constructor, throwing detailed errors on violation.
2.  **Centralized Validation Integration:** Integrated the validation immediately before the tool payload is sent to the socket context in `src/tools/common.ts`.
