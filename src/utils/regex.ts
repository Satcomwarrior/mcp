/**
 * Regex-specific utilities for performance optimizations
 */

/**
 * Extract an array of full string matches from text using a global RegExp.
 * This is a highly optimized replacement for `text.match(pattern).slice(0, limit)`.
 * It prevents a full scan of `text` when only a subset of matches is needed.
 *
 * @param text The string to search.
 * @param pattern The global RegExp pattern to use.
 * @param limit The maximum number of matches to extract.
 * @returns An array of string matches.
 */
export function extractMatches(text: string, pattern: RegExp, limit: number): string[] {
  if (!pattern.global) {
    throw new Error("extractMatches requires a global RegExp pattern");
  }

  // Reset lastIndex to ensure search starts from the beginning
  pattern.lastIndex = 0;

  const matches: string[] = [];
  let match;

  while ((match = pattern.exec(text)) !== null && matches.length < limit) {
    matches.push(match[0]);

    // Prevent infinite loops if the regex can match an empty string
    if (match.index === pattern.lastIndex) {
      pattern.lastIndex++;
    }
  }

  // Reset lastIndex so subsequent .test() or .exec() calls on a shared global regex don't fail
  pattern.lastIndex = 0;

  return matches;
}
