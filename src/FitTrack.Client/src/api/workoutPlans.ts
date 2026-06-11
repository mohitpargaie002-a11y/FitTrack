import client from "./client";
import {
  DayType,
  type PlanDay,
  type WorkoutPlanV2Dto,
  normalizeDayType,
} from "../types";

interface RawPlanDay {
  id: string;
  dayIndex: number;
  dayType: string | number;
  exercises: WorkoutPlanV2Dto["planDays"][0]["exercises"];
}

interface RawPlan extends Omit<WorkoutPlanV2Dto, "planDays"> {
  planDays: RawPlanDay[];
}

const normalizePlan = (plan: RawPlan): WorkoutPlanV2Dto => ({
  ...plan,
  planDays: plan.planDays.map(
    (d): PlanDay => ({
      id: d.id,
      dayIndex: d.dayIndex,
      dayType: normalizeDayType(d.dayType) as DayType,
      exercises: d.exercises,
    }),
  ),
});

export const getPlans = async () => {
  const res = await client.get<RawPlan[]>("/workoutplans/v2");
  return res.data.map(normalizePlan);
};

export const getPlan = async (planId: string) => {
  const res = await client.get<RawPlan>(`/workoutplans/v2/${planId}`);
  return normalizePlan(res.data);
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
  const res = await client.post<RawPlan>("/workoutplans/v2", payload);
  return normalizePlan(res.data);
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
  const res = await client.put<RawPlan>(
    `/workoutplans/v2/${planId}/days/${dayType}/exercises`,
    { exercises },
  );
  return normalizePlan(res.data);
};

export const seedDefaultPlan = async (startDate: string) => {
  const res = await client.post<RawPlan>(
    `/workoutplans/seed?startDate=${startDate}`,
  );
  return normalizePlan(res.data);
};
