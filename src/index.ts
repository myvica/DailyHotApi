/**
 * DailyHotApi - 热榜数据提供
 *
 * 此模块导出爬虫函数供 MCP 使用
 * HTTP 服务已移除 - 请使用 MCP 服务访问热榜数据
 */

import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const routesDir = path.join(__dirname, "routes");

export interface RouterData {
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
}

/**
 * 获取热榜数据
 * @param platform 平台名称 (如 weibo, bilibili, zhihu)
 * @param noCache 是否跳过缓存
 */
export async function getHotList(platform: string, noCache = false): Promise<RouterData> {
  const { handleRoute } = await import(`./routes/${platform}.js`);
  const mockCtx = {
    req: {
      query: (key: string) => key === "cache" ? (noCache ? "false" : "true") : undefined,
    },
  };
  return handleRoute(mockCtx as never, noCache) as RouterData;
}

/**
 * 列出所有可用平台
 */
export async function listPlatforms(): Promise<string[]> {
  const fs = await import("fs");
  const files = fs.readdirSync(routesDir);
  return files
    .filter(f => f.endsWith(".ts") && !f.endsWith(".d.ts"))
    .map(f => f.replace(/\.ts$/, ""));
}

// 保留入口点用于 MCP
export default { getHotList, listPlatforms };
