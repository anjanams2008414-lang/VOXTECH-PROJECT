import { useState } from 'react'
import VoiceGameEngine from '../VoiceGameEngine'
import { ADULT_GAMES } from '../gamesData'
import { useTranslation } from '../../../i18n/LanguageContext'

export default function ClearSpeechGame({ onComplete = () => {}, onClose = () => {} }) {
  const { lang, t } = useTranslation()
  const gameData = ADULT_GAMES.find((g) => g.id === 'clear-speech')
  const activities = gameData?.activities || []
  const [activityIndex, setActivityIndex] = useState(0)

  const currentActivity = activities[activityIndex] || activities[0]
  const spokenPrompt = lang === 'ta' ? currentActivity.instructions.ta : currentActivity.instructions.en
  const targetPhrase = lang === 'ta' ? currentActivity.targetPhrase.ta : currentActivity.targetPhrase.en
  const titleText = lang === 'ta' ? currentActivity.title.ta : currentActivity.title.en
  const exemplarText = lang === 'ta' ? currentActivity.exemplarText.ta : currentActivity.exemplarText.en
  const targetWords = lang === 'ta' ? currentActivity.targetWords.ta : currentActivity.targetWords.en

  const handleNext = () => {
    if (activityIndex < activities.length - 1) {
      setActivityIndex((prev) => prev + 1)
    } else {
      onComplete({
        gameId: 'clear-speech',
        gameName: 'Clear Speech Practice',
        score: 100,
        mode: 'adult',
        xp: 70,
      })
    }
  }

  return (
    <VoiceGameEngine
      mode="adult"
      gameId="clear-speech"
      gameTitle={t('clearSpeechTitle', 'Clear Speech Practice')}
      activityIndex={activityIndex}
      totalActivities={activities.length}
      spokenPrompt={spokenPrompt}
      targetSentence={targetPhrase}
      targetWords={targetWords}
      exemplarText={exemplarText}
      onNextActivity={handleNext}
      onClose={onClose}
    >
      <div className="space-y-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
        {/* Module Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
              {t('clinicalDrill', 'Clinical Drill')} • {currentActivity.targetPhonemes}
            </span>
            <h4 className="text-lg font-bold text-white mt-0.5">{titleText}</h4>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-sky-950/80 border border-sky-600/40 text-sky-300">
            {t('steadyPacing', 'Target: 115-125 WPM')}
          </span>
        </div>

        {/* Target Phrase Box */}
        <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-700/80">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            {t('targetSpeechStatement', 'Target Articulation Statement (Read with Controlled Breath):')}
          </p>
          <p className="text-base sm:text-lg font-semibold text-sky-100 leading-relaxed">
            "{targetPhrase}"
          </p>
        </div>

        {/* Clinical Rationale & Keywords */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="font-bold text-slate-500">{t('focalWords', 'Focus Words')}:</span>
            {targetWords.map((word, i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {word}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 italic">
            💡 {lang === 'ta' ? (currentActivity.clinicalNotesTa || currentActivity.clinicalNotes) : currentActivity.clinicalNotes}
          </p>
        </div>
      </div>
    </VoiceGameEngine>
  )
}
