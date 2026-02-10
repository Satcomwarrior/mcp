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

  // Optimize lookup performance by pre-calculating maps
  // We use a loop to ensure the first tool with a given name is used (matching Array.find behavior)
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

  // Pre-calculate schema lists
  const toolsSchemas = tools.map((tool) => tool.schema);
  const resourcesSchemas = resources.map((resource) => resource.schema);

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: toolsSchemas };
  });

  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return { resources: resourcesSchemas };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
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
    const resource = resourcesMap.get(request.params.uri);
    if (!resource) {
      return { contents: [] };
    }

    const contents = await resource.read(context, request.params.uri);
    return { contents };
  });

  // Capture original close method to avoid infinite recursion
  const originalClose = server.close.bind(server);
  server.close = async () => {
    await originalClose();
    await wss.close();
    await context.close();
  };

  return server;
}
