## 2026-02-23 - [Critical] Command Injection in Port Management

**Vulnerability:** A Command Injection vulnerability was found in `src/utils/port.ts` within the `killProcessOnPort` function. The `port` argument was directly interpolated into a shell command string (`execSync`) without validation. While typed as `number`, runtime input (e.g., from untrusted config or bypass) could inject malicious commands like `"3000; rm -rf /"`.

**Learning:** TypeScript types (`number`) do not guarantee runtime safety for sensitive operations like `execSync`. Always validate inputs that reach shell commands, even if they appear to be typed safely.

**Prevention:**
1.  **Strict Input Validation:** Added `validatePort` to strictly check for integers and valid port range (0-65535).
2.  **Use Safer APIs:** Where possible, use `execFile` or `spawn` which treat arguments as data, not code. In this case, validation was the chosen fix as `execSync` with shell features (pipes, `findstr`) was required for the specific logic.
## 2026-03-08 - [Prevent Shell Injection with execFileSync]
**Vulnerability:** Shell injection vulnerability via `execSync` due to the usage of user inputs or unsafe arguments (e.g. `execSync(\`lsof -ti:${port} | xargs kill -9\`)`).
**Learning:** Using `execSync` with template literals introduces shell injection risks. Always prefer `execFileSync` to bypass the shell interpreter and parse the output in Node.js instead of utilizing shell loops/pipes, even when input types like numbers are used, as TypeScript types aren't a runtime guarantee.
**Prevention:** Use `execFileSync` with an array of arguments, executing commands like `lsof` directly and handling the string parsing logic securely within Node.js to mitigate potential command execution flaws.
