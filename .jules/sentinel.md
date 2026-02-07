## 2026-02-07 - Secure WebSocket Binding
**Vulnerability:** WebSocketServer bound to 0.0.0.0 (all interfaces) by default.
**Learning:** Node.js network servers often default to binding to all interfaces, exposing them to the local network. This is critical for MCP servers that control local tools.
**Prevention:** Explicitly bind to `127.0.0.1` for local-only services.
