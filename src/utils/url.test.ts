import { describe, it } from 'node:test';
import assert from 'node:assert';
import { validateUrl } from './url.js'; // js for tsx extension resolution in esm

describe('validateUrl', () => {
  it('should pass valid http and https urls', () => {
    assert.doesNotThrow(() => validateUrl('http://example.com'));
    assert.doesNotThrow(() => validateUrl('https://example.com'));
  });

  it('should throw for invalid protocols', () => {
    assert.throws(() => validateUrl('file:///etc/passwd'), /Invalid URL protocol/);
    assert.throws(() => validateUrl('javascript:alert(1)'), /Invalid URL protocol/);
    assert.throws(() => validateUrl('ftp://example.com'), /Invalid URL protocol/);
  });

  it('should throw for invalid url formats', () => {
    assert.throws(() => validateUrl('not a url'), /Invalid URL format/);
    assert.throws(() => validateUrl(''), /Invalid URL format/);
  });
});
