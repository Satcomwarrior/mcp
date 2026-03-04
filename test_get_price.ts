const text = "Price: $1,234.56 USD Quote: 1,300.00 USD Last: 1,250.00 $100.50";
const p1 = /\$\d[\d,]*\.?\d*/g;
const p2 = /\d[\d,]*\.?\d*\s*USD/gi;
const p3 = /Price:\s*\d[\d,]*\.?\d*/gi;
const p4 = /Quote:\s*\d[\d,]*\.?\d*/gi;
const p5 = /Last:\s*\d[\d,]*\.?\d*/gi;
console.log(text.match(p1));
console.log(text.match(p2));
console.log(text.match(p3));
console.log(text.match(p4));
console.log(text.match(p5));

const p = /(?:\$\d[\d,]*\.?\d*|\d[\d,]*\.?\d*\s*USD|(?:Price|Quote|Last):\s*\d[\d,]*\.?\d*)/gi;
console.log(text.match(p));
