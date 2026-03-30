import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { requireApiKey } from "../auth.js";
import { getPlatformData, listAllPlatforms } from "../scraper/index.js";

export const getListTool: Tool = {
  name: "get_hot_list",
  description: "Get hot list data for a specific platform",
  inputSchema: {
    type: "object",
    properties: {
      api_key: { type: "string", description: "API key for authentication" },
      platform: {
        type: "string",
        description: "Platform name (e.g., bilibili, weibo, zhihu, github)",
      },
      limit: {
        type: "number",
        description: "Maximum number of items to return (optional)",
        minimum: 1,
        maximum: 100,
      },
      no_cache: {
        type: "boolean",
        description: "Skip cache and fetch fresh data (optional)",
      },
    },
    required: ["api_key", "platform"],
  },
};

export interface GetListArgs {
  api_key?: string;
  platform: string;
  limit?: number;
  no_cache?: boolean;
}

export interface HotListResponse {
  name: string;
  title: string;
  type: string;
  description?: string;
  link?: string;
  total: number;
  data?: Array<{
    id: string;
    title: string;
    desc: string;
    hot: number | string;
    url: string;
    mobileUrl?: string;
  }>;
  updateTime?: string;
  fromCache?: boolean;
  message?: string;
}

export async function handleGetList(args: GetListArgs): Promise<HotListResponse> {
  requireApiKey(args.api_key);

  const platforms = await listAllPlatforms();
  const validPlatforms = platforms.map((p) => p.name);

  if (!validPlatforms.includes(args.platform)) {
    const error = new Error(`Unknown platform: ${args.platform}. Available: ${validPlatforms.join(", ")}`);
    (error as any).error = `Unknown platform: ${args.platform}`;
    throw error;
  }

  const data = await getPlatformData(args.platform, args.no_cache);

  // 限制返回数量
  let resultData = data.data || [];
  if (args.limit && resultData.length > args.limit) {
    resultData = resultData.slice(0, args.limit);
  }

  return {
    name: data.name,
    title: data.title,
    type: data.type,
    description: data.description,
    link: data.link,
    total: resultData.length,
    data: resultData,
    message: `Fetched from ${data.name}`,
  };
}
