import { formatPrice } from './src/utils/trading.ts';

const numberFormatCache = new Map<string, Intl.NumberFormat | null>();
const MAX_CACHE_SIZE = 1000;

function formatPriceOptimized(price: number, currency = "USD"): string {
  if (currency === "BTC" || currency === "ETH") {
    return `${price.toFixed(8)} ${currency}`;
  }

  const targetCurrency = currency === "USDT" ? "USD" : currency;
  const maxDecimals = (currency === "USDT" || currency === "USD" || currency === "EUR" || currency === "GBP") ? 2 : 8;

  const cacheKey = `${targetCurrency}-${maxDecimals}`;

  if (!numberFormatCache.has(cacheKey)) {
    if (numberFormatCache.size >= MAX_CACHE_SIZE) {
      const firstKey = numberFormatCache.keys().next().value;
      if (firstKey) numberFormatCache.delete(firstKey);
    }

    try {
      const formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: targetCurrency,
        minimumFractionDigits: 2,
        maximumFractionDigits: maxDecimals,
      });
      numberFormatCache.set(cacheKey, formatter);
    } catch (e) {
      numberFormatCache.set(cacheKey, null);
    }
  }

  const formatter = numberFormatCache.get(cacheKey);
  if (formatter) {
    return formatter.format(price);
  }

  return `${price.toFixed(maxDecimals)} ${targetCurrency}`;
}

const start = performance.now();
for (let i = 0; i < 100000; i++) {
  formatPriceOptimized(1234.56, "USD");
  formatPriceOptimized(1234.56, "EUR");
}
const end = performance.now();
console.log(`Optimized: ${end - start}ms`);
