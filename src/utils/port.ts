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
    // SECURITY: Using execFileSync with an array of arguments to avoid shell injection
    if (process.platform === "win32") {
      const output = execFileSync("netstat", ["-ano"]).toString();
      const lines = output.split('\n');
      for (const line of lines) {
        if (line.includes(`:${port}`)) {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && pid !== "0") {
            try {
              execFileSync("taskkill", ["/F", "/PID", pid]);
            } catch (e) {
              // Ignore taskkill errors for individual processes
            }
          }
        }
      }
    } else {
      let output = "";
      try {
        output = execFileSync("lsof", ["-t", `-i:${port}`]).toString();
      } catch (e) {
        // lsof returns non-zero exit code if no processes are found
        return;
      }

      const pids = output.trim().split('\n').filter(Boolean);
      for (const pid of pids) {
        try {
          execFileSync("kill", ["-9", pid]);
        } catch (e) {
          // Ignore kill errors for individual processes
        }
      }
    }
  } catch (error) {
    console.error(`Failed to kill process on port ${port}:`, error);
  }
}
