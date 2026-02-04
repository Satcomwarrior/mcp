# Sentinel's Journal

## 2025-02-18 - [CRITICAL] Unrestricted WebSocket Binding
**Vulnerability:** The WebSocket server was binding to `0.0.0.0` (all interfaces) by default, exposing the browser automation capabilities to the local network.
**Learning:** Default behaviors of libraries (like `ws` binding to all interfaces) can be insecure for local-only tools.
**Prevention:** Explicitly bind to `127.0.0.1` for local servers to prevent network exposure.
