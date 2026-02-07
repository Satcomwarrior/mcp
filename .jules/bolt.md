## 2024-05-22 - [Optimized Tool/Resource Lookup]
**Learning:** Replaced O(n) array lookups with O(1) Map lookups for tools and resources. Benchmarking showed ~158x speedup for 1000 lookups on 10,000 items. Also pre-calculated schema arrays to avoid mapping on every list request.
**Action:** Always consider using Maps for frequent lookups by ID/Name, especially in request handlers that might be called frequently. Pre-calculate static responses where possible.
