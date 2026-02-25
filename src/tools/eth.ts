import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

import type { Context } from "@/context";
import { captureAriaSnapshot } from "@/utils/aria-snapshot";

import type { Tool } from "./tool";

// Regex Patterns (Hoisted for performance)
const GAS_PRICE_PATTERNS = [
  /(?:slow|low|standard|average|fast|rapid).*?(\d+\.?\d*)\s*gwei/gi,
  /gas.*?(\d+\.?\d*)\s*gwei/gi,
  /(\d+\.?\d*)\s*gwei/gi,
];
// Optimization: Pre-compiled regexes for fast filtering
const GAS_PRICE_FAST_CHECK = /gwei/i;
const GAS_PRICE_SLOW_CHECK = /slow|low/i;
const GAS_PRICE_FAST_TYPE_CHECK = /fast|rapid/i;

const BALANCE_PATTERNS = [
  /(\d+\.?\d*)\s*ETH/gi,
  /balance.*?(\d+\.?\d*)\s*ETH/gi,
  /ETH.*?(\d+\.?\d*)/gi,
];
const USD_PATTERNS = [
  /\$[\d,]+\.?\d*/g,
  /USD.*?[\d,]+\.?\d*/gi,
];
const TOKEN_PATTERN = /(\d+\.?\d*)\s*([A-Z]{2,10})\b/g;

const PAIR_PRICE_PATTERNS = [
  /price.*?(\d+\.?\d*)/gi,
  /(\d+\.\d{2,})\s*(?:USDT|USD|BTC)/gi,
];
const PAIR_VOLUME_PATTERNS = [
  /volume.*?([\d,.]+[KMB]?)/gi,
  /24h.*?vol.*?([\d,.]+[KMB]?)/gi,
];
const PAIR_CHANGE_PATTERNS = [
  /24h.*?([+-]?\d+\.?\d*%)/gi,
  /change.*?([+-]?\d+\.?\d*%)/gi,
];

const DEFI_APY_PATTERNS = [
  /(\d+\.?\d*%)\s*(?:APY|APR)/gi,
  /(?:APY|APR).*?(\d+\.?\d*%)/gi,
];
const DEFI_LIQUIDITY_PATTERNS = [
  /liquidity.*?\$?([\d,.]+[KMB]?)/gi,
  /TVL.*?\$?([\d,.]+[KMB]?)/gi,
];
const DEFI_STAKING_PATTERNS = [
  /staking.*?(\d+\.?\d*)/gi,
  /rewards.*?(\d+\.?\d*)\s*(?:ETH|%)/gi,
];

