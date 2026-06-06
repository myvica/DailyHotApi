import { config } from "../config.js";
import { stringify, parse } from "flatted";
import logger from "./logger.js";
import NodeCache from "node-cache";
import Redis from "ioredis";

interface CacheData {
  updateTime: string;
  data: unknown;
}

let cache: NodeCache | null = null;
let redis: Redis | null = null;
let isRedisAvailable: boolean = false;
let isRedisTried: boolean = false;

const getCacheInstance = (): NodeCache => {
  if (!cache) {
    cache = new NodeCache({
      stdTTL: config.CACHE_TTL,
      checkperiod: 600,
      useClones: false,
      maxKeys: 100,
    });
    cache.on("expired", (key) => {
      logger.info(`⏳ [NodeCache] Key "${key}" has expired.`);
    });
    cache.on("del", (key) => {
      logger.info(`🗑️ [NodeCache] Key "${key}" has been deleted.`);
    });
  }
  return cache;
};

const getRedisInstance = (): Redis => {
  if (!redis) {
    redis = new Redis({
      host: config.REDIS_HOST,
      port: config.REDIS_PORT,
      password: config.REDIS_PASSWORD,
      db: config.REDIS_DB,
      maxRetriesPerRequest: 5,
      retryStrategy: (times) => Math.min(times * 50, 2000),
      lazyConnect: true,
    });
    redis.on("error", (err) => {
      if (!isRedisTried) {
        isRedisAvailable = false;
        isRedisTried = true;
        logger.error(
          `📦 [Redis] connection failed: ${err instanceof Error ? err.message : "Unknown error"}`,
        );
      }
    });
  }
  return redis;
};

const ensureRedisConnection = async () => {
  if (isRedisTried) return;
  try {
    const r = getRedisInstance();
    if (r.status !== "ready" && r.status !== "connecting") await r.connect();
    isRedisAvailable = true;
    isRedisTried = true;
    logger.info("📦 [Redis] connected successfully.");
  } catch (error) {
    isRedisAvailable = false;
    isRedisTried = true;
    logger.error(
      `📦 [Redis] connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};

export const getCache = async (key: string): Promise<CacheData | undefined> => {
  await ensureRedisConnection();
  if (isRedisAvailable) {
    try {
      const redisResult = await getRedisInstance().get(key);
      if (redisResult) return parse(redisResult);
    } catch (error) {
      logger.error(
        `📦 [Redis] get error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
  return getCacheInstance().get(key);
};

export const setCache = async (
  key: string,
  value: CacheData,
  ttl: number = config.CACHE_TTL,
): Promise<boolean> => {
  if (isRedisAvailable && !Buffer.isBuffer(value?.data)) {
    try {
      await getRedisInstance().set(key, stringify(value), "EX", ttl);
      if (logger) logger.info(`💾 [REDIS] ${key} has been cached`);
    } catch (error) {
      logger.error(
        `📦 [Redis] set error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
  const success = getCacheInstance().set(key, value, ttl);
  if (logger) logger.info(`💾 [NodeCache] ${key} has been cached`);
  return success;
};

export const delCache = async (key: string): Promise<boolean> => {
  let redisSuccess = true;
  try {
    await getRedisInstance().del(key);
    logger.info(`🗑️ [REDIS] ${key} has been deleted from Redis`);
  } catch (error) {
    redisSuccess = false;
    logger.error(
      `📦 [Redis] del error: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
  const nodeCacheSuccess = getCacheInstance().del(key) > 0;
  if (logger) logger.info(`🗑️ [CACHE] ${key} has been deleted from NodeCache`);
  return redisSuccess && nodeCacheSuccess;
};
