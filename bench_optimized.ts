import { performance } from "perf_hooks";

const numberFormatCache = new Map<string, Intl.NumberFormat>();

export function formatPriceOpt(price: number, currency = "USD"): string {
  if (currency === "BTC" || currency === "ETH") {
    return `${price.toFixed(8)} ${currency}`;
  }

  const maxDecimals = (currency === "USDT" || currency === "USD" || currency === "EUR" || currency === "GBP") ? 2 : 8;
  const actualCurrency = currency === "USDT" ? "USD" : currency;
  const cacheKey = `${actualCurrency}-${maxDecimals}`;

  let formatter = numberFormatCache.get(cacheKey);
  if (!formatter) {
    formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: actualCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: maxDecimals,
    });
    numberFormatCache.set(cacheKey, formatter);
  }

  return formatter.format(price);
}

const start = performance.now();
for (let i = 0; i < 100000; i++) {
  formatPriceOpt(1234.56, "USD");
  formatPriceOpt(1234.56, "EUR");
  formatPriceOpt(1234.56, "GBP");
  formatPriceOpt(1234.56, "JPY");
}
const end = performance.now();

console.log(`Optimized: ${(end - start).toFixed(2)}ms`);
