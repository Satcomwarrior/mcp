import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflowPath = new URL("../.github/workflows/repository-backup.yml", import.meta.url);

test("repository backup captures all branch and tag refs in a verified bundle", () => {
  const workflow = readFileSync(workflowPath, "utf8");

  assert.match(workflow, /fetch --prune origin ['"]?\+refs\/heads\/\*:refs\/remotes\/origin\/\*['"]?/);
  assert.match(workflow, /\+refs\/tags\/\*:refs\/tags\/\*/);
  assert.match(workflow, /git bundle create .* --all/);
  assert.match(workflow, /git bundle verify/);
  assert.match(workflow, /sha256sum/);
  assert.match(workflow, /retention-days:\s*90/);
});
