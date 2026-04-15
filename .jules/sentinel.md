## 2026-02-23 - [Critical] Command Injection in Port Management

**Vulnerability:** A Command Injection vulnerability was found in `src/utils/port.ts` within the `killProcessOnPort` function. The `port` argument was directly interpolated into a shell command string (`execSync`) without validation. While typed as `number`, runtime input (e.g., from untrusted config or bypass) could inject malicious commands like `"3000; rm -rf /"`.

**Learning:** TypeScript types (`number`) do not guarantee runtime safety for sensitive operations like `execSync`. Always validate inputs that reach shell commands, even if they appear to be typed safely.

**Prevention:**
1.  **Strict Input Validation:** Added `validatePort` to strictly check for integers and valid port range (0-65535).
2.  **Use Safer APIs:** Where possible, use `execFile` or `spawn` which treat arguments as data, not code. In this case, validation was the chosen fix as `execSync` with shell features (pipes, `findstr`) was required for the specific logic.

## 2025-01-20 - [Critical] Eliminating Shell Execution in Port Management

**Vulnerability:** Shell execution was still being used for process termination via `execSync("lsof -ti:${port} | xargs kill -9")` despite input validation, keeping a theoretical shell injection path open.
**Learning:** Shell commands with pipes and filters can be completely replaced by parsing process outputs (via `execFileSync` without a shell) and using standard Node APIs like `process.kill`.
**Prevention:** Do not rely on input validation alone when unsafe sinks (`execSync`) can be fully replaced by safe alternatives (`execFileSync` with argument arrays and `process.kill`).
