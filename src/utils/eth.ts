/**
 * ETH-specific utilities for Ethereum trading
 */

/**
 * Convert between ETH units
 */
export function convertEthUnits(
  value: number,
  from: "wei" | "gwei" | "eth",
  to: "wei" | "gwei" | "eth"
): number {
  // Conversion factors
  const weiPerEth = 1e18;
  const gweiPerEth = 1e9;
  const weiPerGwei = 1e9;

  // Convert to wei first
  let valueInWei: number;
  switch (from) {
    case "wei":
      valueInWei = value;
      break;
    case "gwei":
      valueInWei = value * weiPerGwei;
      break;
    case "eth":
      valueInWei = value * weiPerEth;
      break;
  }

  // Convert from wei to target
  switch (to) {
    case "wei":
      return valueInWei;
    case "gwei":
      return valueInWei / weiPerGwei;
    case "eth":
      return valueInWei / weiPerEth;
  }
}

/**
 * Format ETH amount with appropriate precision
 */
export function formatEthAmount(amount: number, maxDecimals = 8): string {
  if (amount === 0) return "0 ETH";
  
  // For very small amounts, use scientific notation
  if (amount < 0.000001) {
    return `${amount.toExponential(4)} ETH`;
  }
  
  // For small amounts, show more decimals
  if (amount < 0.01) {
    return `${amount.toFixed(8)} ETH`;
  }
  
  // For normal amounts, show fewer decimals
  return `${amount.toFixed(Math.min(maxDecimals, 6))} ETH`;
}

/**
 * Format gas price in Gwei
 */
export function formatGasPrice(gwei: number): string {
  return `${gwei.toFixed(2)} Gwei`;
}

/**
 * Calculate gas cost in ETH
 */
export function calculateGasCost(
  gasUsed: number,
  gasPriceGwei: number
): number {
  const gasCostWei = gasUsed * gasPriceGwei * 1e9;
  return gasCostWei / 1e18; // Convert to ETH
}

/**
 * Estimate transaction cost
 */
export function estimateTransactionCost(
  gasLimit: number,
  gasPriceGwei: number
): {
  costEth: number;
  costUsd: number | null;
  formattedCost: string;
} {
  const costEth = calculateGasCost(gasLimit, gasPriceGwei);
  
  return {
    costEth,
    costUsd: null, // Would need ETH price to calculate
    formattedCost: formatEthAmount(costEth, 6),
  };
}

/**
 * Parse ETH address
 */
export function isValidEthAddress(address: string): boolean {
  // Basic validation: 0x followed by 40 hex characters
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Shorten ETH address for display
 */
export function shortenAddress(address: string): string {
  if (!isValidEthAddress(address)) return address;
  return `${address.substring(0, 6)}...${address.substring(38)}`;
}

/**
 * Parse gas price from string (e.g., "50 gwei")
 */
export function parseGasPrice(gasPriceString: string): number | null {
  const match = gasPriceString.match(/(\d+\.?\d*)\s*gwei/i);
  if (!match) return null;
  return parseFloat(match[1]);
}

/**
 * Parse ETH amount from string
 */
export function parseEthAmount(ethString: string): number | null {
  // Remove ETH suffix and parse
  const cleaned = ethString.replace(/ETH/gi, "").trim();
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Calculate slippage for DEX trades
 */
export function calculateSlippage(
  expectedPrice: number,
  actualPrice: number
): number {
  if (expectedPrice === 0) return 0;
  return ((actualPrice - expectedPrice) / expectedPrice) * 100;
}

/**
 * Validate slippage is within tolerance
 */
export function isSlippageAcceptable(
  expectedPrice: number,
  actualPrice: number,
  maxSlippagePercent = 1.0
): boolean {
  const slippage = Math.abs(calculateSlippage(expectedPrice, actualPrice));
  return slippage <= maxSlippagePercent;
}

/**
 * Format trading pair
 */
export function formatTradingPair(base: string, quote: string): string {
  return `${base.toUpperCase()}/${quote.toUpperCase()}`;
}

/**
 * Parse trading pair
 */
export function parseTradingPair(pair: string): {
  base: string;
  quote: string;
} | null {
  const match = pair.match(/^([A-Z0-9]+)[\/\-]([A-Z0-9]+)$/i);
  if (!match) return null;
  
  return {
    base: match[1].toUpperCase(),
    quote: match[2].toUpperCase(),
  };
}

/**
 * Common ETH trading pairs
 */
export const COMMON_ETH_PAIRS = [
  "ETH/USDT",
  "ETH/USD",
  "ETH/BTC",
  "ETH/EUR",
  "ETH/USDC",
  "ETH/DAI",
] as const;

/**
 * Check if a pair is an ETH pair
 */
export function isEthPair(pair: string): boolean {
  const parsed = parseTradingPair(pair);
  if (!parsed) return false;
  return parsed.base === "ETH" || parsed.quote === "ETH";
}

/**
 * Gas limits for common operations
 */
export const COMMON_GAS_LIMITS = {
  TRANSFER: 21000,
  ERC20_TRANSFER: 65000,
  UNISWAP_SWAP: 150000,
  APPROVE: 50000,
  COMPLEX_DEFI: 300000,
} as const;

/**
 * Estimate gas limit based on operation type
 */
export function estimateGasLimit(
  operationType: keyof typeof COMMON_GAS_LIMITS | "custom"
): number {
  if (operationType === "custom") {
    return 100000; // Default fallback
  }
  return COMMON_GAS_LIMITS[operationType];
}

/**
 * Calculate APY from APR
 */
export function calculateAPY(apr: number, compoundsPerYear = 365): number {
  return (Math.pow(1 + apr / 100 / compoundsPerYear, compoundsPerYear) - 1) * 100;
}

/**
 * Calculate APR from APY
 */
export function calculateAPR(apy: number, compoundsPerYear = 365): number {
  return (Math.pow(1 + apy / 100, 1 / compoundsPerYear) - 1) * compoundsPerYear * 100;
}

/**
 * Parse DeFi percentage (APY/APR)
 */
export function parseDeFiPercentage(percentString: string): {
  value: number;
  type: "APY" | "APR" | "unknown";
} | null {
  const match = percentString.match(/(\d+\.?\d*)%?\s*(APY|APR)?/i);
  if (!match) return null;
  
  const value = parseFloat(match[1]);
  const type = match[2]?.toUpperCase() as "APY" | "APR" || "unknown";
  
  return { value, type };
}

/**
 * Validate ETH transaction hash
 */
export function isValidTxHash(hash: string): boolean {
  // Transaction hash: 0x followed by 64 hex characters
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

/**
 * Calculate position size in ETH
 */
export function calculatePositionSize(
  portfolioValueEth: number,
  allocationPercent: number
): number {
  return (portfolioValueEth * allocationPercent) / 100;
}

/**
 * Calculate risk/reward ratio
 */
export function calculateRiskReward(
  entryPrice: number,
  targetPrice: number,
  stopLoss: number
): number {
  const reward = Math.abs(targetPrice - entryPrice);
  const risk = Math.abs(entryPrice - stopLoss);
  
  if (risk === 0) return 0;
  return reward / risk;
}
