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
      const output = execFileSync("netstat", ["-ano"], { encoding: "utf8" });
      const lines = output.split('\n');
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 5 && parts[1].endsWith(`:${port}`)) {
          const pid = parts[4];
          if (pid && pid !== "0") {
            try {
              execFileSync("taskkill", ["/F", "/PID", pid]);
            } catch (err) {
              // Ignore failure to kill a specific PID
            }
          }
        }
      }
    } else {
      let output = "";
      try {
        output = execFileSync("lsof", ["-t", "-i", `:${port}`], { encoding: "utf8" });
      } catch (err) {
        return; // lsof returns non-zero if no process is found
      }
      const pids = output.trim().split('\n');
      for (const pid of pids) {
        if (pid) {
          try {
            execFileSync("kill", ["-9", pid]);
          } catch (err) {
            // Ignore failure to kill a specific PID (e.g. already terminated)
          }
        }
      }
    }
  } catch (error) {
    console.error(`Failed to kill process on port ${port}:`, error);
  }
}
