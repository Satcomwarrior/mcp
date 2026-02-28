## 2024-06-05 - [CRITICAL] Prevent SSRF and LFI via Unsafe Browser Protocols
**Vulnerability:** The `navigate` tool in browser automation accepted any URL schema, which allowed dangerous protocols like `file://` (Local File Inclusion) or `javascript:` (XSS / Code Execution) to be executed by the browser.
**Learning:** Browser navigation actions exposed through APIs (like MCP) must strictly control allowed protocols because browsers handle many powerful internal protocols by default.
**Prevention:** Always enforce a strict whitelist (e.g., `http:`, `https:`) for any user-provided URL before passing it to browser navigation APIs.
