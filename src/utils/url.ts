/**
 * Validates a URL to ensure it uses a safe protocol (http: or https:).
 * This prevents SSRF/LFI vulnerabilities by blocking dangerous protocols like file:, data:, or javascript:.
 *
 * @param urlString The URL string to validate
 * @returns The validated URL string
 * @throws Error if the URL is invalid or uses an unsafe protocol
 */
export function validateUrl(urlString: string): string {
  try {
    const parsedUrl = new URL(urlString);
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      throw new Error(
        `Invalid URL protocol: ${parsedUrl.protocol}. Only http: and https: are allowed.`,
      );
    }
    return parsedUrl.href;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.startsWith("Invalid URL protocol")
    ) {
      throw error;
    }
    throw new Error(`Invalid URL format: ${urlString}`);
  }
}
