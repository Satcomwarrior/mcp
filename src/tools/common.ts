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

    // Security: Validate URL protocol to prevent XSS (javascript:) and LFI (file:)
    let trimmedUrl = url.trim();
    const lowerUrl = trimmedUrl.toLowerCase();

    const dangerousProtocols = ['javascript:', 'file:', 'data:', 'about:', 'chrome:', 'edge:'];
    if (dangerousProtocols.some(p => lowerUrl.startsWith(p))) {
      return {
        content: [{ type: "text", text: "Security Error: Dangerous URL protocol blocked" }],
        isError: true,
      };
    }

    const hasProtocol = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmedUrl);
    if (!hasProtocol) {
        trimmedUrl = `http://${trimmedUrl}`;
    }

    try {
        const parsed = new URL(trimmedUrl);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            const recoveredUrl = `http://${trimmedUrl}`;
            try {
                const recoveredParsed = new URL(recoveredUrl);
                if (recoveredParsed.protocol === 'http:' || recoveredParsed.protocol === 'https:') {
                    trimmedUrl = recoveredUrl;
                } else {
                    throw new Error();
                }
            } catch (e) {
                 return {
                   content: [{ type: "text", text: "Security Error: URL protocol must be http: or https:" }],
                   isError: true,
                 };
            }
        }
    } catch (e) {
        trimmedUrl = `http://${trimmedUrl}`;
    }

    try {
        const finalParsed = new URL(trimmedUrl);
        if (finalParsed.protocol !== 'http:' && finalParsed.protocol !== 'https:') {
            return {
              content: [{ type: "text", text: "Security Error: URL protocol must be http: or https:" }],
              isError: true,
            };
        }
    } catch (e) {
        return {
          content: [{ type: "text", text: "Security Error: Invalid URL format" }],
          isError: true,
        };
    }

    url = trimmedUrl;

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
