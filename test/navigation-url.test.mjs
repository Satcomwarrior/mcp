import test from "node:test";
import assert from "node:assert/strict";
import { normalizeNavigationUrl } from "../src/utils/navigation-url.ts";

test("normalizes schemeless hostnames to http", () => {
  assert.equal(normalizeNavigationUrl("example.com/path"), "http://example.com/path");
  assert.equal(normalizeNavigationUrl("localhost:3000/app"), "http://localhost:3000/app");
});

test("preserves and normalizes http and https URLs", () => {
  assert.equal(normalizeNavigationUrl("  HTTPS://Example.COM/a  "), "https://example.com/a");
  assert.equal(normalizeNavigationUrl("http://example.com"), "http://example.com/");
});

test("rejects every non-http(s) protocol", () => {
  for (const url of [
    "javascript:alert(1)",
    "file:///etc/passwd",
    "data:text/html,<script>alert(1)</script>",
    "about:blank",
    "chrome://settings",
    "edge://settings",
    "ftp://example.com/file",
    "blob:https://example.com/id",
  ]) {
    assert.throws(() => normalizeNavigationUrl(url), /http.*https/i, url);
  }
});

test("rejects malformed and empty URLs", () => {
  assert.throws(() => normalizeNavigationUrl(""), /valid url/i);
  assert.throws(() => normalizeNavigationUrl("   "), /valid url/i);
  assert.throws(() => normalizeNavigationUrl("http://"), /valid url/i);
});
