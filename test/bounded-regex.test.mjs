import test from "node:test";
import assert from "node:assert/strict";
import { takeRegexMatches } from "../src/utils/bounded-regex.ts";

test("returns only the first requested matches in source order", () => {
  const text = "price 1 price 2 price 3 price 4";
  assert.deepEqual(takeRegexMatches(text, /price\s+\d+/g, 2), ["price 1", "price 2"]);
});

test("preserves duplicate matches like match().slice()", () => {
  const text = "$10 $10 $20 $30";
  assert.deepEqual(takeRegexMatches(text, /\$\d+/g, 3), ["$10", "$10", "$20"]);
});

test("supports non-global patterns without mutating the caller regex", () => {
  const pattern = /ETH\s+\d+/i;
  assert.deepEqual(takeRegexMatches("ETH 1 ETH 2", pattern, 2), ["ETH 1", "ETH 2"]);
  assert.equal(pattern.global, false);
});

test("returns an empty array for non-positive limits", () => {
  assert.deepEqual(takeRegexMatches("x x x", /x/g, 0), []);
});
