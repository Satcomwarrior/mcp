import { formatPrice } from './src/utils/trading.ts';

function assertEq(actual: any, expected: any, msg: string) {
  if (actual !== expected) {
    throw new Error(`Assertion failed: ${msg}. Expected ${expected}, got ${actual}`);
  }
}

try {
  assertEq(formatPrice(1234.56, "USD"), "$1,234.56", "USD format");
  assertEq(formatPrice(1234.56, "EUR"), "€1,234.56", "EUR format");
  assertEq(formatPrice(1.23456789, "BTC"), "1.23456789 BTC", "BTC format");
  assertEq(formatPrice(1234.56, "USDT"), "$1,234.56", "USDT format");
  assertEq(formatPrice(1234.56, "INVALID"), "1234.56000000 INVALID", "INVALID format fallback");
  console.log("Tests passed!");
} catch (e) {
  console.error(e);
  process.exit(1);
}
