import { performance } from 'node:perf_hooks';

const snapshotText = `
Price: $1,234.56 USD
Quote: 1,300.00 USD
Last: 1,250.00
$100.50
`.repeat(100);

function oldGetPrice() {
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
    return [...new Set(prices)].length;
}

const PRICE_REGEXES = [
  /\$\d[\d,]*\.?\d*/g,
  /\d[\d,]*\.?\d*\s*USD/gi,
  /(?:Price|Quote|Last):\s*\d[\d,]*\.?\d*/gi
];

function newGetPrice() {
    const prices: string[] = [];
    for (const pattern of PRICE_REGEXES) {
      const matches = snapshotText.match(pattern);
      if (matches) {
          prices.push(...matches);
      }
    }
    return [...new Set(prices)].length;
}

const start1 = performance.now();
for (let i = 0; i < 1000; i++) oldGetPrice();
console.log('old:', performance.now() - start1);

const start2 = performance.now();
for (let i = 0; i < 1000; i++) newGetPrice();
console.log('new:', performance.now() - start2);
