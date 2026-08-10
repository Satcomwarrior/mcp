import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

import type { Context } from "@/context";
import { captureAriaSnapshot } from "@/utils/aria-snapshot";

import type { Tool } from "./tool";

// ETH-specific tool schemas
const GetGasPriceTool = z.object({
  name: z.literal("browser_get_gas_price"),
  description: z.literal(
    "Extract current Ethereum gas prices from the page. Looks for gas price indicators in Gwei (slow, standard, fast). Essential for timing ETH transactions and trades.",
  ),
  arguments: z.object({
    unit: z
      .enum(["gwei", "wei"])
      .default("gwei")
      .describe("Unit for gas price display (gwei is standard)"),
  }),
});

const GetEthBalanceTool = z.object({
  name: z.literal("browser_get_eth_balance"),
  description: z.literal(
    "Extract ETH wallet balance from the current page. Works with exchanges, wallets, and DeFi platforms. Returns both ETH amount and USD value if available.",
  ),
  arguments: z.object({
    includeTokens: z
      .boolean()
      .default(false)
      .describe("Also extract ERC-20 token balances if visible"),
  }),
});

const GetEthTradingPairTool = z.object({
  name: z.literal("browser_get_eth_pair_data"),
  description: z.literal(
    "Extract trading pair data for ETH pairs (ETH/USDT, ETH/BTC, etc.). Returns price, volume, and 24h change for the trading pair.",
  ),
  arguments: z.object({
    pair: z
      .string()
      .default("ETH/USDT")
      .describe("Trading pair to analyze (e.g., ETH/USDT, ETH/BTC)"),
  }),
});

const GetDeFiDataTool = z.object({
  name: z.literal("browser_get_defi_data"),
  description: z.literal(
    "Extract DeFi-related data from the page including APY/APR, liquidity pool information, staking rewards, and yield farming opportunities for ETH-based protocols.",
  ),
  arguments: z.object({
    dataType: z
      .enum(["apy", "liquidity", "staking", "all"])
      .default("all")
      .describe("Type of DeFi data to extract"),
  }),
});

const MonitorEthTransactionTool = z.object({
  name: z.literal("browser_monitor_eth_transaction"),
  description: z.literal(
    "Monitor an Ethereum transaction status on block explorers (Etherscan, etc.). Tracks confirmation status, gas used, and transaction success/failure.",
  ),
  arguments: z.object({
    txHash: z
      .string()
      .optional()
      .describe("Transaction hash to monitor (if not on current page)"),
    refreshInterval: z
      .number()
      .min(5)
      .max(60)
      .default(10)
      .describe("Seconds between status checks"),
  }),
});

// Tool implementations
export const getGasPrice: Tool = {
  schema: {
    name: GetGasPriceTool.shape.name.value,
    description: GetGasPriceTool.shape.description.value,
    inputSchema: zodToJsonSchema(GetGasPriceTool.shape.arguments),
  },
  handle: async (context: Context, params) => {
    const { unit } = GetGasPriceTool.shape.arguments.parse(params);

    const snapshot = await captureAriaSnapshot(context);
    const snapshotText = snapshot.content
      .filter((c) => c.type === "text")
      .map((c) => (c as any).text)
      .join("\n");

    // Gas price patterns (common on Etherscan, exchanges, wallets)
    const gasPatterns = [
      /(?:slow|low|standard|average|fast|rapid).*?(\d+\.?\d*)\s*gwei/gi,
      /gas.*?(\d+\.?\d*)\s*gwei/gi,
      /(\d+\.?\d*)\s*gwei/gi,
    ];

    const gasPrices: { type: string; value: string }[] = [];
    const lines = snapshotText.split("\n");

    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      
      // Try to identify gas price type
      let gasType = "standard";
      if (lowerLine.includes("slow") || lowerLine.includes("low")) {
        gasType = "slow";
      } else if (lowerLine.includes("fast") || lowerLine.includes("rapid")) {
        gasType = "fast";
      }

      for (const pattern of gasPatterns) {
        const match = line.match(pattern);
        if (match) {
          gasPrices.push({
            type: gasType,
            value: match[0],
          });
          break;
        }
      }
    }

    const uniqueGasPrices = Array.from(
      new Map(gasPrices.map((item) => [item.value, item])).values()
    );

    const result =
      uniqueGasPrices.length > 0
        ? `Current ETH Gas Prices:\n${uniqueGasPrices.map((g) => `  ${g.type}: ${g.value}`).join("\n")}`
        : "No gas price information found on page";

    return {
      content: [
        {
          type: "text",
          text: result,
        },
      ],
    };
  },
};

