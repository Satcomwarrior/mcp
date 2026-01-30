#!/usr/bin/env node
import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { program } from "commander";

import { appConfig } from "@repo/config/app.config";

import type { Resource } from "@/resources/resource";
import * as tradingResources from "@/resources/trading";
import { createServerWithTools } from "@/server";
import * as common from "@/tools/common";
import * as custom from "@/tools/custom";
import * as eth from "@/tools/eth";
import * as snapshot from "@/tools/snapshot";
import * as trading from "@/tools/trading";
import type { Tool } from "@/tools/tool";

import packageJSON from "../package.json";

function setupExitWatchdog(server: Server) {
  process.stdin.on("close", async () => {
    setTimeout(() => process.exit(0), 15000);
    await server.close();
    process.exit(0);
  });
}

const commonTools: Tool[] = [common.pressKey, common.wait];

const customTools: Tool[] = [custom.getConsoleLogs, custom.screenshot];

const tradingTools: Tool[] = [
  trading.getPrice,
  trading.executeTrade,
  trading.monitorPrice,
  trading.getPortfolio,
  trading.setPriceAlert,
  trading.getMarketData,
];

const ethTools: Tool[] = [
  eth.getGasPrice,
  eth.getEthBalance,
  eth.getEthPairData,
  eth.getDeFiData,
  eth.monitorEthTransaction,
];

const snapshotTools: Tool[] = [
  common.navigate(true),
  common.goBack(true),
  common.goForward(true),
  snapshot.snapshot,
  snapshot.click,
  snapshot.hover,
  snapshot.type,
  snapshot.selectOption,
  ...commonTools,
  ...customTools,
  ...tradingTools,
  ...ethTools,
];

const resources: Resource[] = [
  tradingResources.watchlist,
  tradingResources.positions,
  tradingResources.marketSummary,
];

async function createServer(): Promise<Server> {
  return createServerWithTools({
    name: appConfig.name,
    version: packageJSON.version,
    tools: snapshotTools,
    resources,
  });
}

/**
 * Note: Tools must be defined *before* calling `createServer` because only declarations are hoisted, not the initializations
 */
program
  .version("Version " + packageJSON.version)
  .name(packageJSON.name)
  .action(async () => {
    const server = await createServer();
    setupExitWatchdog(server);

    const transport = new StdioServerTransport();
    await server.connect(transport);
  });
program.parse(process.argv);
