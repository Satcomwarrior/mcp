const text = "Price: $1,234.56 USD Quote: 1,300.00 USD Last: 1,250.00 $100.50";

const pricePatterns = [
      /\$\d[\d,]*\.?\d*/g,
      /\d[\d,]*\.?\d*\s*USD/gi,
      /Price:\s*\d[\d,]*\.?\d*/gi,
      /Quote:\s*\d[\d,]*\.?\d*/gi,
      /Last:\s*\d[\d,]*\.?\d*/gi,
    ];

const prices1: string[] = [];
for (const pattern of pricePatterns) {
    const matches = text.match(pattern);
    if (matches) {
        prices1.push(...matches);
    }
}
console.log("old:", prices1);

const PRICE_REGEX = /(?:\$\d[\d,]*\.?\d*|\d[\d,]*\.?\d*\s*USD|(?:Price|Quote|Last):\s*\d[\d,]*\.?\d*)/gi;
const prices2: string[] = [];
const matches = text.match(PRICE_REGEX);
if (matches) {
    prices2.push(...matches);
}
console.log("new:", prices2);
