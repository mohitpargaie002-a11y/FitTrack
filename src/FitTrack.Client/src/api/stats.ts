import client from "./client";
import type { DashboardStatsDto } from "../types";
import { cacheKey, readCache, writeCache } from "./cache";

export const getDashboardStats = async (
  planId: string,
  options?: { force?: boolean },
) => {
  const key = cacheKey("stats", planId);
  if (!options?.force) {
    const cached = readCache<DashboardStatsDto>(key);
    if (cached) return cached;
  }

  const res = await client.get<DashboardStatsDto>(`/plans/${planId}/stats`);
  writeCache(key, res.data);
  return res.data;
};
