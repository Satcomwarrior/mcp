## 2026-02-23 - [Critical] Command Injection in Port Management

**Vulnerability:** A Command Injection vulnerability was found in `src/utils/port.ts` within the `killProcessOnPort` function. The `port` argument was directly interpolated into a shell command string (`execSync`) without validation. While typed as `number`, runtime input (e.g., from untrusted config or bypass) could inject malicious commands like `"3000; rm -rf /"`.

**Learning:** TypeScript types (`number`) do not guarantee runtime safety for sensitive operations like `execSync`. Always validate inputs that reach shell commands, even if they appear to be typed safely.

**Prevention:**
1.  **Strict Input Validation:** Added `validatePort` to strictly check for integers and valid port range (0-65535).
2.  **Use Safer APIs:** Where possible, use `execFile` or `spawn` which treat arguments as data, not code. In this case, validation was the chosen fix as `execSync` with shell features (pipes, `findstr`) was required for the specific logic.

## 2026-02-24 - [High] SSRF/LFI Risk in Navigation Tool

**Vulnerability:** The `navigate` tool in `src/tools/common.ts` accepted arbitrary URL strings without validation. This could allow an attacker (or hallucinating LLM) to access local files via `file:///` or execute arbitrary JavaScript via `javascript:` protocols (SSRF/LFI).

**Learning:** Navigation tools must explicitly whitelist allowed protocols (`http`, `https`) to prevent access to the local filesystem or internal network resources.

**Prevention:**
1.  **Protocol Whitelisting:** Implemented `validateUrl` helper in `src/utils/url.ts` to strictly enforce `http:` and `https:` protocols.
2.  **Input Validation:** Applied this validation at the entry point of the `navigate` tool handler.
