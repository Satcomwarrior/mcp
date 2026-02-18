import { execSync } from "node:child_process";
import net from "node:net";

export function validatePort(port: number): number {
  if (typeof port !== "number" || isNaN(port) || !Number.isInteger(port)) {
    throw new Error(`Invalid port: ${port}. Port must be an integer.`);
  }
  if (port < 0 || port > 65535) {
    throw new Error(`Invalid port: ${port}. Port must be between 0 and 65535.`);
  }
  return port;
}

export async function isPortInUse(port: number): Promise<boolean> {
  validatePort(port);
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(true)); // Port is still in use
    server.once("listening", () => {
      server.close(() => resolve(false)); // Port is free
    });
    server.listen(port);
  });
}

export function killProcessOnPort(port: number) {
  validatePort(port);
  try {
    if (process.platform === "win32") {
      execSync(
        `FOR /F "tokens=5" %a in ('netstat -ano ^| findstr :${port}') do taskkill /F /PID %a`,
      );
    } else {
      execSync(`lsof -ti:${port} | xargs kill -9`);
    }
  } catch (error) {
    console.error(`Failed to kill process on port ${port}:`, error);
  }
}
