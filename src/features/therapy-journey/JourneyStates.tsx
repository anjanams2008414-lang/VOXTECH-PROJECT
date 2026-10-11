import { useTranslation } from '../../i18n/LanguageContext';

export function TherapySkeleton() {
  return (
    <div className="vt-skeleton" aria-busy="true" aria-live="polite">
      <span className="vt-sr">Loading your therapy progress</span>
      <div className="vt-summary">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="vt-summary__card vt-shimmer" style={{ height: 78 }} />
        ))}
      </div>
      <ul className="vt-journey">
        {[0, 1, 2, 3].map((i) => (
          <li key={i} className="vt-node">
            <div className="vt-shimmer vt-skeleton__ring" />
            <div className="vt-shimmer vt-skeleton__label" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TherapyErrorState({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="vt-state" role="alert">
      <h2>{t('unableToLoadJourney', 'Unable to load your therapy progress.')}</h2>
      <p>{t('unableToLoadJourneyDesc', 'Your saved exercises are safe. Check your connection and load the page again.')}</p>
      <button type="button" className="vt-btn vt-btn--primary" onClick={onRetry}>
        {t('tryAgain', 'Try again')}
      </button>
    </div>
  );
}

export function TherapyEmptyState({ onStart }: { onStart: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="vt-state">
      <h2>{t('therapyJourneyStartsHere', 'Your therapy journey starts here.')}</h2>
      <p>{t('therapyJourneyStartsHereDesc', 'Complete your first activity to begin tracking your progress.')}</p>
      <button type="button" className="vt-btn vt-btn--primary" onClick={onStart}>
        {t('startFirstLesson', 'Start first lesson')}
      </button>
    </div>
  );
}
