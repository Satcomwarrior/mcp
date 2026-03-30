import { Context } from "@/context";
import { ToolResult } from "@/tools/tool";

/**
 * Extracts and concatenates text content from a ToolResult.
 * Optimized to avoid intermediate array allocations (.filter().map().join()).
 */
export function getSnapshotText(result: ToolResult): string {
  let text = "";
  for (const c of result.content) {
    if (c.type === "text") {
      if (text.length > 0) text += "\n";
      text += (c as any).text;
    }
  }
  return text;
}

export async function captureAriaSnapshot(
  context: Context,
  status: string = "",
): Promise<ToolResult> {
  const url = await context.sendSocketMessage("getUrl", undefined);
  const title = await context.sendSocketMessage("getTitle", undefined);
  const snapshot = await context.sendSocketMessage("browser_snapshot", {});
  return {
    content: [
      {
        type: "text",
        text: `${status ? `${status}\n` : ""}
- Page URL: ${url}
- Page Title: ${title}
- Page Snapshot
\`\`\`yaml
${snapshot}
\`\`\`
`,
      },
    ],
  };
}
