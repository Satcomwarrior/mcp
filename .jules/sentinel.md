## 2026-02-23 - [Critical] Command Injection in Port Management

**Vulnerability:** A Command Injection vulnerability was found in `src/utils/port.ts` within the `killProcessOnPort` function. The `port` argument was directly interpolated into a shell command string (`execSync`) without validation. While typed as `number`, runtime input (e.g., from untrusted config or bypass) could inject malicious commands like `"3000; rm -rf /"`.

**Learning:** TypeScript types (`number`) do not guarantee runtime safety for sensitive operations like `execSync`. Always validate inputs that reach shell commands, even if they appear to be typed safely.

**Prevention:**
1.  **Strict Input Validation:** Added `validatePort` to strictly check for integers and valid port range (0-65535).
2.  **Use Safer APIs:** Where possible, use `execFile` or `spawn` which treat arguments as data, not code. In this case, validation was the chosen fix as `execSync` with shell features (pipes, `findstr`) was required for the specific logic.
## 2025-02-28 - Replace execSync with execFileSync to prevent shell injection
**Vulnerability:** Use of `execSync` with unsanitized arguments or environment variables could allow shell injection, especially with complex pipeline commands.
**Learning:** `execSync` spins up a shell to run commands, exposing applications to injection vulnerabilities. Using `execFileSync` avoids the shell completely and provides process-level separation of command and arguments, which is a safer alternative. Node.js native child_process modules should use array-based argument passing.
**Prevention:** Prefer `execFileSync`, `execFile`, or `spawn` over `execSync` or `exec`. Explicitly split commands and their arguments instead of relying on shell execution parsing.
