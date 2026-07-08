import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listPartsTool from "./tools/list-parts";
import getPartTool from "./tools/get-part";
import createPartTool from "./tools/create-part";
import deletePartTool from "./tools/delete-part";
import listBuildsTool from "./tools/list-builds";
import getActiveBuildTool from "./tools/get-active-build";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "riglab-mcp",
  title: "RigLab MCP",
  version: "0.1.0",
  instructions:
    "Tools for RigLab, a PC-building app. Use these to read and manage the signed-in user's PC parts library and builds.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    listPartsTool,
    getPartTool,
    createPartTool,
    deletePartTool,
    listBuildsTool,
    getActiveBuildTool,
  ],
});
