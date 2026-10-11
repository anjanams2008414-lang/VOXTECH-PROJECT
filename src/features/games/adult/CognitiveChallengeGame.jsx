import { useState } from 'react'
import VoiceGameEngine from '../VoiceGameEngine'
import { ADULT_GAMES } from '../gamesData'
import { useTranslation } from '../../../i18n/LanguageContext'

export default function CognitiveChallengeGame({ onComplete = () => {}, onClose = () => {} }) {
  const { lang, t } = useTranslation()
  const gameData = ADULT_GAMES.find((g) => g.id === 'cognitive-challenge')
  const challenges = gameData?.challenges || []
  const [challengeIndex, setChallengeIndex] = useState(0)
  const [questionIndex, setQuestionIndex] = useState(0)

  const currentChallenge = challenges[challengeIndex] || challenges[0]
  const isAuditoryRecall = Boolean(currentChallenge.questions)

  const titleText = lang === 'ta' ? currentChallenge.title.ta : currentChallenge.title.en

  // Audio message or situation description
  const backgroundContent = isAuditoryRecall
    ? (lang === 'ta' ? currentChallenge.audioMessageTa : currentChallenge.audioMessageEn)
    : (lang === 'ta' ? currentChallenge.situationTa : currentChallenge.situationEn)

  const activeQuestion = isAuditoryRecall
    ? (currentChallenge.questions[questionIndex] || currentChallenge.questions[0])
    : null

  const spokenPrompt = isAuditoryRecall
    ? (lang === 'ta' ? activeQuestion.qTa : activeQuestion.qEn)
    : (lang === 'ta' ? currentChallenge.promptTa : currentChallenge.promptEn)

  const targetWords = isAuditoryRecall
    ? (lang === 'ta' ? activeQuestion.expectedKeywordsTa : activeQuestion.expectedKeywordsEn)
    : (lang === 'ta' ? currentChallenge.expectedKeywordsTa : currentChallenge.expectedKeywordsEn)

  const exemplarText = isAuditoryRecall
    ? (lang === 'ta' ? activeQuestion.exemplarTa : activeQuestion.exemplarEn)
    : (lang === 'ta' ? currentChallenge.exemplarTa : currentChallenge.exemplarEn)

  const handleNext = () => {
    if (isAuditoryRecall && questionIndex < currentChallenge.questions.length - 1) {
      setQuestionIndex((prev) => prev + 1)
    } else if (challengeIndex < challenges.length - 1) {
      setChallengeIndex((prev) => prev + 1)
      setQuestionIndex(0)
    } else {
      onComplete({
        gameId: 'cognitive-challenge',
        gameName: 'Cognitive Communication Challenge',
        score: 100,
        mode: 'adult',
        xp: 80,
      })
    }
  }

  return (
    <VoiceGameEngine
      mode="adult"
      gameId="cognitive-challenge"
      gameTitle={t('cognitiveChallengeTitle', 'Cognitive Communication Challenge')}
      activityIndex={isAuditoryRecall ? questionIndex : challengeIndex}
      totalActivities={isAuditoryRecall ? currentChallenge.questions.length : challenges.length}
      spokenPrompt={spokenPrompt}
      targetWords={targetWords}
      exemplarText={exemplarText}
      onNextActivity={handleNext}
      onClose={onClose}
    >
      <div className="space-y-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
        {/* Challenge Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-950/80 border border-purple-500/30 text-xl text-purple-300">
              🧠
            </span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                {t('cognitiveDomain', 'Auditory Attention & Reasoning')}
              </span>
              <h4 className="text-base sm:text-lg font-bold text-white mt-0.5">{titleText}</h4>
            </div>
          </div>
          {isAuditoryRecall && (
            <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-semibold border border-slate-700">
              {t('question', 'Q')}: {questionIndex + 1} / {currentChallenge.questions.length}
            </span>
          )}
        </div>

        {/* Auditory Content / Voicemail Transcript Card */}
        <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-purple-400">📋</span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {isAuditoryRecall ? t('auditoryVoicemailTranscript', 'Recorded Voicemail Script:') : t('situationOverview', 'Problem-Solving Context:')}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
            "{backgroundContent}"
          </p>
        </div>

        {/* Spoken Task Prompt */}
        <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-600/40 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-purple-300 mb-1">
            {t('verbalReasoningTask', 'Spoken Verbal Recall Question')}
          </p>
          <p className="text-sm sm:text-base font-bold text-white">
            "{spokenPrompt}"
          </p>
        </div>
      </div>
    </VoiceGameEngine>
  )
}
