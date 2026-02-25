/**
 * Validates a URL string to ensure it uses a safe protocol (http/https).
 * Throws an error if the URL is invalid or uses an unsafe protocol.
 * @param url The URL string to validate
 * @returns The validated URL string
 */
export function validateUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error(`Invalid protocol: ${parsed.protocol}. Only http and https are allowed.`);
    }
    return url;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Invalid protocol")) {
      throw error;
    }
    // If URL parsing fails, throw a clear error
    throw new Error(`Invalid URL: ${url}`);
  }
}
