## 2026-02-23 - [Critical] Command Injection in Port Management

**Vulnerability:** A Command Injection vulnerability was found in `src/utils/port.ts` within the `killProcessOnPort` function. The `port` argument was directly interpolated into a shell command string (`execSync`) without validation. While typed as `number`, runtime input (e.g., from untrusted config or bypass) could inject malicious commands like `"3000; rm -rf /"`.

**Learning:** TypeScript types (`number`) do not guarantee runtime safety for sensitive operations like `execSync`. Always validate inputs that reach shell commands, even if they appear to be typed safely.

**Prevention:**
1.  **Strict Input Validation:** Added `validatePort` to strictly check for integers and valid port range (0-65535).
2.  **Use Safer APIs:** Where possible, use `execFile` or `spawn` which treat arguments as data, not code. In this case, validation was the chosen fix as `execSync` with shell features (pipes, `findstr`) was required for the specific logic.

## 2026-03-09 - [High] SSRF/LFI Risk in Navigate Tool via Missing Protocol Validation

**Vulnerability:** A Server-Side Request Forgery (SSRF) and Local File Inclusion (LFI) vulnerability was found in `src/tools/common.ts` within the `navigate` tool. The `url` argument passed to `browser_navigate` lacked protocol validation. Zod's `url()` schema only verifies structural validity, not protocol safety. This meant an attacker could exploit the tool by providing malicious URLs with protocols like `file:///` or `gopher://`.

**Learning:** URL structure validation (via types or schema tools like Zod) does not guarantee protocol safety. Always explicitly parse untrusted URLs using the `URL` constructor and validate the `protocol` property against an allowlist (e.g., `['http:', 'https:']`).

**Prevention:**
1.  **Protocol Allowlist:** Created `validateUrl` in `src/utils/url.ts` to explicitly check the `url.protocol` and reject unsafe protocols.
2.  **Early Validation:** Ensured `validateUrl` runs immediately before passing the URL to internal socket messages.
