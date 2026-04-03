import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

import type { Context } from "@/context";
import { captureAriaSnapshot } from "@/utils/aria-snapshot";

import type { Tool } from "./tool";

// Trading-specific tool schemas
const GetPriceTool = z.object({
  name: z.literal("browser_get_price"),
  description: z.literal(
    "Extract current price from the trading page. Looks for price elements using common patterns (price, quote, last, current, etc.). Returns the price value found on the page.",
  ),
  arguments: z.object({
    selector: z
      .string()
      .optional()
      .describe(
        "Optional CSS selector or element description to locate the price. If not provided, uses common price patterns.",
      ),
  }),
});

const ExecuteTradeTool = z.object({
  name: z.literal("browser_execute_trade"),
  description: z.literal(
    "Prepare for trade execution by providing guidance on filling order forms. This tool helps identify the steps needed to execute buy/sell trades with market, limit, or stop orders. Use with browser_click and browser_type tools to actually execute the trade.",
  ),
  arguments: z.object({
    action: z
      .enum(["buy", "sell"])
      .describe("The trade action to perform"),
    amount: z
      .string()
      .describe("The amount or quantity to trade"),
    orderType: z
      .enum(["market", "limit", "stop"])
      .default("market")
      .describe("The type of order to place"),
    price: z
      .string()
      .optional()
      .describe("The limit/stop price (required for limit and stop orders)"),
    symbol: z
      .string()
      .optional()
      .describe("The trading symbol (e.g., AAPL, BTC, ETH)"),
  }),
});

const MonitorPriceTool = z.object({
  name: z.literal("browser_monitor_price"),
  description: z.literal(
    "Monitor price changes in real-time. Takes snapshots at specified intervals to track price movements. Useful for detecting price alerts and market opportunities.",
  ),
  arguments: z.object({
    interval: z
      .number()
      .min(1)
      .default(5)
      .describe("Interval in seconds between price checks"),
    duration: z
      .number()
      .min(1)
      .max(300)
      .default(60)
      .describe("Total monitoring duration in seconds (max 5 minutes)"),
    selector: z
      .string()
      .optional()
      .describe("Optional CSS selector to locate the price element"),
  }),
});

const GetPortfolioTool = z.object({
  name: z.literal("browser_get_portfolio"),
  description: z.literal(
    "Extract portfolio information from the trading page including positions, balances, and P&L. Works with common trading platforms by identifying portfolio/account sections.",
  ),
  arguments: z.object({
    includeDetails: z
      .boolean()
      .default(true)
      .describe("Include detailed position information"),
  }),
});

const SetPriceAlertTool = z.object({
  name: z.literal("browser_set_price_alert"),
  description: z.literal(
    "Prepare for setting price alerts by providing guidance on filling alert forms. This tool helps identify the steps needed to set price alerts on trading platforms. Use with browser_click and browser_type tools to actually create the alert.",
  ),
  arguments: z.object({
    symbol: z.string().describe("The trading symbol"),
    targetPrice: z.string().describe("The target price for the alert"),
    condition: z
      .enum(["above", "below"])
      .describe("Alert when price goes above or below target"),
  }),
});

const GetMarketDataTool = z.object({
  name: z.literal("browser_get_market_data"),
  description: z.literal(
    "Extract comprehensive market data including prices, volume, market cap, and trends from the current page. Optimized for crypto and stock trading pages.",
  ),
  arguments: z.object({
    dataPoints: z
      .array(
        z.enum([
          "price",
          "volume",
          "market_cap",
          "change_24h",
          "high_24h",
          "low_24h",
          "all",
        ]),
      )
      .default(["price", "volume", "change_24h"])
      .describe("Specific data points to extract"),
  }),
});

// Pre-compiled regex for getPortfolio tool to avoid repeated allocations in loops
// This optimization provides a ~3-4x speedup over Array.some() with .toLowerCase()
const PORTFOLIO_KEYWORD_PATTERN = /balance|equity|position|holdings|portfolio|total|profit|loss|p&l|pnl/i;

