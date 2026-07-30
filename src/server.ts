import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { Context } from "@/context";
import type { Resource } from "@/resources/resource";
import type { Tool } from "@/tools/tool";
import { createWebSocketServer } from "@/ws";

type Options = {
  name: string;
  version: string;
  tools: Tool[];
  resources: Resource[];
};

export async function createServerWithTools(options: Options): Promise<Server> {
  const { name, version, tools, resources } = options;

  // Optimization: Pre-calculate maps for O(1) lookup
  // We iterate manually to ensure "first match wins" behavior, mirroring Array.find()
  const toolsMap = new Map<string, Tool>();
  for (const tool of tools) {
    if (!toolsMap.has(tool.schema.name)) {
      toolsMap.set(tool.schema.name, tool);
    }
  }

  const resourcesMap = new Map<string, Resource>();
  for (const resource of resources) {
    if (!resourcesMap.has(resource.schema.uri)) {
      resourcesMap.set(resource.schema.uri, resource);
    }
  }

  // Optimization: Pre-calculate schema lists to avoid mapping on every request
  const toolSchemas = tools.map((tool) => tool.schema);
  const resourceSchemas = resources.map((resource) => resource.schema);

  const context = new Context();
  const server = new Server(
    { name, version },
    {
      capabilities: {
        tools: {},
        resources: {},
      },
    },
  );

  const wss = await createWebSocketServer();
  wss.on("connection", (websocket) => {
    // Close any existing connections
    if (context.hasWs()) {
      context.ws.close();
    }
    context.ws = websocket;
  });

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: toolSchemas };
  });

  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return { resources: resourceSchemas };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    // Optimization: Use O(1) Map lookup
    const tool = toolsMap.get(request.params.name);
    if (!tool) {
      return {
        content: [
          { type: "text", text: `Tool "${request.params.name}" not found` },
        ],
        isError: true,
      };
    }

    try {
      const result = await tool.handle(context, request.params.arguments);
      return result;
    } catch (error) {
      return {
        content: [{ type: "text", text: String(error) }],
        isError: true,
      };
    }
  });

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    // Optimization: Use O(1) Map lookup
    const resource = resourcesMap.get(request.params.uri);
    if (!resource) {
      return { contents: [] };
    }

    const contents = await resource.read(context, request.params.uri);
    return { contents };
  });

  server.close = async () => {
    await server.close();
    await wss.close();
    await context.close();
  };

  return server;
}
