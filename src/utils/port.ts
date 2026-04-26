import { execFileSync } from "node:child_process";
import net from "node:net";

/**
 * Validates that a port is a valid integer between 0 and 65535.
 * Throws an error if invalid.
 */
function validatePort(port: number): void {
  if (!Number.isInteger(port)) {
    throw new Error(`Invalid port: ${port}. Must be an integer.`);
  }
  if (port < 0 || port > 65535) {
    throw new Error(`Invalid port: ${port}. Must be between 0 and 65535.`);
  }
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
  if (process.platform === "win32") {
    try {
      const output = execFileSync("netstat", ["-ano"], { encoding: "utf-8" });
      const lines = output.split("\n");
      const pidsToKill = new Set<string>();

      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if ((parts.length === 4 || parts.length === 5) && parts[1].endsWith(`:${port}`)) {
          const pid = parts[parts.length - 1];
          if (pid && pid !== "0") {
            pidsToKill.add(pid);
          }
        }
      }

      for (const pid of pidsToKill) {
        try {
          execFileSync("taskkill", ["/F", "/PID", pid]);
        } catch (err) {
          console.error(`Failed to kill PID ${pid} on port ${port}:`, err);
        }
      }
    } catch (error) {
      console.error(`Failed to get netstat for port ${port}:`, error);
    }
  } else {
    try {
      const output = execFileSync("lsof", ["-t", `-i:${port}`], { encoding: "utf-8" });
      const pids = output.trim().split("\n").filter(Boolean);
      for (const pid of pids) {
        try {
          process.kill(parseInt(pid, 10), "SIGKILL");
        } catch (err) {
          console.error(`Failed to kill PID ${pid} on port ${port}:`, err);
        }
      }
    } catch (error: any) {
      if (error.status !== 1) {
        console.error(`Failed to kill process on port ${port}:`, error);
      }
    }
  }
}