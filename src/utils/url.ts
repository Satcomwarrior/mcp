/**
 * Validates that a URL is valid and uses a safe protocol (http or https).
 * Throws an error if invalid.
 */
export function validateUrl(url: string): void {
  try {
    const parsedUrl = new URL(url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error(`Invalid protocol: ${parsedUrl.protocol}. Only http and https are allowed.`);
    }
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Invalid protocol')) {
      throw error;
    }
    // If URL constructor fails
    throw new Error(`Invalid URL: ${url}`);
  }
}
