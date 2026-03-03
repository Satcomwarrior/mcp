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
  try {
    if (process.platform === "win32") {
      const output = execFileSync("netstat", ["-ano"]).toString();
      const lines = output.split("\n");
      for (const line of lines) {
        if (line.includes(`:${port}`)) {
          const parts = line.trim().split(/\s+/);
          const pid = parts[4];
          if (pid && pid !== "0") {
            try {
              execFileSync("taskkill", ["/F", "/PID", pid]);
            } catch (err) {
              // Ignore process kill errors
            }
          }
        }
      }
    } else {
      const output = execFileSync("lsof", ["-t", `-i:${port}`]).toString();
      const pids = output.split("\n").filter(Boolean);
      for (const pid of pids) {
        try {
          execFileSync("kill", ["-9", pid]);
        } catch (err) {
          // Ignore process kill errors
        }
      }
    }
  } catch (error) {
    // Note: lsof returns exit code 1 if no process is found on the port.
    // That error is expected and can be ignored.
    // console.error(`Failed to kill process on port ${port}:`, error);
  }
}
