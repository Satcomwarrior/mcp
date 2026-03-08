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
      let output = "";
      try {
        output = execFileSync("netstat", ["-ano"], { encoding: "utf8" });
      } catch (e: any) {
        output = e.stdout || "";
      }
      const lines = output.split("\n");
      const pidsToKill = new Set<string>();
      for (const line of lines) {
        if (line.includes(`:${port}`)) {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && pid !== "0" && !isNaN(Number(pid))) {
            pidsToKill.add(pid);
          }
        }
      }
      for (const pid of pidsToKill) {
        try {
          execFileSync("taskkill", ["/F", "/PID", pid]);
        } catch (e) {
          // Ignore individual process kill failures
        }
      }
    } else {
      let output = "";
      try {
        output = execFileSync("lsof", ["-ti", `:${port}`], { encoding: "utf8" });
      } catch (e: any) {
        output = e.stdout || "";
      }
      const pids = output.split("\n").map((pid: string) => pid.trim()).filter(Boolean);
      for (const pid of pids) {
        try {
          execFileSync("kill", ["-9", pid]);
        } catch (e) {
          // Ignore individual process kill failures
        }
      }
    }
  } catch (error) {
    console.error(`Failed to kill process on port ${port}:`, error);
  }
}
