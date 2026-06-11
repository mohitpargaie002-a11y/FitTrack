import client from "./client";
import {
  type CalendarDayDto,
  type DailyLogDto,
  normalizeDayType,
} from "../types";

interface RawCalendarDay extends Omit<CalendarDayDto, "dayType"> {
  dayType: string | number;
}

export const getCalendar = async (
  planId: string,
  year: number,
  month: number,
) => {
  const res = await client.get<RawCalendarDay[]>(
    `/plans/${planId}/logs/calendar?year=${year}&month=${month}`,
  );
  return res.data.map(
    (d): CalendarDayDto => ({
      ...d,
      dayType: normalizeDayType(d.dayType),
    }),
  );
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
  return res.data;
};
