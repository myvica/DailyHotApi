import type { RouterData } from "../types.js";
import { get } from "../utils/getData.js";
import { getTime } from "../utils/getTime.js";
import * as cheerio from "cheerio";

/*
 * ========================= Change Record =========================
 * [Date]        2026-04-09
 * [Type]        Bug Fix
 * [Description] Replace the fragile Huxiu moment API path with HTML parsing
 *               logic from the validated local patch so the route can survive
 *               API blocking or response regressions.
 * [Approach]    Fetch the public moment page with a browser-like User-Agent
 *               and extract cards from multiple selector variants.
 * [Parameters]  handleRoute(_, noCache): `_` is unused by this route and
 *               `noCache` bypasses the shared HTTP cache when true.
 * [Returns]     RouterData containing parsed Huxiu moments.
 * [Impact]      Affects `/huxiu` route consumers and generated dist output.
 * [Risk]        HTML selectors may need refresh if Huxiu redesigns the page.
 * =================================================================
 */
export const handleRoute = async (_: undefined, noCache: boolean) => {
  const listData = await getList(noCache);
  const routeData: RouterData = {
    name: "huxiu",
    title: "虎嗅",
    type: "24小时",
    link: "https://www.huxiu.com/moment/",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

const getList = async (noCache: boolean) => {
  const url = `https://www.huxiu.com/moment/`;
  const result = await get<string>({
    url,
    noCache,
    responseType: "text",
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  });
  const $ = cheerio.load(result.data);
  const data: RouterData["data"] = [];
  $(".moment-item-wrap").each((_, element) => {
    const root = $(element);
    const id = root.attr("id") || "";
    const author = root.find(".username i").first().text().trim() || root.find(".username").first().text().trim();
    const userIntro = root.find(".yijuhua").first().text().trim();
    const contentNode = root
      .find(".plain-text, .moment-item-desc, .moment-item-content, .article-content, .summary, .line-clamp-6")
      .first();
    const title = contentNode.text().trim() || root.find(".moment-item a").first().text().trim();
    const href = root.find("a[href*='/moment/'], a[href*='/article/']").first().attr("href") || "";
    const timeText = root.find(".time, .publish-time, .moment-time").first().text().trim();
    const fullUrl = href
      ? new URL(href, "https://www.huxiu.com").toString()
      : `https://www.huxiu.com/moment/${id}.html`;
    if (!title) {
      return;
    }
    data.push({
      id: id || fullUrl,
      title,
      desc: userIntro,
      author,
      timestamp: timeText ? getTime(timeText) : undefined,
      hot: undefined,
      url: fullUrl,
      mobileUrl: fullUrl.replace("https://www.huxiu.com", "https://m.huxiu.com"),
    });
  });
  return {
    ...result,
    data,
  };
};
