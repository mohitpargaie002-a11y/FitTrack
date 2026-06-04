export interface AuthResponse {
  token: string;
  name: string;
  email: string;
  userId: string;
}

export interface User {
  userId: string;
  name: string;
  email: string;
}

export const DayType = {
  Chest: "Chest",
  Back: "Back",
  Abs: "Abs",
  Rest: "Rest",
} as const;

export type DayType = (typeof DayType)[keyof typeof DayType];

export interface ExerciseTemplate {
  id: string;
  name: string;
  description?: string;
  sets: number;
  reps: string;
  orderIndex: number;
}

export interface PlanDay {
  id: string;
  dayIndex: number;
  dayType: DayType;
  exercises: ExerciseTemplate[];
}

export interface WorkoutPlan {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  planDays: PlanDay[];
}

export interface LogEntryDto {
  id: string;
  exerciseTemplateId: string;
  exerciseName: string;
  reps: string;
  sets: number;
  isCompleted: boolean;
  notes?: string;
}

export interface DailyLogDto {
  id: string;
  date: string;
  planDayId: string;
  dayType: string;
  isCompleted: boolean;
  completedAt?: string;
  notes?: string;
  logEntries: LogEntryDto[];
}

export interface CalendarDayDto {
  date: string;
  dayType: string;
  hasLog: boolean;
  isCompleted: boolean;
  totalExercises: number;
  completedExercises: number;
}

export interface WeeklyBarDto {
  weekLabel: string;
  completed: number;
  total: number;
}

export interface ExerciseStatsDto {
  exerciseName: string;
  dayType: string;
  timesCompleted: number;
  timesScheduled: number;
  completionRate: number;
}

export interface DashboardStatsDto {
  currentStreak: number;
  longestStreak: number;
  totalCompleted: number;
  totalScheduled: number;
  overallConsistency: number;
  chestConsistency: number;
  backConsistency: number;
  absConsistency: number;
  daysRemaining: number;
  weeklyBars: WeeklyBarDto[];
  exerciseStats: ExerciseStatsDto[];
  heatmapDays: CalendarDayDto[];
}
