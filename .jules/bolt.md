## 2024-05-24 - Object.entries() in string parsers
**Learning:** Using `Object.entries()` inside frequently called string parsing functions (like `parseVolume`) creates a significant performance bottleneck due to continuous array allocation and iteration overhead.
**Action:** Replace `Object.entries()` loops with direct conditional checks (e.g., `if/else if` based on string characters) or cache the arrays globally outside the function to prevent unnecessary garbage generation.

## 2024-05-24 - Object.entries() in string parsers
**Learning:** Using `Object.entries()` inside frequently called string parsing functions (like `parseVolume`) creates a significant performance bottleneck due to continuous array allocation and iteration overhead.
**Action:** Replace `Object.entries()` loops with direct conditional checks (e.g., `if/else if` based on string characters) or cache the arrays globally outside the function to prevent unnecessary garbage generation.
