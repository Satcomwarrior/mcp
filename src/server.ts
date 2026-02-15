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

  // Optimize lookups by pre-calculating maps and schemas
  // Use maps for O(1) access instead of O(n) array scans
  const toolsMap = new Map<string, Tool>();
  const toolSchemas = tools.map((tool) => {
    if (!toolsMap.has(tool.schema.name)) {
      toolsMap.set(tool.schema.name, tool);
    }
    return tool.schema;
  });

  const resourcesMap = new Map<string, Resource>();
  const resourceSchemas = resources.map((resource) => {
    if (!resourcesMap.has(resource.schema.uri)) {
      resourcesMap.set(resource.schema.uri, resource);
    }
    return resource.schema;
  });

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
    // @ts-ignore - request.params.name is typed as string | undefined but Map.get expects string. However undefined is safe here.
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
    // @ts-ignore - request.params.uri is typed as string | undefined but Map.get expects string. However undefined is safe here.
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
