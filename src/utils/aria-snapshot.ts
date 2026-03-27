import { Context } from "@/context";
import { ToolResult } from "@/tools/tool";

/**
 * Optimized utility to extract text content from a ToolResult snapshot.
 * Replaces `.filter().map().join('\n')` with a single-pass loop to avoid
 * intermediate array allocations and centralizes the extraction logic.
 */
export function getSnapshotText(snapshot: ToolResult): string {
  let text = "";
  let first = true;
  for (const c of snapshot.content) {
    if (c.type === "text" && typeof c.text === "string") {
      if (!first) {
        text += "\n";
      } else {
        first = false;
      }
      text += c.text;
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
