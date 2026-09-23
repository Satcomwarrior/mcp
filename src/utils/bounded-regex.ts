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

export function takeUniqueRegexMatches(text: string, pattern: RegExp, limit: number): string[] {
  if (limit <= 0) {
    return [];
  }

  const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
  const safePattern = new RegExp(pattern.source, flags);
  const uniqueMatches = new Set<string>();

  for (const match of text.matchAll(safePattern)) {
    uniqueMatches.add(match[0]);
    if (uniqueMatches.size >= limit) {
      break;
    }
  }

  return Array.from(uniqueMatches);
}
