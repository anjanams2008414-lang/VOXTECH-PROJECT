/**
 * VOXTECH Voice Utilities
 * Robust Speech Recognition (STT), Audio Visualization (Web Audio API),
 * Text-to-Speech (TTS), and Practice-Oriented Speech Evaluation.
 */

export function isSpeechRecognitionSupported() {
  return typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)
}

export function createSpeechRecognizer({
  lang = 'en-US',
  continuous = true,
  interimResults = true,
  onResult = () => {},
  onStart = () => {},
  onEnd = () => {},
  onError = () => {},
} = {}) {
  if (!isSpeechRecognitionSupported()) {
    onError(new Error('Speech recognition is not supported in this browser.'))
    return null
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  const recognition = new SpeechRecognition()

  recognition.continuous = continuous
  recognition.interimResults = interimResults
  recognition.lang = lang
  recognition.maxAlternatives = 3

  recognition.onstart = () => {
    onStart()
  }

  recognition.onresult = (event) => {
    let interim = ''
    let final = ''
    let confidence = 0.9

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const res = event.results[i]
      const text = res[0].transcript
      if (res.isFinal) {
        final += text
        if (res[0].confidence) confidence = res[0].confidence
      } else {
        interim += text
      }
    }

    onResult({
      transcript: final || interim,
      isFinal: Boolean(final),
      confidence,
      finalText: final,
      interimText: interim,
    })
  }

  recognition.onerror = (event) => {
    // Ignore harmless 'no-speech' or 'aborted' events without crashing
    if (event.error === 'no-speech' || event.error === 'aborted') {
      return
    }
    console.warn('Speech recognition notification:', event.error)
    onError(event)
  }

  recognition.onend = () => {
    onEnd()
  }

  try {
    recognition.start()
  } catch (err) {
    console.warn('Recognition start warning:', err)
  }

  return {
    stop: () => {
      try {
        recognition.stop()
      } catch {}
    },
    abort: () => {
      try {
        recognition.abort()
      } catch {}
    },
  }
}

/**
 * Real-time Audio Analyser using Web Audio API
 * Draws animated waveform / frequency bars on canvas & measures RMS dB volume
 */
export function startAudioVisualizer(stream, canvas, { onMetrics = () => {}, mode = 'wave', theme = 'child' } = {}) {
  if (!stream || !canvas) return { stop: () => {} }

  let audioCtx
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    audioCtx = new AudioContext()
  } catch (e) {
    console.warn('Web Audio API not supported:', e)
    return { stop: () => {} }
  }

  const analyser = audioCtx.createAnalyser()
  analyser.fftSize = 256
  const source = audioCtx.createMediaStreamSource(stream)
  source.connect(analyser)

  const bufferLength = analyser.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)
  let animationId = null
  let active = true

  const ctx = canvas.getContext('2d')

  const render = () => {
    if (!active) return

    analyser.getByteFrequencyData(dataArray)

    // Calculate Average Volume (0 - 100)
    let sum = 0
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i]
    }
    const average = sum / bufferLength
    const volumePercent = Math.min(100, Math.round((average / 128) * 100))

    // Estimate dominant frequency / pitch
    let maxVal = 0
    let maxIndex = 0
    for (let i = 0; i < bufferLength; i++) {
      if (dataArray[i] > maxVal) {
        maxVal = dataArray[i]
        maxIndex = i
      }
    }
    const nyquist = audioCtx.sampleRate / 2
    const estimatedHz = Math.round((maxIndex * nyquist) / bufferLength)

    onMetrics({ volume: volumePercent, pitchHz: estimatedHz, inSafeZone: volumePercent >= 15 && volumePercent <= 80 })

    if (ctx && canvas.width && canvas.height) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const width = canvas.width
      const height = canvas.height

      if (mode === 'wave') {
        analyser.getByteTimeDomainData(dataArray)
        ctx.lineWidth = theme === 'child' ? 4 : 2
        ctx.strokeStyle = theme === 'child' ? '#10b981' : '#38bdf8'
        ctx.beginPath()

        const sliceWidth = width / bufferLength
        let x = 0

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0
          const y = (v * height) / 2

          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
          x += sliceWidth
        }

        ctx.lineTo(width, height / 2)
        ctx.stroke()
      } else {
        // Frequency bars
        const barWidth = (width / bufferLength) * 2.5
        let x = 0

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * height

          const gradient = ctx.createLinearGradient(0, height, 0, 0)
          if (theme === 'child') {
            gradient.addColorStop(0, '#10b981')
            gradient.addColorStop(1, '#f59e0b')
          } else {
            gradient.addColorStop(0, '#0284c7')
            gradient.addColorStop(1, '#38bdf8')
          }

          ctx.fillStyle = gradient
          ctx.fillRect(x, height - barHeight, barWidth, barHeight)
          x += barWidth + 1
        }
      }
    }

    animationId = requestAnimationFrame(render)
  }

  render()

  return {
    stop: () => {
      active = false
      if (animationId) cancelAnimationFrame(animationId)
      try {
        source.disconnect()
        analyser.disconnect()
        audioCtx.close()
      } catch {}
    },
  }
}

