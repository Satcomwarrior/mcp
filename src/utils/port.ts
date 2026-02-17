import { execSync } from "node:child_process";
import net from "node:net";

/**
 * Validates that the input is a safe port number.
 * Throws an error if the port is invalid.
 */
function validatePort(port: unknown): number {
  const portNum = Number(port);
  if (!Number.isInteger(portNum) || portNum < 0 || portNum > 65535) {
    throw new Error(`Invalid port: ${port}. Must be an integer between 0 and 65535.`);
  }
  return portNum;
}

export async function isPortInUse(port: number): Promise<boolean> {
  const validPort = validatePort(port);
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(true)); // Port is still in use
    server.once("listening", () => {
      server.close(() => resolve(false)); // Port is free
    });
    // Bind to localhost for security to avoid exposing the port check to the network
    server.listen(validPort, "127.0.0.1");
  });
}

export function killProcessOnPort(port: number) {
  try {
    // Validate input before using it in shell commands to prevent command injection
    const validPort = validatePort(port);

    if (process.platform === "win32") {
      execSync(
        `FOR /F "tokens=5" %a in ('netstat -ano ^| findstr :${validPort}') do taskkill /F /PID %a`,
      );
    } else {
      execSync(`lsof -ti:${validPort} | xargs kill -9`);
    }
  } catch (error) {
    console.error(`Failed to kill process on port ${port}:`, error);
  }
}
