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

    let finalUrl = url.trim();
    const lowerUrl = finalUrl.toLowerCase();

    // Security: Block dangerous protocols to prevent XSS and LFI vulnerabilities
    if (
      lowerUrl.startsWith("javascript:") ||
      lowerUrl.startsWith("file:") ||
      lowerUrl.startsWith("data:") ||
      lowerUrl.startsWith("about:") ||
      lowerUrl.startsWith("chrome:") ||
      lowerUrl.startsWith("edge:")
    ) {
      return {
        content: [{ type: "text", text: `Dangerous protocol in URL: ${url}` }],
        isError: true,
      };
    }

    try {
      const parsed = new URL(finalUrl);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        if (parsed.protocol === "localhost:") {
          finalUrl = `http://${finalUrl}`;
        } else {
          return {
            content: [{ type: "text", text: `Only http and https protocols are allowed. URL: ${url}` }],
            isError: true,
          };
        }
      }
    } catch (e) {
      finalUrl = `http://${finalUrl}`;
      try {
        const parsed2 = new URL(finalUrl);
        if (parsed2.protocol !== "http:" && parsed2.protocol !== "https:") {
          return {
            content: [{ type: "text", text: `Invalid URL format: ${url}` }],
            isError: true,
          };
        }
      } catch (e2) {
        return {
          content: [{ type: "text", text: `Invalid URL format: ${url}` }],
          isError: true,
        };
      }
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