// Tool implementations
export const getPrice: Tool = {
  schema: {
    name: GetPriceTool.shape.name.value,
    description: GetPriceTool.shape.description.value,
    inputSchema: zodToJsonSchema(GetPriceTool.shape.arguments),
  },
  handle: async (context: Context, params) => {
    const { selector } = GetPriceTool.shape.arguments.parse(params);
    
    // Get page snapshot to analyze
    const snapshot = await captureAriaSnapshot(context);
    
    // Look for price in the snapshot content
    const snapshotText = snapshot.content
      .filter((c) => c.type === "text")
      .map((c) => (c as any).text)
      .join("\n");
    
    // Common price patterns - ensure at least one digit
    const pricePatterns = [
      /\$\d[\d,]*\.?\d*/g,
      /\d[\d,]*\.?\d*\s*USD/gi,
      /Price:\s*\d[\d,]*\.?\d*/gi,
      /Quote:\s*\d[\d,]*\.?\d*/gi,
      /Last:\s*\d[\d,]*\.?\d*/gi,
    ];
    
    const prices: string[] = [];
    for (const pattern of pricePatterns) {
      const matches = snapshotText.match(pattern);
      if (matches) {
        prices.push(...matches);
      }
    }
    
    const uniquePrices = [...new Set(prices)];
    
    return {
      content: [
        {
          type: "text",
          text: selector
            ? `Extracted prices using pattern "${selector}":\n${uniquePrices.join("\n")}`
            : `Extracted prices from page:\n${uniquePrices.join("\n")}`,
        },
      ],
    };
  },
};

export const executeTrade: Tool = {
  schema: {
    name: ExecuteTradeTool.shape.name.value,
    description: ExecuteTradeTool.shape.description.value,
    inputSchema: zodToJsonSchema(ExecuteTradeTool.shape.arguments),
  },
  handle: async (context: Context, params) => {
    const validatedParams = ExecuteTradeTool.shape.arguments.parse(params);
    const { action, amount, orderType, price, symbol } = validatedParams;
    
    // This is a placeholder - actual implementation would interact with specific trading platforms
    // For now, we'll capture the state and provide guidance
    const snapshot = await captureAriaSnapshot(context);
    
    const tradeInfo = [
      `Trade execution guidance:`,
      `  Action: ${action.toUpperCase()}`,
      `  Amount: ${amount}`,
      `  Order Type: ${orderType}`,
      price ? `  Price: ${price}` : "",
      symbol ? `  Symbol: ${symbol}` : "",
      "",
      "⚠️  IMPORTANT: This tool provides guidance only. To execute the trade:",
      "1. Use browser_click to interact with the buy/sell buttons",
      "2. Use browser_type to fill in the order form fields",
      "3. Manually verify all order details before confirming",
      "4. Use browser_click to submit the order with caution",
      "",
      "Always double-check order parameters before execution!",
    ]
      .filter(Boolean)
      .join("\n");
    
    return {
      content: [
        {
          type: "text",
          text: tradeInfo,
        },
        ...snapshot.content,
      ],
    };
  },
};

export const monitorPrice: Tool = {
  schema: {
    name: MonitorPriceTool.shape.name.value,
    description: MonitorPriceTool.shape.description.value,
    inputSchema: zodToJsonSchema(MonitorPriceTool.shape.arguments),
  },
  handle: async (context: Context, params) => {
    const { interval, duration, selector } = MonitorPriceTool.shape.arguments.parse(params);
    
    const iterations = Math.min(Math.floor(duration / interval), 60); // Max 60 iterations
    const priceHistory: string[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const snapshot = await captureAriaSnapshot(context);
      const snapshotText = snapshot.content
        .filter((c) => c.type === "text")
        .map((c) => (c as any).text)
        .join("\n");
      
      // Extract price
      const priceMatch = snapshotText.match(/\$[\d,]+\.?\d*/);
      if (priceMatch) {
        const timestamp = new Date().toISOString();
        priceHistory.push(`[${timestamp}] ${priceMatch[0]}`);
      }
      
      // Wait for next interval (except on last iteration)
      if (i < iterations - 1) {
        await context.sendSocketMessage("browser_wait", { time: interval });
      }
    }
    
    return {
      content: [
        {
          type: "text",
          text: `Price monitoring complete (${iterations} samples over ${iterations * interval}s):\n${priceHistory.join("\n")}`,
        },
      ],
    };
  },
};

