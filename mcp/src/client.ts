import axios, { AxiosInstance } from "axios";
import { config } from "dotenv";
import type { RouteInfo, HotListResponse, GetHotListOptions } from "./types.js";

config();

const DEFAULT_API_URL = "http://localhost:6688";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

let apiClient: AxiosInstance | null = null;
let routesCache: { data: RouteInfo[]; timestamp: number } | null = null;

export function getApiBaseUrl(): string {
  return process.env.DAILYHOT_API_URL || DEFAULT_API_URL;
}

export function getApiClient(): AxiosInstance {
  if (!apiClient) {
    apiClient = axios.create({
      baseURL: getApiBaseUrl(),
      timeout: 30000,
      headers: {
        Accept: "application/json",
      },
    });
  }
  return apiClient;
}

export async function getAllRoutes(): Promise<RouteInfo[]> {
  const now = Date.now();

  if (routesCache && now - routesCache.timestamp < CACHE_TTL_MS) {
    return routesCache.data;
  }

  const client = getApiClient();

  try {
    const response = await client.get("/all");
    // /all 返回 { code, count, routes: [...] }
    const data = response.data as { code: number; count: number; routes: RouteInfo[] };
    const routes = data.routes || [];

    routesCache = {
      data: routes,
      timestamp: now,
    };

    return routes;
  } catch (error) {
    if (routesCache) {
      return routesCache.data;
    }
    throw error;
  }
}

export async function getHotList(
  platform: string,
  options?: GetHotListOptions,
): Promise<HotListResponse> {
  const client = getApiClient();
  const params: Record<string, string | number> = {};

  if (options?.noCache) {
    params.noCache = "1";
  }

  const response = await client.get<HotListResponse>(`/${platform}`, { params });

  let data = response.data;

  if (options?.limit && data.data) {
    data = {
      ...data,
      data: data.data.slice(0, options.limit),
      total: Math.min(data.total, options.limit),
    };
  }

  return data;
}

export function clearRoutesCache(): void {
  routesCache = null;
}
