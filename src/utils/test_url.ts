import test from "node:test";
import assert from "node:assert";
import { validateUrl } from "./url.ts";

test("validateUrl allows valid http and https URLs", () => {
  assert.strictEqual(validateUrl("http://example.com"), "http://example.com");
  assert.strictEqual(validateUrl("https://example.com"), "https://example.com");
  assert.strictEqual(
    validateUrl("https://localhost:8080/path"),
    "https://localhost:8080/path",
  );
  assert.strictEqual(validateUrl("http://127.0.0.1"), "http://127.0.0.1");
});

test("validateUrl blocks unsafe protocols", () => {
  assert.throws(
    () => validateUrl("file:///etc/passwd"),
    /Invalid or unsafe URL protocol/,
  );
  assert.throws(
    () => validateUrl("ftp://example.com/file"),
    /Invalid or unsafe URL protocol/,
  );
  assert.throws(
    () => validateUrl("gopher://example.com"),
    /Invalid or unsafe URL protocol/,
  );
  assert.throws(
    () => validateUrl("javascript:alert(1)"),
    /Invalid or unsafe URL protocol/,
  );
  assert.throws(
    () => validateUrl("data:text/html,<html>"),
    /Invalid or unsafe URL protocol/,
  );
});

test("validateUrl throws on invalid URL formats", () => {
  assert.throws(() => validateUrl("not a url"), /Invalid URL format/);
  assert.throws(() => validateUrl("://example.com"), /Invalid URL format/);
});
