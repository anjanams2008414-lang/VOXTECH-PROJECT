import { useState, useEffect } from 'react'
import VoiceGameEngine from '../VoiceGameEngine'
import { CHILD_GAMES } from '../gamesData'
import { useTranslation } from '../../../i18n/LanguageContext'

export default function BuildSentenceGame({ onComplete = () => {}, onClose = () => {} }) {
  const { lang, t } = useTranslation()
  const gameData = CHILD_GAMES.find((g) => g.id === 'build-sentence')
  const activities = gameData?.activities || []
  const [activityIndex, setActivityIndex] = useState(0)

  const currentActivity = activities[activityIndex] || activities[0]
  const targetSentence = lang === 'ta' ? currentActivity.correctSentence.ta : currentActivity.correctSentence.en
  const rawTiles = lang === 'ta' ? currentActivity.tiles.ta : currentActivity.tiles.en

  // Scramble tiles slightly for interactivity
  const [selectedTiles, setSelectedTiles] = useState([])
  const [availableTiles, setAvailableTiles] = useState([])

  useEffect(() => {
    setSelectedTiles([])
    setAvailableTiles([...rawTiles].sort(() => Math.random() - 0.5))
  }, [activityIndex, lang])

  const handleTileClick = (tile) => {
    setSelectedTiles((prev) => [...prev, tile])
    setAvailableTiles((prev) => prev.filter((item) => item !== tile))
  }

  const handleRemoveTile = (tile) => {
    setAvailableTiles((prev) => [...prev, tile])
    setSelectedTiles((prev) => prev.filter((item) => item !== tile))
  }

  const handleResetTiles = () => {
    setSelectedTiles([])
    setAvailableTiles([...rawTiles].sort(() => Math.random() - 0.5))
  }

  const assembledSentence = selectedTiles.join(' ') || targetSentence
  const spokenPrompt = lang === 'ta' ? currentActivity.prompt.ta : currentActivity.prompt.en
  const exemplarText = lang === 'ta' ? currentActivity.audioCue.ta : currentActivity.audioCue.en

  const handleNext = () => {
    if (activityIndex < activities.length - 1) {
      setActivityIndex((prev) => prev + 1)
    } else {
      onComplete({
        gameId: 'build-sentence',
        gameName: 'Build the Sentence — Speak It',
        score: 100,
        stars: 3,
        xp: 75,
      })
    }
  }

  return (
    <VoiceGameEngine
      mode="child"
      gameId="build-sentence"
      gameTitle={t('buildSentenceTitle', 'Build the Sentence — Speak It')}
      activityIndex={activityIndex}
      totalActivities={activities.length}
      spokenPrompt={spokenPrompt}
      targetSentence={targetSentence}
      exemplarText={exemplarText}
      onNextActivity={handleNext}
      onClose={onClose}
    >
      <div className="space-y-4 p-5 rounded-3xl bg-gradient-to-br from-violet-50/60 via-purple-50/40 to-pink-50/40 border border-purple-200 shadow-inner">
        {/* Sentence Assembly Rack */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-900">
              {t('constructedSentence', '1. Your Constructed Sentence (Read Aloud):')}
            </span>
            {selectedTiles.length > 0 && (
              <button
                type="button"
                onClick={handleResetTiles}
                className="text-[11px] font-bold text-purple-600 hover:underline"
              >
                {t('resetTiles', 'Reset Tiles')}
              </button>
            )}
          </div>

          <div className="min-h-[64px] p-3.5 rounded-2xl bg-white border-2 border-dashed border-purple-300 flex flex-wrap items-center gap-2 shadow-sm">
            {selectedTiles.length === 0 ? (
              <span className="text-xs text-slate-400 font-semibold italic">
                {lang === 'ta'
                  ? 'கீழே உள்ள சொற்களைத் தட்டி வாக்கியத்தை அமையுங்கள்...'
                  : 'Tap tiles below to order them, or speak the target sentence directly!'}
              </span>
            ) : (
              selectedTiles.map((tile, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleRemoveTile(tile)}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-black text-xs sm:text-sm shadow-md transition hover:scale-95 flex items-center gap-1.5"
                >
                  <span>{tile}</span>
                  <span className="text-[10px] opacity-70">✕</span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Word Tiles to Select */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
            {t('availableTiles', '2. Available Word Tiles:')}
          </span>
          <div className="flex flex-wrap gap-2">
            {availableTiles.map((tile, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleTileClick(tile)}
                className="px-3.5 py-2 rounded-xl bg-white border border-purple-200 text-purple-900 font-bold text-xs sm:text-sm shadow-sm transition hover:scale-105 active:scale-95 hover:bg-purple-50"
              >
                + {tile}
              </button>
            ))}
          </div>
        </div>

        {/* Big Speak It Callout */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-100/70 to-pink-100/70 border border-purple-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🎙️</span>
            <div>
              <p className="text-xs font-black text-purple-950 uppercase tracking-wide">
                {t('speakItStep', 'Now Speak It Aloud!')}
              </p>
              <p className="text-xs font-bold text-purple-800">"{assembledSentence}"</p>
            </div>
          </div>
        </div>
      </div>
    </VoiceGameEngine>
  )
}
