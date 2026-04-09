import type { RouterData } from "../types.js";
import { get } from "../utils/getData.js";
import { getTime } from "../utils/getTime.js";
import * as cheerio from "cheerio";

/*
 * ========================= Change Record =========================
 * [Date]        2026-04-09
 * [Type]        Bug Fix
 * [Description] Switch Weibo hot search fetching to the mobile endpoint and
 *               add a TopHub fallback to survive web endpoint instability.
 * [Approach]    Prefer the tested mobile API payload, then parse TopHub links
 *               if Weibo blocks or changes the primary response.
 * [Parameters]  handleRoute(_, noCache): `_` is unused and `noCache` bypasses
 *               the shared HTTP cache when true.
 * [Returns]     RouterData for the current Weibo hot list.
 * [Impact]      Affects `/weibo` route consumers and generated dist output.
 * [Risk]        The mobile API contract is unofficial and may change.
 * =================================================================
 */

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const listData = await getList(noCache);
  const routeData: RouterData = {
    name: "weibo",
    title: "微博",
    type: "热搜榜",
    description: "实时热点，每分钟更新一次",
    link: "https://s.weibo.com/top/summary/",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

interface WeiboItem {
  itemid?: string;
  mid?: string;
  desc?: string;
  word_scheme?: string;
  onboard_time?: number | string;
  scheme?: string;
}

interface WeiboResponse {
  data?: {
    cards?: Array<{
      card_group?: WeiboItem[];
    }>;
  };
}

const TOPHUB_FALLBACK_URL = "https://tophub.today/n/KqndgxeLl9";

/**
 * Uses TopHub as a degraded but stable response source when Weibo blocks the
 * mobile endpoint or changes its response shape.
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
    if (!title || title === "" || !href.startsWith("https://s.weibo.com/weibo?q=")) {
      return;
    }
    data.push({
      id: title,
      title,
      desc: title,
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
    const result = await get<WeiboResponse>({
      url: "https://m.weibo.cn/api/container/getIndex?containerid=106003type%3D25%26t%3D3%26disable_hot%3D1%26filter_type%3Drealtimehot&title=%E5%BE%AE%E5%8D%9A%E7%83%AD%E6%90%9C&extparam=filter_type%3Drealtimehot%26mi_cid%3D100103%26pos%3D0_0%26c_type%3D30%26display_time%3D1540538388&luicode=10000011&lfid=231583",
      noCache,
      ttl: 60,
      headers: {
        Referer: "https://s.weibo.com/top/summary?cate=realtimehot",
        "MWeibo-Pwa": "1",
        "X-Requested-With": "XMLHttpRequest",
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1",
      },
    });
    const list = result.data?.data?.cards?.[0]?.card_group;
    if (Array.isArray(list) && list.length) {
      return {
        ...result,
        data: list.map((item, index) => {
          const title = item.desc || `热搜${index + 1}`;
          const keyword = item.word_scheme || `#${title}`;
          return {
            id: item.itemid || item.mid || `weibo-${index}`,
            title,
            desc: keyword,
            timestamp: item.onboard_time ? getTime(item.onboard_time) : undefined,
            hot: undefined,
            url: `https://s.weibo.com/weibo?q=${encodeURIComponent(keyword)}&t=31&band_rank=1&Refer=top`,
            mobileUrl: item.scheme || `https://s.weibo.com/weibo?q=${encodeURIComponent(keyword)}`,
          };
        }),
      };
    }
  } catch {
    // Intentionally continue to the mirror fallback when the primary endpoint
    // is rate-limited or returns an unexpected schema.
  }
  return getTopHubFallback(noCache);
};
