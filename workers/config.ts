import type { Env } from "./env";

export type Config = {
  PORT: number;
  DISALLOW_ROBOT: boolean;
  CACHE_TTL: number;
  REQUEST_TIMEOUT: number;
  ALLOWED_DOMAIN: string;
  ALLOWED_HOST: string;
  USE_LOG_FILE: boolean;
  RSS_MODE: boolean;
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD: string;
  REDIS_DB: number;
  ZHIHU_COOKIE: string;
  FILTER_WEIBO_ADVERTISEMENT: boolean;
  API_TOKEN: string;
};

const getNumericEnvVariable = (value: string | undefined, defaultValue: number): number => {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

const getBooleanEnvVariable = (value: string | undefined, defaultValue: boolean): boolean => {
  if (!value) return defaultValue;
  return value.toLowerCase() === "true";
};

export const createConfig = (env: Env): Config => ({
  PORT: 8787,
  DISALLOW_ROBOT: true,
  CACHE_TTL: getNumericEnvVariable(env.CACHE_TTL, 3600),
  REQUEST_TIMEOUT: getNumericEnvVariable(env.REQUEST_TIMEOUT, 6000),
  ALLOWED_DOMAIN: env.ALLOWED_DOMAIN || "*",
  ALLOWED_HOST: env.ALLOWED_HOST || "imsyy.top",
  USE_LOG_FILE: false,
  RSS_MODE: getBooleanEnvVariable(env.RSS_MODE, false),
  REDIS_HOST: "",
  REDIS_PORT: 0,
  REDIS_PASSWORD: "",
  REDIS_DB: 0,
  ZHIHU_COOKIE: env.ZHIHU_COOKIE || "",
  FILTER_WEIBO_ADVERTISEMENT: getBooleanEnvVariable(env.FILTER_WEIBO_ADVERTISEMENT, false),
  API_TOKEN: env.API_TOKEN || "",
});

let currentConfig: Config | null = null;

export const getConfig = (): Config => {
  if (!currentConfig) {
    throw new Error("Config not initialized. Call createConfig first.");
  }
  return currentConfig;
};

export const setConfig = (config: Config): void => {
  currentConfig = config;
};
