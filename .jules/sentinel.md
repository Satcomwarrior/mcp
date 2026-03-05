## 2026-02-23 - [Critical] Command Injection in Port Management

**Vulnerability:** A Command Injection vulnerability was found in `src/utils/port.ts` within the `killProcessOnPort` function. The `port` argument was directly interpolated into a shell command string (`execSync`) without validation. While typed as `number`, runtime input (e.g., from untrusted config or bypass) could inject malicious commands like `"3000; rm -rf /"`.

**Learning:** TypeScript types (`number`) do not guarantee runtime safety for sensitive operations like `execSync`. Always validate inputs that reach shell commands, even if they appear to be typed safely.

**Prevention:**
1.  **Strict Input Validation:** Added `validatePort` to strictly check for integers and valid port range (0-65535).
2.  **Use Safer APIs:** Where possible, use `execFile` or `spawn` which treat arguments as data, not code. In this case, validation was the chosen fix as `execSync` with shell features (pipes, `findstr`) was required for the specific logic.

## 2024-05-24 - Command Injection via execSync with Shell Pipes
**Vulnerability:** The `killProcessOnPort` function used `execSync` with unsanitized shell commands like \`lsof -ti:${port} | xargs kill -9\`. While `port` was validated as an integer, using `execSync` with shell pipes and interpolation creates a systemic command injection risk if validation is ever bypassed or refactored.
**Learning:** `execSync` always runs in a shell when a string is passed, interpreting shell metacharacters (`|`, `>`, `&`). This is a common vector for command injection.
**Prevention:** Always use `execFileSync` (or `execFile`) with an array of arguments for OS commands. It explicitly bypasses the shell, passing arguments directly to the executable, neutralizing any embedded shell metacharacters. Shell pipes should be replaced with native Node.js data handling (e.g., parsing `lsof` output and iterating in a loop to call `kill`).
