## 2026-02-23 - [Critical] Command Injection in Port Management

**Vulnerability:** A Command Injection vulnerability was found in `src/utils/port.ts` within the `killProcessOnPort` function. The `port` argument was directly interpolated into a shell command string (`execSync`) without validation. While typed as `number`, runtime input (e.g., from untrusted config or bypass) could inject malicious commands like `"3000; rm -rf /"`.

**Learning:** TypeScript types (`number`) do not guarantee runtime safety for sensitive operations like `execSync`. Always validate inputs that reach shell commands, even if they appear to be typed safely.

**Prevention:**
1.  **Strict Input Validation:** Added `validatePort` to strictly check for integers and valid port range (0-65535).
2.  **Use Safer APIs:** Where possible, use `execFile` or `spawn` which treat arguments as data, not code. In this case, validation was the chosen fix as `execSync` with shell features (pipes, `findstr`) was required for the specific logic.

## 2026-02-26 - [High] Protocol Bypass in Browser Navigation

**Vulnerability:** The `navigate` tool in `src/tools/common.ts` accepted any valid URL string, including `file://` and `javascript:` protocols. This could allow an attacker (or a compromised LLM) to access local files (LFI) or execute arbitrary JavaScript via the controlled browser instance.

**Learning:** URL validation libraries (like Zod's `.url()`) often only check format compliance, not protocol safety. `file:///etc/passwd` is a valid URL but unsafe in this context.

**Prevention:**
1.  **Strict Protocol Whitelisting:** Implemented `validateUrl` helper to explicitly whitelist only `http:` and `https:` protocols.
2.  **Explicit Validation Layer:** Always add a dedicated validation step for sensitive inputs (like URLs passed to browser automation) beyond basic type checking.
