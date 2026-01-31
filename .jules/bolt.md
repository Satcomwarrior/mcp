## 2026-01-31 - Sequential MCP Tool Calls
**Learning:** Tools often fetch multiple pieces of state (URL, title, snapshot) to build a result. Doing this sequentially adds unnecessary latency.
**Action:** Always check if multiple `sendSocketMessage` or state-fetching calls can be parallelized with `Promise.all`.
