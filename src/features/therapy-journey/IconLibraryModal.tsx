import { useState } from 'react';
import { TherapyIcon } from './TherapyIcon';
import type { ActivityStatus, TherapyActivity } from './types';

const states: ActivityStatus[] = ['completed', 'recommended', 'upcoming', 'locked'];

const iconPaths: Record<string, string> = {
  breathing: '<path d="M4 8h9.5a2.5 2.5 0 0 1 0 5H12"/><path d="M4 12h13.5a2.5 2.5 0 0 0 0-5H16"/><path d="M4 16h8a2.5 2.5 0 0 1 0 5H10"/>',
  'sound-practice': '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><path d="M12 17v4M8 21h8"/>',
  'word-practice': '<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.5 8.5 0 0 1 4.7-7.6h.5a8.48 8.48 0 0 1 8 8v.5z"/><path d="M8.5 10l1.2 4.2 1.3-2.6 1.3 2.6 1.2-4.2"/>',
  'sentence-building': '<rect x="3" y="4" width="8" height="4.5" rx="1.5"/><rect x="13" y="4" width="8" height="4.5" rx="1.5"/><rect x="3" y="11" width="11" height="4.5" rx="1.5"/><rect x="16" y="11" width="5" height="4.5" rx="1.5"/><rect x="3" y="18" width="18" height="4" rx="1.5"/>',
  conversation: '<path d="M14 9a5 5 0 0 0-10 0c0 1.6.8 3.1 2 4.1V16l2.6-1.3c.7.2 1.5.3 2.4.3a5 5 0 0 0 3-1"/><path d="M17 9.5a5 5 0 0 1 3 4.5c0 1.6-.8 3.1-2 4.1V21l-2.6-1.3c-.7.2-1.5.3-2.4.3a5 5 0 0 1-4.8-3.4"/>',
  storytelling: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M12 6h4M12 10h4"/>',
};

const stateLabels: Record<ActivityStatus, string> = {
  completed: 'Completed',
  'in-progress': 'In progress',
  recommended: 'Recommended',
  upcoming: 'Upcoming',
  locked: 'Locked',
};

interface Props {
  activities: TherapyActivity[];
  onClose: () => void;
}

export function IconLibraryModal({ activities, onClose }: Props) {
  const [selected, setSelected] = useState<TherapyActivity | null>(null);
  const [copied, setCopied] = useState(false);

  const copyIcon = async (activity: TherapyActivity, status: ActivityStatus) => {
    const color = status === 'completed' || status === 'recommended' ? '#2de2b5' : '#64748b';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${iconPaths[String(activity.id)] ?? ''}</svg>`;
    try {
      await navigator.clipboard.writeText(svg);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="vt-icon-modal" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="vt-icon-modal__panel" role="dialog" aria-modal="true" aria-labelledby="icon-library-title">
        <header className="vt-icon-modal__header">
          <div>
            <p className="vt-icon-modal__eyebrow">Production-ready SVG system</p>
            <h2 id="icon-library-title">Therapy roadmap icons</h2>
            <p>Preview the same icon across each journey state.</p>
          </div>
          <button type="button" className="vt-icon-modal__close" aria-label="Close icon library" onClick={onClose}>×</button>
        </header>

        <div className="vt-icon-modal__body">
          <div className="vt-icon-matrix__labels" aria-hidden="true">
            {states.map((status) => <span key={status}>{stateLabels[status]}</span>)}
          </div>
          <div className="vt-icon-matrix">
            {activities.map((activity) => (
              <div className="vt-icon-matrix__row" key={activity.id}>
                <button type="button" className="vt-icon-matrix__name" onClick={() => setSelected(activity)}>{activity.name}</button>
                {states.map((status) => (
                  <button
                    type="button"
                    key={`${activity.id}-${status}`}
                    className={`vt-icon-matrix__cell vt-icon-matrix__cell--${status}`}
                    aria-label={`Copy ${activity.name}, ${stateLabels[status]} icon`}
                    onClick={() => copyIcon(activity, status)}
                  >
                    <TherapyIcon id={String(activity.id)} size={24} />
                  </button>
                ))}
              </div>
            ))}
          </div>
          {selected && <p className="vt-icon-modal__selection">Selected: <strong>{selected.name}</strong>. Click a state icon to copy its SVG.</p>}
        </div>

        <footer className="vt-icon-modal__footer">
          <span role="status">{copied ? 'SVG copied to clipboard.' : '24 icon variants across 6 milestones.'}</span>
          <button type="button" className="vt-btn vt-btn--ghost" onClick={onClose}>Done</button>
        </footer>
      </section>
    </div>
  );
}
