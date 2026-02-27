/**
 * Validates that a URL string is a valid HTTP or HTTPS URL.
 * Throws an error if the URL is invalid or uses an unsafe protocol.
 */
export function validateUrl(url: string): void {
  try {
    const parsedUrl = new URL(url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error(`Invalid protocol: ${parsedUrl.protocol}. Only http: and https: are allowed.`);
    }
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('Invalid URL')) {
      throw new Error(`Invalid URL format: ${url}`);
    }
    throw error;
  }
}
