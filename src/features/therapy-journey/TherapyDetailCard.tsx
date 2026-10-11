import { useEffect, useRef } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { ProgressRing } from './ProgressRing';
import { TherapyIcon } from './TherapyIcon';
import { remaining, type TherapyActivity } from './types';

function formatLastPractice(iso: string | null, lang: string) {
  if (!iso) return lang === 'ta' ? 'இன்னும் பயிற்சி செய்யப்படவில்லை' : 'Not yet practised';
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return lang === 'ta' ? 'இன்னும் பயிற்சி செய்யப்படவில்லை' : 'Not yet practised';
  const days = Math.floor((Date.now() - then.getTime()) / 86_400_000);
  if (days <= 0) return lang === 'ta' ? 'இன்று' : 'Today';
  if (days === 1) return lang === 'ta' ? 'நேற்று' : 'Yesterday';
  if (days < 7) return lang === 'ta' ? `${days} நாட்களுக்கு முன்` : `${days} days ago`;
  return then.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

interface Props {
  activity: TherapyActivity;
  onClose: () => void;
  onContinue: (a: TherapyActivity) => void;
  onViewProgress: (a: TherapyActivity) => void;
}

export function TherapyDetailCard({ activity, onClose, onContinue, onViewProgress }: Props) {
  const { lang, t } = useTranslation();
  const dialog = useRef<HTMLDivElement>(null);
  const restoreTo = useRef<Element | null>(null);

  useEffect(() => {
    restoreTo.current = document.activeElement;
    dialog.current?.querySelector<HTMLElement>('button')?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !dialog.current) return;
      const focusables = dialog.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      (restoreTo.current as HTMLElement | null)?.focus?.();
    };
  }, [onClose]);

  const locked = activity.status === 'locked';

  return (
    <div className="vt-sheet" onClick={onClose}>
      <div
        ref={dialog}
        className="vt-sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="vt-sheet-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="vt-sheet__close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <header className="vt-sheet__head">
          <ProgressRing progress={activity.progress} size={76} thickness={5}>
            <TherapyIcon id={String(activity.id)} size={24} />
          </ProgressRing>
          <div>
            <h2 id="vt-sheet-title">{t(activity.name, activity.name)}</h2>
            <p className="vt-sheet__sub">
              {activity.progress}% {lang === 'ta' ? 'நிறைவடைந்தது' : 'complete'} · {activity.completedExercises}/
              {activity.totalExercises} {t('exercises', 'exercises')}
            </p>
          </div>
        </header>

        <p className="vt-sheet__desc">{t(activity.description, activity.description)}</p>

        <dl className="vt-sheet__stats">
          <div>
            <dt>{t('level', 'Level')}</dt>
            <dd>{t(activity.level, activity.level)}</dd>
          </div>
          <div>
            <dt>{t('remaining', 'Remaining')}</dt>
            <dd>{remaining(activity)} {t('exercises', 'exercises')}</dd>
          </div>
          <div>
            <dt>{t('lastPractised', 'Last practised')}</dt>
            <dd>{formatLastPractice(activity.lastPracticeDate, lang)}</dd>
          </div>
          <div>
            <dt>{t('currentStreak', 'Current streak')}</dt>
            <dd>
              {lang === 'ta' ? `${activity.streak} நாட்கள்` : `${activity.streak} ${activity.streak === 1 ? 'day' : 'days'}`}
            </dd>
          </div>
        </dl>

        <div className="vt-sheet__actions">
          <button
            type="button"
            className="vt-btn vt-btn--primary"
            disabled={locked}
            onClick={() => onContinue(activity)}
          >
            {locked
              ? t('finishPreviousStage', 'Finish the previous stage to unlock')
              : activity.completedExercises === 0
                ? t('startPractice', 'Start practice')
                : t('continuePractice', 'Continue practice')}
          </button>
          <button
            type="button"
            className="vt-btn vt-btn--ghost"
            onClick={() => onViewProgress(activity)}
          >
            {t('viewProgress', 'View progress')}
          </button>
        </div>
      </div>
    </div>
  );
}
