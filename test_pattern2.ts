const text = "Price: $1,234.56 USD Quote: 1,300.00 USD Last: 1,250.00 $100.50";

const PRICE_REGEXES = [
  /\$\d[\d,]*\.?\d*/g,
  /\d[\d,]*\.?\d*\s*USD/gi,
  /(?:Price|Quote|Last):\s*\d[\d,]*\.?\d*/gi
];
const prices2: string[] = [];
for (const pattern of PRICE_REGEXES) {
  const matches = text.match(pattern);
  if (matches) {
      prices2.push(...matches);
  }
}
console.log("new:", prices2);
