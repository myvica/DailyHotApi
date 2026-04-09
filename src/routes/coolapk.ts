import type { RouterData } from "../types.js";
import { get } from "../utils/getData.js";
import { genHeaders } from "../utils/getToken/coolapk.js";
import * as cheerio from "cheerio";

/*
 * ========================= Change Record =========================
 * [Date]        2026-04-09
 * [Type]        Bug Fix
 * [Description] Add a TopHub fallback for Coolapk so the route still returns
 *               data when the official API is rate-limited or unavailable.
 * [Approach]    Keep the official API as the preferred path and downgrade to
 *               a mirrored HTML source only when the API path fails.
 * [Parameters]  handleRoute(_, noCache): `_` is unused and `noCache` bypasses
 *               the shared HTTP cache when true.
 * [Returns]     RouterData for the current Coolapk hot list.
 * [Impact]      Affects `/coolapk` route consumers and generated dist output.
 * [Risk]        TopHub fallback depends on a third-party mirror.
 * =================================================================
 */

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const listData = await getList(noCache);
  const routeData: RouterData = {
    name: "coolapk",
    title: "酷安",
    type: "热榜",
    link: "https://www.coolapk.com/",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

interface CoolapkItem {
  id: string;
  message: string;
  tpic: string;
  username: string;
  ttitle: string;
  shareUrl: string;
}

interface CoolapkResponse {
  data: CoolapkItem[];
}

const TOPHUB_FALLBACK_URL = "https://tophub.today/n/12owD90vNV";

/**
 * Uses TopHub as the last available source when Coolapk's first-party API is
 * temporarily blocked or returns an empty payload.
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
  const data: RouterData["data"] = [];
  $(".p-c-m .table a").each((_, element) => {
    const anchor = $(element);
    const title = anchor.text().trim().replace(/\s+/g, " ");
    const href = anchor.attr("href") || "";
    if (!title || title === "" || !href.startsWith("https://www.coolapk.com/feed/")) {
      return;
    }
    data.push({
      id: href.split("/").pop() || title,
      title,
      cover: undefined,
      author: undefined,
      desc: "TopHub fallback",
      timestamp: undefined,
      hot: undefined,
      url: href,
      mobileUrl: href,
    });
  });
  return {
    ...result,
    data,
  };
};

const getList = async (noCache: boolean) => {
  try {
    const result = await get<CoolapkResponse>({
      url: `https://api.coolapk.com/v6/page/dataList?url=/feed/statList?cacheExpires=300&statType=day&sortField=detailnum&title=今日热门&title=今日热门&subTitle=&page=1`,
      noCache,
      headers: genHeaders(),
    });
    const list = result.data?.data;
    if (Array.isArray(list) && list.length) {
      return {
        ...result,
        data: list.map((item) => ({
          id: item.id,
          title: item.message,
          cover: item.tpic,
          author: item.username,
          desc: item.ttitle,
          timestamp: undefined,
          hot: undefined,
          url: item.shareUrl,
          mobileUrl: item.shareUrl,
        })),
      };
    }
  } catch {
    // Intentionally continue to the mirror fallback when the official API is
    // unavailable in the current environment.
  }
  return getTopHubFallback(noCache);
};
