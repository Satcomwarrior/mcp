## 2026-02-23 - [Critical] Command Injection in Port Management

**Vulnerability:** A Command Injection vulnerability was found in `src/utils/port.ts` within the `killProcessOnPort` function. The `port` argument was directly interpolated into a shell command string (`execSync`) without validation. While typed as `number`, runtime input (e.g., from untrusted config or bypass) could inject malicious commands like `"3000; rm -rf /"`.

**Learning:** TypeScript types (`number`) do not guarantee runtime safety for sensitive operations like `execSync`. Always validate inputs that reach shell commands, even if they appear to be typed safely.

**Prevention:**
1.  **Strict Input Validation:** Added `validatePort` to strictly check for integers and valid port range (0-65535).
2.  **Use Safer APIs:** Where possible, use `execFile` or `spawn` which treat arguments as data, not code. In this case, validation was the chosen fix as `execSync` with shell features (pipes, `findstr`) was required for the specific logic.

## 2026-02-23 - [Critical] SSRF/LFI in Navigate Tool

**Vulnerability:** The `navigate` tool only validated that the input was a syntactically valid URL using Zod, but failed to restrict the protocol scheme. This allowed for Local File Inclusion (LFI) via `file://` or potentially XSS/SSRF via other schemes like `javascript://`.

**Learning:** Syntax validation (like `z.string().url()`) is insufficient for URL inputs that interact with external or internal resources. Explicit protocol allowlisting is mandatory.

**Prevention:** Always enforce protocol allowlists (e.g., `http:` and `https:`) using the `URL` API (`new URL(url).protocol`) when accepting URLs as input for navigation or fetching tools.
