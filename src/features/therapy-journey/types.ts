// Domain model for the Therapy Journey feature.
// Nothing in the UI layer should invent or default these values —
// they all originate from the service layer in ../api/therapyProgress.ts

export type ActivityId =
  | 'breathing'
  | 'sound-practice'
  | 'word-practice'
  | 'sentence-building'
  | 'conversation'
  | 'storytelling';

export type ActivityStatus =
  | 'completed'
  | 'in-progress'
  | 'recommended'
  | 'upcoming'
  | 'locked';

export interface TherapyActivity {
  id: ActivityId | string;
  name: string;
  /** 0–100, derived from completed/total if the backend does not send it. */
  progress: number;
  status: ActivityStatus;
  completedExercises: number;
  totalExercises: number;
  level: number;
  /** ISO date string, or null if never practised. */
  lastPracticeDate: string | null;
  streak: number;
  description: string;
  /** Activity ids that must be completed before this one unlocks. */
  prerequisites: string[];
  /** Route to open when the user taps "Continue practice". */
  route: string;
}

export interface TherapySummary {
  overallProgress: number; // 0–100
  currentLevel: number;
  dailyStreak: number; // days
  completedExercises: number;
  totalExercises: number;
}

export interface TherapyJourney {
  summary: TherapySummary;
  activities: TherapyActivity[];
  /** Server-side recommendation, if the backend provides one. */
  recommendedActivityId: string | null;
}

export const isActionable = (a: TherapyActivity) => a.status !== 'locked';

export const remaining = (a: TherapyActivity) =>
  Math.max(0, a.totalExercises - a.completedExercises);
