/**
 * MCP Scraper Layer
 *
 * 直接调用爬虫逻辑，不依赖 HTTP 服务
 */

import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// 本地 routes 目录
const routesDir = path.resolve(__dirname, "../routes");

interface MockContext {
  req: {
    query: (key: string) => string | undefined;
  };
}

export interface RouterData {
  name: string;
  title: string;
  type: string;
  description: string;
  link: string;
  total: number;
  data?: Array<{
    id: string;
    title: string;
    desc: string;
    hot: number | string;
    url: string;
    mobileUrl?: string;
  }>;
}

export interface PlatformInfo {
  name: string;
  path: string;
  title: string;
  description: string;
}

export async function getPlatformData(platform: string, noCache = false): Promise<RouterData> {
  const platformName = platform.toLowerCase();
  const routePath = path.join(routesDir, `${platformName}.ts`);

  try {
    const { handleRoute } = await import(routePath);

    // 模拟 Hono Context（大部分路由不依赖 c 参数）
    const mockCtx: MockContext = {
      req: {
        query: (key: string) => {
          if (key === "cache") {
            return noCache ? "false" : "true";
          }
          return undefined;
        },
      },
    };

    const data = await handleRoute(mockCtx as never, noCache);
    return data as RouterData;
  } catch (error) {
    throw new Error(`Failed to fetch platform ${platform}: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export async function listAllPlatforms(): Promise<PlatformInfo[]> {
  const fs = await import("fs");
  const files = fs.readdirSync(routesDir);

  const platforms: PlatformInfo[] = [];
  const platformMetadata: Record<string, { title: string; description: string }> = {
    weibo: { title: "微博", description: "微博热搜" },
    bilibili: { title: "B站", description: "B站热门" },
    zhihu: { title: "知乎", description: "知乎热榜" },
    douyin: { title: "抖音", description: "抖音热点" },
    baidu: { title: "百度", description: "百度热搜" },
    github: { title: "GitHub", description: "GitHub Trending" },
    juejin: { title: "掘金", description: "稀土掘金" },
    v2ex: { title: "V2EX", description: "V2EX" },
    csdn: { title: "CSDN", description: "CSDN排行榜" },
    toutiao: { title: "头条", description: "今日头条" },
  };

  for (const file of files) {
    if (file.endsWith(".ts") && !file.endsWith(".d.ts")) {
      const name = file.replace(/\.ts$/, "");
      const meta = platformMetadata[name] || { title: name, description: "" };
      platforms.push({
        name,
        path: `/${name}`,
        title: meta.title,
        description: meta.description,
      });
    }
  }

  return platforms;
}