const TX_STATUS_PATTERNS = [
  /status.*?(success|failed|pending|confirmed)/gi,
  /(success|failed|pending|confirmed)/gi,
];
const TX_CONFIRMATION_PATTERNS = [
  /(\d+)\s*(?:confirmations?|blocks?)/gi,
];
const TX_GAS_PATTERNS = [
  /gas\s*used.*?(\d+\.?\d*)/gi,
  /transaction\s*fee.*?(\d+\.?\d*\s*ETH)/gi,
];

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

    const gasPrices: { type: string; value: string }[] = [];
    const lines = snapshotText.split("\n");

    for (const line of lines) {
      // Optimization: Fast fail if line doesn't contain 'gwei'
      if (!GAS_PRICE_FAST_CHECK.test(line)) continue;

      // Try to identify gas price type
      let gasType = "standard";
      // Optimization: Use regex test instead of toLowerCase + includes
      if (GAS_PRICE_SLOW_CHECK.test(line)) {
        gasType = "slow";
      } else if (GAS_PRICE_FAST_TYPE_CHECK.test(line)) {
        gasType = "fast";
      }

      for (const pattern of GAS_PRICE_PATTERNS) {
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

    const balances: string[] = [];
    const usdValues: string[] = [];

    for (const pattern of BALANCE_PATTERNS) {
      const matches = snapshotText.match(pattern);
      if (matches) {
        balances.push(...matches);
      }
    }

    if (includeTokens) {
      // Look for ERC-20 token balances
      const tokens = snapshotText.match(TOKEN_PATTERN) || [];
      balances.push(...tokens.filter(t => !t.includes('ETH')));
    }

    for (const pattern of USD_PATTERNS) {
      const matches = snapshotText.match(pattern);
      if (matches) {
        usdValues.push(...matches.slice(0, 3)); // Limit to first 3 USD values
      }
    }

    const uniqueBalances = [...new Set(balances)].slice(0, 10);
    const uniqueUsdValues = [...new Set(usdValues)].slice(0, 5);

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
    const pairData: Record<string, string[]> = {
      price: [],
      volume: [],
      change: [],
    };

    for (const pattern of PAIR_PRICE_PATTERNS) {
      const matches = snapshotText.match(pattern);
      if (matches) {
        pairData.price.push(...matches.slice(0, 3));
      }
    }

    for (const pattern of PAIR_VOLUME_PATTERNS) {
      const matches = snapshotText.match(pattern);
      if (matches) {
        pairData.volume.push(...matches.slice(0, 3));
      }
    }

    for (const pattern of PAIR_CHANGE_PATTERNS) {
      const matches = snapshotText.match(pattern);
      if (matches) {
        pairData.change.push(...matches.slice(0, 3));
      }
    }

    let result = `Trading Pair Data for ${pair}:\n`;
    
    if (pairData.price.length > 0) {
      result += `  Price: ${pairData.price[0]}\n`;
    }
    if (pairData.volume.length > 0) {
      result += `  Volume: ${pairData.volume[0]}\n`;
    }
    if (pairData.change.length > 0) {
      result += `  24h Change: ${pairData.change[0]}`;
    }

    if (pairData.price.length === 0 && pairData.volume.length === 0 && pairData.change.length === 0) {
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

    const defiData: Record<string, string[]> = {
      apy: [],
      liquidity: [],
      staking: [],
    };

    if (dataType === "apy" || dataType === "all") {
      for (const pattern of DEFI_APY_PATTERNS) {
        const matches = snapshotText.match(pattern);
        if (matches) {
          defiData.apy.push(...matches.slice(0, 5));
        }
      }
    }

    if (dataType === "liquidity" || dataType === "all") {
      for (const pattern of DEFI_LIQUIDITY_PATTERNS) {
        const matches = snapshotText.match(pattern);
        if (matches) {
          defiData.liquidity.push(...matches.slice(0, 5));
        }
      }
    }

    if (dataType === "staking" || dataType === "all") {
      for (const pattern of DEFI_STAKING_PATTERNS) {
        const matches = snapshotText.match(pattern);
        if (matches) {
          defiData.staking.push(...matches.slice(0, 5));
        }
      }
    }

    let result = "DeFi Data:\n";
    let foundData = false;

    if (defiData.apy.length > 0) {
      result += `  APY/APR: ${[...new Set(defiData.apy)].join(", ")}\n`;
      foundData = true;
    }
    if (defiData.liquidity.length > 0) {
      result += `  Liquidity/TVL: ${[...new Set(defiData.liquidity)].join(", ")}\n`;
      foundData = true;
    }
    if (defiData.staking.length > 0) {
      result += `  Staking: ${[...new Set(defiData.staking)].join(", ")}`;
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

    let status = "unknown";
    let confirmations = "0";
    let gasUsed = "N/A";

    for (const pattern of TX_STATUS_PATTERNS) {
      const match = snapshotText.match(pattern);
      if (match) {
        status = match[0];
        break;
      }
    }

    for (const pattern of TX_CONFIRMATION_PATTERNS) {
      const match = snapshotText.match(pattern);
      if (match) {
        confirmations = match[0];
        break;
      }
    }

    for (const pattern of TX_GAS_PATTERNS) {
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
