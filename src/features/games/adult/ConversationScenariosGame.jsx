import { useState } from 'react'
import VoiceGameEngine from '../VoiceGameEngine'
import { ADULT_GAMES } from '../gamesData'
import { useTranslation } from '../../../i18n/LanguageContext'

export default function ConversationScenariosGame({ onComplete = () => {}, onClose = () => {} }) {
  const { lang, t } = useTranslation()
  const gameData = ADULT_GAMES.find((g) => g.id === 'conversation-scenarios')
  const scenarios = gameData?.scenarios || []
  const [scenarioIndex, setScenarioIndex] = useState(0)
  const [turnIndex, setTurnIndex] = useState(0)

  const currentScenario = scenarios[scenarioIndex] || scenarios[0]
  const turns = currentScenario.turns || []
  const titleText = lang === 'ta' ? currentScenario.title.ta : currentScenario.title.en
  const overviewText = lang === 'ta' ? currentScenario.overviewTa : currentScenario.overviewEn

  // Identify active user turn (turns usually alternate AI -> User -> AI -> User)
  // Find current turn
  const activeTurn = turns[turnIndex] || turns[0]
  const isAiTurn = activeTurn.speaker === 'ai'

  // If currently on AI turn, prompt is the AI utterance. If on user turn, prompt is the instruction for what to say
  const spokenPrompt = isAiTurn
    ? (lang === 'ta' ? activeTurn.textTa : activeTurn.textEn)
    : (lang === 'ta' ? activeTurn.promptTa : activeTurn.promptEn)

  const targetWords = lang === 'ta'
    ? [...(activeTurn.expectedKeywordsTa || []), ...(activeTurn.expectedKeywordsEn || [])]
    : (activeTurn.expectedKeywordsEn || [])
  const exemplarText = lang === 'ta' ? activeTurn.exemplarTa : activeTurn.exemplarEn

  const handleNextTurn = () => {
    if (turnIndex < turns.length - 1) {
      setTurnIndex((prev) => prev + 1)
    } else if (scenarioIndex < scenarios.length - 1) {
      setScenarioIndex((prev) => prev + 1)
      setTurnIndex(0)
    } else {
      onComplete({
        gameId: 'conversation-scenarios',
        gameName: 'Conversation Scenarios',
        score: 100,
        mode: 'adult',
        xp: 85,
      })
    }
  }

  return (
    <VoiceGameEngine
      mode="adult"
      gameId="conversation-scenarios"
      gameTitle={t('conversationScenariosTitle', 'Conversation Scenarios')}
      activityIndex={turnIndex}
      totalActivities={turns.length}
      spokenPrompt={spokenPrompt}
      targetWords={targetWords}
      exemplarText={exemplarText}
      onNextActivity={handleNextTurn}
      onClose={onClose}
    >
      <div className="space-y-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
        {/* Scenario Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
              {t('voiceRoleplay', 'Voice Roleplay')} • {t('turn', 'Turn')} {turnIndex + 1} / {turns.length}
            </span>
            <h4 className="text-base sm:text-lg font-bold text-white mt-0.5">{titleText}</h4>
          </div>
          <span className="text-xs text-slate-400">{overviewText}</span>
        </div>

        {/* Conversation Turns Timeline */}
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {turns.slice(0, turnIndex + 1).map((turn, idx) => {
            const isCurrent = idx === turnIndex
            if (turn.speaker === 'ai') {
              return (
                <div key={idx} className={`flex items-start gap-3 transition ${isCurrent ? 'opacity-100' : 'opacity-70'}`}>
                  <div className="h-8 w-8 rounded-lg bg-sky-600/30 border border-sky-400/40 text-sky-200 flex items-center justify-center text-xs shrink-0 font-bold">
                    AI
                  </div>
                  <div className="bg-slate-800/90 border border-slate-700/80 p-3 rounded-xl rounded-tl-none text-xs font-medium text-slate-200 shadow-sm max-w-lg">
                    {lang === 'ta' ? turn.textTa : turn.textEn}
                  </div>
                </div>
              )
            } else {
              return (
                <div key={idx} className={`flex items-start justify-end gap-3 transition ${isCurrent ? 'opacity-100' : 'opacity-70'}`}>
                  <div className="bg-sky-950/70 border border-sky-600/40 p-3 rounded-xl rounded-tr-none text-xs font-medium text-sky-100 shadow-sm max-w-lg text-right">
                    <p className="text-[10px] uppercase font-bold text-sky-400 mb-0.5">
                      {isCurrent ? t('yourTurnToRespond', 'Your Turn to Respond:') : t('userResponse', 'Your Spoken Response:')}
                    </p>
                    <p className="font-semibold">
                      {lang === 'ta' ? turn.promptTa : turn.promptEn}
                    </p>
                  </div>
                  <div className="h-8 w-8 rounded-lg bg-emerald-600/30 border border-emerald-400/40 text-emerald-200 flex items-center justify-center text-xs shrink-0 font-bold">
                    {t('youBadge', 'YOU')}
                  </div>
                </div>
              )
            }
          })}
        </div>
      </div>
    </VoiceGameEngine>
  )
}
