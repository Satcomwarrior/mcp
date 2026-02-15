## 2025-02-18 - [Command Injection in Port Management]
**Vulnerability:** `killProcessOnPort` in `src/utils/port.ts` used `execSync` with string interpolation of the `port` argument directly into a shell command, allowing potential command injection if `port` was not validated.
**Learning:** Even typed arguments (like `port: number`) must be validated at runtime when used in sensitive operations like shell execution, as Typescript types are erased at runtime and do not guarantee safety against malicious input.
**Prevention:** Always use `Number.isInteger()` and range checks for numeric inputs before using them in shell commands, or prefer `execFile`/`spawn` with argument arrays to avoid shell interpretation.
