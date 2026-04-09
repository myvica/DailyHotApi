import type { ListItem, RouterData } from "../types.js";
import { get } from "../utils/getData.js";
import { parseChineseNumber } from "../utils/getNum.js";
import UserAgent from "user-agents";
import * as cheerio from "cheerio";

const APOLLO_STATE_PREFIX = "window.__APOLLO_STATE__=";
const TOPHUB_FALLBACK_URL = "https://tophub.today/n/MZd7PrPerO";

/*
 * ========================= Change Record =========================
 * [Date]        2026-04-09
 * [Type]        Bug Fix
 * [Description] Add layered fallback logic for Kuaishou so the route still
 *               returns data when the APOLLO payload or the home page layout
 *               changes.
 * [Approach]    Keep APOLLO parsing as the primary path, then fall back to the
 *               rendered rank list, and finally to TopHub as a last resort.
 * [Parameters]  handleRoute(_, noCache): `_` is unused and `noCache` bypasses
 *               the shared HTTP cache when true.
 * [Returns]     RouterData with the best available Kuaishou hot list.
 * [Impact]      Affects `/kuaishou` route consumers and generated dist output.
 * [Risk]        TopHub fallback depends on a third-party mirror remaining
 *               available; otherwise no known risk.
 * =================================================================
 */

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const listData = await getList(noCache);
  const routeData: RouterData = {
    name: "kuaishou",
    title: "快手",
    type: "热榜",
    description: "快手，拥抱每一种生活",
    link: "https://www.kuaishou.com/",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

interface KuaishouHotItem {
  id: string;
  name: string;
  poster?: string;
  hotValue?: string;
  photoIds?: { json?: string[] };
}

interface KuaishouApolloState {
  [key: string]: KuaishouHotItem & {
    items?: Array<{ id: string }>;
  };
}

/**
 * Parses the inlined APOLLO state that powers the home page hot list.
 */
const parseApolloList = (html: string): ListItem[] => {
  const listData: ListItem[] = [];
  const start = html.indexOf(APOLLO_STATE_PREFIX);
  if (start === -1) {
    throw new Error("Kuaishou APOLLO_STATE not found");
  }
  const scriptSlice = html.slice(start + APOLLO_STATE_PREFIX.length);
  const sentinelA = scriptSlice.indexOf(";(function(");
  const sentinelB = scriptSlice.indexOf("</script>");
  const cutIndex =
    sentinelA !== -1 && sentinelB !== -1 ? Math.min(sentinelA, sentinelB) : Math.max(sentinelA, sentinelB);
  if (cutIndex === -1) {
    throw new Error("Kuaishou APOLLO_STATE end marker not found");
  }
  const raw = scriptSlice.slice(0, cutIndex).trim().replace(/;$/, "");
  let jsonObject: KuaishouApolloState;
  try {
    const lastBrace = raw.lastIndexOf("}");
    const cleanRaw = lastBrace !== -1 ? raw.slice(0, lastBrace + 1) : raw;
    jsonObject = JSON.parse(cleanRaw)["defaultClient"];
  } catch (err) {
    const msg =
      err instanceof Error
        ? `${err.message} | snippet=${raw.slice(0, 200)}...`
        : "未知错误";
    throw new Error(`快手数据解析失败: ${msg}`);
  }
  const allItems =
    jsonObject['$ROOT_QUERY.visionHotRank({"page":"home"})']?.items ||
    jsonObject['$ROOT_QUERY.visionHotRank({"page":"home","platform":"web"})']
      ?.items ||
    [];
  allItems.forEach((item: { id: string }) => {
    const hotItem = jsonObject[item.id];
    if (!hotItem) return;
    const id = hotItem.photoIds?.json?.[0];
    const hotValue = hotItem.hotValue ?? "";
    const poster = hotItem.poster ? decodeURIComponent(hotItem.poster) : undefined;
    listData.push({
      id: hotItem.id,
      title: hotItem.name,
      cover: poster,
      hot: parseChineseNumber(String(hotValue)),
      timestamp: undefined,
      url: id
        ? `https://www.kuaishou.com/short-video/${id}`
        : `https://www.kuaishou.com/search/${encodeURIComponent(hotItem.name || "")}`,
      mobileUrl: id
        ? `https://www.kuaishou.com/short-video/${id}`
        : `https://www.kuaishou.com/search/${encodeURIComponent(hotItem.name || "")}`,
    });
  });
  return listData;
};

/**
 * Falls back to the rendered rank DOM when the embedded APOLLO payload changes.
 */
const parseRenderedRankList = (html: string): ListItem[] => {
  const $ = cheerio.load(html);
  const listData: ListItem[] = [];
  $(".rank-container .rank-item").each((_, element) => {
    const root = $(element);
    const anchor = root.find("a.rank-name").first();
    const title = anchor.text().trim();
    const href = anchor.attr("href") || "";
    const hotText = root.find(".rank-detail").text().trim();
    if (!title) {
      return;
    }
    const fullUrl = href
      ? new URL(href, "https://www.kuaishou.com").toString()
      : `https://www.kuaishou.com/search/${encodeURIComponent(title)}`;
    listData.push({
      id: title,
      title,
      cover: undefined,
      hot: parseChineseNumber(hotText || "0"),
      timestamp: undefined,
      url: fullUrl,
      mobileUrl: fullUrl,
    });
  });
  return listData;
};

/**
 * Uses TopHub as the final fallback when both first-party Kuaishou paths fail.
 */
const getTopHubFallback = async (noCache: boolean) => {
  const result = await get<string>({
    url: TOPHUB_FALLBACK_URL,
    noCache,
    responseType: "text",
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  });
  const $ = cheerio.load(result.data);
  const listData: ListItem[] = [];
  $(".p-c-m .table a").each((_, element) => {
    const anchor = $(element);
    const title = anchor.text().trim().replace(/\s+/g, " ");
    const href = anchor.attr("href") || "";
    if (!title || title === "" || href.includes("tophub.today") || href.startsWith("javascript:")) {
      return;
    }
    listData.push({
      id: title,
      title,
      cover: undefined,
      hot: undefined,
      timestamp: undefined,
      url: href,
      mobileUrl: href,
    });
  });
  return {
    ...result,
    data: listData,
  };
};

const getList = async (noCache: boolean) => {
  const url = `https://www.kuaishou.com/?isHome=1`;
  const userAgent = new UserAgent({
    deviceCategory: "desktop",
  });
  try {
    const result = await get<string>({
      url,
      noCache,
      responseType: "text",
      headers: {
        "User-Agent": userAgent.toString(),
      },
    });
    const apolloData = parseApolloList(result.data || "");
    const htmlData = apolloData.length ? apolloData : parseRenderedRankList(result.data || "");
    if (htmlData.length) {
      return {
        ...result,
        data: htmlData,
      };
    }
  } catch {
    // Intentionally continue to the external fallback because Kuaishou
    // frequently changes the embedded state and rank DOM structure.
  }
  return getTopHubFallback(noCache);
};
