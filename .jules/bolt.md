## 2024-05-22 - [Optimizing Tool/Resource Lookups]
**Learning:** O(N) lookups using `Array.find` became a significant bottleneck (45x slower) compared to `Map.get` O(1) lookups even with just 1000 items. Pre-calculating schema arrays for list operations provided an even larger speedup (187x) by avoiding allocation on every request.
**Action:** Always prefer `Map` for key-based lookups of static collections like tools and resources, and pre-calculate derived arrays if the source data is immutable.

## 2024-05-22 - [Critical Bug in Server Shutdown]
**Learning:** Overriding instance methods (like `server.close`) without properly capturing the original method context led to infinite recursion and stack overflow.
**Action:** Always capture the original method using `.bind(instance)` before overwriting it to ensure the original implementation can be called safely.