export const getEthBalance: Tool = {
  schema: {
    name: GetEthBalanceTool.shape.name.value,
    description: GetEthBalanceTool.shape.description.value,
    inputSchema: zodToJsonSchema(GetEthBalanceTool.shape.arguments),
  },
  handle: async (context: Context, params) => {
    const { includeTokens } = GetEthBalanceTool.shape.arguments.parse(params);

    const snapshot = await captureAriaSnapshot(context);
    const snapshotText = snapshot.content
      .filter((c) => c.type === "text")
      .map((c) => (c as any).text)
      .join("\n");

    // Balance patterns
    const balancePatterns = [
      /(\d+\.?\d*)\s*ETH/gi,
      /balance.*?(\d+\.?\d*)\s*ETH/gi,
      /ETH.*?(\d+\.?\d*)/gi,
    ];

    const usdPatterns = [
      /\$[\d,]+\.?\d*/g,
      /USD.*?[\d,]+\.?\d*/gi,
    ];

    const balances = new Set<string>();
    const usdValues = new Set<string>();

    // ⚡ Bolt: Optimize performance by lazily iterating regex matches to a limit
    // instead of fully evaluating the document and allocating large intermediate arrays.
    const extractToSet = (patterns: RegExp[], targetSet: Set<string>, limit: number) => {
      for (const pattern of patterns) {
        let count = 0;
        for (const match of snapshotText.matchAll(pattern)) {
          targetSet.add(match[0]);
          if (++count >= limit) break;
        }
      }
    };

    extractToSet(balancePatterns, balances, 10);

    if (includeTokens) {
      // Look for ERC-20 token balances
      const tokenPattern = /(\d+\.?\d*)\s*([A-Z]{2,10})\b/g;
      let count = 0;
      for (const match of snapshotText.matchAll(tokenPattern)) {
        if (!match[0].includes('ETH')) {
          balances.add(match[0]);
        }
        if (++count >= 10) break; // Apply rough limit for tokens too
      }
    }

    extractToSet(usdPatterns, usdValues, 3); // Limit to first 3 USD values from patterns

    const uniqueBalances = Array.from(balances).slice(0, 10);
    const uniqueUsdValues = Array.from(usdValues).slice(0, 5);

    let result = "ETH Balance Information:\n";
    if (uniqueBalances.length > 0) {
      result += `  Balances: ${uniqueBalances.join(", ")}\n`;
    }
    if (uniqueUsdValues.length > 0) {
      result += `  USD Values: ${uniqueUsdValues.join(", ")}`;
    }

    if (uniqueBalances.length === 0 && uniqueUsdValues.length === 0) {
      result = "No ETH balance information found on page";
    }

    return {
      content: [
        {
          type: "text",
          text: result,
        },
      ],
    };
  },
};

export const getEthPairData: Tool = {
  schema: {
    name: GetEthTradingPairTool.shape.name.value,
    description: GetEthTradingPairTool.shape.description.value,
    inputSchema: zodToJsonSchema(GetEthTradingPairTool.shape.arguments),
  },
  handle: async (context: Context, params) => {
    const { pair } = GetEthTradingPairTool.shape.arguments.parse(params);

    const snapshot = await captureAriaSnapshot(context);
    const snapshotText = snapshot.content
      .filter((c) => c.type === "text")
      .map((c) => (c as any).text)
      .join("\n");

    // Extract trading pair data
    const pairData: Record<string, Set<string>> = {
      price: new Set(),
      volume: new Set(),
      change: new Set(),
    };

    // ⚡ Bolt: Optimize performance by lazily iterating regex matches to a limit
    // instead of fully evaluating the document and allocating large intermediate arrays.
    const extractToSet = (patterns: RegExp[], targetSet: Set<string>, limit: number) => {
      for (const pattern of patterns) {
        let count = 0;
        for (const match of snapshotText.matchAll(pattern)) {
          targetSet.add(match[0]);
          if (++count >= limit) break;
        }
      }
    };

    // Price patterns
    const pricePatterns = [
      /price.*?(\d+\.?\d*)/gi,
      /(\d+\.\d{2,})\s*(?:USDT|USD|BTC)/gi,
    ];

    // Volume patterns
    const volumePatterns = [
      /volume.*?([\d,.]+[KMB]?)/gi,
      /24h.*?vol.*?([\d,.]+[KMB]?)/gi,
    ];

    // Change patterns
    const changePatterns = [
      /24h.*?([+-]?\d+\.?\d*%)/gi,
      /change.*?([+-]?\d+\.?\d*%)/gi,
    ];

    extractToSet(pricePatterns, pairData.price, 3);
    extractToSet(volumePatterns, pairData.volume, 3);
    extractToSet(changePatterns, pairData.change, 3);

    let result = `Trading Pair Data for ${pair}:\n`;
    
    if (pairData.price.size > 0) {
      result += `  Price: ${Array.from(pairData.price)[0]}\n`;
    }
    if (pairData.volume.size > 0) {
      result += `  Volume: ${Array.from(pairData.volume)[0]}\n`;
    }
    if (pairData.change.size > 0) {
      result += `  24h Change: ${Array.from(pairData.change)[0]}`;
    }

    if (pairData.price.size === 0 && pairData.volume.size === 0 && pairData.change.size === 0) {
      result = `No trading pair data found for ${pair}`;
    }

    return {
      content: [
        {
          type: "text",
          text: result,
        },
      ],
    };
  },
};

