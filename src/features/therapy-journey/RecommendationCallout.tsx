import type { TherapyActivity } from './types';

interface Props {
  activity: TherapyActivity;
  onStart: (a: TherapyActivity) => void;
}

/**
 * Anchored beside the recommended node. Positioning is handled in CSS with
 * `max-width: min(18rem, calc(100vw - 2rem))` so it can never overflow the
 * viewport or trigger horizontal scroll; below 380px it drops under the node.
 */
export function RecommendationCallout({ activity, onStart }: Props) {
  return (
    <div className="vt-callout" role="note">
      <p className="vt-callout__eyebrow">Next best lesson</p>
      <p className="vt-callout__title">{activity.name}</p>
      <p className="vt-callout__detail">
        {activity.completedExercises} of {activity.totalExercises} exercises completed
      </p>
      <button type="button" className="vt-callout__cta" onClick={() => onStart(activity)}>
        Continue practice
      </button>
    </div>
  );
}
