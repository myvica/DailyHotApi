import type { ListItem, RouterData } from "../types.js";
import { get } from "../utils/getData.js";
import { parseRSS } from "../utils/parseRSS.js";

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const listData = await getList(noCache);
  const routeData: RouterData = {
    name: "producthunt",
    title: "Product Hunt",
    type: "Today",
    description: "The best new products, every day",
    link: "https://www.producthunt.com/",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

const getList = async (noCache: boolean) => {
  const feedUrl = "https://www.producthunt.com/feed";
  const result = await get<string>({
    url: feedUrl,
    noCache,
    headers: {
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
  });

  try {
    const stories = (await parseRSS(result.data))
      .map(mapFeedItemToStory)
      .filter((item): item is ListItem => item !== null);

    return {
      ...result,
      data: stories,
    };
  } catch (error) {
    throw new Error(`Failed to parse Product Hunt feed: ${error}`);
  }
};

interface ProductHuntFeedItem {
  title?: string;
  link?: string;
  pubDate?: string;
  guid?: string;
}

export const mapFeedItemToStory = (item: ProductHuntFeedItem): ListItem | null => {
  if (!item.title || !item.link) return null;

  return {
    id: item.guid ?? item.link,
    title: item.title,
    hot: undefined,
    timestamp: item.pubDate ? Date.parse(item.pubDate) : undefined,
    url: item.link,
    mobileUrl: item.link,
  };
};
