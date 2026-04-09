import type { RouterData, ListContext, Options, RouterResType } from "../types.js";
import { get } from "../utils/getData.js";

/*
 * ========================= Change Record =========================
 * [Date]        2026-04-09
 * [Type]        Bug Fix
 * [Description] Harden the Baidu route against board HTML changes and align
 *               source code with the previously validated post-build patch.
 * [Approach]    Keep the existing resilient s-data parsing, but restore the
 *               mobile User-Agent and safer URL fallbacks from the tested fix.
 * [Parameters]  handleRoute(c, noCache): `c` carries the query string, and
 *               `noCache` bypasses the shared HTTP cache when true.
 * [Returns]     RouterData for the selected Baidu board, or an empty list when
 *               the page no longer exposes a parsable payload.
 * [Impact]      Affects `/baidu` route consumers and build output generated
 *               from this source file.
 * [Risk]        Depends on Baidu still embedding `<!--s-data:...-->` in the
 *               board page; no other known risk.
 * =================================================================
 */
const typeMap: Record<string, string> = {
  realtime: "热搜",
  novel: "小说",
  movie: "电影",
  teleplay: "电视剧",
  car: "汽车",
  game: "游戏",
};

export const handleRoute = async (c: ListContext, noCache: boolean) => {
  const type = c.req.query("type") || "realtime";
  const listData = await getList({ type }, noCache);
  const routeData: RouterData = {
    name: "baidu",
    title: "百度",
    type: typeMap[type],
    params: {
      type: {
        name: "热搜类别",
        type: typeMap,
      },
    },
    link: "https://top.baidu.com/board",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

interface BaiduItem {
  index?: number;
  word?: string;
  title?: string;
  desc?: string;
  img?: string;
  imgInfo?: { src: string };
  show?: string;
  hotScore?: string;
  hotTag?: string;
  query?: string;
  rawUrl?: string;
  url?: string;
  content?: BaiduItem[];
}

interface BaiduSData {
  data?: { cards?: Array<{ content?: BaiduItem[] }> };
  cards?: Array<{ content?: BaiduItem[] }>;
}

/**
 * Extracts the actual board list from the nested `s-data` payload.
 *
 * The Baidu board payload has changed between `cards` and `data.cards`, and
 * some responses wrap the final list in an extra `content[0].content` layer.
 */
const extractBoardItems = (payload: BaiduSData): BaiduItem[] => {
  const cardContent = payload.data?.cards?.[0]?.content ?? payload.cards?.[0]?.content;
  if (!Array.isArray(cardContent)) {
    return [];
  }
  if (cardContent.length > 0 && Array.isArray(cardContent[0]?.content)) {
    return cardContent[0].content ?? [];
  }
  return cardContent;
};

const getList = async (options: Options, noCache: boolean): Promise<RouterResType> => {
  const { type } = options;
  const url = `https://top.baidu.com/board?tab=${type}`;
  const result = await get<string>({
    url,
    noCache,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (iPhone; CPU iPhone OS 14_2_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/1.0 Mobile/12F69 Safari/605.1.15",
    },
  });
  const pattern = /<!--s-data:(.*?)-->/s;
  const matchResult = result.data.match(pattern);
  if (!matchResult) {
    return {
      ...result,
      data: [],
    };
  }
  let jsonObject: BaiduItem[] = [];
  try {
    jsonObject = extractBoardItems(JSON.parse(matchResult[1]) as BaiduSData);
  } catch {
    jsonObject = [];
  }
  return {
    ...result,
    data: jsonObject.map((v, index: number) => {
      const title = v.word ?? v.title ?? "";
      return {
        id: v.index ?? index + 1,
        title,
        desc: v.desc ?? "",
        cover: v.img ?? v.imgInfo?.src ?? "",
        author: v.show?.length ? v.show : "",
        timestamp: 0,
        hot: parseInt((v.hotScore ?? v.hotTag ?? "0").toString(), 10) || 0,
        url: v.query
          ? `https://www.baidu.com/s?wd=${encodeURIComponent(v.query)}`
          : (v.url ?? `https://www.baidu.com/s?wd=${encodeURIComponent(title)}`),
        mobileUrl: v.rawUrl ?? v.url ?? `https://www.baidu.com/s?wd=${encodeURIComponent(title)}`,
      };
    }),
  };
};
