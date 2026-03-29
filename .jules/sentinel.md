## 2026-02-23 - [Critical] Command Injection in Port Management

**Vulnerability:** A Command Injection vulnerability was found in `src/utils/port.ts` within the `killProcessOnPort` function. The `port` argument was directly interpolated into a shell command string (`execSync`) without validation. While typed as `number`, runtime input (e.g., from untrusted config or bypass) could inject malicious commands like `"3000; rm -rf /"`.

**Learning:** TypeScript types (`number`) do not guarantee runtime safety for sensitive operations like `execSync`. Always validate inputs that reach shell commands, even if they appear to be typed safely.

**Prevention:**
1.  **Strict Input Validation:** Added `validatePort` to strictly check for integers and valid port range (0-65535).
2.  **Use Safer APIs:** Where possible, use `execFile` or `spawn` which treat arguments as data, not code. In this case, validation was the chosen fix as `execSync` with shell features (pipes, `findstr`) was required for the specific logic.
## $(date +%Y-%m-%d) - Local Server Interface Binding and Cross-Platform Tools

**Vulnerability:** The local WebSocket server (`ws.ts`) and port checker (`utils/port.ts`) were binding to `0.0.0.0` (all network interfaces) by default, exposing the browser automation controls to unauthorized external network access. Additionally, the manual port killing script relied on `xargs -r`, which breaks on macOS/BSD environments.
**Learning:** Node.js defaults to binding to all available network interfaces (`0.0.0.0` or `::`) unless explicitly instructed to bind to the local loopback (`127.0.0.1`). Furthermore, relying on GNU-specific shell extensions like `xargs -r` introduces cross-platform regressions. The safest approach is handling standard exit codes (like `lsof`'s exit code 1 for no processes found) programmatically in Node.js instead of shell pipelines.
**Prevention:** Always explicitly define `host: "127.0.0.1"` when creating network services or listeners intended for local-only communication. Avoid complex shell pipelines (`|`) in process management scripts; instead, parse outputs and gracefully handle standard UNIX exit codes directly in Node.js to ensure robust cross-platform compatibility.