/**
 * Text to Speech Synthesizer
 * Uses Sarvam API endpoint with fallback to window.speechSynthesis
 */
export async function playSpeechTTS(text, { lang = 'en-US', onStart = () => {}, onEnd = () => {} } = {}) {
  if (!text || !text.trim()) {
    onEnd()
    return { stop: () => {} }
  }

  let activeAudio = null
  let stopped = false
  let watchdogTimer = null

  const cleanText = text.replace(/[*#]/g, '').trim()
  const targetLang = lang.startsWith('ta') ? 'ta-IN' : 'en-IN'

  const clearWatchdog = () => {
    if (watchdogTimer) {
      clearTimeout(watchdogTimer)
      watchdogTimer = null
    }
  }

  const safeEnd = () => {
    clearWatchdog()
    if (!stopped) onEnd()
  }

  // Safety watchdog: audio shouldn't block user forever even if network or synth stalls
  const maxWaitMs = Math.max(3500, Math.min(20000, cleanText.length * 120))
  watchdogTimer = setTimeout(() => {
    safeEnd()
  }, maxWaitMs)

  const fallbackToBrowserSynth = () => {
    if (stopped) return
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      safeEnd()
      return
    }

    try {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(cleanText)
      utterance.lang = targetLang === 'ta-IN' ? 'ta-IN' : 'en-US'
      const savedSpeed = typeof window !== 'undefined' ? parseFloat(window.localStorage.getItem('voxtech_tts_speed') || '1.0') : 1.0
      const rateMultiplier = isNaN(savedSpeed) ? 1.0 : savedSpeed
      utterance.rate = Math.max(0.6, Math.min(2.0, (lang.startsWith('ta') ? 0.9 : 0.95) * rateMultiplier))
      utterance.pitch = 1.0

      utterance.onstart = () => {
        if (!stopped) onStart()
      }
      utterance.onend = safeEnd
      utterance.onerror = safeEnd

      window.speechSynthesis.speak(utterance)
    } catch (e) {
      safeEnd()
    }
  }

  try {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('voxtech-token') : null
    const res = await fetch('/api/speech/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        text: cleanText,
        targetLanguage: targetLang,
      }),
    })

    if (res.ok && !stopped) {
      const blob = await res.blob()
      if (stopped) return { stop: () => {} }

      const audioUrl = URL.createObjectURL(blob)
      activeAudio = new Audio(audioUrl)
      const savedSpeed = typeof window !== 'undefined' ? parseFloat(window.localStorage.getItem('voxtech_tts_speed') || '1.0') : 1.0
      if (!isNaN(savedSpeed) && savedSpeed > 0) {
        activeAudio.playbackRate = savedSpeed
      }

      activeAudio.onplay = () => {
        if (!stopped) onStart()
      }
      activeAudio.onended = () => {
        URL.revokeObjectURL(audioUrl)
        safeEnd()
      }
      activeAudio.onerror = () => {
        URL.revokeObjectURL(audioUrl)
        fallbackToBrowserSynth()
      }

      try {
        await activeAudio.play()
      } catch (playErr) {
        console.warn('Audio play restricted or failed:', playErr)
        URL.revokeObjectURL(audioUrl)
        fallbackToBrowserSynth()
      }
    } else {
      fallbackToBrowserSynth()
    }
  } catch (err) {
    fallbackToBrowserSynth()
  }

  return {
    stop: () => {
      stopped = true
      clearWatchdog()
      if (activeAudio) {
        try {
          activeAudio.pause()
          activeAudio.currentTime = 0
        } catch {}
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel()
        } catch {}
      }
      onEnd()
    },
  }
}

/**
 * Transcribe recorded audio blob via Sarvam STT backend API
 */
export async function transcribeAudioBlob(blob, { lang = 'ta-IN' } = {}) {
  if (!blob || blob.size < 100) return ''
  try {
    const formData = new FormData()
    const ext = blob.type && blob.type.includes('webm') ? 'recording.webm' : 'recording.wav'
    formData.append('audio', blob, ext)
    const targetLang = lang.startsWith('ta') ? 'ta-IN' : 'en-IN'
    formData.append('language_code', targetLang)

    const token = typeof window !== 'undefined' ? window.localStorage.getItem('voxtech-token') : null
    const res = await fetch(`/api/speech/transcribe?provider=sarvam&language_code=${targetLang}`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    })

    if (res.ok) {
      const data = await res.json()
      return (data?.transcript || '').trim()
    }
  } catch (err) {
    console.warn('Audio transcription failed:', err)
  }
  return ''
}

