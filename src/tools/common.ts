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
    let { url } = NavigateTool.shape.arguments.parse(params);

    // Security: Validate URL protocol to prevent LFI (file://) or XSS (javascript:)
    let parsedUrl;
    try {
      if (!url.includes("://")) {
        url = `http://${url}`;
      }
      parsedUrl = new URL(url);
    } catch (e) {
      return {
        content: [{ type: "text", text: "Security Error: Invalid URL provided." }],
        isError: true,
      };
    }

    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return {
        content: [{ type: "text", text: `Security Error: Disallowed protocol '${parsedUrl.protocol}'. Only http: and https: are allowed.` }],
        isError: true,
      };
    }

    await context.sendSocketMessage("browser_navigate", { url });
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
