## 2024-05-18 - Array.from(new Map(arr.map(...))) is slow
**Learning:** Using `Array.from(new Map(arr.map(item => [key, item])).values())` for deduplication incurs significant performance overhead due to transient allocations of arrays inside `arr.map`.
**Action:** Use a `Set` with `.filter()` for much faster deduplication if retaining the first occurrence is acceptable, or use a `for` loop with `map.set()` to retain the last occurrence (same behavior as the original).
