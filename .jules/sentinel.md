# Sentinel Journal

This journal documents critical security learnings and vulnerabilities found in the codebase.

## 2024-05-22 - Initial Setup
**Vulnerability:** N/A
**Learning:** Initial setup of security journal.
**Prevention:** N/A

## 2024-05-22 - Command Injection in Process Management
**Vulnerability:** The `killProcessOnPort` function in `src/utils/port.ts` directly interpolated the `port` argument into a shell command (`execSync`) without validation. While the function typed `port` as `number`, runtime values (e.g., from `any` or user input) could inject shell commands if not strictly validated.
**Learning:** Even if a function expects a number, strict runtime validation is necessary when the value is used in a dangerous sink like `execSync`. TypeScript types are erased at runtime and do not guarantee safety against malicious input from external sources.
**Prevention:** Added strict runtime validation `Number.isInteger(port)` and range checks (0-65535) before using the value in shell commands.
