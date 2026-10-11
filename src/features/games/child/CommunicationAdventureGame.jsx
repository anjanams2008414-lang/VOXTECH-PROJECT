import { useState } from 'react'
import VoiceGameEngine from '../VoiceGameEngine'
import { CHILD_GAMES } from '../gamesData'
import { useTranslation } from '../../../i18n/LanguageContext'

export default function CommunicationAdventureGame({ onComplete = () => {}, onClose = () => {} }) {
  const { lang, t } = useTranslation()
  const gameData = CHILD_GAMES.find((g) => g.id === 'communication-adventure')
  const activities = gameData?.activities || []
  const [activityIndex, setActivityIndex] = useState(0)
  const [chatTurn, setChatTurn] = useState(0) // 0: AI initial prompt, 1: AI follow-up

  const currentActivity = activities[activityIndex] || activities[0]
  const scenarioText = lang === 'ta' ? currentActivity.scenarioTa : currentActivity.scenarioEn
  const initialPrompt = lang === 'ta' ? currentActivity.aiPromptTa : currentActivity.aiPromptEn
  const followUpPrompt = lang === 'ta' ? currentActivity.aiFollowUpTa : currentActivity.aiFollowUpEn
  const activeSpokenPrompt = chatTurn === 0 ? initialPrompt : followUpPrompt

  const targetWords = lang === 'ta' ? currentActivity.targetWordsTa : currentActivity.targetWordsEn
  const exemplarText = lang === 'ta' ? currentActivity.modelResponseTa : currentActivity.modelResponseEn

  const handleEvaluationComplete = (result) => {
    if (result.success && chatTurn === 0) {
      setTimeout(() => {
        setChatTurn(1)
      }, 2500)
    }
  }

  const handleNext = () => {
    if (activityIndex < activities.length - 1) {
      setActivityIndex((prev) => prev + 1)
      setChatTurn(0)
    } else {
      onComplete({
        gameId: 'communication-adventure',
        gameName: 'Communication Adventure',
        score: 100,
        stars: 3,
        xp: 85,
      })
    }
  }

  return (
    <VoiceGameEngine
      mode="child"
      gameId="communication-adventure"
      gameTitle={t('communicationAdventureTitle', 'Communication Adventure')}
      activityIndex={activityIndex}
      totalActivities={activities.length}
      spokenPrompt={activeSpokenPrompt}
      targetWords={targetWords}
      exemplarText={exemplarText}
      onEvaluationComplete={handleEvaluationComplete}
      onNextActivity={handleNext}
      onClose={onClose}
      aacSupported={true}
      aacSymbols={gameData.aacSymbols}
    >
      <div className="space-y-4 p-5 rounded-3xl bg-gradient-to-br from-amber-50/60 via-rose-50/40 to-purple-50/50 border border-rose-200 shadow-inner">
        {/* Scenario Card */}
        <div className="p-4 rounded-2xl bg-white border border-rose-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xl">🎭</span>
            <h4 className="text-xs font-black uppercase tracking-wider text-rose-800">
              {t('realLifeScenario', 'Real-Life Social Scenario')}
            </h4>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-800">{scenarioText}</p>
        </div>

        {/* Dynamic Multi-turn Dialogue History */}
        <div className="space-y-2.5">
          {/* AI Turn 1 */}
          <div className="flex items-start gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-purple-600 text-white flex items-center justify-center text-sm shrink-0">
              🤖
            </div>
            <div className="bg-white border border-purple-200 p-3 rounded-2xl rounded-tl-none text-xs font-bold text-slate-800 shadow-sm max-w-md">
              {initialPrompt}
            </div>
          </div>

          {/* AI Turn 2 (If reached) */}
          {chatTurn >= 1 && (
            <div className="flex items-start gap-2.5 animate-fadeIn">
              <div className="h-8 w-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-sm shrink-0">
                🤖
              </div>
              <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-2xl rounded-tl-none text-xs font-bold text-emerald-950 shadow-sm max-w-md">
                {followUpPrompt}
              </div>
            </div>
          )}
        </div>
      </div>
    </VoiceGameEngine>
  )
}
