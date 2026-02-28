export function validateUrl(urlStr: string): void {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error(`Invalid protocol: ${parsed.protocol}. Only http: and https: are allowed.`);
    }
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`Invalid URL format: ${urlStr}`);
    }
    throw error;
  }
}
