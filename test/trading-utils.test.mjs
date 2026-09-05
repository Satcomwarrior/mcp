import test from "node:test";
import assert from "node:assert/strict";
import { parseVolume } from "../src/utils/trading.ts";

test("parseVolume expands K, M, and B suffixes", () => {
  assert.equal(parseVolume("1.5K"), 1500);
  assert.equal(parseVolume("2M"), 2_000_000);
  assert.equal(parseVolume("3.25B"), 3_250_000_000);
});

test("parseVolume preserves plain and decorated numeric values", () => {
  assert.equal(parseVolume("1234"), 1234);
  assert.equal(parseVolume("Volume: 12.5m"), 12_500_000);
});

test("parseVolume rejects empty or non-numeric input", () => {
  assert.equal(parseVolume(""), null);
  assert.equal(parseVolume("n/a"), null);
});
