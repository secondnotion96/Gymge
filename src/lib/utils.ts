import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculate1RM(weight: number, reps: number) {
  if (reps === 0) return 0;
  if (reps === 1) return weight;
  // Brzycki Formula
  const onerm = weight / (1.0278 - 0.0278 * reps);
  return isFinite(onerm) ? onerm : weight; // Fallback to weight if reps are too high
}
