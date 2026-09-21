export function takeRegexMatches(text: string, pattern: RegExp, limit: number): string[] {
  if (limit <= 0) {
    return [];
  }

  const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
  const safePattern = new RegExp(pattern.source, flags);
  const matches: string[] = [];

  for (const match of text.matchAll(safePattern)) {
    matches.push(match[0]);
    if (matches.length >= limit) {
      break;
    }
  }

  return matches;
}

/**
 * ⚡ Bolt: Performance optimization
 * Extracts a limited number of unique regex matches using lazy evaluation.
 * Avoids the CPU and memory overhead of eager String.prototype.match(/g/)
 * followed by whole-array deduplication on large strings.
 */
export function takeUniqueRegexMatches(text: string, pattern: RegExp, limit: number): string[] {
  if (limit <= 0) {
    return [];
  }

  const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
  const safePattern = new RegExp(pattern.source, flags);
  const matches = new Set<string>();

  for (const match of text.matchAll(safePattern)) {
    matches.add(match[0]);
    if (matches.size >= limit) {
      break;
    }
  }

  return Array.from(matches);
}
