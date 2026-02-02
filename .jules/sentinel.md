# Sentinel Journal

## 2024-10-18 - Localhost Binding
**Vulnerability:** WebSocket server bound to `0.0.0.0` (all interfaces) by default.
**Learning:** `ws.WebSocketServer` and `net.Server` bind to all interfaces if `host` is not specified, exposing internal tools to the network.
**Prevention:** Always specify `host: "127.0.0.1"` when creating servers intended for local use.
