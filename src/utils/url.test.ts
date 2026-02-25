import { describe, it } from 'node:test';
import assert from 'node:assert';
import { validateUrl } from './url';

describe('validateUrl', () => {
  it('should accept valid http/https URLs', () => {
    assert.strictEqual(validateUrl('https://example.com'), 'https://example.com');
    assert.strictEqual(validateUrl('http://localhost:3000'), 'http://localhost:3000');
    assert.strictEqual(validateUrl('https://sub.domain.co.uk/path?query=1'), 'https://sub.domain.co.uk/path?query=1');
  });

  it('should reject invalid protocols', () => {
    assert.throws(() => validateUrl('file:///etc/passwd'), { message: /Invalid protocol: file:. Only http and https are allowed./ });
    assert.throws(() => validateUrl('javascript:alert(1)'), { message: /Invalid protocol: javascript:. Only http and https are allowed./ });
    assert.throws(() => validateUrl('ftp://ftp.example.com'), { message: /Invalid protocol: ftp:. Only http and https are allowed./ });
    assert.throws(() => validateUrl('data:text/html,<html></html>'), { message: /Invalid protocol: data:. Only http and https are allowed./ });
  });

  it('should reject malformed URLs', () => {
    assert.throws(() => validateUrl('not-a-url'), { message: /Invalid URL: not-a-url/ });
    assert.throws(() => validateUrl(''), { message: /Invalid URL: / });
  });
});
