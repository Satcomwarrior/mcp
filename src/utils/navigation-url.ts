const EXPLICIT_SCHEME = /^[a-zA-Z][a-zA-Z\d+.-]*:/;
const HOST_WITH_PORT = /^(?:localhost|(?:\d{1,3}\.){3}\d{1,3}|(?:[a-zA-Z\d-]+\.)+[a-zA-Z\d-]+):\d+(?:\/|$)/;

export function normalizeNavigationUrl(input: string): string {
  // 🛡️ Sentinel: Aggressively strip whitespace and C0 control characters (e.g. \x01)
  // because new URL() will ignore them, which can bypass the EXPLICIT_SCHEME check
  // and allow dangerous protocols like javascript:
  const trimmed = input.replace(/^[\s\x00-\x1F]+|[\s\x00-\x1F]+$/g, "");
  if (!trimmed) {
    throw new Error("A valid URL is required");
  }

  const shouldPrefixHttp = !EXPLICIT_SCHEME.test(trimmed) || HOST_WITH_PORT.test(trimmed);
  const candidate = shouldPrefixHttp ? `http://${trimmed}` : trimmed;

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new Error("A valid URL is required");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Navigation only supports http and https URLs");
  }

  return parsed.href;
}
