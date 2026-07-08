import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_active_build",
  title: "Get active build",
  description: "Return the signed-in user's currently active PC build, if any.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const { data, error } = await supabaseForUser(ctx)
      .from("builds")
      .select("id, name, is_active, parts, created_at, updated_at")
      .eq("is_active", true)
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) return { content: [{ type: "text", text: "No active build" }] };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { build: data },
    };
  },
});
