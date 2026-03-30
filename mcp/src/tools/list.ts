import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { requireApiKey } from "../auth.js";
import { listAllPlatforms } from "../scraper/index.js";

export const listPlatformsTool: Tool = {
  name: "list_hot_platforms",
  description: "List all available hot list platforms from DailyHotApi",
  inputSchema: {
    type: "object",
    properties: {
      api_key: { type: "string", description: "API key for authentication" },
    },
    required: ["api_key"],
  },
};

export interface ListPlatformsResult {
  platforms: Array<{
    name: string;
    path: string;
    title: string;
    description: string;
  }>;
  total: number;
}

export async function handleListPlatforms(args: {
  api_key?: string;
}): Promise<ListPlatformsResult> {
  requireApiKey(args.api_key);

  const platforms = await listAllPlatforms();

  return {
    platforms: platforms.map((p) => ({
      name: p.name,
      path: p.path,
      title: p.title,
      description: p.description,
    })),
    total: platforms.length,
  };
}
