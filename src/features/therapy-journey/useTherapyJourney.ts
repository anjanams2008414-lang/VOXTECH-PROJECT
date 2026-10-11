import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchTherapyJourney } from './therapyProgress';
import { isJourneyEmpty, recommendNextActivity, withRecommendation } from './recommend';
import type { TherapyActivity, TherapyJourney } from './types';

type Status = 'loading' | 'ready' | 'error';

interface Result {
  status: Status;
  isEmpty: boolean;
  summary: TherapyJourney['summary'] | null;
  activities: TherapyActivity[];
  recommended: TherapyActivity | null;
  retry: () => void;
}

/**
 * If Voxtech already uses React Query / SWR, swap the body of this hook for
 * a `useQuery(['therapy-journey'], fetchTherapyJourney)` call and keep the
 * same return shape — the components below depend only on this interface.
 */
export function useTherapyJourney(): Result {
  const [journey, setJourney] = useState<TherapyJourney | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [nonce, setNonce] = useState(0);
  const inFlight = useRef<AbortController | null>(null);

  useEffect(() => {
    inFlight.current?.abort();
    const controller = new AbortController();
    inFlight.current = controller;
    let active = true;

    setStatus('loading');
    fetchTherapyJourney(controller.signal)
      .then((data) => {
        if (!active) return;
        setJourney(data);
        setStatus('ready');
      })
      .catch((err) => {
        if (!active || controller.signal.aborted) return;
        console.error('[therapy-journey] load failed', err);
        setStatus('error');
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [nonce]);

  const retry = useCallback(() => setNonce((n) => n + 1), []);

  const recommended = useMemo(
    () => (journey ? recommendNextActivity(journey) : null),
    [journey],
  );

  const activities = useMemo(
    () => (journey ? withRecommendation(journey.activities, recommended?.id ?? null) : []),
    [journey, recommended],
  );

  return {
    status,
    isEmpty: journey ? isJourneyEmpty(journey) : false,
    summary: journey?.summary ?? null,
    activities,
    recommended: activities.find((a) => a.id === recommended?.id) ?? null,
    retry,
  };
}
