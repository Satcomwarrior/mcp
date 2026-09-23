import type { Context } from "@/context";
import { captureAriaSnapshot } from "@/utils/aria-snapshot";
import { takeUniqueRegexMatches } from "@/utils/bounded-regex";

import type { Resource } from "./resource";

/**
 * Trading watchlist resource
 * Provides access to monitored trading symbols and their current status
 */
export const watchlist: Resource = {
  schema: {
    uri: "trading://watchlist",
    name: "Trading Watchlist",
    description: "Current trading watchlist with monitored symbols and prices",
    mimeType: "application/json",
  },
  read: async (context: Context) => {
    // Get current page snapshot to extract watchlist data
    const snapshot = await captureAriaSnapshot(context);
    const snapshotText = snapshot.content
      .filter((c) => c.type === "text")
      .map((c) => (c as any).text)
      .join("\n");

    // Extract potential watchlist items using lazy bounded evaluation
    const symbolPattern = /\b[A-Z]{2,5}\b/g;
    const pricePattern = /\$[\d,]+\.?\d*/g;
    
    const symbols = takeUniqueRegexMatches(snapshotText, symbolPattern, 20);
    const prices = takeUniqueRegexMatches(snapshotText, pricePattern, 20);
    
    const watchlistData = {
      timestamp: new Date().toISOString(),
      symbols, // Limit to 20 symbols
      prices,
      source: "current_page",
    };

    return [
      {
        uri: "trading://watchlist",
        mimeType: "application/json",
        text: JSON.stringify(watchlistData, null, 2),
      },
    ];
  },
};

/**
 * Trading positions resource
 * Provides access to current open positions and portfolio information
 */
export const positions: Resource = {
  schema: {
    uri: "trading://positions",
    name: "Trading Positions",
    description: "Current open trading positions and portfolio status",
    mimeType: "application/json",
  },
  read: async (context: Context) => {
    const snapshot = await captureAriaSnapshot(context);
    const snapshotText = snapshot.content
      .filter((c) => c.type === "text")
      .map((c) => (c as any).text)
      .join("\n");

    // Look for position-related data
    const positionKeywords = [
      "position",
      "holdings",
      "quantity",
      "qty",
      "shares",
      "coins",
      "P&L",
      "profit",
      "loss",
    ];

    const positionLines: string[] = [];
    const lines = snapshotText.split("\n");

    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      if (positionKeywords.some((keyword) => lowerLine.includes(keyword))) {
        positionLines.push(line.trim());
      }
    }

    const positionsData = {
      timestamp: new Date().toISOString(),
      positions: positionLines,
      source: "current_page",
    };

    return [
      {
        uri: "trading://positions",
        mimeType: "application/json",
        text: JSON.stringify(positionsData, null, 2),
      },
    ];
  },
};

// Cache patterns globally to avoid re-allocation and regex recompilation on each read
const MARKET_PATTERNS = {
  indices: /\b(DOW|NASDAQ|S&P\s*500|SP500|DJI|IXIC|SPX)\b/gi,
  prices: /\$[\d,]+\.?\d*/g,
  changes: /[+-][\d,]+\.?\d*%/g,
  volume: /Vol:\s*[\d,]+\.?\d*[KMB]?/gi,
};
const MARKET_PATTERN_ENTRIES = Object.entries(MARKET_PATTERNS);

/**
 * Market summary resource
 * Provides quick access to market overview data
 */
export const marketSummary: Resource = {
  schema: {
    uri: "trading://market-summary",
    name: "Market Summary",
    description: "Current market overview including indices and major market data",
    mimeType: "application/json",
  },
  read: async (context: Context) => {
    const snapshot = await captureAriaSnapshot(context);
    const snapshotText = snapshot.content
      .filter((c) => c.type === "text")
      .map((c) => (c as any).text)
      .join("\n");

    const marketData: Record<string, string[]> = {};
    
    for (const [key, pattern] of MARKET_PATTERN_ENTRIES) {
      const matches = takeUniqueRegexMatches(snapshotText, pattern, 10);
      if (matches.length > 0) {
        marketData[key] = matches;
      }
    }

    const summaryData = {
      timestamp: new Date().toISOString(),
      ...marketData,
      source: "current_page",
    };

    return [
      {
        uri: "trading://market-summary",
        mimeType: "application/json",
        text: JSON.stringify(summaryData, null, 2),
      },
    ];
  },
};
