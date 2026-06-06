import { Hono } from "hono";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";
import { trimTrailingSlash } from "hono/trailing-slash";
import { getConfig } from "./config";
import registry from "./registry";
import NotFound from "../src/views/NotFound";
import Home from "../src/views/Home";
import Error from "../src/views/Error";

const app = new Hono();

app.use(prettyJSON());
app.use(trimTrailingSlash());

app.use("*", async (c, next) => {
  const config = getConfig();
  if (config.API_TOKEN) {
    const authHeader = c.req.header("Authorization");
    const token = authHeader?.replace(/^Bearer\s+/i, "");
    if (token !== config.API_TOKEN) {
      return c.json({ code: 403, message: "Forbidden" }, 403);
    }
  }
  await next();
});

app.use(
  "*",
  cors({
    origin: (origin) => {
      const config = getConfig();
      const isSame = config.ALLOWED_HOST && origin.endsWith(config.ALLOWED_HOST);
      return isSame ? origin : config.ALLOWED_DOMAIN;
    },
    allowMethods: ["POST", "GET", "OPTIONS"],
    allowHeaders: ["X-Custom-Header", "Upgrade-Insecure-Requests"],
    credentials: true,
  })
);

app.get("/favicon.ico", async (c) => {
  return c.body(null, 404);
});

app.route("/", registry);

app.get("/", (c) => c.html(<Home />));

app.notFound((c) => c.html(<NotFound />, 404));

app.onError((err, c) => {
  console.error(`[ERROR] ${err?.message}`);
  return c.html(<Error error={err?.message} />, 500);
});

export default app;
