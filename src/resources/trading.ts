import type { Context } from "@/context";
import { captureAriaSnapshot } from "@/utils/aria-snapshot";
import { filterLinesByKeywords } from "@/utils/trading";

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

    // Extract potential watchlist items
    const symbolPattern = /\b[A-Z]{2,5}\b/g;
    const pricePattern = /\$[\d,]+\.?\d*/g;
    
    const symbols = snapshotText.match(symbolPattern) || [];
    const prices = snapshotText.match(pricePattern) || [];
    
    const watchlistData = {
      timestamp: new Date().toISOString(),
      symbols: [...new Set(symbols)].slice(0, 20), // Limit to 20 symbols
      prices: [...new Set(prices)].slice(0, 20),
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

    const lines = snapshotText.split("\n");
    // Use optimized regex filter instead of loop + toLowerCase
    const positionLines = filterLinesByKeywords(lines, positionKeywords);

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

    // Extract market indices and major data points
    const marketPatterns = {
      indices: /\b(DOW|NASDAQ|S&P\s*500|SP500|DJI|IXIC|SPX)\b/gi,
      prices: /\$[\d,]+\.?\d*/g,
      changes: /[+-][\d,]+\.?\d*%/g,
      volume: /Vol:\s*[\d,]+\.?\d*[KMB]?/gi,
    };

    const marketData: Record<string, string[]> = {};
    
    for (const [key, pattern] of Object.entries(marketPatterns)) {
      const matches = snapshotText.match(pattern);
      if (matches) {
        marketData[key] = [...new Set(matches)].slice(0, 10);
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
