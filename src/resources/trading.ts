import type { Context } from "@/context";
import { captureAriaSnapshot } from "@/utils/aria-snapshot";

import type { Resource } from "./resource";

/**
 * Regex constants for trading data extraction
 */
const WATCHLIST_SYMBOL_PATTERN = /\b[A-Z]{2,5}\b/g;
const WATCHLIST_PRICE_PATTERN = /\$[\d,]+\.?\d*/g;

const POSITION_KEYWORDS_REGEX =
  /position|holdings|quantity|qty|shares|coins|P&L|profit|loss/i;

const MARKET_PATTERNS = {
  indices: /\b(DOW|NASDAQ|S&P\s*500|SP500|DJI|IXIC|SPX)\b/gi,
  prices: /\$[\d,]+\.?\d*/g,
  changes: /[+-][\d,]+\.?\d*%/g,
  volume: /Vol:\s*[\d,]+\.?\d*[KMB]?/gi,
};

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
    const symbols = snapshotText.match(WATCHLIST_SYMBOL_PATTERN) || [];
    const prices = snapshotText.match(WATCHLIST_PRICE_PATTERN) || [];
    
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
    const positionLines: string[] = [];
    const lines = snapshotText.split("\n");

    for (const line of lines) {
      if (POSITION_KEYWORDS_REGEX.test(line)) {
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
    const marketData: Record<string, string[]> = {};

    for (const [key, pattern] of Object.entries(MARKET_PATTERNS)) {
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
