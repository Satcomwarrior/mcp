import { performance } from 'node:perf_hooks';

const snapshotText = `
Price is $1,234.56. Vol is 10K. Other details: None.
Volume: 10K.
Market Cap: 1B
24h: +5%
High: 1,300.00
Low: 1,200.00
`.repeat(100);

function oldGetMarketData() {
    const marketData: Record<string, string[]> = {};

    const patterns: Record<string, RegExp[]> = {
      price: [/\$[\d,]+\.?\d*/g, /Price:\s*[\d,]+\.?\d*/gi],
      volume: [/Volume:\s*[\d,]+\.?\d*[KMB]?/gi, /Vol:\s*[\d,]+\.?\d*[KMB]?/gi],
      market_cap: [/Market Cap:\s*[\d,]+\.?\d*[KMB]?/gi, /Mkt Cap:\s*[\d,]+\.?\d*[KMB]?/gi],
      change_24h: [/24h:\s*[+-]?[\d,]+\.?\d*%?/gi, /Change:\s*[+-]?[\d,]+\.?\d*%?/gi],
      high_24h: [/High:\s*[\d,]+\.?\d*/gi, /24h High:\s*[\d,]+\.?\d*/gi],
      low_24h: [/Low:\s*[\d,]+\.?\d*/gi, /24h Low:\s*[\d,]+\.?\d*/gi],
    };

    const requestedPoints = Object.keys(patterns);

    for (const point of requestedPoints) {
      if (point === "all") continue;
      const pointPatterns = patterns[point as keyof typeof patterns] || [];
      const matches: string[] = [];

      for (const pattern of pointPatterns) {
        const found = snapshotText.match(pattern);
        if (found) {
          matches.push(...found);
        }
      }

      if (matches.length > 0) {
        marketData[point] = [...new Set(matches)];
      }
    }
    return marketData;
}

const MARKET_DATA_PATTERNS: Record<string, RegExp> = {
  price: /(?:\$[\d,]+\.?\d*|Price:\s*[\d,]+\.?\d*)/gi,
  volume: /(?:Volume|Vol):\s*[\d,]+\.?\d*[KMB]?/gi,
  market_cap: /(?:Market Cap|Mkt Cap):\s*[\d,]+\.?\d*[KMB]?/gi,
  change_24h: /(?:24h|Change):\s*[+-]?[\d,]+\.?\d*%?/gi,
  high_24h: /(?:High|24h High):\s*[\d,]+\.?\d*/gi,
  low_24h: /(?:Low|24h Low):\s*[\d,]+\.?\d*/gi,
};

function newGetMarketData() {
    const marketData: Record<string, string[]> = {};
    const requestedPoints = Object.keys(MARKET_DATA_PATTERNS);

    for (const point of requestedPoints) {
      if (point === "all") continue;

      // Use the combined pattern
      const pattern = MARKET_DATA_PATTERNS[point];
      const matches = snapshotText.match(pattern);

      if (matches && matches.length > 0) {
        marketData[point] = [...new Set(matches)];
      }
    }
    return marketData;
}

const start1 = performance.now();
for (let i = 0; i < 1000; i++) oldGetMarketData();
console.log('old:', performance.now() - start1);

const start2 = performance.now();
for (let i = 0; i < 1000; i++) newGetMarketData();
console.log('new:', performance.now() - start2);
