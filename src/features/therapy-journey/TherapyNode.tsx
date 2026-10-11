import { useState } from 'react';
import { ProgressRing } from './ProgressRing';
import { CheckBadgeIcon, LockIcon, SparkIcon, TherapyIcon } from './TherapyIcon';
import { remaining, type TherapyActivity } from './types';

const STATUS_TEXT: Record<TherapyActivity['status'], string> = {
  completed: 'Completed',
  'in-progress': 'In progress',
  recommended: 'Recommended',
  upcoming: 'Upcoming',
  locked: 'Locked',
};

function StatusBadge({ status }: { status: TherapyActivity['status'] }) {
  const icon =
    status === 'completed' ? <CheckBadgeIcon /> :
    status === 'locked' ? <LockIcon /> :
    status === 'recommended' ? <SparkIcon /> : null;
  return (
    <span className={`vt-badge vt-badge--${status}`}>
      {icon}
      <span className="vt-badge__text">{STATUS_TEXT[status]}</span>
    </span>
  );
}

interface Props {
  activity: TherapyActivity;
  index: number;
  onOpen: (a: TherapyActivity) => void;
}

export function TherapyNode({ activity, index, onOpen }: Props) {
  const [tipOpen, setTipOpen] = useState(false);
  const locked = activity.status === 'locked';
  const tipId = `vt-tip-${activity.id}`;

  const label =
    `${activity.name}, ${activity.progress} percent complete, ` +
    `${activity.completedExercises} of ${activity.totalExercises} exercises. ` +
    `${STATUS_TEXT[activity.status]}.`;

  return (
    <div className="vt-node" style={{ '--i': index } as React.CSSProperties}>
      <button
        type="button"
        className={`vt-node__button vt-node__button--${activity.status}`}
        aria-label={label}
        aria-describedby={tipOpen ? tipId : undefined}
        aria-disabled={locked || undefined}
        onClick={() => onOpen(activity)}
        onMouseEnter={() => setTipOpen(true)}
        onMouseLeave={() => setTipOpen(false)}
        onFocus={() => setTipOpen(true)}
        onBlur={() => setTipOpen(false)}
      >
        <ProgressRing progress={activity.progress} delay={index * 110}>
          <span className="vt-node__icon">
            <TherapyIcon id={String(activity.id)} />
          </span>
        </ProgressRing>
        <StatusBadge status={activity.status} />
      </button>

      <div className="vt-node__meta">
        <span className="vt-node__name">{activity.name}</span>
        <span className="vt-node__pct">
          {activity.progress}%
          <span className="vt-node__count">
            {' · '}
            {activity.completedExercises}/{activity.totalExercises}
          </span>
        </span>
      </div>

      <div id={tipId} role="tooltip" className="vt-tooltip" data-open={tipOpen || undefined}>
        <strong>{activity.name}</strong>
        <span>{activity.progress}% complete</span>
        <span>
          {activity.completedExercises} of {activity.totalExercises} exercises
        </span>
        <span>{remaining(activity)} remaining</span>
        <span className="vt-tooltip__status">{STATUS_TEXT[activity.status]}</span>
      </div>
    </div>
  );
}
