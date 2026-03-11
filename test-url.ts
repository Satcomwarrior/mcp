import { validateUrl } from './src/utils/url.ts';

const safeUrls = [
  "https://example.com",
  "http://example.com/path",
  "https://example.com:8080/path?query=1#hash"
];

const unsafeUrls = [
  "file:///etc/passwd",
  "data:text/html,<script>alert(1)</script>",
  "javascript:alert(1)",
  "ftp://example.com/file",
  "ws://example.com/socket"
];

let failed = false;

console.log("Testing safe URLs...");
for (const url of safeUrls) {
  try {
    const valid = validateUrl(url);
    console.log(`✅ Safe URL validated correctly: ${url} -> ${valid}`);
  } catch (e) {
    console.error(`❌ Safe URL incorrectly rejected: ${url}`);
    console.error(e);
    failed = true;
  }
}

console.log("\nTesting unsafe URLs...");
for (const url of unsafeUrls) {
  try {
    validateUrl(url);
    console.error(`❌ Unsafe URL incorrectly validated: ${url}`);
    failed = true;
  } catch (e) {
    console.log(`✅ Unsafe URL properly rejected: ${url} - Error: ${e.message}`);
  }
}

console.log("\nTesting invalid URLs...");
try {
  validateUrl("not a url");
  console.error(`❌ Invalid URL incorrectly validated: not a url`);
  failed = true;
} catch (e) {
  console.log(`✅ Invalid URL properly rejected: not a url - Error: ${e.message}`);
}

if (failed) {
  console.error("\n❌ TESTS FAILED");
  process.exit(1);
} else {
  console.log("\n✅ ALL TESTS PASSED");
  process.exit(0);
}
