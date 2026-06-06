import type { Env } from "./env";
import { stringify, parse } from "flatted";

interface CacheData {
  updateTime: string;
  data: unknown;
}

export class KVCache {
  private kv: KVNamespace;
  private defaultTTL: number;

  constructor(kv: KVNamespace, defaultTTL: number = 3600) {
    this.kv = kv;
    this.defaultTTL = defaultTTL;
  }

  async get(key: string): Promise<CacheData | undefined> {
    try {
      const value = await this.kv.get(key);
      if (!value) return undefined;
      return parse(value) as CacheData;
    } catch (error) {
      console.error(`[KV] get error: ${error}`);
      return undefined;
    }
  }

  async set(key: string, value: CacheData, ttl?: number): Promise<boolean> {
    try {
      const serialized = stringify(value);
      await this.kv.put(key, serialized, {
        expirationTtl: ttl || this.defaultTTL,
      });
      console.log(`[KV] ${key} has been cached`);
      return true;
    } catch (error) {
      console.error(`[KV] set error: ${error}`);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      await this.kv.delete(key);
      console.log(`[KV] ${key} has been deleted`);
      return true;
    } catch (error) {
      console.error(`[KV] del error: ${error}`);
      return false;
    }
  }
}

let cacheInstance: KVCache | null = null;

export const initCache = (kv: KVNamespace, ttl: number): void => {
  cacheInstance = new KVCache(kv, ttl);
};

export const getCache = async (key: string): Promise<CacheData | undefined> => {
  if (!cacheInstance) {
    throw new Error("Cache not initialized. Call initCache first.");
  }
  return cacheInstance.get(key);
};

export const setCache = async (
  key: string,
  value: CacheData,
  ttl?: number
): Promise<boolean> => {
  if (!cacheInstance) {
    throw new Error("Cache not initialized. Call initCache first.");
  }
  return cacheInstance.set(key, value, ttl);
};

export const delCache = async (key: string): Promise<boolean> => {
  if (!cacheInstance) {
    throw new Error("Cache not initialized. Call initCache first.");
  }
  return cacheInstance.del(key);
};
