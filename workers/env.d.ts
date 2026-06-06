export interface Env {
  // KV 绑定
  CACHE: KVNamespace;
  
  // 环境变量
  CACHE_TTL: string;
  REQUEST_TIMEOUT: string;
  ALLOWED_DOMAIN: string;
  ALLOWED_HOST: string;
  RSS_MODE: string;
  FILTER_WEIBO_ADVERTISEMENT: string;
  ZHIHU_COOKIE?: string;
}
