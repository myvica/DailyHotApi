import type { Get, Post } from "../src/types";
import { getCache, setCache, delCache } from "./cache";
import { getConfig } from "./config";

export interface RequestResult<T = unknown> {
  fromCache: boolean;
  updateTime: string;
  data: T;
}

const timeoutFetch = async (
  url: string,
  options: RequestInit = {},
  timeout: number = 6000
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
};

const processResponse = async (
  response: Response,
  responseType?: string
): Promise<unknown> => {
  if (responseType === "arraybuffer") {
    return await response.arrayBuffer();
  }
  
  const contentType = response.headers.get("content-type") || "";
  
  if (contentType.includes("application/json")) {
    return await response.json();
  }
  
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

export const get = async <T = unknown>(options: Get): Promise<RequestResult<T>> => {
  const config = getConfig();
  const {
    url,
    headers,
    params,
    noCache,
    ttl = config.CACHE_TTL,
    originaInfo = false,
    responseType = "json",
  } = options;

  console.log(`[GET] ${url}`);

  try {
    if (noCache) {
      await delCache(url);
    } else {
      const cachedData = await getCache(url);
      if (cachedData) {
        console.log("[CACHE] The request is cached");
        return {
          fromCache: true,
          updateTime: cachedData.updateTime,
          data: cachedData.data as T,
        };
      }
    }

    const fetchHeaders: Record<string, string> = {};
    if (headers) {
      Object.entries(headers).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          fetchHeaders[key] = value.join(", ");
        } else {
          fetchHeaders[key] = value;
        }
      });
    }

    let requestUrl = url;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, String(value));
      });
      requestUrl += `?${searchParams.toString()}`;
    }

    const response = await timeoutFetch(
      requestUrl,
      { method: "GET", headers: fetchHeaders },
      config.REQUEST_TIMEOUT
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const responseData = await processResponse(response, responseType);
    const updateTime = new Date().toISOString();
    const data = originaInfo ? (response as unknown as T) : (responseData as T);

    await setCache(url, { data, updateTime }, ttl);

    console.log(`[${response.status}] request was successful`);
    return { fromCache: false, updateTime, data };
  } catch (error) {
    console.error("[ERROR] request failed:", error);
    throw error;
  }
};

export const post = async <T = unknown>(options: Post): Promise<RequestResult<T>> => {
  const config = getConfig();
  const { url, headers, body, noCache, ttl = config.CACHE_TTL, originaInfo = false } = options;

  console.log(`[POST] ${url}`);

  try {
    if (noCache) {
      await delCache(url);
    } else {
      const cachedData = await getCache(url);
      if (cachedData) {
        console.log("[CACHE] The request is cached");
        return {
          fromCache: true,
          updateTime: cachedData.updateTime,
          data: cachedData.data as T,
        };
      }
    }

    const fetchHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (headers) {
      Object.entries(headers).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          fetchHeaders[key] = value.join(", ");
        } else {
          fetchHeaders[key] = value;
        }
      });
    }

    const response = await timeoutFetch(
      url,
      {
        method: "POST",
        headers: fetchHeaders,
        body: typeof body === "string" ? body : JSON.stringify(body),
      },
      config.REQUEST_TIMEOUT
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const responseData = await processResponse(response);
    const updateTime = new Date().toISOString();
    const data = originaInfo ? (response as unknown as T) : (responseData as T);

    if (!noCache) {
      await setCache(url, { data, updateTime }, ttl);
    }

    console.log(`[${response.status}] request was successful`);
    return { fromCache: false, updateTime, data };
  } catch (error) {
    console.error("[ERROR] request failed:", error);
    throw error;
  }
};
