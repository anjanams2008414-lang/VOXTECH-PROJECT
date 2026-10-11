import { useState } from 'react'
import VoiceGameEngine from '../VoiceGameEngine'
import { ADULT_GAMES } from '../gamesData'
import { useTranslation } from '../../../i18n/LanguageContext'

export default function ProfessionalLanguageGame({ onComplete = () => {}, onClose = () => {} }) {
  const { lang, t } = useTranslation()
  const gameData = ADULT_GAMES.find((g) => g.id === 'professional-language')
  const activities = gameData?.activities || []
  const [activityIndex, setActivityIndex] = useState(0)
  const [stage, setStage] = useState(0) // 0: AI Prompt, 1: AI Follow-up

  const currentActivity = activities[activityIndex] || activities[0]
  const titleText = lang === 'ta' ? currentActivity.title.ta : currentActivity.title.en
  const scenarioText = lang === 'ta' ? currentActivity.scenarioTa : currentActivity.scenarioEn
  const aiPrompt = lang === 'ta' ? currentActivity.aiPromptTa : currentActivity.aiPromptEn
  const followUpPrompt = lang === 'ta' ? currentActivity.followUpTa : currentActivity.followUpEn
  const activeSpokenPrompt = stage === 0 ? aiPrompt : followUpPrompt

  const exemplarText = lang === 'ta' ? currentActivity.exemplarTa : currentActivity.exemplarEn
  const targetWords = lang === 'ta' ? currentActivity.targetWordsTa : currentActivity.targetWordsEn

  const handleEvaluationComplete = (result) => {
    if (result.success && stage === 0) {
      setTimeout(() => {
        setStage(1)
      }, 2500)
    }
  }

  const handleNext = () => {
    if (activityIndex < activities.length - 1) {
      setActivityIndex((prev) => prev + 1)
      setStage(0)
    } else {
      onComplete({
        gameId: 'professional-language',
        gameName: 'Professional Language Builder',
        score: 100,
        mode: 'adult',
        xp: 75,
      })
    }
  }

  return (
    <VoiceGameEngine
      mode="adult"
      gameId="professional-language"
      gameTitle={t('professionalLanguageTitle', 'Professional Language Builder')}
      activityIndex={activityIndex}
      totalActivities={activities.length}
      spokenPrompt={activeSpokenPrompt}
      targetWords={targetWords}
      exemplarText={exemplarText}
      onEvaluationComplete={handleEvaluationComplete}
      onNextActivity={handleNext}
      onClose={onClose}
    >
      <div className="space-y-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
        {/* Scenario Background */}
        <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-base">💼</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              {titleText}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            {scenarioText}
          </p>
        </div>

        {/* Dynamic Multi-turn Professional Dialogue */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-emerald-700/60 border border-emerald-500/30 text-white flex items-center justify-center text-xs shrink-0">
              👔
            </div>
            <div className="bg-slate-800/80 border border-slate-700 p-3.5 rounded-xl rounded-tl-none text-xs font-semibold text-slate-200 shadow-sm max-w-xl">
              <span className="text-[10px] text-emerald-400 uppercase font-bold block mb-1">
                {t('directorPrompt', 'Stakeholder / Meeting Partner:')}
              </span>
              "{aiPrompt}"
            </div>
          </div>

          {stage >= 1 && (
            <div className="flex items-start gap-3 animate-fadeIn">
              <div className="h-8 w-8 rounded-lg bg-sky-700/60 border border-sky-500/30 text-white flex items-center justify-center text-xs shrink-0">
                👔
              </div>
              <div className="bg-sky-950/50 border border-sky-600/40 p-3.5 rounded-xl rounded-tl-none text-xs font-semibold text-sky-200 shadow-sm max-w-xl">
                <span className="text-[10px] text-sky-400 uppercase font-bold block mb-1">
                  {t('followUpNote', 'Follow-up Response:')}
                </span>
                "{followUpPrompt}"
              </div>
            </div>
          )}
        </div>

        {/* Suggested Strategic Vocabulary */}
        <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-2 items-center text-xs">
          <span className="text-[11px] font-bold text-slate-500">{t('recommendedTerms', 'Key Terms')}:</span>
          {targetWords.map((term, i) => (
            <span key={i} className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-medium">
              {term}
            </span>
          ))}
        </div>
      </div>
    </VoiceGameEngine>
  )
}
