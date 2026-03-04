import fs from 'fs';

const p = 'src/tools/trading.ts';
let code = fs.readFileSync(p, 'utf-8');

const target = `      if (found && found.length > 0) {
        marketData[point] = [...new Set(found)];
      }`;

const replacement = `      if (found && found.length > 0) {
        marketData[point] = [...new Set<string>(found)];
      }`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  console.log('patched');
  fs.writeFileSync(p, code);
} else {
  console.log('not found');
}
