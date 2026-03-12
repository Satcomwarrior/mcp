import fs from 'fs';

const content = fs.readFileSync('src/ws.ts', 'utf8');
if (content.includes('host: "127.0.0.1"')) {
  console.log("Successfully verified 'host: \"127.0.0.1\"' is present in src/ws.ts");
} else {
  console.error("Failed to find 'host: \"127.0.0.1\"' in src/ws.ts");
  process.exit(1);
}
