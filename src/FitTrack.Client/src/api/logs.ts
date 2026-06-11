import client from "./client";
import {
  type CalendarDayDto,
  type DailyLogDto,
  normalizeDayType,
} from "../types";
import { cacheKey, invalidateCachePrefix, readCache, writeCache } from "./cache";

interface RawCalendarDay extends Omit<CalendarDayDto, "dayType"> {
  dayType: string | number;
}

export const getCalendar = async (
  planId: string,
  year: number,
  month: number,
  options?: { force?: boolean },
) => {
  const key = cacheKey("calendar", planId, year, month);
  if (!options?.force) {
    const cached = readCache<CalendarDayDto[]>(key);
    if (cached) return cached;
  }

  const res = await client.get<RawCalendarDay[]>(
    `/plans/${planId}/logs/calendar?year=${year}&month=${month}`,
  );
  const days = res.data.map(
    (d): CalendarDayDto => ({
      ...d,
      dayType: normalizeDayType(d.dayType),
    }),
  );
  writeCache(key, days);
  return days;
};

export const getDayLog = async (planId: string, date: string) => {
  const res = await client.get<DailyLogDto>(
    `/plans/${planId}/logs/date/${date}`,
  );
  return res.data;
};

export const toggleDay = async (
  planId: string,
  logId: string,
  isCompleted: boolean,
) => {
  const res = await client.patch<DailyLogDto>(
    `/plans/${planId}/logs/${logId}/toggle`,
    { isCompleted },
  );
  invalidateCachePrefix(["calendar", planId]);
  invalidateCachePrefix(["stats", planId]);
  return res.data;
};

export const toggleExercise = async (
  planId: string,
  logId: string,
  entryId: string,
  isCompleted: boolean,
) => {
  const res = await client.patch<DailyLogDto>(
    `/plans/${planId}/logs/${logId}/entries/${entryId}/toggle`,
    { isCompleted },
  );
  invalidateCachePrefix(["calendar", planId]);
  invalidateCachePrefix(["stats", planId]);
  return res.data;
};
