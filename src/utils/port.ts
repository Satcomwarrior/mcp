import { exec } from "node:child_process";
import { promisify } from "node:util";
import net from "node:net";

const execAsync = promisify(exec);

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

export async function killProcessOnPort(port: number) {
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error(`Invalid port number: ${port}`);
  }
  try {
    if (process.platform === "win32") {
      await execAsync(
        `FOR /F "tokens=5" %a in ('netstat -ano ^| findstr :${port}') do taskkill /F /PID %a`,
      );
    } else {
      await execAsync(`lsof -ti:${port} | xargs kill -9`);
    }
  } catch (error) {
    console.error(`Failed to kill process on port ${port}:`, error);
  }
}
