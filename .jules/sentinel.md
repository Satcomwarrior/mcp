## 2026-02-11 - Command Injection in Utility Function
**Vulnerability:** `killProcessOnPort` in `src/utils/port.ts` accepted unvalidated number input, which, if coerced from an untrusted string (e.g., config/env), could allow arbitrary command execution via `execSync` shell metacharacters.
**Learning:** Even utility functions typed as taking `number` must validate their inputs at runtime if they are used in security-critical contexts like shell execution, because TS types are erased and inputs can be manipulated.
**Prevention:** Always validate inputs to `exec`, `execSync`, `spawn`, etc., especially when constructing shell commands. Prefer `execFile` or `spawn` with argument arrays over shell strings where possible.
