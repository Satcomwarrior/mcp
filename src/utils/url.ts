/**
 * Validates a URL string to ensure it uses a safe protocol (HTTP or HTTPS).
 * This prevents Server-Side Request Forgery (SSRF) and Local File Inclusion (LFI)
 * vulnerabilities that can occur if malicious protocols like 'file:' are used.
 *
 * @param urlString The URL string to validate
 * @returns The original URL string if valid
 * @throws Error if the URL is invalid or uses an unsafe protocol
 */
export function validateUrl(urlString: string): string {
  try {
    const url = new URL(urlString);

    // Only allow http and https protocols to prevent SSRF/LFI
    const allowedProtocols = ["http:", "https:"];

    if (!allowedProtocols.includes(url.protocol)) {
      throw new Error(
        `Invalid or unsafe URL protocol: ${url.protocol}. Only http and https are allowed.`,
      );
    }

    return urlString;
  } catch (error) {
    if (error instanceof Error && error.message.includes("Invalid or unsafe")) {
      throw error;
    }
    throw new Error(`Invalid URL format: ${urlString}`);
  }
}
