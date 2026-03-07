## 2026-02-23 - [Critical] Command Injection in Port Management

**Vulnerability:** A Command Injection vulnerability was found in `src/utils/port.ts` within the `killProcessOnPort` function. The `port` argument was directly interpolated into a shell command string (`execSync`) without validation. While typed as `number`, runtime input (e.g., from untrusted config or bypass) could inject malicious commands like `"3000; rm -rf /"`.

**Learning:** TypeScript types (`number`) do not guarantee runtime safety for sensitive operations like `execSync`. Always validate inputs that reach shell commands, even if they appear to be typed safely.

**Prevention:**
1.  **Strict Input Validation:** Added `validatePort` to strictly check for integers and valid port range (0-65535).
2.  **Use Safer APIs:** Where possible, use `execFile` or `spawn` which treat arguments as data, not code. In this case, validation was the chosen fix as `execSync` with shell features (pipes, `findstr`) was required for the specific logic.

## 2026-02-23 - [Medium] Information Exposure via Error Messages in Tool/Resource Handlers

**Vulnerability:** The MCP server exposed raw error strings and stack traces to clients when tool execution or resource reading failed. This can leak internal file paths, API structure, dependency versions, and business logic to unauthenticated or unauthorized users, violating the "fail securely" principle.

**Learning:** Error boundaries must be established at the interface level (e.g., API boundaries, tool handlers, resource handlers). While raw errors are useful for debugging, they should never cross this boundary to external clients.

**Prevention:**
1. **Sanitize Errors:** Catch all exceptions at the outermost boundary before they are returned to the client.
2. **Log Internally:** Use server-side logging (e.g., `debugLog`) to record the full error details, including stack traces, for debugging purposes.
3. **Return Generic Errors:** Send standardized, opaque error messages to the client (e.g., "An internal error occurred while executing the tool.") that provide no insight into the internal workings or failure mode of the application.
