## 2025-02-12 - Command Injection via execSync
**Vulnerability:** Command injection in `killProcessOnPort` function where `port` argument was directly concatenated into shell commands (`lsof`, `taskkill`) without validation.
**Learning:** Even when inputs are typed as `number`, runtime values can be malicious strings (especially when called from JS or untrusted sources), allowing arbitrary command execution via `execSync`.
**Prevention:** Validate all inputs used in shell commands. Ensure numeric inputs are strictly integers. Prefer `child_process.spawn` or `execFile` over `exec` / `execSync` to avoid shell interpretation where possible.
