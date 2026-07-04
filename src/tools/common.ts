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

    // Validate and sanitize the URL
    const trimmedUrl = url.trim();
    const lowerUrl = trimmedUrl.toLowerCase();

    if (
      lowerUrl.startsWith("javascript:") ||
      lowerUrl.startsWith("file:") ||
      lowerUrl.startsWith("data:") ||
      lowerUrl.startsWith("about:") ||
      lowerUrl.startsWith("chrome:") ||
      lowerUrl.startsWith("edge:")
    ) {
      return {
        isError: true,
        content: [{ type: "text", text: "Error: Blocked dangerous URL protocol." }],
      };
    }

    let finalUrl = trimmedUrl;
    try {
      const hasScheme = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmedUrl);
      if (!hasScheme) {
        finalUrl = `http://${trimmedUrl}`;
      }

      const parsedUrl = new URL(finalUrl);

      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        if (hasScheme && !trimmedUrl.includes("://") && /^[a-zA-Z0-9.-]+:\d+/.test(trimmedUrl)) {
          finalUrl = `http://${trimmedUrl}`;
          const reParsed = new URL(finalUrl);
          if (reParsed.protocol !== "http:" && reParsed.protocol !== "https:") {
            return { isError: true, content: [{ type: "text", text: `Error: Invalid protocol ${reParsed.protocol}` }] };
          }
        } else {
          return { isError: true, content: [{ type: "text", text: `Error: Invalid protocol ${parsedUrl.protocol}` }] };
        }
      }
    } catch (e) {
      return { isError: true, content: [{ type: "text", text: "Error: Invalid URL format." }] };
    }

    await context.sendSocketMessage("browser_navigate", { url: finalUrl });
    if (snapshot) {
      return captureAriaSnapshot(context);
    }
    return {
      content: [
        {
          type: "text",
          text: `Navigated to ${finalUrl}`,
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
