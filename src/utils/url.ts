/**
 * Validates that a URL uses a safe protocol (http or https).
 * Throws an error if the URL is invalid or uses an unsafe protocol (like file:, javascript:, etc).
 * This prevents Server-Side Request Forgery (SSRF) and Local File Inclusion (LFI).
 */
export function validateUrl(urlString: string): void {
  let url: URL;
  try {
    url = new URL(urlString);
  } catch (error) {
    throw new Error(`Invalid URL: ${urlString}`);
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(
      `Invalid protocol: ${url.protocol}. Only http: and https: are allowed.`,
    );
  }
}
