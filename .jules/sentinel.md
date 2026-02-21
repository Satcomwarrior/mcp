## 2024-05-22 - Command Injection via Utility Functions
**Vulnerability:** Found `killProcessOnPort` utility executing shell commands with unvalidated input.
**Learning:** Utility functions in `src/utils` are often assumed safe but can introduce critical vulnerabilities like Command Injection if they use `execSync` without strict input validation.
**Prevention:** Always validate inputs to shell commands using strict whitelists (e.g., `validatePort`) before execution, or avoid shell execution entirely if possible.
