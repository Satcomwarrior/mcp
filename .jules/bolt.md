## 2024-05-23 - Monorepo Isolation Challenges
**Learning:** The current environment is an isolated subdirectory (`/app`) of a larger monorepo. Consequently, commands requiring full workspace resolution (e.g., `pnpm install`, `pnpm build`, `pnpm typecheck`) may fail due to missing `@repo/*` workspace dependencies.
**Action:** Verification of code changes in this isolated environment often requires creating standalone scripts (e.g., `.cjs` or `ts-node` friendly files with mocked dependencies) to bypass workspace import errors.
