## 2024-10-24 - Default Network Exposure and Command Injection
**Vulnerability:** The WebSocket server defaulted to binding to `0.0.0.0`, and `execSync` used unvalidated inputs for shell commands.
**Learning:** Node.js/ws defaults to listening on all interfaces, which is insecure for local tools. TypeScript types do not prevent runtime injection in shell commands.
**Prevention:** Explicitly bind to `127.0.0.1` for local servers. Always validate inputs to `execSync` at runtime, even if typed as numbers.
