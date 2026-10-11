import { useState } from 'react'
import VoiceGameEngine from '../VoiceGameEngine'
import { ADULT_GAMES } from '../gamesData'
import { useTranslation } from '../../../i18n/LanguageContext'

export default function VoiceFluencyStudioGame({ onComplete = () => {}, onClose = () => {} }) {
  const { lang, t } = useTranslation()
  const gameData = ADULT_GAMES.find((g) => g.id === 'voice-fluency')
  const exercises = gameData?.exercises || []
  const [exerciseIndex, setExerciseIndex] = useState(0)
  const [drillIndex, setDrillIndex] = useState(0)

  const currentExercise = exercises[exerciseIndex] || exercises[0]
  const drills = currentExercise.drillSequence || []
  const currentDrill = drills[drillIndex] || drills[0]

  const titleText = lang === 'ta' ? currentExercise.title.ta : currentExercise.title.en
  const techniqueText = lang === 'ta' ? currentExercise.techniqueTa : currentExercise.techniqueEn
  const drillCue = lang === 'ta' ? currentDrill.cueTa : currentDrill.cueEn

  const handleNext = () => {
    if (drillIndex < drills.length - 1) {
      setDrillIndex((prev) => prev + 1)
    } else if (exerciseIndex < exercises.length - 1) {
      setExerciseIndex((prev) => prev + 1)
      setDrillIndex(0)
    } else {
      onComplete({
        gameId: 'voice-fluency',
        gameName: 'Voice & Fluency Studio',
        score: 100,
        mode: 'adult',
        xp: 90,
      })
    }
  }

  return (
    <VoiceGameEngine
      mode="adult"
      gameId="voice-fluency"
      gameTitle={t('voiceFluencyStudioTitle', 'Voice & Fluency Studio')}
      activityIndex={drillIndex}
      totalActivities={drills.length}
      spokenPrompt={drillCue}
      targetSentence={drillCue}
      targetWords={[drillCue]}
      exemplarText={drillCue}
      onNextActivity={handleNext}
      onClose={onClose}
    >
      <div className="space-y-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
        {/* Studio Exercise Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-950/80 border border-teal-500/30 text-xl text-teal-300">
              🌊
            </span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                {t('fluencyTechnique', 'Fluency & Pacing Studio')} • {t('drillLabel', 'Drill')} {drillIndex + 1}/{drills.length}
              </span>
              <h4 className="text-base sm:text-lg font-bold text-white mt-0.5">{titleText}</h4>
            </div>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-teal-950/80 text-teal-300 border border-teal-500/40 font-semibold">
            {t('comfortZoneSafe', 'Comfort Zone: Safe & Natural')}
          </span>
        </div>

        {/* Clinical Technique Guidance */}
        <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            {t('clinicalGuidance', 'Clinical Technique Description:')}
          </p>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            {techniqueText}
          </p>
        </div>

        {/* Live Vocal Cue Exercise */}
        <div className="p-5 rounded-xl bg-gradient-to-r from-teal-950/40 to-slate-950 border border-teal-600/40 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-teal-400 mb-2">
            {t('vocalPracticeDrill', 'Vocal Practice Statement:')}
          </p>
          <p className="text-base sm:text-xl font-bold text-white leading-relaxed tracking-wide">
            "{drillCue}"
          </p>
          <p className="text-xs text-teal-200/80 mt-2">
            {lang === 'ta'
              ? 'குரல் நாண்களை நெகிழ்வாக வைத்து, மைக்ரோஃபோனில் சீரான ஓட்டத்துடன் பேசுங்கள்.'
              : 'Keep vocal folds relaxed and maintain smooth, unforced airflow into the microphone.'}
          </p>
        </div>

        {/* Vocal Strain Prevention Alert */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-950/30 border border-amber-600/30 text-amber-200 text-xs">
          <span>⚠️</span>
          <span>
            {t('vocalStrainWarning', 'Caution: Avoid vocal strain. Automated indicators are for practice guidance, not clinical diagnosis.')}
          </span>
        </div>
      </div>
    </VoiceGameEngine>
  )
}
