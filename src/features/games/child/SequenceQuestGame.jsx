import { useState } from 'react'
import VoiceGameEngine from '../VoiceGameEngine'
import { CHILD_GAMES } from '../gamesData'
import { useTranslation } from '../../../i18n/LanguageContext'

export default function SequenceQuestGame({ onComplete = () => {}, onClose = () => {} }) {
  const { lang, t } = useTranslation()
  const gameData = CHILD_GAMES.find((g) => g.id === 'sequence-quest')
  const activities = gameData?.activities || []
  const [activityIndex, setActivityIndex] = useState(0)
  const [questionIndex, setQuestionIndex] = useState(0)

  const currentActivity = activities[activityIndex] || activities[0]
  const currentQuestion = currentActivity.questions[questionIndex] || currentActivity.questions[0]

  const promptText = lang === 'ta' ? currentQuestion.qTa : currentQuestion.qEn
  const titleText = lang === 'ta' ? currentActivity.title.ta : currentActivity.title.en
  const exemplarText = lang === 'ta' ? currentQuestion.modelTa : currentQuestion.modelEn
  const targetWords = lang === 'ta' ? currentQuestion.expectedWordsTa : currentQuestion.expectedWordsEn

  const handleNext = () => {
    if (questionIndex < currentActivity.questions.length - 1) {
      setQuestionIndex((prev) => prev + 1)
    } else if (activityIndex < activities.length - 1) {
      setActivityIndex((prev) => prev + 1)
      setQuestionIndex(0)
    } else {
      onComplete({
        gameId: 'sequence-quest',
        gameName: 'Memory & Sequence Quest',
        score: 100,
        stars: 3,
        xp: 80,
      })
    }
  }

  return (
    <VoiceGameEngine
      mode="child"
      gameId="sequence-quest"
      gameTitle={t('sequenceQuestTitle', 'Memory & Sequence Quest')}
      activityIndex={questionIndex}
      totalActivities={currentActivity.questions.length}
      spokenPrompt={promptText}
      targetWords={targetWords}
      exemplarText={exemplarText}
      onNextActivity={handleNext}
      onClose={onClose}
    >
      <div className="space-y-4 p-5 rounded-3xl bg-gradient-to-br from-sky-50/70 via-blue-50/40 to-indigo-50/50 border border-sky-200 shadow-inner">
        {/* Story Sequence Steps Cards */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-900">
              {t('chronologicalStory', 'Story Sequence:')} {titleText}
            </span>
            <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">
              {t('questionProgress', 'Question')} {questionIndex + 1} / {currentActivity.questions.length}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {currentActivity.steps.map((step) => {
              const stepText = lang === 'ta' ? step.text.ta : step.text.en
              return (
                <div
                  key={step.order}
                  className="flex flex-col items-center text-center p-3 rounded-2xl bg-white border border-sky-100 shadow-sm transition hover:shadow-md"
                >
                  <span className="text-3xl sm:text-4xl mb-1.5">{step.icon}</span>
                  <span className="text-[10px] sm:text-xs font-bold text-slate-700 leading-tight">
                    {stepText}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Current Active Question Display */}
        <div className="p-4 rounded-2xl bg-white border border-sky-200 shadow-sm text-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-sky-600">
            {t('spokenQuestion', 'Spoken Question')}
          </span>
          <p className="mt-1 text-lg sm:text-xl font-black text-slate-900">"{promptText}"</p>
          <p className="mt-1 text-xs text-slate-500">
            {lang === 'ta'
              ? 'உங்கள் பதிலைப் பேச மைக்ரோஃபோனைத் தட்டவும்.'
              : 'Tap Speak and answer the sequence question aloud!'}
          </p>
        </div>
      </div>
    </VoiceGameEngine>
  )
}
