## 2026-02-23 - [Critical] Command Injection in Port Management

**Vulnerability:** A Command Injection vulnerability was found in `src/utils/port.ts` within the `killProcessOnPort` function. The `port` argument was directly interpolated into a shell command string (`execSync`) without validation. While typed as `number`, runtime input (e.g., from untrusted config or bypass) could inject malicious commands like `"3000; rm -rf /"`.

**Learning:** TypeScript types (`number`) do not guarantee runtime safety for sensitive operations like `execSync`. Always validate inputs that reach shell commands, even if they appear to be typed safely.

**Prevention:**
1.  **Strict Input Validation:** Added `validatePort` to strictly check for integers and valid port range (0-65535).
2.  **Use Safer APIs:** Where possible, use `execFile` or `spawn` which treat arguments as data, not code. In this case, validation was the chosen fix as `execSync` with shell features (pipes, `findstr`) was required for the specific logic.

## 2026-03-04 - [High] SSRF/LFI Vulnerability in Browser Navigation

**Vulnerability:** A Server-Side Request Forgery (SSRF) and Local File Inclusion (LFI) vulnerability was found in `src/tools/common.ts` within the `navigate` tool handler. The `url` argument provided by the agent/user was passed directly to `browser_navigate` without validating the URL scheme/protocol. This could allow navigating to unsafe protocols like `file://` to access local files or `javascript:` to execute arbitrary code.

**Learning:** Merely parsing a URL or validating that it is a string is insufficient security for navigation. We must actively restrict navigation to safe, explicitly allowed protocols to prevent SSRF and LFI attacks.

**Prevention:**
1.  **Protocol Allowlist:** Implemented `validateUrl` in `src/utils/url.ts` to explicitly check that the parsed `URL.protocol` is either `http:` or `https:`.
2.  **Input Validation before Action:** Added the protocol validation step inside the `navigate` tool handler *before* sending the message to the browser extension, stopping unsafe navigation at the source.