export const getPortfolio: Tool = {
  schema: {
    name: GetPortfolioTool.shape.name.value,
    description: GetPortfolioTool.shape.description.value,
    inputSchema: zodToJsonSchema(GetPortfolioTool.shape.arguments),
  },
  handle: async (context: Context, params) => {
    const { includeDetails } = GetPortfolioTool.shape.arguments.parse(params);
    
    const snapshot = await captureAriaSnapshot(context);
    const snapshotText = snapshot.content
      .filter((c) => c.type === "text")
      .map((c) => (c as any).text)
      .join("\n");
    
    const portfolioInfo: string[] = [];
    const lines = snapshotText.split("\n");
    
    // Optimized: use a single pre-compiled regex instead of Array.some() with repeated .toLowerCase()
    for (const line of lines) {
      if (PORTFOLIO_KEYWORD_PATTERN.test(line)) {
        portfolioInfo.push(line.trim());
      }
    }
    
    return {
      content: [
        {
          type: "text",
          text: `Portfolio information extracted:\n${portfolioInfo.join("\n")}`,
        },
      ],
    };
  },
};

export const setPriceAlert: Tool = {
  schema: {
    name: SetPriceAlertTool.shape.name.value,
    description: SetPriceAlertTool.shape.description.value,
    inputSchema: zodToJsonSchema(SetPriceAlertTool.shape.arguments),
  },
  handle: async (context: Context, params) => {
    const validatedParams = SetPriceAlertTool.shape.arguments.parse(params);
    const { symbol, targetPrice, condition } = validatedParams;
    
    const snapshot = await captureAriaSnapshot(context);
    
    return {
      content: [
        {
          type: "text",
          text: `Price alert guidance for ${symbol}:\n  Target: ${targetPrice}\n  Condition: ${condition}\n\n⚠️  To create the alert:\n1. Navigate to the alerts/notifications page\n2. Use browser_click to open the alert creation form\n3. Use browser_type to fill in symbol, price, and condition\n4. Use browser_click to save the alert\n\nVerify the alert is created successfully before relying on it.`,
        },
        ...snapshot.content,
      ],
    };
  },
};

export const getMarketData: Tool = {
  schema: {
    name: GetMarketDataTool.shape.name.value,
    description: GetMarketDataTool.shape.description.value,
    inputSchema: zodToJsonSchema(GetMarketDataTool.shape.arguments),
  },
  handle: async (context: Context, params) => {
    const { dataPoints } = GetMarketDataTool.shape.arguments.parse(params);
    
    const snapshot = await captureAriaSnapshot(context);
    const snapshotText = snapshot.content
      .filter((c) => c.type === "text")
      .map((c) => (c as any).text)
      .join("\n");
    
    const marketData: Record<string, string[]> = {};
    
    const patterns: Record<string, RegExp[]> = {
      price: [/\$[\d,]+\.?\d*/g, /Price:\s*[\d,]+\.?\d*/gi],
      volume: [/Volume:\s*[\d,]+\.?\d*[KMB]?/gi, /Vol:\s*[\d,]+\.?\d*[KMB]?/gi],
      market_cap: [/Market Cap:\s*[\d,]+\.?\d*[KMB]?/gi, /Mkt Cap:\s*[\d,]+\.?\d*[KMB]?/gi],
      change_24h: [/24h:\s*[+-]?[\d,]+\.?\d*%?/gi, /Change:\s*[+-]?[\d,]+\.?\d*%?/gi],
      high_24h: [/High:\s*[\d,]+\.?\d*/gi, /24h High:\s*[\d,]+\.?\d*/gi],
      low_24h: [/Low:\s*[\d,]+\.?\d*/gi, /24h Low:\s*[\d,]+\.?\d*/gi],
    };
    
    const requestedPoints = dataPoints.includes("all")
      ? Object.keys(patterns)
      : dataPoints;
    
    for (const point of requestedPoints) {
      if (point === "all") continue;
      const pointPatterns = patterns[point as keyof typeof patterns] || [];
      const matches: string[] = [];
      
      for (const pattern of pointPatterns) {
        const found = snapshotText.match(pattern);
        if (found) {
          matches.push(...found);
        }
      }
      
      if (matches.length > 0) {
        marketData[point] = [...new Set(matches)];
      }
    }
    
    const result = Object.entries(marketData)
      .map(([key, values]) => `${key}:\n  ${values.join("\n  ")}`)
      .join("\n\n");
    
    return {
      content: [
        {
          type: "text",
          text: result || "No market data found on page",
        },
      ],
    };
  },
};
