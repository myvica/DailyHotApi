import { Hono } from "hono";
import { getConfig } from "./config";
import getRSS from "../src/utils/getRSS";

import { handleRoute as route36kr } from "../src/routes/36kr";
import { handleRoute as route51cto } from "../src/routes/51cto";
import { handleRoute as routeAcFun } from "../src/routes/acfun";
import { handleRoute as routeBaidu } from "../src/routes/baidu";
import { handleRoute as routeBilibili } from "../src/routes/bilibili";
import { handleRoute as routeCoolapk } from "../src/routes/coolapk";
import { handleRoute as routeCSDN } from "../src/routes/csdn";
import { handleRoute as routeDGTLE } from "../src/routes/dgtle";
import { handleRoute as routeDoubanGroup } from "../src/routes/douban-group";
import { handleRoute as routeDoubanMovie } from "../src/routes/douban-movie";
import { handleRoute as routeDouyin } from "../src/routes/douyin";
import { handleRoute as routeEarthquake } from "../src/routes/earthquake";
import { handleRoute as routeGameres } from "../src/routes/gameres";
import { handleRoute as routeGeekpark } from "../src/routes/geekpark";
import { handleRoute as routeGenshin } from "../src/routes/genshin";
import { handleRoute as routeGithub } from "../src/routes/github";
import { handleRoute as routeGuokr } from "../src/routes/guokr";
import { handleRoute as routeHackernews } from "../src/routes/hackernews";
import { handleRoute as routeHellogithub } from "../src/routes/hellogithub";
import { handleRoute as routeHistory } from "../src/routes/history";
import { handleRoute as routeHonkai } from "../src/routes/honkai";
import { handleRoute as routeHostloc } from "../src/routes/hostloc";
import { handleRoute as routeHupu } from "../src/routes/hupu";
import { handleRoute as routeHuxiu } from "../src/routes/huxiu";
import { handleRoute as routeIfanr } from "../src/routes/ifanr";
import { handleRoute as routeIthomeXijiayi } from "../src/routes/ithome-xijiayi";
import { handleRoute as routeIthome } from "../src/routes/ithome";
import { handleRoute as routeJianshu } from "../src/routes/jianshu";
import { handleRoute as routeJuejin } from "../src/routes/juejin";
import { handleRoute as routeKuaishou } from "../src/routes/kuaishou";
import { handleRoute as routeLinuxdo } from "../src/routes/linuxdo";
import { handleRoute as routeLol } from "../src/routes/lol";
import { handleRoute as routeMiyoushe } from "../src/routes/miyoushe";
import { handleRoute as routeNeteaseNews } from "../src/routes/netease-news";
import { handleRoute as routeNewsmth } from "../src/routes/newsmth";
import { handleRoute as routeNgabbs } from "../src/routes/ngabbs";
import { handleRoute as routeNodeseek } from "../src/routes/nodeseek";
import { handleRoute as routeNytimes } from "../src/routes/nytimes";
import { handleRoute as routeProducthunt } from "../src/routes/producthunt";
import { handleRoute as routeQQNews } from "../src/routes/qq-news";
import { handleRoute as routeSinaNews } from "../src/routes/sina-news";
import { handleRoute as routeSina } from "../src/routes/sina";
import { handleRoute as routeSmzdm } from "../src/routes/smzdm";
import { handleRoute as routeSspai } from "../src/routes/sspai";
import { handleRoute as routeStarrail } from "../src/routes/starrail";
import { handleRoute as routeThepaper } from "../src/routes/thepaper";
import { handleRoute as routeTieba } from "../src/routes/tieba";
import { handleRoute as routeToutiao } from "../src/routes/toutiao";
import { handleRoute as routeV2ex } from "../src/routes/v2ex";
import { handleRoute as routeWeatheralarm } from "../src/routes/weatheralarm";
import { handleRoute as routeWeibo } from "../src/routes/weibo";
import { handleRoute as routeWeread } from "../src/routes/weread";
import { handleRoute as routeYystv } from "../src/routes/yystv";
import { handleRoute as routeZhihuDaily } from "../src/routes/zhihu-daily";
import { handleRoute as routeZhihu } from "../src/routes/zhihu";

const routeMap: Record<string, Function> = {
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

import { handleRoute as route52pojie } from "./handler/52pojie";
routeMap["52pojie"] = route52pojie;
allRoutePath.push("52pojie");

for (const router of allRoutePath) {
  const listApp = app.basePath(`/${router}`);
  
  listApp.get("/", async (c) => {
    const config = getConfig();
    const noCache = c.req.query("cache") === "false";
    const limit = c.req.query("limit");
    const rssEnabled = c.req.query("rss") === "true";

    const handleRoute = routeMap[router];
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
