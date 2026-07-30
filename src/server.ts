import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { Context } from "@/context";
import type { Resource, ResourceSchema } from "@/resources/resource";
import type { Tool, ToolSchema } from "@/tools/tool";
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

  // Optimization: Use Map for O(1) lookup instead of Array.find (O(N))
  // Pre-calculate schemas to avoid mapping on every request
  const toolsMap = new Map<string, Tool>();
  const toolSchemas: ToolSchema[] = [];
  for (const tool of tools) {
    // First match wins to preserve Array.find behavior
    if (!toolsMap.has(tool.schema.name)) {
      toolsMap.set(tool.schema.name, tool);
      toolSchemas.push(tool.schema);
    }
  }

  const resourcesMap = new Map<string, Resource>();
  const resourceSchemas: ResourceSchema[] = [];
  for (const resource of resources) {
    // First match wins to preserve Array.find behavior
    if (!resourcesMap.has(resource.schema.uri)) {
      resourcesMap.set(resource.schema.uri, resource);
      resourceSchemas.push(resource.schema);
    }
  }

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

  server.close = async () => {
    await server.close();
    await wss.close();
    await context.close();
  };

  return server;
}
