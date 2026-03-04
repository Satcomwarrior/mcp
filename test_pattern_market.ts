const text = "Volume: 10K Vol: 10K";
const p1 = /Volume:\s*[\d,]+\.?\d*[KMB]?/gi;
const p2 = /Vol:\s*[\d,]+\.?\d*[KMB]?/gi;
console.log(text.match(p1));
console.log(text.match(p2));

const p3 = /(?:Volume|Vol):\s*[\d,]+\.?\d*[KMB]?/gi;
console.log(text.match(p3));
