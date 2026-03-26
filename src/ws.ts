import { WebSocketServer } from "ws";

import { mcpConfig } from "@repo/config/mcp.config";
import { wait } from "@repo/utils";

import { isPortInUse, killProcessOnPort } from "@/utils/port";

export async function createWebSocketServer(
  port: number = mcpConfig.defaultWsPort,
): Promise<WebSocketServer> {
  killProcessOnPort(port);
  // Wait until the port is free
  while (await isPortInUse(port)) {
    await wait(100);
  }
  // SEC-FIX: Explicitly bind to localhost (127.0.0.1) to prevent exposing the MCP server
  // to external networks, which could allow unauthorized remote command execution.
  return new WebSocketServer({ port, host: "127.0.0.1" });
}
