import client from "./client";
import type { WorkoutPlanV2Dto } from "../types";

export const getPlans = async () => {
  const res = await client.get<WorkoutPlanV2Dto[]>("/workoutplans/v2");
  return res.data;
};

export const getPlan = async (planId: string) => {
  const res = await client.get<WorkoutPlanV2Dto>(`/workoutplans/v2/${planId}`);
  return res.data;
};

export const createPlan = async (payload: {
  name: string;
  startDate: string;
  durationMonths: number;
  customEndDate: string | null;
  workDays: number;
  restDays: number;
  daySlots: {
    slotName: string;
    exercises: {
      name: string;
      description: string;
      sets: number;
      reps: string;
    }[];
  }[];
}) => {
  const res = await client.post<WorkoutPlanV2Dto>("/workoutplans/v2", payload);
  return res.data;
};

export const deletePlan = async (planId: string) => {
  await client.delete(`/workoutplans/${planId}`);
};

export const updateDayExercises = async (
  planId: string,
  dayType: string,
  exercises: {
    name: string;
    description: string;
    sets: number;
    reps: string;
  }[],
) => {
  const res = await client.put<WorkoutPlanV2Dto>(
    `/workoutplans/v2/${planId}/days/${dayType}/exercises`,
    { exercises },
  );
  return res.data;
};

export const seedDefaultPlan = async (startDate: string) => {
  const res = await client.post<WorkoutPlanV2Dto>(
    `/workoutplans/seed?startDate=${startDate}`,
  );
  return res.data;
};
