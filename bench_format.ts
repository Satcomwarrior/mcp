import { performance } from "perf_hooks";
import { formatPrice } from "./src/utils/trading.ts";

const start = performance.now();
for (let i = 0; i < 100000; i++) {
  formatPrice(1234.56, "USD");
  formatPrice(1234.56, "EUR");
  formatPrice(1234.56, "GBP");
  formatPrice(1234.56, "JPY");
}
const end = performance.now();

console.log(`Original: ${(end - start).toFixed(2)}ms`);
