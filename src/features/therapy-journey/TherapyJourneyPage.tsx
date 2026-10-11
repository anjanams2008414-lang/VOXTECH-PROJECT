import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/LanguageContext';
import { useTherapyJourney } from './useTherapyJourney';
import { ProgressSummary } from './ProgressSummary';
import { TherapyJourney } from './TherapyJourney';
import { TherapyDetailCard } from './TherapyDetailCard';
import { IconLibraryModal } from './IconLibraryModal';
import {
  TherapyEmptyState,
  TherapyErrorState,
  TherapySkeleton,
} from './JourneyStates';
import type { TherapyActivity } from './types';
import './therapy-journey.css';

export default function TherapyJourneyPage() {
  const navigate = useNavigate();
  const { lang, t } = useTranslation();
  const { status, isEmpty, summary, activities, recommended, retry } = useTherapyJourney();
  const [selected, setSelected] = useState<TherapyActivity | null>(null);
  const [iconLibraryOpen, setIconLibraryOpen] = useState(false);

  const continuePractice = useCallback(
    (a: TherapyActivity) => {
      setSelected(null);
      navigate(a.route);
    },
    [navigate],
  );

  const navItems = [
    [t('dashboard', 'Home'), '/'],
    [t('therapy', 'Therapy'), '/therapy'],
    [t('journey', 'Progress'), '/journey'],
    [t('goals', 'Goals'), '/goals'],
    [t('profile', 'Profile'), '/profile'],
  ];

  return (
    <div className="vt-page">
      <header className="vt-header">
        <button type="button" className="vt-icon-btn" aria-label="Go back" onClick={() => navigate(-1)}>
          ‹
        </button>
        <div className="vt-header__text">
          <h1>{t('myTherapyJourney', 'My therapy journey')} <span className="vt-header__tag">{t('speechPathV2', 'Speech Path V2')}</span></h1>
          <p>{t('buildSkillsSub', 'Build your communication skills, one step at a time.')}</p>
        </div>
        <div className="vt-header__actions">
          <button type="button" className="vt-icon-library-btn" onClick={() => setIconLibraryOpen(true)}>
            <span aria-hidden="true">◇</span><span>{t('iconSystem', 'Icon system')}</span>
          </button>
          <button type="button" className="vt-avatar" aria-label="Open your profile" onClick={() => navigate('/profile')} />
        </div>
      </header>

      <main className="vt-main">
        {status === 'loading' && <TherapySkeleton />}

        {status === 'error' && <TherapyErrorState onRetry={retry} />}

        {status === 'ready' && isEmpty && (
          <TherapyEmptyState
            onStart={() => navigate(activities[0]?.route ?? '/therapy')}
          />
        )}

        {status === 'ready' && !isEmpty && summary && (
          <div className="vt-layout">
            <div className="vt-layout__journey">
              <div className="vt-journey-intro">
                <span><i /> {t('interactivePathway', 'Interactive pathway')}</span>
                <small>{t('clickMilestone', 'Click any milestone to preview it')}</small>
              </div>
              <TherapyJourney
                activities={activities}
                recommended={recommended}
                onOpen={setSelected}
                onStart={continuePractice}
              />
            </div>
            <aside className="vt-layout__side">
              <ProgressSummary summary={summary} />
              {recommended && (
                <section className="vt-goal" aria-label="Today's goal">
                  <h2>{t('todaysGoal', "Today's goal")}</h2>
                  <p>
                    {lang === 'ta'
                      ? `${t(recommended.name, recommended.name)} இல் 3 பயிற்சிகள் செய்வது உங்கள் ${summary.dailyStreak}-நாள் தொடர்ச்சியைத் தக்கவைத்துக்கொள்கிறது.`
                      : `Three exercises in ${recommended.name} keeps your ${summary.dailyStreak}-day streak going.`}
                  </p>
                  <button
                    type="button"
                    className="vt-btn vt-btn--primary"
                    onClick={() => continuePractice(recommended)}
                  >
                    {t('continuePractice', 'Continue practice')}
                  </button>
                </section>
              )}
            </aside>
          </div>
        )}
      </main>

      {selected && (
        <TherapyDetailCard
          activity={selected}
          onClose={() => setSelected(null)}
          onContinue={continuePractice}
          onViewProgress={(a) => {
            setSelected(null);
            navigate(`/journey?activity=${encodeURIComponent(String(a.id))}`);
          }}
        />
      )}

      {iconLibraryOpen && <IconLibraryModal activities={activities} onClose={() => setIconLibraryOpen(false)} />}

      <nav className="vt-nav" aria-label="Main">
        {navItems.map(([label, to]) => (
          <button
            key={to}
            type="button"
            className="vt-nav__item"
            aria-current={label === t('journey', 'Progress') ? 'page' : undefined}
            onClick={() => navigate(to)}
          >
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
