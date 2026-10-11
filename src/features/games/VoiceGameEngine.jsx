import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from '../../i18n/LanguageContext'
import {
  createSpeechRecognizer,
  startAudioVisualizer,
  playSpeechTTS,
  transcribeAudioBlob,
  evaluateSpokenResponse,
  isSpeechRecognitionSupported,
} from './voiceUtils'

export default function VoiceGameEngine({
  mode = 'child', // 'child' | 'adult'
  gameId = 'game',
  gameTitle = 'Speech Activity',
  activityIndex = 0,
  totalActivities = 1,
  spokenPrompt = '',
  targetWords = [],
  targetSound = '',
  targetSentence = '',
  exemplarText = '',
  onEvaluationComplete = () => {},
  onNextActivity = () => {},
  onClose = () => {},
  children,
  aacSupported = false,
  aacSymbols = [],
  onAacSelect = () => {},
}) {
  const { lang, t } = useTranslation()
  const isChild = mode === 'child'

  // Speech & Audio States
  const [isAiSpeaking, setIsAiSpeaking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimText, setInterimText] = useState('')
  const [audioMetrics, setAudioMetrics] = useState({ volume: 0, pitchHz: 0, inSafeZone: true })
  const [evaluation, setEvaluation] = useState(null)
  const [inputMode, setInputMode] = useState('voice') // 'voice' | 'text'
  const [manualText, setManualText] = useState('')
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState(true)

  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const recognizerRef = useRef(null)
  const visualizerRef = useRef(null)
  const ttsControllerRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

  // Stop everything safely
  const stopAllAudio = useCallback(() => {
    if (ttsControllerRef.current) {
      try {
        ttsControllerRef.current.stop()
      } catch {}
      ttsControllerRef.current = null
    }
    if (recognizerRef.current) {
      try {
        recognizerRef.current.stop()
      } catch {}
      recognizerRef.current = null
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop()
      } catch {}
    }
    if (visualizerRef.current) {
      try {
        visualizerRef.current.stop()
      } catch {}
      visualizerRef.current = null
    }
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => track.stop())
      } catch {}
      streamRef.current = null
    }
    setIsAiSpeaking(false)
    setIsListening(false)
  }, [])

  // Auto-speak spokenPrompt on activity change
  useEffect(() => {
    stopAllAudio()
    setEvaluation(null)
    setTranscript('')
    setInterimText('')
    setManualText('')

    if (spokenPrompt) {
      const timer = setTimeout(() => {
        handlePlayAiPrompt(spokenPrompt)
      }, 400)
      return () => {
        clearTimeout(timer)
        stopAllAudio()
      }
    }

    return () => {
      stopAllAudio()
    }
  }, [activityIndex, spokenPrompt])

  const handlePlayAiPrompt = async (textToSpeak) => {
    if (!textToSpeak) return
    stopAllAudio()
    setIsAiSpeaking(true)

    ttsControllerRef.current = await playSpeechTTS(textToSpeak, {
      lang: lang === 'ta' ? 'ta-IN' : 'en-US',
      onStart: () => setIsAiSpeaking(true),
      onEnd: () => setIsAiSpeaking(false),
    })
  }

  // Start Listening using browser microphone & MediaRecorder
  const handleStartListening = async () => {
    stopAllAudio()
    setTranscript('')
    setInterimText('')
    audioChunksRef.current = []

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      setHasMicrophonePermission(true)

      // Start Web Audio API Canvas Visualizer
      if (canvasRef.current) {
        visualizerRef.current = startAudioVisualizer(stream, canvasRef.current, {
          mode: isChild ? 'wave' : 'bars',
          theme: isChild ? 'child' : 'adult',
          onMetrics: (metrics) => setAudioMetrics(metrics),
        })
      }

      // Initialize MediaRecorder for Sarvam STT (essential for accurate Tamil)
      try {
        if (typeof MediaRecorder !== 'undefined') {
          let mimeType = ''
          if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
            mimeType = 'audio/webm;codecs=opus'
          } else if (MediaRecorder.isTypeSupported('audio/webm')) {
            mimeType = 'audio/webm'
          } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
            mimeType = 'audio/mp4'
          }
          const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)
          recorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
              audioChunksRef.current.push(event.data)
            }
          }
          recorder.start(250)
          mediaRecorderRef.current = recorder
        }
      } catch (recErr) {
        console.warn('MediaRecorder setup error:', recErr)
      }

      // Start Web Speech API Recognizer in parallel (for live typing animation)
      setIsListening(true)
      recognizerRef.current = createSpeechRecognizer({
        lang: lang === 'ta' ? 'ta-IN' : 'en-US',
        continuous: true,
        interimResults: true,
        onStart: () => setIsListening(true),
        onResult: ({ transcript: resTranscript, isFinal }) => {
          setTranscript(resTranscript)
          if (isFinal) {
            setInterimText('')
          } else {
            setInterimText(resTranscript)
          }
        },
        onEnd: () => {},
        onError: (err) => {
          console.warn('Speech error notification:', err)
        },
      })
    } catch (err) {
      console.warn('Microphone permission denied or not supported:', err)
      setHasMicrophonePermission(false)
      setInputMode('text')
    }
  }

  // Stop Listening & Evaluate Speech with Sarvam STT Fallback
  const handleStopListeningAndEvaluate = async (textOverride = null) => {
    let rawText = textOverride || transcript || interimText || manualText
    const currentStream = streamRef.current
    const recorder = mediaRecorderRef.current

    setIsListening(false)

    // Stop visualizer and Web Speech recognizer
    if (recognizerRef.current) {
      try { recognizerRef.current.stop() } catch {}
      recognizerRef.current = null
    }
    if (visualizerRef.current) {
      try { visualizerRef.current.stop() } catch {}
      visualizerRef.current = null
    }

    // Capture recorded audio blob if available
    let recordedBlob = null
    if (recorder && recorder.state !== 'inactive') {
      await new Promise((resolve) => {
        recorder.onstop = () => {
          const type = recorder.mimeType || 'audio/webm'
          recordedBlob = new Blob(audioChunksRef.current, { type })
          resolve()
        }
        try {
          recorder.stop()
        } catch {
          resolve()
        }
      })
    } else if (audioChunksRef.current.length > 0) {
      recordedBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
    }

    // Stop mic stream tracks
    if (currentStream) {
      try {
        currentStream.getTracks().forEach((track) => track.stop())
      } catch {}
      streamRef.current = null
    }

    // If in Tamil mode OR if Web Speech API captured nothing, use Sarvam AI transcription
    if ((lang === 'ta' || !rawText || rawText.trim().length < 2) && recordedBlob && recordedBlob.size > 500) {
      setIsTranscribing(true)
      try {
        const aiTranscript = await transcribeAudioBlob(recordedBlob, { lang: lang === 'ta' ? 'ta-IN' : 'en-IN' })
        if (aiTranscript && aiTranscript.trim()) {
          rawText = aiTranscript.trim()
          setTranscript(rawText)
          setInterimText('')
        }
      } catch (sttErr) {
        console.warn('Backend STT failed, using existing text:', sttErr)
      } finally {
        setIsTranscribing(false)
      }
    }

    const result = evaluateSpokenResponse(rawText, {
      targetWords,
      targetSound,
      targetSentence,
      lang,
    })

    setEvaluation(result)
    onEvaluationComplete(result)

    // Cheer with supportive TTS feedback
    if (result.feedback) {
      setTimeout(() => {
        handlePlayAiPrompt(result.feedback)
      }, 400)
    }
  }

  const handleManualTextSubmit = (e) => {
    e.preventDefault()
    if (!manualText.trim()) return
    handleStopListeningAndEvaluate(manualText)
  }

  const handleRetry = () => {
    stopAllAudio()
    setEvaluation(null)
    setTranscript('')
    setInterimText('')
    setManualText('')
  }

  return (
    <div className={`flex flex-col h-full ${isChild ? 'font-sans' : 'font-sans text-slate-100'}`}>
      {/* Top Session Progress Bar */}
      <div className="flex items-center justify-between border-b pb-4 mb-5 border-slate-200/40">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            aria-label="Back to games"
            className={`rounded-xl p-2 text-xs font-bold transition ${
              isChild ? 'bg-amber-100 text-amber-900 hover:bg-amber-200' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            ← {t('backBtn', 'Exit')}
          </button>
          <div>
            <h3 className={`font-extrabold ${isChild ? 'text-lg text-slate-900' : 'text-base text-white'}`}>{gameTitle}</h3>
            <p className="text-[11px] text-slate-500">
              {t('stepLabel', 'Activity')} {activityIndex + 1} of {totalActivities}
            </p>
          </div>
        </div>

        {/* Mode & Step Indicators */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {Array.from({ length: totalActivities }).map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all ${
                  idx === activityIndex
                    ? isChild
                      ? 'w-6 bg-gradient-to-r from-amber-500 to-orange-500'
                      : 'w-6 bg-sky-400'
                    : idx < activityIndex
                    ? isChild
                      ? 'w-2 bg-emerald-500'
                      : 'w-2 bg-sky-700'
                    : isChild
                    ? 'w-2 bg-slate-200'
                    : 'w-2 bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* AI Coach Banner / Spoken Instruction */}
      <div
        className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 mb-5 transition shadow-sm ${
          isChild
            ? 'bg-gradient-to-r from-amber-50 via-orange-50 to-emerald-50 border border-amber-200/60 text-slate-900'
            : 'bg-slate-900/90 border border-slate-700/60 text-slate-100'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl shadow-sm ${
                isAiSpeaking
                  ? 'animate-pulse ring-4 ring-emerald-400/40 bg-emerald-100'
                  : isChild
                  ? 'bg-white'
                  : 'bg-slate-800 border border-slate-700'
              }`}
            >
              {isAiSpeaking ? '🗣️' : isChild ? '🦊' : '🎙️'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isChild ? 'text-amber-700' : 'text-sky-400'}`}>
                  {isAiSpeaking ? t('aiSpeaking', 'VOXTECH Coach is speaking...') : t('spokenInstruction', 'VOXTECH Voice Coach')}
                </span>
                {isAiSpeaking && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
              </div>
              <p className={`mt-1 font-bold ${isChild ? 'text-slate-900 text-sm sm:text-base' : 'text-slate-200 text-sm'}`}>
                {spokenPrompt}
              </p>
            </div>
          </div>

          {/* Replay Spoken Audio Button & Skip Button */}
          <div className="flex items-center gap-2 shrink-0">
            {isAiSpeaking && (
              <button
                type="button"
                onClick={stopAllAudio}
                className="rounded-xl px-2.5 py-2 text-xs font-bold transition flex items-center gap-1 bg-rose-500/10 text-rose-500 border border-rose-300/40 hover:bg-rose-500/20"
                title={t('skipAiSpeaking', 'Skip Audio')}
              >
                <span>⏹️</span>
                <span className="hidden sm:inline">{t('skipAiSpeaking', 'Skip')}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => handlePlayAiPrompt(spokenPrompt)}
              disabled={isAiSpeaking}
              title={t('replayAudio', 'Replay Instruction')}
              className={`shrink-0 rounded-xl px-3 py-2 text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
                isChild
                  ? 'bg-white text-slate-700 hover:bg-slate-50 border border-amber-200'
                  : 'bg-slate-800 text-sky-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <span>🔊</span>
              <span className="hidden sm:inline">{t('replayAudio', 'Replay')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Activity Content Area (Passed as children) */}
      <div className="flex-1 min-h-[160px] flex flex-col justify-center mb-5">{children}</div>

      {/* AAC Picture Communication Board (If Enabled or Requested) */}
      {aacSupported && aacSymbols.length > 0 && (
        <div className={`p-4 rounded-2xl mb-4 border ${isChild ? 'bg-amber-50/70 border-amber-200' : 'bg-slate-900 border-slate-800'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold uppercase tracking-wide ${isChild ? 'text-amber-800' : 'text-sky-400'}`}>
              ♿ {t('aacTitle', 'AAC Communication Symbols (Tap to Speak)')}
            </span>
            <span className="text-[10px] text-slate-500">{t('aacValidNotice', 'AAC is always a valid communication mode.')}</span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {aacSymbols.map((sym) => (
              <button
                key={sym.id}
                type="button"
                onClick={() => {
                  const spokenVal = lang === 'ta' ? sym.labelTa : sym.labelEn
                  onAacSelect(sym)
                  setTranscript((prev) => (prev ? `${prev} ${spokenVal}` : spokenVal))
                  playSpeechTTS(spokenVal, { lang: lang === 'ta' ? 'ta-IN' : 'en-US' })
                }}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition hover:scale-105 active:scale-95 shadow-sm ${
                  isChild
                    ? 'bg-white border-amber-200 text-slate-800 hover:bg-amber-100'
                    : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                }`}
              >
                <span className="text-xl sm:text-2xl">{sym.icon}</span>
                <span className="text-[11px] font-bold mt-1 truncate max-w-full">
                  {lang === 'ta' ? sym.labelTa : sym.labelEn}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Evaluation Results Card (Shown when user has responded) */}
      {evaluation && (
        <div
          className={`p-5 rounded-2xl mb-5 border animate-fadeIn transition ${
            evaluation.success
              ? isChild
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-md'
                : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200 shadow-md'
              : isChild
              ? 'bg-amber-50 border-amber-300 text-amber-950'
              : 'bg-slate-800 border-amber-500/40 text-amber-200'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 text-center sm:text-left">
              <span className="text-4xl">{evaluation.success ? (isChild ? '🌟' : '✅') : '💪'}</span>
              <div>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <span className="text-sm font-black uppercase tracking-wider">{evaluation.feedback}</span>
                  {isChild && (
                    <span className="flex text-amber-500">
                      {'⭐'.repeat(evaluation.stars)}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs opacity-80">
                  {t('speechRecognized', 'Heard')}: <span className="font-bold underline">"{evaluation.transcript}"</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleRetry}
                className={`flex-1 sm:flex-none rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                  isChild
                    ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                🔄 {t('tryAgainPrompt', 'Try Again')}
              </button>

              <button
                type="button"
                onClick={onNextActivity}
                className={`flex-1 sm:flex-none rounded-xl px-6 py-2.5 text-xs font-extrabold shadow-md transition hover:scale-105 ${
                  isChild
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/20'
                    : 'bg-sky-500 text-slate-950 hover:bg-sky-400'
                }`}
              >
                {activityIndex < totalActivities - 1 ? t('nextPrompt', 'Next Step ➔') : t('completeActivity', 'Complete Activity 🎉')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voice Interaction & Controls Footer */}
      <div
        className={`rounded-2xl border p-4 sm:p-5 shadow-sm transition ${
          isChild ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
        }`}
      >
        {inputMode === 'voice' ? (
          <div className="space-y-4">
            {/* Live Audio Visualizer Canvas & Metrics */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="w-full sm:flex-1 h-14 bg-slate-950 rounded-xl overflow-hidden relative flex items-center justify-center border border-slate-800">
                <canvas ref={canvasRef} width={380} height={56} className="w-full h-full" />
                {!isListening && (
                  <span className="absolute text-[11px] font-semibold text-slate-400">
                    {t('micActiveMsg', 'Speak clearly into your microphone')}
                  </span>
                )}
                {isListening && (
                  <span className="absolute top-1.5 right-2 flex items-center gap-1.5 bg-rose-950/80 border border-rose-600/40 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                    {t('recLabel', 'REC')}
                  </span>
                )}
              </div>

              {/* Pitch & Decibel Indicators (Safe Zone) */}
              <div className="flex items-center gap-3 shrink-0">
                <div className={`px-3 py-2 rounded-xl text-center border ${isChild ? 'bg-slate-50 border-slate-200' : 'bg-slate-800 border-slate-700'}`}>
                  <p className="text-[10px] uppercase font-bold text-slate-400">{t('volumeLabel', 'Vol')}</p>
                  <p className="text-xs font-extrabold text-emerald-500">{audioMetrics.volume}%</p>
                </div>
                {!isChild && (
                  <div className="px-3 py-2 rounded-xl text-center border bg-slate-800 border-slate-700">
                    <p className="text-[10px] uppercase font-bold text-slate-400">{t('pitchLabel', 'Pitch')}</p>
                    <p className="text-xs font-extrabold text-sky-400">{audioMetrics.pitchHz} Hz</p>
                  </div>
                )}
              </div>
            </div>

            {/* Live Interim Transcript Display */}
            {(transcript || interimText) && !isTranscribing && (
              <div className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-between gap-2 ${
                isChild ? 'bg-emerald-50 border-emerald-200 text-slate-800' : 'bg-slate-800/80 border-slate-700 text-slate-200'
              }`}>
                <div className="flex items-center gap-2 truncate">
                  <span>🎙️</span>
                  <span className="font-bold">{transcript || interimText}</span>
                </div>
                {isListening && (
                  <button
                    type="button"
                    onClick={() => handleStopListeningAndEvaluate()}
                    className="shrink-0 bg-emerald-600 text-white font-bold text-[11px] px-3 py-1 rounded-lg shadow-sm"
                  >
                    {t('submitAnswer', 'Done')}
                  </button>
                )}
              </div>
            )}

            {/* AI Speech Analysis Indicator */}
            {isTranscribing && (
              <div className={`p-3 rounded-xl border flex items-center justify-center gap-2 animate-pulse text-xs font-bold ${
                isChild ? 'bg-amber-100/90 text-amber-950 border-amber-300' : 'bg-sky-950/80 text-sky-300 border-sky-600/50'
              }`}>
                <span className="animate-spin text-sm">🔄</span>
                <span>{t('analyzingVoice', 'VOX AI is analyzing your speech...')}</span>
              </div>
            )}

            {/* Voice Control Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                {!isListening ? (
                  <button
                    type="button"
                    onClick={handleStartListening}
                    disabled={isTranscribing}
                    className={`flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-extrabold text-white shadow-lg transition hover:scale-105 active:scale-95 disabled:opacity-60 ${
                      isChild
                        ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 shadow-emerald-500/25'
                        : 'bg-gradient-to-r from-sky-500 to-blue-600 shadow-sky-500/20'
                    }`}
                  >
                    <span className="text-lg">🎙️</span>
                    <span>{isTranscribing ? t('analyzingVoice', 'Processing voice...') : t('tapToSpeak', 'Tap to Speak Now')}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleStopListeningAndEvaluate()}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 px-5 py-3 text-xs font-extrabold text-white shadow-lg shadow-rose-500/25 animate-pulse"
                  >
                    <span>⏹️</span>
                    <span>{t('stopListening', 'Done Speaking')}</span>
                  </button>
                )}

                {exemplarText && (
                  <button
                    type="button"
                    onClick={() => handlePlayAiPrompt(exemplarText)}
                    disabled={isAiSpeaking}
                    className={`rounded-xl px-3 py-2.5 text-xs font-bold transition flex items-center gap-1.5 border ${
                      isChild
                        ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <span>🎧</span>
                    <span className="hidden sm:inline">{t('hearModelPrompt', 'Hear Model')}</span>
                  </button>
                )}
              </div>

              {/* Accessible Non-Voice Fallback Toggle */}
              <button
                type="button"
                onClick={() => setInputMode('text')}
                className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 underline"
              >
                ⌨️ {t('textFallbackOption', 'Switch to Keyboard / Text')}
              </button>
            </div>
          </div>
        ) : (
          /* Accessible Keyboard / Text Fallback Form */
          <form onSubmit={handleManualTextSubmit} className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-500">
                ⌨️ {t('typeAnswerPlaceholder', 'Type your spoken response below if voice is unavailable:')}
              </label>
              <button
                type="button"
                onClick={() => setInputMode('voice')}
                className="text-xs font-bold text-emerald-600 hover:underline"
              >
                🎙️ {t('voiceModeOption', 'Switch to Voice Input')}
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder={t('typeAnswerPlaceholder', 'Type your answer here...')}
                className={`flex-1 rounded-xl border px-3 py-2.5 text-xs outline-none transition ${
                  isChild
                    ? 'border-slate-300 bg-slate-50 text-slate-900 focus:border-amber-500'
                    : 'border-slate-700 bg-slate-800 text-white focus:border-sky-500'
                }`}
              />
              <button
                type="submit"
                className={`rounded-xl px-5 py-2.5 text-xs font-extrabold text-white transition ${
                  isChild ? 'bg-amber-600 hover:bg-amber-500' : 'bg-sky-600 hover:bg-sky-500'
                }`}
              >
                {t('submitAnswer', 'Submit')}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Clinical Safety & Encouragement Footer Disclaimer */}
      <div className="mt-3 text-center">
        <p className="text-[10px] text-slate-400">
          🛡️ {t('clinicalDisclaimer', 'VOXTECH activities support voice and language practice. They do not replace clinical diagnosis. Never strain your voice.')}
        </p>
      </div>
    </div>
  )
}
