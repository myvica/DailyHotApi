/**
 * Type definitions for DailyHotApi MCP Server
 */

// Context (minimal mock for route handlers)
export type ListContext = any;

// List item in hot list
export interface ListItem {
  id: number | string;
  title: string;
  cover?: string;
  author?: string;
  desc?: string;
  hot: number | undefined;
  timestamp: number | undefined;
  url: string;
  mobileUrl: string;
}

// Router response type
export interface RouterResType {
  updateTime: string | number;
  fromCache: boolean;
  data: ListItem[];
  message?: string;
}

// Full router data
export interface RouterData extends RouterResType {
  name: string;
  title: string;
  type: string;
  description?: string;
  params?: Record<string, string | object>;
  total: number;
  link?: string;
}

// Request types
export interface Get {
  url: string;
  headers?: Record<string, string | string[]>;
  params?: Record<string, string | number>;
  timeout?: number;
  noCache?: boolean;
  ttl?: number;
  originaInfo?: boolean;
  responseType?: any;
}

export interface Post {
  url: string;
  headers?: Record<string, string | string[]>;
  body?: string | object | Buffer | undefined;
  timeout?: number;
  noCache?: boolean;
  ttl?: number;
  originaInfo?: boolean;
}

// Options
export interface Options {
  [key: string]: string | number | undefined;
}

// Extended route info for MCP
export interface RouteInfo {
  name: string;
  path: string;
  title: string;
  type: string;
  description?: string;
  total?: number;
  link?: string;
}

// Hot list response from API
export interface HotListResponse {
  name: string;
  title: string;
  type: string;
  total: number;
  data: ListItem[];
  updateTime: string | number;
  fromCache: boolean;
  message?: string;
}

// Platform metadata for documentation
export interface PlatformMetadata {
  title: string;
  description: string;
  category?: string;
}

// Platform metadata mapping
export const PLATFORM_METADATA: Record<string, PlatformMetadata> = {
  bilibili: {
    title: "哔哩哔哩",
    description: "B站热门视频排行榜",
    category: "视频",
  },
  weibo: {
    title: "微博",
    description: "微博热搜榜",
    category: "社交",
  },
  zhihu: {
    title: "知乎",
    description: "知乎热榜",
    category: "问答",
  },
  douyin: {
    title: "抖音",
    description: "抖音热点榜",
    category: "短视频",
  },
  baidu: {
    title: "百度",
    description: "百度热搜榜",
    category: "搜索",
  },
  github: {
    title: "GitHub",
    description: "GitHub Trending",
    category: "开源",
  },
  juejin: {
    title: "稀土掘金",
    description: "掘金热榜",
    category: "技术",
  },
  v2ex: {
    title: "V2EX",
    description: "V2EX 主题榜",
    category: "社区",
  },
  csdn: {
    title: "CSDN",
    description: "CSDN 排行榜",
    category: "技术",
  },
  toutiao: {
    title: "今日头条",
    description: "头条热榜",
    category: "资讯",
  },
  thepaper: {
    title: "澎湃新闻",
    description: "澎湃热榜",
    category: "新闻",
  },
  huxiu: {
    title: "虎嗅",
    description: "虎嗅 24 小时",
    category: "商业",
  },
  ithome: {
    title: "IT之家",
    description: "IT之家热榜",
    category: "科技",
  },
  sspai: {
    title: "少数派",
    description: "少数派热榜",
    category: "科技",
  },
  coolapk: {
    title: "酷安",
    description: "酷安热榜",
    category: "数码",
  },
  hupu: {
    title: "虎扑",
    description: "虎扑步行街热帖",
    category: "体育",
  },
  netease: {
    title: "网易云音乐",
    description: "网易云音乐热歌榜",
    category: "音乐",
  },
  miyoushe: {
    title: "米游社",
    description: "米游社最新消息",
    category: "游戏",
  },
  genshin: {
    title: "原神",
    description: "原神最新消息",
    category: "游戏",
  },
  ngabbs: {
    title: "NGA",
    description: "NGA 热帖",
    category: "游戏",
  },
};

// Options for getHotList
export interface GetHotListOptions {
  limit?: number;
  noCache?: boolean;
}
