export interface BuilderExercise {
  name: string;
  description: string;
  sets: number;
  reps: string;
}

export interface BuilderSlot {
  slotName: string;
  exercises: BuilderExercise[];
}

export interface BuilderState {
  // Step 1
  name: string;
  startDate: string;
  durationMonths: number;
  customEndDate: string;

  // Step 2
  workDays: number;
  restDays: number;
  slots: BuilderSlot[];
}
