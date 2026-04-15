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
      const output = execFileSync("netstat", ["-ano"], { encoding: "utf8" });
      const lines = output.split("\n");
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (
          parts.length >= 5 &&
          parts[1].endsWith(`:${port}`) &&
          parts[3] === "LISTENING"
        ) {
          const pid = parts[4];
          if (/^\d+$/.test(pid)) {
            try {
              execFileSync("taskkill", ["/F", "/PID", pid]);
            } catch (err) {
              // Ignore individual kill errors
            }
          }
        }
      }
    } catch (error) {
      console.error(`Failed to execute netstat for port ${port}:`, error);
    }
  } else {
    try {
      const output = execFileSync("lsof", ["-i", `:${port}`, "-t"], { encoding: "utf8" });
      const pids = output.trim().split("\n");
      for (const pidStr of pids) {
        const pid = parseInt(pidStr, 10);
        if (!isNaN(pid)) {
          try {
            process.kill(pid, "SIGKILL");
          } catch (err) {
            // Ignore individual kill errors
          }
        }
      }
    } catch (error: any) {
      if (error.status !== 1) {
        console.error(`Failed to kill process on port ${port}:`, error);
      }
    }
  }
}
