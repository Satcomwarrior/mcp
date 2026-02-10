## 2024-05-22 - [Local Server Exposure and Command Injection]
**Vulnerability:** The WebSocket server bound to `0.0.0.0` by default, exposing the local browser automation tool to the network. Also, `killProcessOnPort` lacked input validation, risking command injection if the port input was tainted.
**Learning:** `ws` WebSocketServer defaults to binding to all interfaces if `host` is not specified. Helper functions using `execSync` need strict runtime type checking even in TypeScript projects.
**Prevention:** Always specify `host: "127.0.0.1"` for local servers. Validate all inputs to shell command execution functions.
