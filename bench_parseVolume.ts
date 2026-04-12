import { performance } from "perf_hooks";
import { parseVolume } from "./src/utils/trading.ts";

const start = performance.now();
for (let i = 0; i < 100000; i++) {
  parseVolume("1.5K");
  parseVolume("2.3M");
  parseVolume("4.5B");
  parseVolume("123");
}
const end = performance.now();

console.log(`Original parseVolume: ${(end - start).toFixed(2)}ms`);

const multipliers: Record<string, number> = {
  K: 1000,
  M: 1000000,
  B: 1000000000,
};

export function parseVolumeOpt(volumeString: string): number | null {
  if (!volumeString) return null;

  const cleaned = volumeString.replace(/[^0-9.KMB]/gi, "").toUpperCase();
  let num = parseFloat(cleaned);
  if (isNaN(num)) return null;

  const lastChar = cleaned[cleaned.length - 1];
  if (lastChar && multipliers[lastChar]) {
    num *= multipliers[lastChar];
  }

  return num;
}

const start2 = performance.now();
for (let i = 0; i < 100000; i++) {
  parseVolumeOpt("1.5K");
  parseVolumeOpt("2.3M");
  parseVolumeOpt("4.5B");
  parseVolumeOpt("123");
}
const end2 = performance.now();

console.log(`Optimized parseVolume: ${(end2 - start2).toFixed(2)}ms`);
