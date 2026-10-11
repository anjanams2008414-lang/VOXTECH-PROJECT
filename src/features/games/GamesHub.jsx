import { useState, useEffect } from 'react'
import { useTranslation } from '../../i18n/LanguageContext'
import { CHILD_GAMES, ADULT_GAMES } from './gamesData'
import PictureTalkGame from './child/PictureTalkGame'
import SoundSafariGame from './child/SoundSafariGame'
import BuildSentenceGame from './child/BuildSentenceGame'
import SequenceQuestGame from './child/SequenceQuestGame'
import CommunicationAdventureGame from './child/CommunicationAdventureGame'
import ClearSpeechGame from './adult/ClearSpeechGame'
import ProfessionalLanguageGame from './adult/ProfessionalLanguageGame'
import ConversationScenariosGame from './adult/ConversationScenariosGame'
import CognitiveChallengeGame from './adult/CognitiveChallengeGame'
import VoiceFluencyStudioGame from './adult/VoiceFluencyStudioGame'
import TherapistGameConfigModal from './TherapistGameConfigModal'

export default function GamesHub({ role }) {
  const { lang, t } = useTranslation()

  const [mode, setMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem('voxtech_game_mode') || 'child'
    }
    return 'child'
  })

  const [activeGame, setActiveGame] = useState(null)
  const [scoresList, setScoresList] = useState([])
  const [userProgress, setUserProgress] = useState({
    xp: 320,
    level: 2,
    stars: 24,
    streakDays: 5,
    totalMinutes: 75,
    badges: ['First Word Explorer', 'Sound Master', 'Daily Streak Star'],
  })
  const [showConfigModal, setShowConfigModal] = useState(false)

  const handleModeChange = (newMode) => {
    setMode(newMode)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('voxtech_game_mode', newMode)
    }
  }

  // Fetch Scores and Progress
  useEffect(() => {
    async function fetchData() {
      try {
        const token = window.localStorage.getItem('voxtech-token')
        const headers = token ? { Authorization: `Bearer ${token}` } : {}

        const [scoresRes, progRes] = await Promise.all([
          fetch('/api/games/scores', { headers }),
          fetch('/api/games/progress/me', { headers }),
        ])

        if (scoresRes.ok) {
          const data = await scoresRes.json()
          if (data.scores) setScoresList(data.scores)
        }
        if (progRes.ok) {
          const data = await progRes.json()
          if (data.progress) setUserProgress(data.progress)
        }
      } catch (err) {
        console.warn('Game data fetch error:', err)
      }
    }
    fetchData()
  }, [])

  const handleGameComplete = async (result) => {
    try {
      const token = window.localStorage.getItem('voxtech-token')
      const res = await fetch('/api/games/scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          gameName: result.gameName,
          gameId: result.gameId,
          score: result.score || 100,
          mode,
          stars: result.stars || 3,
          xp: result.xp || 60,
          durationSeconds: 90,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.entry) {
          setScoresList((prev) => [data.entry, ...prev])
        }
        if (data.progress) {
          setUserProgress(data.progress)
        }
      }
    } catch (err) {
      console.error('Score submit error:', err)
    }
    setActiveGame(null)
  }

  const isChild = mode === 'child'
  const activeGamesList = isChild ? CHILD_GAMES : ADULT_GAMES

  // Render the selected interactive voice game
  const renderActiveGameModal = () => {
    if (!activeGame) return null

    let GameComponent = null
    switch (activeGame.id) {
      case 'picture-talk':
        GameComponent = PictureTalkGame
        break
      case 'sound-safari':
        GameComponent = SoundSafariGame
        break
      case 'build-sentence':
        GameComponent = BuildSentenceGame
        break
      case 'sequence-quest':
        GameComponent = SequenceQuestGame
        break
      case 'communication-adventure':
        GameComponent = CommunicationAdventureGame
        break
      case 'clear-speech':
        GameComponent = ClearSpeechGame
        break
      case 'professional-language':
        GameComponent = ProfessionalLanguageGame
        break
      case 'conversation-scenarios':
        GameComponent = ConversationScenariosGame
        break
      case 'cognitive-challenge':
        GameComponent = CognitiveChallengeGame
        break
      case 'voice-fluency':
        GameComponent = VoiceFluencyStudioGame
        break
      default:
        GameComponent = isChild ? PictureTalkGame : ClearSpeechGame
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 sm:p-6 backdrop-blur-md overflow-y-auto animate-fadeIn">
        <div className={`w-full max-w-3xl rounded-3xl p-5 sm:p-7 shadow-2xl border ${
          isChild ? 'bg-white border-amber-300' : 'bg-slate-900 border-slate-700'
        }`}>
          <GameComponent
            onComplete={handleGameComplete}
            onClose={() => setActiveGame(null)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Top Mode Selector Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex w-full sm:w-auto p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => handleModeChange('child')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-xs font-black transition ${
              isChild
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🧸</span>
            <span>{t('childModeTab', 'Child Mode (Junior Quest)')}</span>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange('adult')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-xs font-black transition ${
              !isChild
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>💼</span>
            <span>{t('adultModeTab', 'Adult Mode (Clinical & Voice Studio)')}</span>
          </button>
        </div>

        {/* Therapist Settings Button */}
        <button
          type="button"
          onClick={() => setShowConfigModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition border border-slate-200"
        >
          <span>⚙️</span>
          <span>{t('therapistConfigBtn', 'Therapist Settings & Targets')}</span>
        </button>
      </div>

      {/* Hero Header Banner */}
      {isChild ? (
        /* Child Mode Banner: Playful, Vibrant, Gamified */
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 p-6 sm:p-8 text-white shadow-xl">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-[11px] font-black uppercase tracking-widest backdrop-blur-sm">
                🌟 {t('childModeKicker', 'EXPLORER ADVENTURE')}
              </span>
              <h2 className="mt-2 text-2xl sm:text-4xl font-black tracking-tight">
                {t('childModeHeading', 'Playful Speech & Language Quests')}
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-amber-100 max-w-xl font-medium">
                {t('childModeSubtitle', 'Vibrant, encouraging voice games with stars, badges, and cheerful practice.')}
              </p>
            </div>

            {/* Child Gamification Badges & Stats */}
            <div className="flex flex-wrap gap-3 text-slate-900">
              <div className="flex items-center gap-2.5 rounded-2xl bg-white/95 px-4 py-2.5 shadow-md backdrop-blur-sm">
                <span className="text-2xl">⭐</span>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500">{t('starsCollected', 'Stars')}</p>
                  <p className="text-base font-black text-amber-600">{userProgress.stars || 24}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-2xl bg-white/95 px-4 py-2.5 shadow-md backdrop-blur-sm">
                <span className="text-2xl">🔥</span>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500">{t('currentStreakDays', 'Streak')}</p>
                  <p className="text-base font-black text-orange-600">{userProgress.streakDays || 5} {t('daysLabel', 'days')}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-2xl bg-white/95 px-4 py-2.5 shadow-md backdrop-blur-sm">
                <span className="text-2xl">⚡</span>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500">{t('levelLabel', 'Level')} {userProgress.level || 2}</p>
                  <p className="text-base font-black text-emerald-600">{userProgress.xp || 320} XP</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Adult Mode Banner: Sleek, Mature, Clinical */
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 p-6 sm:p-8 text-white shadow-xl border border-slate-800">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <span className="inline-block rounded-full bg-sky-500/20 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-sky-300 border border-sky-500/30">
                🎙️ {t('adultModeKicker', 'CLINICAL & PROFESSIONAL')}
              </span>
              <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight">
                {t('adultModeHeading', 'Executive Voice & Speech Studio')}
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-400 max-w-xl font-medium">
                {t('adultModeSubtitle', 'Structured articulation, cognitive-communication, and fluency training with real-time waveform analytics.')}
              </p>
            </div>

            {/* Adult Clinical Metrics & Tracking */}
            <div className="flex flex-wrap gap-3">
              <div className="rounded-2xl bg-slate-800/80 border border-slate-700/80 px-4 py-2.5 text-slate-100">
                <p className="text-[10px] uppercase font-bold text-slate-400">{t('targetPace', 'Target Pace')}</p>
                <p className="text-sm font-black text-sky-400">110 - 125 WPM</p>
              </div>

              <div className="rounded-2xl bg-slate-800/80 border border-slate-700/80 px-4 py-2.5 text-slate-100">
                <p className="text-[10px] uppercase font-bold text-slate-400">{t('practiceMins', 'Practice Mins')}</p>
                <p className="text-sm font-black text-emerald-400">{userProgress.totalMinutes || 75} {t('minsLabel', 'mins')}</p>
              </div>

              <div className="rounded-2xl bg-slate-800/80 border border-slate-700/80 px-4 py-2.5 text-slate-100">
                <p className="text-[10px] uppercase font-bold text-slate-400">{t('consistency', 'Consistency')}</p>
                <p className="text-sm font-black text-teal-400">{userProgress.streakDays || 5} {t('dayStreak', 'Day Streak')}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Voice-First Notice Banner */}
      <div className={`flex items-center justify-between p-3.5 rounded-2xl text-xs font-semibold border ${
        isChild
          ? 'bg-amber-50 border-amber-200 text-amber-900'
          : 'bg-slate-900 border-slate-800 text-slate-300'
      }`}>
        <div className="flex items-center gap-2">
          <span>🎙️</span>
          <span>{t('voiceFirstActive', 'Voice-Driven Interaction Active: Tap any activity below to speak into your microphone.')}</span>
        </div>
        <span className="hidden md:inline text-[11px] opacity-70">
          🇬🇧 English • 🇮🇳 தமிழ்
        </span>
      </div>

      {/* Games Cards Grid (5 Games for Selected Mode) */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {activeGamesList.map((game, index) => {
          const title = t(game.nameKey, game.id)
          const desc = t(game.descKey, '')
          const targets = t(game.targetsKey, game.category)

          return (
            <div
              key={game.id}
              className={`flex flex-col justify-between rounded-3xl p-5 sm:p-6 transition hover:shadow-xl border ${
                isChild
                  ? 'bg-white border-slate-100 shadow-md hover:-translate-y-1'
                  : 'bg-slate-900/95 border-slate-800 shadow-lg hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-3xl shadow-sm">
                    {game.icon}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                    isChild
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-sky-950 text-sky-300 border border-sky-800'
                  }`}>
                    #{index + 1} {game.category}
                  </span>
                </div>

                <h3 className={`text-lg font-black ${isChild ? 'text-slate-900' : 'text-white'}`}>
                  {title}
                </h3>

                <p className="mt-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  {targets}
                </p>

                <p className={`mt-2 text-xs leading-relaxed ${isChild ? 'text-slate-600' : 'text-slate-400'}`}>
                  {desc}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                <div className="text-[11px] font-bold text-slate-400">
                  {isChild ? `+${game.xpReward || 60} XP • ⭐⭐⭐` : `${game.activities?.length || game.challenges?.length || 3} ${t('tasksLabel', 'Tasks')}`}
                </div>

                <button
                  type="button"
                  onClick={() => setActiveGame(game)}
                  className={`flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-black text-white shadow-md transition hover:scale-105 active:scale-95 ${
                    isChild
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-500/20'
                      : 'bg-gradient-to-r from-sky-500 to-blue-600 shadow-sky-500/20'
                  }`}
                >
                  <span>🎙️</span>
                  <span>{t('playGame', 'Play Game')}</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Therapy Badges Showcase */}
      <div className={`p-6 rounded-3xl border shadow-sm ${
        isChild ? 'bg-white border-slate-100' : 'bg-slate-900/90 border-slate-800 text-white'
      }`}>
        <h3 className="font-extrabold text-sm sm:text-base flex items-center gap-2">
          <span>🏆</span>
          <span>{t('badgesTitle', 'Therapy Badges Earned')}</span>
        </h3>
        <div className="mt-3 flex flex-wrap gap-2.5">
          {userProgress.badges?.map((badge, idx) => {
            const badgeMapTa = {
              'First Word Explorer': 'முதல் சொல் ஆய்வாளர்',
              'Sound Master': 'ஒலி மாஸ்டர்',
              'Daily Streak Star': 'தினசரி தொடர் நட்சத்திரம்',
              'Fluency Champion': 'ஓட்ட சாம்பியன்',
              'Clear Voice Hero': 'தெளிவான குரல் நாயகன்',
            }
            return (
              <span
                key={idx}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border shadow-sm ${
                  isChild
                    ? 'bg-amber-50 text-amber-900 border-amber-200'
                    : 'bg-slate-800 text-sky-200 border-slate-700'
                }`}
              >
                <span>🎖️</span>
                <span>{lang === 'ta' ? (badgeMapTa[badge] || badge) : badge}</span>
              </span>
            )
          })}
        </div>
      </div>

      {/* Leaderboard & Recent Voice Sessions */}
      <div className={`rounded-3xl p-6 border shadow-sm ${
        isChild ? 'bg-white border-slate-100' : 'bg-slate-900/90 border-slate-800 text-white'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-sm sm:text-base flex items-center gap-2">
            <span>📈</span>
            <span>{t('recentHighScores', 'Recent Voice Sessions & High Scores')}</span>
          </h3>
          <span className="text-xs text-slate-500">
            {scoresList.length} {t('sessionsRecorded', 'sessions logged')}
          </span>
        </div>

        <div className="space-y-2">
          {scoresList.slice(0, 6).map((s, idx) => (
            <div
              key={s.id || idx}
              className={`flex items-center justify-between rounded-2xl p-3.5 text-xs transition ${
                isChild ? 'bg-slate-50 hover:bg-slate-100/80' : 'bg-slate-800/60 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-black text-slate-400">#{idx + 1}</span>
                <span className="font-bold text-slate-900 dark:text-white">{s.user || 'Patient'}</span>
                <span className="text-slate-500">• {s.gameName}</span>
                {s.mode && (
                  <span className="hidden sm:inline text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {s.mode}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="font-black text-emerald-600 dark:text-emerald-400">
                  {s.score} {lang === 'ta' ? 'புள்ளிகள்' : 'pts'}
                </span>
                {s.stars && <span className="hidden sm:inline">{'⭐'.repeat(s.stars)}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Game Modal */}
      {renderActiveGameModal()}

      {/* Therapist Configuration Modal */}
      <TherapistGameConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        role={role}
      />
    </div>
  )
}
