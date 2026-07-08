import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

const CATEGORIES = ["cpu", "motherboard", "ram", "gpu", "storage", "psu", "case", "cooler"] as const;

export default defineTool({
  name: "create_part",
  title: "Create part",
  description:
    "Add a new PC part to the signed-in user's library. `data` should include name, brand, price and any category-specific fields.",
  inputSchema: {
    category: z.enum(CATEGORIES).describe("Part category."),
    data: z
      .record(z.string(), z.unknown())
      .describe("Full part spec as a JSON object (must include `name`; may include brand, price, etc.)."),
    asin: z.string().optional().describe("Optional Amazon ASIN for price refresh."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ category, data, asin }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    if (!data || typeof (data as { name?: unknown }).name !== "string") {
      return { content: [{ type: "text", text: "`data.name` is required" }], isError: true };
    }
    const { data: row, error } = await supabaseForUser(ctx)
      .from("parts")
      .insert({ owner_id: ctx.getUserId(), category, data, asin: asin ?? null })
      .select()
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Created part ${row.id}` }],
      structuredContent: { part: row },
    };
  },
});
