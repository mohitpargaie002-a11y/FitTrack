import client from "./client";
import type { WorkoutPlan } from "../types";

export const getPlans = async () => {
  const res = await client.get<WorkoutPlan[]>("/workoutplans");
  return res.data;
};

export const getPlan = async (planId: string) => {
  const res = await client.get<WorkoutPlan>(`/workoutplans/${planId}`);
  return res.data;
};

export const seedDefaultPlan = async (startDate: string) => {
  const res = await client.post<WorkoutPlan>(
    `/workoutplans/seed?startDate=${startDate}`,
  );
  return res.data;
};
