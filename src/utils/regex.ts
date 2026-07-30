
/**
 * Efficiently extracts a limited number of matches from a string using a regex.
 * This avoids scanning the entire string if only a few matches are needed.
 *
 * @param text The text to search in
 * @param pattern The regex pattern (must have global flag if multiple matches are desired, though this function handles resetting lastIndex)
 * @param limit The maximum number of matches to return
 * @returns Array of matches
 */
export function extractMatches(text: string, pattern: RegExp, limit: number): string[] {
  if (limit <= 0) return [];

  const matches: string[] = [];
  // Ensure we start from the beginning for global regexes
  pattern.lastIndex = 0;

  try {
    let match;
    // Use exec in a loop to stop early
    while ((match = pattern.exec(text)) !== null) {
      matches.push(match[0]); // match[0] is the full match
      if (matches.length >= limit) break;
    }
  } finally {
    // Reset lastIndex so the regex is clean for future use
    pattern.lastIndex = 0;
  }

  return matches;
}
