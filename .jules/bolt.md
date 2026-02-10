## 2024-05-23 - [MCP Server Lookup Optimization]
**Learning:** MCP servers perform frequent lookups for tools and resources by name/URI. Using `Array.find` creates an O(N) bottleneck that scales linearly with the number of tools.
**Action:** Always index tools and resources into `Map`s during server initialization for O(1) lookups. Also pre-calculate schema lists to avoid mapping over the array on every `ListTools`/`ListResources` request.
