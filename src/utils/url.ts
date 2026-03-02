/**
 * Validates a URL to ensure it uses a safe protocol (http: or https:).
 * This prevents SSRF and Local File Inclusion (LFI) vulnerabilities
 * via unsafe protocols like file:// or javascript:.
 */
export function validateUrl(urlString: string): void {
  try {
    const url = new URL(urlString);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error(`Invalid URL protocol: ${url.protocol}. Only http: and https: are allowed.`);
    }
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`Invalid URL format: ${urlString}`);
    }
    throw error;
  }
}
