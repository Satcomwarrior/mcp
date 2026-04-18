import { Context } from "@/context";
import { ToolResult } from "@/tools/tool";

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

export function getSnapshotText(snapshot: ToolResult): string {
  let snapshotText = "";
  for (let i = 0; i < snapshot.content.length; i++) {
    const c = snapshot.content[i];
    if (c.type === "text" && "text" in c) {
      snapshotText += (snapshotText ? "\n" : "") + (c as any).text;
    }
  }
  return snapshotText;
}
