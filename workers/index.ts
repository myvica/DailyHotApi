import type { Env } from "./env";
import { createConfig, setConfig } from "./config";
import { initCache } from "./cache";
import app from "./app";

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const config = createConfig(env);
    setConfig(config);
    
    initCache(env.CACHE, config.CACHE_TTL);
    
    return app.fetch(request, env, ctx);
  },
};
