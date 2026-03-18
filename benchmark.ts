import { formatPrice } from './src/utils/trading.ts';

const start = performance.now();
for (let i = 0; i < 100000; i++) {
  formatPrice(1234.56, "USD");
  formatPrice(1234.56, "EUR");
}
const end = performance.now();
console.log(`Original: ${end - start}ms`);
