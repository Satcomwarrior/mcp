import { execSync } from "node:child_process";
import net from "node:net";

export async function isPortInUse(port: number): Promise<boolean> {
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
  // Validate port is a safe integer and within valid range to prevent command injection
  const portNum = Number(port);
  if (!Number.isInteger(portNum) || portNum < 0 || portNum > 65535) {
    throw new Error(`Invalid port number: ${port}`);
  }

  try {
    if (process.platform === "win32") {
      execSync(
        `FOR /F "tokens=5" %a in ('netstat -ano ^| findstr :${portNum}') do taskkill /F /PID %a`,
      );
    } else {
      execSync(`lsof -ti:${portNum} | xargs kill -9`);
    }
  } catch (error) {
    console.error(`Failed to kill process on port ${portNum}:`, error);
  }
}
