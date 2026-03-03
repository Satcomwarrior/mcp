## 2026-02-23 - [Critical] Command Injection in Port Management

**Vulnerability:** A Command Injection vulnerability was found in `src/utils/port.ts` within the `killProcessOnPort` function. The `port` argument was directly interpolated into a shell command string (`execSync`) without validation. While typed as `number`, runtime input (e.g., from untrusted config or bypass) could inject malicious commands like `"3000; rm -rf /"`.

**Learning:** TypeScript types (`number`) do not guarantee runtime safety for sensitive operations like `execSync`. Always validate inputs that reach shell commands, even if they appear to be typed safely.

**Prevention:**
1.  **Strict Input Validation:** Added `validatePort` to strictly check for integers and valid port range (0-65535).
2.  **Use Safer APIs:** Where possible, use `execFile` or `spawn` which treat arguments as data, not code. In this case, validation was the chosen fix as `execSync` with shell features (pipes, `findstr`) was required for the specific logic.
## 2025-02-28 - Command Injection Risk in Shell Piping
**Vulnerability:** Shell execution tools like `execSync` combined with string formatting allow for command injection, especially when piping output using `|` or executing string commands that haven't been sanitized. The `killProcessOnPort` function passed a dynamic user input (`port`) to a shell execution pipeline.
**Learning:** Using piping logic (`| xargs`, `| findstr`) inside a `execSync` string requires a shell to run, opening the door for command injections if inputs are not stringently checked, even with numeric validators, as future code refactors might miss it.
**Prevention:** Avoid `execSync` with complex shell commands. Instead, use `execFileSync` passing arguments as an array (`["-ano"]`), as it executes the process directly without invoking a shell. Parse the standard output in Node.js instead of relying on shell operators.
