import { useState } from 'react'
import VoiceGameEngine from '../VoiceGameEngine'
import { CHILD_GAMES } from '../gamesData'
import { useTranslation } from '../../../i18n/LanguageContext'

export default function PictureTalkGame({ onComplete = () => {}, onClose = () => {} }) {
  const { lang, t } = useTranslation()
  const gameData = CHILD_GAMES.find((g) => g.id === 'picture-talk')
  const activities = gameData?.activities || []
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showHint, setShowHint] = useState(false)

  const activity = activities[currentIndex] || activities[0]
  const promptText = lang === 'ta' ? activity.prompt.ta : activity.prompt.en
  const titleText = lang === 'ta' ? activity.title.ta : activity.title.en
  const exemplarText = lang === 'ta' ? activity.exemplar.ta : activity.exemplar.en
  const hintText = lang === 'ta' ? activity.hint.ta : activity.hint.en
  const targets = lang === 'ta' ? activity.targetWords.ta : activity.targetWords.en

  const handleNext = () => {
    setShowHint(false)
    if (currentIndex < activities.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      onComplete({
        gameId: 'picture-talk',
        gameName: 'Picture Talk & Naming',
        score: 100,
        stars: 3,
        xp: 60,
      })
    }
  }

  return (
    <VoiceGameEngine
      mode="child"
      gameId="picture-talk"
      gameTitle={t('pictureTalkTitle', 'Picture Talk & Naming')}
      activityIndex={currentIndex}
      totalActivities={activities.length}
      spokenPrompt={promptText}
      targetWords={targets}
      exemplarText={exemplarText}
      onNextActivity={handleNext}
      onClose={onClose}
    >
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 p-4 bg-gradient-to-b from-amber-50/50 to-orange-50/40 rounded-3xl border border-amber-100 shadow-inner">
        {/* SVG Illustration Viewer */}
        <div className="w-48 h-48 sm:w-56 sm:h-56 shrink-0 rounded-2xl overflow-hidden shadow-md flex items-center justify-center bg-white p-2 border border-amber-200/60">
          <div
            className="w-full h-full flex items-center justify-center"
            dangerouslySetInnerHTML={{ __html: activity.imageSvg }}
          />
        </div>

        {/* Clues and Target Words Display */}
        <div className="flex-1 text-center md:text-left space-y-3">
          <div>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold text-amber-900 uppercase tracking-wide">
              {t('pictureTalkCategory', 'Expressive Naming')}
            </span>
            <h4 className="mt-1.5 text-xl font-black text-slate-900">{titleText}</h4>
            <p className="mt-1 text-xs text-slate-600">
              {lang === 'ta'
                ? 'படத்தை உற்று நோக்கி, அதன் பெயரை உங்கள் மைக்ரோஃபோனில் சத்தமாகக் கூறுங்கள்.'
                : 'Say what you see in the picture aloud into your microphone!'}
            </p>
          </div>

          {/* Expected Words Hint Pill */}
          <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
            <span className="text-[11px] font-bold text-slate-400 self-center mr-1">
              {t('targets', 'Targets')}:
            </span>
            {targets.map((word, i) => (
              <span
                key={i}
                className="rounded-xl bg-white border border-amber-200 px-3 py-1 text-xs font-bold text-amber-800 shadow-sm"
              >
                {word}
              </span>
            ))}
          </div>

          {/* Supportive Hint Button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowHint((prev) => !prev)}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 underline flex items-center gap-1 mx-auto md:mx-0"
            >
              <span>💡</span>
              <span>{showHint ? t('hideHint', 'Hide Clue') : t('needHint', 'Need a Clue?')}</span>
            </button>
            {showHint && (
              <p className="mt-1.5 text-xs font-semibold text-amber-900 bg-amber-100/70 p-2 rounded-xl animate-fadeIn">
                "{hintText}"
              </p>
            )}
          </div>
        </div>
      </div>
    </VoiceGameEngine>
  )
}
