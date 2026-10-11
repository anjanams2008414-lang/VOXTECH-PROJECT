import type { TherapyActivity, TherapyJourney } from './types';

/**
 * Picks the next best lesson.
 *
 * 1. Trust the backend recommendation if it points at an actionable activity.
 * 2. Otherwise prefer an in-progress activity (closest to finishing first).
 * 3. Otherwise the earliest incomplete activity whose prerequisites are met.
 * 4. Never recommend a locked or completed activity.
 * Returns null when everything is complete.
 */
export function recommendNextActivity(journey: TherapyJourney): TherapyActivity | null {
  const { activities, recommendedActivityId } = journey;
  const completed = new Set(
    activities.filter((a) => a.status === 'completed').map((a) => a.id),
  );

  const eligible = (a: TherapyActivity) =>
    a.status !== 'completed' &&
    a.status !== 'locked' &&
    a.prerequisites.every((p) => completed.has(p));

  if (recommendedActivityId) {
    const fromServer = activities.find((a) => a.id === recommendedActivityId);
    if (fromServer && eligible(fromServer)) return fromServer;
  }

  const inProgress = activities
    .filter((a) => eligible(a) && a.completedExercises > 0)
    .sort((a, b) => b.progress - a.progress);
  if (inProgress.length) return inProgress[0];

  return activities.find(eligible) ?? null;
}

/**
 * Applies the recommendation as a display status, without mutating input.
 * `recommended` is a view state — it replaces `in-progress`/`upcoming`
 * on exactly one node.
 */
export function withRecommendation(
  activities: TherapyActivity[],
  recommendedId: string | null,
): TherapyActivity[] {
  return activities.map((a) =>
    a.id === recommendedId && a.status !== 'completed'
      ? { ...a, status: 'recommended' as const }
      : a,
  );
}

export const isJourneyEmpty = (journey: TherapyJourney) =>
  journey.summary.completedExercises === 0 &&
  journey.activities.every((a) => a.completedExercises === 0);
