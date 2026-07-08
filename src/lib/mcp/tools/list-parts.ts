import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

const CATEGORIES = ["cpu", "motherboard", "ram", "gpu", "storage", "psu", "case", "cooler"] as const;

export default defineTool({
  name: "list_parts",
  title: "List parts",
  description: "List the signed-in user's saved PC parts. Optionally filter by category.",
  inputSchema: {
    category: z
      .enum(CATEGORIES)
      .optional()
      .describe("Filter to a single part category."),
    limit: z.number().int().min(1).max(200).optional().describe("Max rows to return (default 100)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ category, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase.from("parts").select("id, category, asin, data, price_updated_at").limit(limit ?? 100);
    if (category) query = query.eq("category", category);
    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { parts: data ?? [] },
    };
  },
});
