# Sentinel Journal

## 2025-02-10 - Command Injection in Utility Function
**Vulnerability:** Unsanitized `port` argument in `killProcessOnPort` allowed command injection via `execSync`.
**Learning:** Utility functions in internal modules are often implicitly trusted but can become dangerous gadgets if inputs are not validated.
**Prevention:** Always validate numeric inputs before string interpolation in shell commands, even in internal code.
