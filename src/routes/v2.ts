import { Hono } from "hono";
import dayjs from "dayjs";

const app = new Hono();

// HotList-Web 对应的路由映射
const hotlistMap: Record<string, { name: string; subtitle: string; route: string }> = {
  toutiao: { name: "今日头条", subtitle: "热点", route: "toutiao" },
  pengPai: { name: "澎湃新闻", subtitle: "时事", route: "thepaper" },
  qqNews: { name: "腾讯新闻", subtitle: "热点榜", route: "qq-news" },
  wyNews: { name: "网易新闻", subtitle: "热点榜", route: "netease-news" },
  baiduRD: { name: "百度热点", subtitle: "指数", route: "baidu" },
  wbHot: { name: "微博", subtitle: "热搜榜", route: "weibo" },
  douyinHot: { name: "抖音", subtitle: "热点榜", route: "douyin" },
  zhihuHot: { name: "知乎热榜", subtitle: "热度", route: "zhihu" },
  wbNews: { name: "微博", subtitle: "要闻", route: "weibo" },
  huXiu: { name: "虎嗅", subtitle: "最新资讯", route: "huxiu" },
  gcores: { name: "机核", subtitle: "资讯", route: "gameres" },
  zhihuDay: { name: "知乎日报", subtitle: "", route: "zhihu-daily" },
  "36Ke": { name: "36氪", subtitle: "24小时热榜", route: "36kr" },
  itNews: { name: "IT之家", subtitle: "最新资讯", route: "ithome" },
  chongBluo: { name: "虫部落", subtitle: "最新热门", route: "sspai" },
  woShiPm: { name: "woShiPm", subtitle: "热榜", route: "producthunt" },
};

// 静态定义的可用路由列表（从registry.ts复制）
const availableRoutes = [
  "36kr", "51cto", "acfun", "baidu", "bilibili", "coolapk", "csdn", "dgtle",
  "douban-group", "douban-movie", "douyin", "earthquake", "gameres", "geekpark",
  "genshin", "github", "guokr", "hackernews", "hellogithub", "history", "honkai",
  "hostloc", "hupu", "huxiu", "ifanr", "ithome-xijiayi", "ithome", "jianshu",
  "juejin", "kuaishou", "linuxdo", "lol", "miyoushe", "netease-news", "newsmth",
  "ngabbs", "nodeseek", "nytimes", "producthunt", "qq-news", "sina-news", "sina",
  "smzdm", "sspai", "starrail", "thepaper", "tieba", "toutiao", "v2ex",
  "weatheralarm", "weibo", "weread", "yystv", "zhihu-daily", "zhihu"
];

// 格式化热度值
const formatHot = (hot: number | undefined): string => {
  if (hot === undefined) return "";
  if (hot >= 10000) {
    return `${(hot / 10000).toFixed(1)}万`;
  }
  return hot.toString();
};

// 获取单个热榜数据
const getHotlist = async (type: string, noCache: boolean = false) => {
  const mapping = hotlistMap[type];
  if (!mapping) {
    return null;
  }

  try {
    const { handleRoute } = await import(`./${mapping.route}.js`);
    const data = await handleRoute(undefined, noCache);
    
    // 转换数据格式
    const items = data.data?.map((item: any, index: number) => ({
      index: index + 1,
      title: item.title,
      hot: formatHot(item.hot),
      url: item.url,
    })) || [];

    return {
      name: mapping.name,
      subtitle: mapping.subtitle,
      data: items,
      update_time: dayjs(data.updateTime).toISOString(),
    };
  } catch (error) {
    console.error(`Error fetching ${mapping.route}:`, error);
    return null;
  }
};

// 主路由
app.get("/", async (c) => {
  const type = c.req.query("type");
  const noCache = c.req.query("cache") === "false";

  if (type === "all") {
    // 获取全部热榜
    const allData: any[] = [];
    
    for (const [key, mapping] of Object.entries(hotlistMap)) {
      if (availableRoutes.includes(mapping.route)) {
        const data = await getHotlist(key, noCache);
        if (data) {
          allData.push(data);
        }
      }
    }
    
    return c.json({
      data: allData,
    });
  } else if (type) {
    // 获取单个热榜
    const data = await getHotlist(type, noCache);
    if (data) {
      return c.json({
        data: data.data,
        update_time: data.update_time,
      });
    } else {
      return c.json({ data: [], update_time: dayjs().toISOString() });
    }
  }

  return c.json({ message: "Please specify a type parameter, e.g., ?type=all or ?type=toutiao" });
});

export default app;