import { formatPrice } from "./src/utils/trading.ts";

console.time("formatPrice - 10000 iterations");
for (let i = 0; i < 10000; i++) {
  formatPrice(1234.56, "USD");
  formatPrice(9876.54, "EUR");
  formatPrice(55.123, "GBP");
}
console.timeEnd("formatPrice - 10000 iterations");
