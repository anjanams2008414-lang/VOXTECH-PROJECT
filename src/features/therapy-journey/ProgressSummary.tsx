import { useTranslation } from '../../i18n/LanguageContext';
import type { TherapySummary } from './types';

export function ProgressSummary({ summary }: { summary: TherapySummary }) {
  const { lang, t } = useTranslation();

  const cards = [
    { key: 'overall', label: t('overallProgress', 'Overall progress'), value: `${summary.overallProgress}%` },
    { key: 'level', label: t('currentLevel', 'Current level'), value: lang === 'ta' ? `நிலை ${summary.currentLevel}` : `Level ${summary.currentLevel}` },
    {
      key: 'streak',
      label: t('dailyStreak', 'Daily streak'),
      value: lang === 'ta' ? `${summary.dailyStreak} நாட்கள்` : `${summary.dailyStreak} ${summary.dailyStreak === 1 ? 'day' : 'days'}`,
    },
    {
      key: 'exercises',
      label: t('exercises', 'Exercises'),
      value: `${summary.completedExercises} / ${summary.totalExercises}`,
    },
  ];

  return (
    <section className="vt-summary" aria-label="Progress summary">
      {cards.map((c) => (
        <article key={c.key} className={`vt-summary__card vt-summary__card--${c.key}`}>
          <p className="vt-summary__label">{c.label}</p>
          <p className="vt-summary__value">{c.value}</p>
          {c.key === 'overall' && (
            <div
              className="vt-summary__bar"
              role="progressbar"
              aria-valuenow={summary.overallProgress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Overall therapy progress"
            >
              <span style={{ width: `${summary.overallProgress}%` }} />
            </div>
          )}
        </article>
      ))}
    </section>
  );
}
