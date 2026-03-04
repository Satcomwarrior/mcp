export function validateUrl(url: string): void {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error('Invalid URL protocol. Only http and https are allowed.');
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes('Invalid URL protocol')) {
      throw err;
    }
    throw new Error('Invalid URL format.');
  }
}
