## 2026-03-27 - [Critical] Unintended External Network Exposure

**Vulnerability:** A network exposure vulnerability was found in `src/ws.ts` and `src/utils/port.ts`. The `WebSocketServer` and the `net.createServer().listen(port)` utility were binding to all network interfaces (`0.0.0.0` or `::`) by default because a specific host was not provided. This could unintentionally expose the local Model Context Protocol (MCP) server to the local network or internet, allowing unauthorized access to the browser automation tools.

**Learning:** In Node.js, network server creation utilities (like `net.createServer` or `ws.WebSocketServer`) default to binding to all available network interfaces if a host is not explicitly specified. This is a common footgun for local tools that only intend to communicate over the loopback interface.

**Prevention:**
1.  **Explicit Loopback Binding:** Always explicitly pass `'127.0.0.1'` (or `'localhost'`) as the host argument when creating local servers or checking ports to ensure they are only accessible from the local machine.
