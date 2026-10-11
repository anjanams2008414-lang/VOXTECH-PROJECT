import { useState } from 'react'
import VoiceGameEngine from '../VoiceGameEngine'
import { CHILD_GAMES } from '../gamesData'
import { useTranslation } from '../../../i18n/LanguageContext'

export default function SoundSafariGame({ onComplete = () => {}, onClose = () => {} }) {
  const { lang, t } = useTranslation()
  const gameData = CHILD_GAMES.find((g) => g.id === 'sound-safari')
  const activities = gameData?.activities || []
  const [activityIndex, setActivityIndex] = useState(0)
  const [progressionLevel, setProgressionLevel] = useState(0) // 0: Sound, 1: Word, 2: Phrase, 3: Sentence

  const currentActivity = activities[activityIndex] || activities[0]
  const currentStep = currentActivity.progression[progressionLevel] || currentActivity.progression[0]

  const promptText = lang === 'ta' ? currentStep.promptTa : currentStep.promptEn
  const titleText = lang === 'ta' ? currentActivity.title.ta : currentActivity.title.en
  const exemplarText = lang === 'ta' ? currentActivity.exemplar.ta : currentActivity.exemplar.en
  const activeTarget = lang === 'ta' ? (currentStep.targetTa || currentStep.target) : currentStep.target
  const targetWords = lang === 'ta' ? [currentStep.targetTa, currentStep.target, ...(currentActivity.targetWords?.ta || [])].filter(Boolean) : [currentStep.target, ...(currentActivity.targetWords?.en || [])]

  const handleNextStep = () => {
    if (progressionLevel < currentActivity.progression.length - 1) {
      setProgressionLevel((prev) => prev + 1)
    } else if (activityIndex < activities.length - 1) {
      setActivityIndex((prev) => prev + 1)
      setProgressionLevel(0)
    } else {
      onComplete({
        gameId: 'sound-safari',
        gameName: 'Sound Safari',
        score: 100,
        stars: 3,
        xp: 70,
      })
    }
  }

  return (
    <VoiceGameEngine
      mode="child"
      gameId="sound-safari"
      gameTitle={t('soundSafariTitle', 'Sound Safari')}
      activityIndex={activityIndex}
      totalActivities={activities.length}
      spokenPrompt={promptText}
      targetWords={targetWords}
      targetSound={lang === 'ta' ? (currentActivity.soundTa || currentActivity.sound) : currentActivity.sound}
      exemplarText={exemplarText}
      onNextActivity={handleNextStep}
      onClose={onClose}
    >
      <div className="space-y-4 p-5 rounded-3xl bg-gradient-to-br from-emerald-50/70 via-teal-50/50 to-emerald-100/40 border border-emerald-200/70 shadow-inner">
        {/* Safari Target Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-emerald-200/60 pb-3">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-2xl text-white shadow-md">
              🦁
            </span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                {t('targetSoundBadge', 'Target Sound')}: /{lang === 'ta' ? (currentActivity.soundTa || currentActivity.sound) : currentActivity.sound}/ • {t(currentActivity.position, currentActivity.position)}
              </span>
              <h4 className="text-base sm:text-lg font-black text-slate-900">{titleText}</h4>
            </div>
          </div>

          {/* Sound Safari Progression Ladder (Sound -> Word -> Phrase -> Sentence) */}
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-2xl border border-emerald-200 shadow-sm">
            {currentActivity.progression.map((prog, idx) => (
              <div key={idx} className="flex items-center gap-1">
                <span
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition ${
                    idx === progressionLevel
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : idx < progressionLevel
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'text-slate-400 bg-slate-100'
                  }`}
                >
                  {lang === 'ta' ? (prog.levelTa || prog.level) : prog.level}
                </span>
                {idx < currentActivity.progression.length - 1 && <span className="text-slate-300 text-[10px]">➔</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Active Stage Callout */}
        <div className="text-center py-6 px-4 rounded-2xl bg-white/90 border border-emerald-200/80 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
            {t('speakTargetNow', 'Say the magic safari target:')}
          </p>
          <div className="mt-2 text-3xl sm:text-4xl font-black text-emerald-900 tracking-wide animate-pulse">
            "{activeTarget}"
          </div>
          <p className="mt-2 text-xs text-slate-500 max-w-sm mx-auto">
            {lang === 'ta'
              ? 'உங்கள் குரலை தெளிவாக மைக்ரோஃபோனில் சொல்லி சஃபாரி நட்சத்திரங்களை வெல்லுங்கள்!'
              : 'Speak the target aloud to unlock your safari stars!'}
          </p>
        </div>
      </div>
    </VoiceGameEngine>
  )
}
