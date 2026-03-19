import { useState, useEffect } from 'react';
import { AppState, Exercise, Workout, Schedule, WorkoutLog, BodyWeightLog } from '../types';

const STORAGE_KEY = 'gymge_app_state';

const initialState: AppState = {
  exercises: [
    { id: '1', name: 'Bench Press', category: 'Chest' },
    { id: '2', name: 'Squat', category: 'Legs' },
    { id: '3', name: 'Deadlift', category: 'Back' },
  ],
  workouts: [],
  schedule: {
    '0': null, '1': null, '2': null, '3': null, '4': null, '5': null, '6': null
  },
  logs: [],
  bodyweight: [],
};

export function useAppState() {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialState;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addExercise = (exercise: Omit<Exercise, 'id'>) => {
    const newExercise = { ...exercise, id: crypto.randomUUID() };
    setState(prev => ({ ...prev, exercises: [...prev.exercises, newExercise] }));
  };

  const addWorkout = (workout: Omit<Workout, 'id'>) => {
    const newWorkout = { ...workout, id: crypto.randomUUID() };
    setState(prev => ({ ...prev, workouts: [...prev.workouts, newWorkout] }));
  };

  const updateSchedule = (day: string, workoutId: string | null) => {
    setState(prev => ({
      ...prev,
      schedule: { ...prev.schedule, [day]: workoutId }
    }));
  };

  const addLog = (log: Omit<WorkoutLog, 'id'>) => {
    const newLog = { ...log, id: crypto.randomUUID() };
    setState(prev => ({ ...prev, logs: [...prev.logs, newLog] }));
  };

  const addBodyweight = (weight: number) => {
    const newLog: BodyWeightLog = { date: new Date().toISOString(), weight };
    setState(prev => ({ ...prev, bodyweight: [...prev.bodyweight, newLog] }));
  };

  const deleteExercise = (id: string) => {
    setState(prev => ({ ...prev, exercises: prev.exercises.filter(e => e.id !== id) }));
  };

  const deleteWorkout = (id: string) => {
    setState(prev => ({ ...prev, workouts: prev.workouts.filter(w => w.id !== id) }));
  };

  const updateWorkout = (id: string, workout: Omit<Workout, 'id'>) => {
    setState(prev => ({
      ...prev,
      workouts: prev.workouts.map(w => w.id === id ? { ...workout, id } : w)
    }));
  };

  return {
    state,
    addExercise,
    deleteExercise,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    updateSchedule,
    addLog,
    addBodyweight,
  };
}
