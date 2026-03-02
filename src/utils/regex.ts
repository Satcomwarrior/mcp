/**
 * Safe, efficient extraction of global RegExp matches up to a limit.
 * Used to avoid expensive full-string `match()` scans on large Aria snapshots.
 */
export function extractMatches(text: string, pattern: RegExp, limit: number = Infinity): string[] {
  if (!pattern.global) {
    const match = pattern.exec(text);
    return match ? [match[0]] : [];
  }
  pattern.lastIndex = 0;
  const results: string[] = [];
  let match;
  while (results.length < limit && (match = pattern.exec(text)) !== null) {
    results.push(match[0]);
    if (match.index === pattern.lastIndex) pattern.lastIndex++;
  }
  pattern.lastIndex = 0; // Reset state for subsequent uses of this regex
  return results;
}
