## 2026-02-23 - [Critical] Command Injection in Port Management

**Vulnerability:** A Command Injection vulnerability was found in `src/utils/port.ts` within the `killProcessOnPort` function. The `port` argument was directly interpolated into a shell command string (`execSync`) without validation. While typed as `number`, runtime input (e.g., from untrusted config or bypass) could inject malicious commands like `"3000; rm -rf /"`.

**Learning:** TypeScript types (`number`) do not guarantee runtime safety for sensitive operations like `execSync`. Always validate inputs that reach shell commands, even if they appear to be typed safely.

**Prevention:**
1.  **Strict Input Validation:** Added `validatePort` to strictly check for integers and valid port range (0-65535).
2.  **Use Safer APIs:** Where possible, use `execFile` or `spawn` which treat arguments as data, not code. In this case, validation was the chosen fix as `execSync` with shell features (pipes, `findstr`) was required for the specific logic.

## 2026-02-23 - [Critical] SSRF/LFI in Navigation Tool

**Vulnerability:** An SSRF (Server-Side Request Forgery) and LFI (Local File Inclusion) vulnerability was identified in `src/tools/common.ts` within the `navigate` tool. The `url` argument was passed directly to the browser automation service without protocol validation, allowing attackers to navigate to `file:///etc/passwd` or internal network resources.

**Learning:** Browser automation tools are powerful proxies. If they accept URLs from users (or LLMs acting on user instructions), those URLs must be strictly validated to prevent access to local files or internal networks.

**Prevention:**
1.  **Protocol Whitelisting:** Implemented `validateUrl` in `src/utils/url.ts` to strictly allow only `http:` and `https:` protocols.
2.  **Defense in Depth:** Even if the downstream browser automation service has its own checks, the MCP server must validate inputs at the boundary.