/**
 * Flexible, Supportive Speech Evaluation
 * Prioritizes participation, effort, and partial matches without punitive scoring.
 */
export function evaluateSpokenResponse(spoken, {
  targetWords = [],
  targetSound = '',
  targetSentence = '',
  lang = 'en',
} = {}) {
  if (!spoken || !spoken.trim()) {
    return {
      success: false,
      accuracy: 0,
      score: 10,
      stars: 1,
      feedback: lang === 'ta' ? 'நல்ல முயற்சி! உங்கள் குரலைக் கேட்க முடியவில்லை, மீண்டும் முயற்சி செய்யுங்கள்.' : 'Nice try! We did not clearly hear your voice. Let us try once more!',
      recognizedMatches: [],
    }
  }

  const cleanSpoken = spoken.toLowerCase().replace(/[,.?!:;'"-]/g, '').trim()
  const spokenTokens = cleanSpoken.split(/\s+/).filter(Boolean)
  const isTamil = lang === 'ta' || /[\u0B80-\u0BFF]/.test(cleanSpoken)

  // 1. Target Sound Checking (e.g. /s/, /r/, /th/)
  let soundMatched = false
  if (targetSound) {
    const cleanSound = targetSound.toLowerCase().replace(/[/]/g, '')
    soundMatched = cleanSpoken.includes(cleanSound) || spokenTokens.some(w => w.startsWith(cleanSound) || w.endsWith(cleanSound))
  }

  // 2. Target Words Matching
  const matchedWords = []
  const normTargets = targetWords.map(w => w.toLowerCase().replace(/[,.?!:;'"-]/g, '').trim()).filter(Boolean)

  normTargets.forEach(t => {
    if (cleanSpoken.includes(t)) {
      matchedWords.push(t)
      return
    }
    const hasTokenMatch = spokenTokens.some(tok => {
      if (tok === t) return true
      if (t.length >= 3 && tok.includes(t)) return true
      if (tok.length >= 3 && t.includes(tok)) return true
      // Stem match for Tamil suffixes (e.g. -ஐ, -கள், -இல், -க்கு)
      if (t.length >= 4 && tok.startsWith(t.slice(0, 3))) return true
      return false
    })
    if (hasTokenMatch) {
      matchedWords.push(t)
    }
  })

  // 3. Target Sentence Matching (Word overlap)
  let sentenceRatio = 0
  if (targetSentence) {
    const targetTokens = targetSentence.toLowerCase().replace(/[,.?!:;'"-]/g, '').trim().split(/\s+/).filter(Boolean)
    let hits = 0
    targetTokens.forEach(t => {
      if (spokenTokens.includes(t) || cleanSpoken.includes(t)) hits++
    })
    sentenceRatio = targetTokens.length ? hits / targetTokens.length : 1
  }

  // Calculate overall performance
  const wordsMatchedRatio = normTargets.length ? matchedWords.length / normTargets.length : (cleanSpoken.length > 2 ? 1 : 0)
  const matchRatio = targetSentence ? (wordsMatchedRatio * 0.4 + sentenceRatio * 0.6) : (wordsMatchedRatio || (soundMatched ? 1 : 0.7))

  // For Tamil mode, any spoken vocalization with Tamil unicode characters or matching phonetics is recognized
  const hasSpokenEffort = spokenTokens.length > 0 && cleanSpoken.length >= 2
  const isSuccess = matchRatio >= 0.25 || soundMatched || matchedWords.length > 0 || (isTamil && hasSpokenEffort)

  let stars = 3
  let score = 85
  let feedback = ''

  if (matchRatio >= 0.65 || (normTargets.length && matchedWords.length >= Math.ceil(normTargets.length * 0.5))) {
    stars = 3
    score = 100
    feedback = lang === 'ta'
      ? 'மிக அற்புதம்! உங்கள் உச்சரிப்பு மிகத் தெளிவாக இருந்தது!'
      : 'Outstanding speaking! Your pronunciation was remarkably clear!'
  } else if (isSuccess) {
    stars = 2
    score = 80
    feedback = lang === 'ta'
      ? 'அருமையான முயற்சி! நீங்கள் கூறியது நன்றாகக் கேட்டது, தொடர்ந்து பயிற்சி செய்யுங்கள்!'
      : 'Great try! We heard your voice clearly. Keep practicing with that confidence!'
  } else {
    stars = 1
    score = 60
    feedback = lang === 'ta'
      ? 'நல்ல ஆரம்பம்! வார்த்தையை மீண்டும் ஒருமுறை மெதுவாகக் கூறிப் பாருங்கள்.'
      : 'Good attempt! Try speaking the target word slowly and smoothly once more.'
  }

  return {
    success: isSuccess,
    accuracy: Math.round(matchRatio * 100) || (isSuccess ? 75 : 30),
    score,
    stars,
    feedback,
    recognizedMatches: matchedWords,
    transcript: spoken,
  }
}
