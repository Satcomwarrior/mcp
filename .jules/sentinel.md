## 2024-05-20 - Command Injection in Utility Functions
**Vulnerability:** Command injection risk in `src/utils/port.ts` where `killProcessOnPort` uses string interpolation with `execSync` without strict validation.
**Learning:** Utility functions that wrap shell commands are often overlooked but can become critical vulnerabilities if they accept untrusted input. Input validation must be strict (e.g., checking for integer types and ranges) before passing to shell execution.
**Prevention:** Always validate inputs to shell commands using strict type checks and allow-listing (e.g., ensuring ports are integers 0-65535). Use safer alternatives to `exec` when possible, or libraries that handle argument escaping.
