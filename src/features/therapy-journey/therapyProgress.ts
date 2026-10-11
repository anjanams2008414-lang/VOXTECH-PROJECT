/**
 * Service layer — the ONLY file you should need to edit to connect this
 * feature to the real Voxtech backend.
 *
 * Replace `request()` with your existing API client (axios instance, fetch
 * wrapper, tRPC/React Query call — whatever Voxtech already uses). Auth
 * headers/cookies must come from that existing client so no tokens or
 * secrets are introduced here.
 */

import type {
  ActivityStatus,
  TherapyActivity,
  TherapyJourney,
} from './types';

/* ------------------------------------------------------------------ *
 * 1. Wire this to your existing client
 * ------------------------------------------------------------------ */

// e.g.  import { api } from '@/lib/api';
//       const request = (path: string, signal?: AbortSignal) =>
//         api.get(path, { signal }).then(r => r.data);

const API_BASE = ''; // your client probably already sets this

async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  const token = window.localStorage.getItem('voxtech-token');
  const res = await fetch(`${API_BASE}${path}`, {
    signal,
    credentials: 'include', // existing session/cookie auth
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

/**
 * Candidate endpoints, tried in order until one responds.
 * Delete the ones that don't exist in Voxtech and keep the real one first —
 * this list exists only so the feature works before you've confirmed the path.
 */
const ENDPOINTS = ['/api/therapy/journey', '/api/careplan'];

/* ------------------------------------------------------------------ *
 * 2. Static activity metadata (copy, icons, order, routes)
 *    Progress numbers are NEVER defined here.
 * ------------------------------------------------------------------ */

type ActivityMeta = Pick<
  TherapyActivity,
  'id' | 'name' | 'description' | 'totalExercises' | 'prerequisites' | 'route'
>;

export const ACTIVITY_CATALOG: ActivityMeta[] = [
  {
    id: 'breathing',
    name: 'Breathing',
    description: 'Steady your breath to support clear, relaxed speech.',
    totalExercises: 10,
    prerequisites: [],
    route: '/therapy',
  },
  {
    id: 'sound-practice',
    name: 'Sound Practice',
    description: 'Shape individual sounds and hear them played back.',
    totalExercises: 20,
    prerequisites: ['breathing'],
    route: '/therapy',
  },
  {
    id: 'word-practice',
    name: 'Word Practice',
    description: 'Practise identifying and saying everyday words.',
    totalExercises: 20,
    prerequisites: ['sound-practice'],
    route: '/therapy',
  },
  {
    id: 'sentence-building',
    name: 'Sentence Building',
    description: 'Join words into sentences that carry a full idea.',
    totalExercises: 20,
    prerequisites: ['word-practice'],
    route: '/therapy',
  },
  {
    id: 'conversation',
    name: 'Conversation',
    description: 'Take turns, ask questions, and keep a topic going.',
    totalExercises: 20,
    prerequisites: ['sentence-building'],
    route: '/therapy',
  },
  {
    id: 'storytelling',
    name: 'Storytelling',
    description: 'Tell a story from beginning to end in your own words.',
    totalExercises: 20,
    prerequisites: ['conversation'],
    route: '/therapy',
  },
];

/* ------------------------------------------------------------------ *
 * 3. Normalisation — map whatever shape the backend returns
 * ------------------------------------------------------------------ */

const clampPct = (n: unknown, fallback = 0) => {
  const v = typeof n === 'number' && Number.isFinite(n) ? n : fallback;
  return Math.min(100, Math.max(0, Math.round(v)));
};

/** Accepts snake_case or camelCase keys — adjust to your actual payload. */
function pick<T>(src: Record<string, any>, ...keys: string[]): T | undefined {
  for (const k of keys) if (src?.[k] !== undefined && src[k] !== null) return src[k] as T;
  return undefined;
}

function deriveStatus(
  activity: { completed: number; total: number },
  prerequisitesMet: boolean,
  raw?: string,
): ActivityStatus {
  if (raw && ['completed', 'in-progress', 'upcoming', 'locked'].includes(raw))
    return raw as ActivityStatus;
  if (activity.total > 0 && activity.completed >= activity.total) return 'completed';
  if (!prerequisitesMet && activity.completed === 0) return 'locked';
  if (activity.completed > 0) return 'in-progress';
  return 'upcoming';
}

export function normalizeJourney(payload: Record<string, any>): TherapyJourney {
  const rawActivities: Record<string, any>[] =
    pick(payload, 'activities', 'stages', 'modules', 'carePlan') ?? [];

  const byId = new Map<string, Record<string, any>>();
  for (const [index, a] of rawActivities.entries()) {
    const id = String(
      pick<string>(a, 'id', 'slug', 'activityId') ?? ACTIVITY_CATALOG[index]?.id ?? '',
    );
    const catalogId = ACTIVITY_CATALOG[index]?.id;
    if (id) byId.set(id, a);
    if (catalogId && !byId.has(catalogId)) byId.set(catalogId, a);
  }

  const completedIds = new Set<string>();

  const activities: TherapyActivity[] = ACTIVITY_CATALOG.map((meta) => {
    const raw = byId.get(String(meta.id)) ?? {};
    const total =
      pick<number>(raw, 'totalExercises', 'total_exercises', 'total') ?? meta.totalExercises;
    const rawStatus = pick<string>(raw, 'status')?.toLowerCase().replace(/\s+/g, '-')
    const completed = Math.min(
      total,
      pick<number>(raw, 'completedExercises', 'completed_exercises', 'completed') ??
        (rawStatus === 'completed' ? total : 0),
    );
    const prerequisitesMet = meta.prerequisites.every((p) => completedIds.has(p));
    const status = deriveStatus(
      { completed, total },
      prerequisitesMet,
      rawStatus,
    );
    if (status === 'completed') completedIds.add(String(meta.id));

    return {
      ...meta,
      totalExercises: total,
      completedExercises: completed,
      progress: clampPct(
        pick<number>(raw, 'progress', 'progressPercent', 'percent') ??
          (total > 0 ? (completed / total) * 100 : 0),
      ),
      status,
      level: pick<number>(raw, 'level') ?? 1,
      lastPracticeDate:
        pick<string>(raw, 'lastPracticeDate', 'last_practice_date', 'lastPracticedAt') ?? null,
      streak: pick<number>(raw, 'streak', 'currentStreak') ?? 0,
      route: pick<string>(raw, 'route', 'url') ?? meta.route,
    };
  });

  const totalEx = activities.reduce((s, a) => s + a.totalExercises, 0);
  const doneEx = activities.reduce((s, a) => s + a.completedExercises, 0);
  const rawSummary: Record<string, any> = pick(payload, 'summary', 'stats') ?? payload;

  return {
    activities,
    summary: {
      overallProgress: clampPct(
        pick<number>(rawSummary, 'overallProgress', 'overall_progress') ??
          (totalEx > 0 ? (doneEx / totalEx) * 100 : 0),
      ),
      currentLevel: pick<number>(rawSummary, 'currentLevel', 'current_level', 'level') ?? 1,
      dailyStreak: pick<number>(rawSummary, 'dailyStreak', 'daily_streak', 'streak') ?? 0,
      completedExercises:
        pick<number>(rawSummary, 'completedExercises', 'completed_exercises') ?? doneEx,
      totalExercises: pick<number>(rawSummary, 'totalExercises', 'total_exercises') ?? totalEx,
    },
    recommendedActivityId:
      pick<string>(
        rawSummary,
        'recommendedActivityId',
        'recommended_activity_id',
        'nextBestLesson',
      ) ?? null,
  };
}

/* ------------------------------------------------------------------ *
 * 4. Public API
 * ------------------------------------------------------------------ */

export async function fetchTherapyJourney(signal?: AbortSignal): Promise<TherapyJourney> {
  let lastError: unknown;
  for (const path of ENDPOINTS) {
    try {
      const payload = await request<Record<string, any>>(path, signal);
      return normalizeJourney(payload);
    } catch (err) {
      if (signal?.aborted) throw err;
      lastError = err;
    }
  }
  throw lastError ?? new Error('No therapy progress endpoint responded');
}
