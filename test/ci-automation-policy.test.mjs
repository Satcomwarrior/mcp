import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const ciFix = readFileSync(new URL("../.github/workflows/jules-ci-fix.yml", import.meta.url), "utf8");
const tests = readFileSync(new URL("../.github/workflows/test.yml", import.meta.url), "utf8");

test("CI auto-fix is gated by same-repository provenance, not branch-name/user confusion", () => {
  assert.match(ciFix, /head_repository\.full_name\s*==\s*github\.repository/);
  assert.doesNotMatch(ciFix, /contains\([^\n]*head_branch/);
});

test("dependency-free syntax validation covers the full TypeScript source tree", () => {
  assert.match(tests, /find src -name ['"]\\?\*\.ts['"]/);
  assert.match(tests, /--experimental-strip-types --check/);
});
