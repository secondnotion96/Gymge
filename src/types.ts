export interface Exercise {
  id: string;
  name: string;
  category: string;
  notes?: string;
}

export interface WorkoutExercise {
  exerciseId: string;
  sets: number;
  reps: number;
}

export interface Workout {
  id: string;
  name: string;
  exercises: WorkoutExercise[];
}

export interface Schedule {
  [day: string]: string | null; // day (0-6) -> workoutId
}

export interface SetLog {
  reps: number;
  weight: number;
  completed: boolean;
}

export interface ExerciseLog {
  exerciseId: string;
  sets: SetLog[];
}

export interface WorkoutLog {
  id: string;
  workoutId: string;
  date: string; // ISO string
  exercises: ExerciseLog[];
}

export interface BodyWeightLog {
  date: string; // ISO string
  weight: number;
}

export interface AppState {
  exercises: Exercise[];
  workouts: Workout[];
  schedule: Schedule;
  logs: WorkoutLog[];
  bodyweight: BodyWeightLog[];
}
