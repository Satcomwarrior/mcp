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
  // 🛡️ SECURITY: Bind strictly to 127.0.0.1 (localhost) to prevent
  // the server from being accessible from external networks (0.0.0.0)
  return new WebSocketServer({ port, host: "127.0.0.1" });
}
