import client from "./client";
import type { DashboardStatsDto } from "../types";

export const getDashboardStats = async (planId: string) => {
  const res = await client.get<DashboardStatsDto>(`/plans/${planId}/stats`);
  return res.data;
};
