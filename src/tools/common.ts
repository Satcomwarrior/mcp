import { zodToJsonSchema } from "zod-to-json-schema";

import {
  GoBackTool,
  GoForwardTool,
  NavigateTool,
  PressKeyTool,
  WaitTool,
} from "@repo/types/mcp/tool";

import { captureAriaSnapshot } from "@/utils/aria-snapshot";

import type { Tool, ToolFactory } from "./tool";

export const navigate: ToolFactory = (snapshot) => ({
  schema: {
    name: NavigateTool.shape.name.value,
    description: NavigateTool.shape.description.value,
    inputSchema: zodToJsonSchema(NavigateTool.shape.arguments),
  },
  handle: async (context, params) => {
    const { url } = NavigateTool.shape.arguments.parse(params);

    // Security: Validate URL protocol to prevent XSS and local file inclusion
    let parsedUrl: URL;
    try {
      const trimmedUrl = url.trim().toLowerCase();
      // Handle schema-less localhost URLs which URL parser might misinterpret
      const isMissingScheme =
        !trimmedUrl.includes("://") &&
        !trimmedUrl.startsWith("javascript:") &&
        !trimmedUrl.startsWith("data:") &&
        !trimmedUrl.startsWith("file:") &&
        !trimmedUrl.startsWith("about:") &&
        !trimmedUrl.startsWith("chrome:") &&
        !trimmedUrl.startsWith("edge:");

      const urlToParse = isMissingScheme ? `http://${url.trim()}` : url.trim();
      parsedUrl = new URL(urlToParse);
    } catch (e) {
      return {
        isError: true,
        content: [{ type: "text", text: `Invalid URL format: ${url}` }],
      };
    }

    const blockedProtocols = [
      "javascript:",
      "file:",
      "data:",
      "about:",
      "chrome:",
      "edge:",
    ];

    if (blockedProtocols.includes(parsedUrl.protocol)) {
      return {
        isError: true,
        content: [{ type: "text", text: `Navigation to ${parsedUrl.protocol} is not allowed for security reasons.` }],
      };
    }

    await context.sendSocketMessage("browser_navigate", { url: parsedUrl.href });
    if (snapshot) {
      return captureAriaSnapshot(context);
    }
    return {
      content: [
        {
          type: "text",
          text: `Navigated to ${url}`,
        },
      ],
    };
  },
});

export const goBack: ToolFactory = (snapshot) => ({
  schema: {
    name: GoBackTool.shape.name.value,
    description: GoBackTool.shape.description.value,
    inputSchema: zodToJsonSchema(GoBackTool.shape.arguments),
  },
  handle: async (context) => {
    await context.sendSocketMessage("browser_go_back", {});
    if (snapshot) {
      return captureAriaSnapshot(context);
    }
    return {
      content: [
        {
          type: "text",
          text: "Navigated back",
        },
      ],
    };
  },
});

export const goForward: ToolFactory = (snapshot) => ({
  schema: {
    name: GoForwardTool.shape.name.value,
    description: GoForwardTool.shape.description.value,
    inputSchema: zodToJsonSchema(GoForwardTool.shape.arguments),
  },
  handle: async (context) => {
    await context.sendSocketMessage("browser_go_forward", {});
    if (snapshot) {
      return captureAriaSnapshot(context);
    }
    return {
      content: [
        {
          type: "text",
          text: "Navigated forward",
        },
      ],
    };
  },
});

export const wait: Tool = {
  schema: {
    name: WaitTool.shape.name.value,
    description: WaitTool.shape.description.value,
    inputSchema: zodToJsonSchema(WaitTool.shape.arguments),
  },
  handle: async (context, params) => {
    const { time } = WaitTool.shape.arguments.parse(params);
    await context.sendSocketMessage("browser_wait", { time });
    return {
      content: [
        {
          type: "text",
          text: `Waited for ${time} seconds`,
        },
      ],
    };
  },
};

export const pressKey: Tool = {
  schema: {
    name: PressKeyTool.shape.name.value,
    description: PressKeyTool.shape.description.value,
    inputSchema: zodToJsonSchema(PressKeyTool.shape.arguments),
  },
  handle: async (context, params) => {
    const { key } = PressKeyTool.shape.arguments.parse(params);
    await context.sendSocketMessage("browser_press_key", { key });
    return {
      content: [
        {
          type: "text",
          text: `Pressed key ${key}`,
        },
      ],
    };
  },
};