export const getDeFiData: Tool = {
  schema: {
    name: GetDeFiDataTool.shape.name.value,
    description: GetDeFiDataTool.shape.description.value,
    inputSchema: zodToJsonSchema(GetDeFiDataTool.shape.arguments),
  },
  handle: async (context: Context, params) => {
    const { dataType } = GetDeFiDataTool.shape.arguments.parse(params);

    const snapshot = await captureAriaSnapshot(context);
    const snapshotText = snapshot.content
      .filter((c) => c.type === "text")
      .map((c) => (c as any).text)
      .join("\n");

    const defiData: Record<string, Set<string>> = {
      apy: new Set(),
      liquidity: new Set(),
      staking: new Set(),
    };

    // ⚡ Bolt: Optimize performance by lazily iterating regex matches to a limit
    // instead of fully evaluating the document and allocating large intermediate arrays.
    const extractToSet = (patterns: RegExp[], targetSet: Set<string>, limit: number) => {
      for (const pattern of patterns) {
        let count = 0;
        for (const match of snapshotText.matchAll(pattern)) {
          targetSet.add(match[0]);
          if (++count >= limit) break;
        }
      }
    };

    // APY/APR patterns
    const apyPatterns = [
      /(\d+\.?\d*%)\s*(?:APY|APR)/gi,
      /(?:APY|APR).*?(\d+\.?\d*%)/gi,
    ];

    // Liquidity patterns
    const liquidityPatterns = [
      /liquidity.*?\$?([\d,.]+[KMB]?)/gi,
      /TVL.*?\$?([\d,.]+[KMB]?)/gi,
    ];

    // Staking patterns
    const stakingPatterns = [
      /staking.*?(\d+\.?\d*)/gi,
      /rewards.*?(\d+\.?\d*)\s*(?:ETH|%)/gi,
    ];

    if (dataType === "apy" || dataType === "all") {
      extractToSet(apyPatterns, defiData.apy, 5);
    }

    if (dataType === "liquidity" || dataType === "all") {
      extractToSet(liquidityPatterns, defiData.liquidity, 5);
    }

    if (dataType === "staking" || dataType === "all") {
      extractToSet(stakingPatterns, defiData.staking, 5);
    }

    let result = "DeFi Data:\n";
    let foundData = false;

    if (defiData.apy.size > 0) {
      result += `  APY/APR: ${Array.from(defiData.apy).join(", ")}\n`;
      foundData = true;
    }
    if (defiData.liquidity.size > 0) {
      result += `  Liquidity/TVL: ${Array.from(defiData.liquidity).join(", ")}\n`;
      foundData = true;
    }
    if (defiData.staking.size > 0) {
      result += `  Staking: ${Array.from(defiData.staking).join(", ")}`;
      foundData = true;
    }

    if (!foundData) {
      result = "No DeFi data found on page";
    }

    return {
      content: [
        {
          type: "text",
          text: result,
        },
      ],
    };
  },
};

export const monitorEthTransaction: Tool = {
  schema: {
    name: MonitorEthTransactionTool.shape.name.value,
    description: MonitorEthTransactionTool.shape.description.value,
    inputSchema: zodToJsonSchema(MonitorEthTransactionTool.shape.arguments),
  },
  handle: async (context: Context, params) => {
    const { txHash, refreshInterval } = MonitorEthTransactionTool.shape.arguments.parse(params);

    const snapshot = await captureAriaSnapshot(context);
    const snapshotText = snapshot.content
      .filter((c) => c.type === "text")
      .map((c) => (c as any).text)
      .join("\n");

    // Look for transaction status indicators
    const statusPatterns = [
      /status.*?(success|failed|pending|confirmed)/gi,
      /(success|failed|pending|confirmed)/gi,
    ];

    const confirmationPatterns = [
      /(\d+)\s*(?:confirmations?|blocks?)/gi,
    ];

    const gasPatterns = [
      /gas\s*used.*?(\d+\.?\d*)/gi,
      /transaction\s*fee.*?(\d+\.?\d*\s*ETH)/gi,
    ];

    let status = "unknown";
    let confirmations = "0";
    let gasUsed = "N/A";

    for (const pattern of statusPatterns) {
      const match = snapshotText.match(pattern);
      if (match) {
        status = match[0];
        break;
      }
    }

    for (const pattern of confirmationPatterns) {
      const match = snapshotText.match(pattern);
      if (match) {
        confirmations = match[0];
        break;
      }
    }

    for (const pattern of gasPatterns) {
      const match = snapshotText.match(pattern);
      if (match) {
        gasUsed = match[0];
        break;
      }
    }

    const result = [
      "ETH Transaction Status:",
      txHash ? `  Hash: ${txHash}` : "",
      `  Status: ${status}`,
      `  Confirmations: ${confirmations}`,
      `  Gas: ${gasUsed}`,
      "",
      `Monitoring with ${refreshInterval}s refresh interval.`,
      "Use browser_wait and repeat this tool to continue monitoring.",
    ]
      .filter(Boolean)
      .join("\n");

    return {
      content: [
        {
          type: "text",
          text: result,
        },
      ],
    };
  },
};
