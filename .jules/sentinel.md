## 2026-02-23 - [Critical] Command Injection in Port Management

**Vulnerability:** A Command Injection vulnerability was found in `src/utils/port.ts` within the `killProcessOnPort` function. The `port` argument was directly interpolated into a shell command string (`execSync`) without validation. While typed as `number`, runtime input (e.g., from untrusted config or bypass) could inject malicious commands like `"3000; rm -rf /"`.

**Learning:** TypeScript types (`number`) do not guarantee runtime safety for sensitive operations like `execSync`. Always validate inputs that reach shell commands, even if they appear to be typed safely.

**Prevention:**
1.  **Strict Input Validation:** Added `validatePort` to strictly check for integers and valid port range (0-65535).
2.  **Use Safer APIs:** Where possible, use `execFile` or `spawn` which treat arguments as data, not code. In this case, validation was the chosen fix as `execSync` with shell features (pipes, `findstr`) was required for the specific logic.

## 2026-03-01 - [High] SSRF/LFI Vulnerability in Browser Navigation Tool

**Vulnerability:** The `navigate` tool (`src/tools/common.ts`) allowed parsing and sending an unvalidated URL directly to the browser via the `browser_navigate` command. An attacker could provide `file://` protocols to perform Local File Inclusion (LFI) accessing local files like `/etc/passwd` or use other internal schemes to execute Server-Side Request Forgery (SSRF) against localhost or internal networks.

**Learning:** URL string validation via types or schemas (e.g. `z.string().url()`) only verifies the structure, not the safety of the protocol scheme itself.

**Prevention:** Always parse untrusted URLs using the `URL` constructor and strictly validate the `protocol` property against an explicit allowlist (e.g., `["http:", "https:"]`) before using the URL in any outbound request or browser context. Created `src/utils/url.ts` to encapsulate this logic.
