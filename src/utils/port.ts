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
      // 🛡️ Security: Use execFileSync instead of execSync to prevent shell injection,
      // parse the output in Node.js instead of using shell pipes/loops.
      const output = execFileSync("netstat", ["-ano"], { encoding: "utf8" });
      const lines = output.split("\n");
      const pidsToKill = new Set<string>();

      for (const line of lines) {
        if (line.includes(`:${port}`)) {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 5) {
            const pid = parts[4];
            if (pid && pid !== "0") {
              pidsToKill.add(pid);
            }
          }
        }
      }

      for (const pid of pidsToKill) {
        try {
          execFileSync("taskkill", ["/F", "/PID", pid]);
        } catch (e) {
          // Ignore individual kill failures
        }
      }
    } else {
      // 🛡️ Security: Use execFileSync instead of execSync to prevent shell injection,
      // parse the output in Node.js instead of using shell pipes/loops.
      const output = execFileSync("lsof", ["-ti", `:${port}`], { encoding: "utf8" });
      const pids = output.trim().split("\n");

      for (const pid of pids) {
        if (pid) {
          try {
            execFileSync("kill", ["-9", pid]);
          } catch (e) {
            // Ignore individual kill failures
          }
        }
      }
    }
  } catch (error) {
    console.error(`Failed to kill process on port ${port}:`, error);
  }
}
