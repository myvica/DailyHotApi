import { Hono } from "hono";
import { getConfig } from "./config";
import getRSS from "../src/utils/getRSS";

import route36kr from "../src/routes/36kr";
import route51cto from "../src/routes/51cto";
import routeAcFun from "../src/routes/acfun";
import routeBaidu from "../src/routes/baidu";
import routeBilibili from "../src/routes/bilibili";
import routeCoolapk from "../src/routes/coolapk";
import routeCSDN from "../src/routes/csdn";
import routeDGTLE from "../src/routes/dgtle";
import routeDoubanGroup from "../src/routes/douban-group";
import routeDoubanMovie from "../src/routes/douban-movie";
import routeDouyin from "../src/routes/douyin";
import routeEarthquake from "../src/routes/earthquake";
import routeGameres from "../src/routes/gameres";
import routeGeekpark from "../src/routes/geekpark";
import routeGenshin from "../src/routes/genshin";
import routeGithub from "../src/routes/github";
import routeGuokr from "../src/routes/guokr";
import routeHackernews from "../src/routes/hackernews";
import routeHellogithub from "../src/routes/hellogithub";
import routeHistory from "../src/routes/history";
import routeHonkai from "../src/routes/honkai";
import routeHostloc from "../src/routes/hostloc";
import routeHupu from "../src/routes/hupu";
import routeHuxiu from "../src/routes/huxiu";
import routeIfanr from "../src/routes/ifanr";
import routeIthomeXijiayi from "../src/routes/ithome-xijiayi";
import routeIthome from "../src/routes/ithome";
import routeJianshu from "../src/routes/jianshu";
import routeJuejin from "../src/routes/juejin";
import routeKuaishou from "../src/routes/kuaishou";
import routeLinuxdo from "../src/routes/linuxdo";
import routeLol from "../src/routes/lol";
import routeMiyoushe from "../src/routes/miyoushe";
import routeNeteaseNews from "../src/routes/netease-news";
import routeNewsmth from "../src/routes/newsmth";
import routeNgabbs from "../src/routes/ngabbs";
import routeNodeseek from "../src/routes/nodeseek";
import routeNytimes from "../src/routes/nytimes";
import routeProducthunt from "../src/routes/producthunt";
import routeQQNews from "../src/routes/qq-news";
import routeSinaNews from "../src/routes/sina-news";
import routeSina from "../src/routes/sina";
import routeSmzdm from "../src/routes/smzdm";
import routeSspai from "../src/routes/sspai";
import routeStarrail from "../src/routes/starrail";
import routeThepaper from "../src/routes/thepaper";
import routeTieba from "../src/routes/tieba";
import routeToutiao from "../src/routes/toutiao";
import routeV2ex from "../src/routes/v2ex";
import routeWeatheralarm from "../src/routes/weatheralarm";
import routeWeibo from "../src/routes/weibo";
import routeWeread from "../src/routes/weread";
import routeYystv from "../src/routes/yystv";
import routeZhihuDaily from "../src/routes/zhihu-daily";
import routeZhihu from "../src/routes/zhihu";

const routeMap: Record<string, { handleRoute: Function }> = {
  "36kr": route36kr,
  "51cto": route51cto,
  acfun: routeAcFun,
  baidu: routeBaidu,
  bilibili: routeBilibili,
  coolapk: routeCoolapk,
  csdn: routeCSDN,
  dgtle: routeDGTLE,
  "douban-group": routeDoubanGroup,
  "douban-movie": routeDoubanMovie,
  douyin: routeDouyin,
  earthquake: routeEarthquake,
  gameres: routeGameres,
  geekpark: routeGeekpark,
  genshin: routeGenshin,
  github: routeGithub,
  guokr: routeGuokr,
  hackernews: routeHackernews,
  hellogithub: routeHellogithub,
  history: routeHistory,
  honkai: routeHonkai,
  hostloc: routeHostloc,
  hupu: routeHupu,
  huxiu: routeHuxiu,
  ifanr: routeIfanr,
  "ithome-xijiayi": routeIthomeXijiayi,
  ithome: routeIthome,
  jianshu: routeJianshu,
  juejin: routeJuejin,
  kuaishou: routeKuaishou,
  linuxdo: routeLinuxdo,
  lol: routeLol,
  miyoushe: routeMiyoushe,
  "netease-news": routeNeteaseNews,
  newsmth: routeNewsmth,
  ngabbs: routeNgabbs,
  nodeseek: routeNodeseek,
  nytimes: routeNytimes,
  producthunt: routeProducthunt,
  "qq-news": routeQQNews,
  "sina-news": routeSinaNews,
  sina: routeSina,
  smzdm: routeSmzdm,
  sspai: routeSspai,
  starrail: routeStarrail,
  thepaper: routeThepaper,
  tieba: routeTieba,
  toutiao: routeToutiao,
  v2ex: routeV2ex,
  weatheralarm: routeWeatheralarm,
  weibo: routeWeibo,
  weread: routeWeread,
  yystv: routeYystv,
  "zhihu-daily": routeZhihuDaily,
  zhihu: routeZhihu,
};

const excludeRoutes: string[] = ["v2", "52pojie"];
const allRoutePath = Object.keys(routeMap).filter(
  (route) => !excludeRoutes.includes(route)
);

const app = new Hono();

import v2Routes from "../src/routes/v2";
app.route("/v2", v2Routes);

import route52pojie from "./handler/52pojie";
routeMap["52pojie"] = route52pojie;
allRoutePath.push("52pojie");

for (const router of allRoutePath) {
  const listApp = app.basePath(`/${router}`);
  
  listApp.get("/", async (c) => {
    const config = getConfig();
    const noCache = c.req.query("cache") === "false";
    const limit = c.req.query("limit");
    const rssEnabled = c.req.query("rss") === "true";

    const { handleRoute } = routeMap[router];
    const listData = await handleRoute(c, noCache);

    if (limit && listData?.data?.length > parseInt(limit)) {
      listData.total = parseInt(limit);
      listData.data = listData.data.slice(0, parseInt(limit));
    }

    if (rssEnabled || config.RSS_MODE) {
      const rss = getRSS(listData);
      if (typeof rss === "string") {
        c.header("Content-Type", "application/xml; charset=utf-8");
        return c.body(rss);
      } else {
        return c.json({ code: 500, message: "RSS generation failed" }, 500);
      }
    }

    return c.json({ code: 200, ...listData });
  });

  listApp.all("*", (c) => c.json({ code: 405, message: "Method Not Allowed" }, 405));
}

app.get("/all", (c) =>
  c.json({
    code: 200,
    count: allRoutePath.length,
    routes: allRoutePath.map((path) => ({
      name: path,
      path: `/${path}`,
    })),
  })
);

export default app;
