import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '../../i18n/LanguageContext'
import {
  ArrowSeparator,
  BrainIcon,
  CoachIcon,
  GameQuestIcon,
  MicIcon,
  ProgressIcon,
} from './SpeechJourneyIcons'

function SpeechJourneyFlow() {
  const navigate = useNavigate()
  const { lang, t } = useTranslation()
  const [activePrompt, setActivePrompt] = useState('')

  const steps = [
    { icon: '🗣️', key: 'sounds', label: t('sounds', 'Sounds'), complete: true },
    { icon: '🔤', key: 'words', label: t('words', 'Words'), complete: true },
    { icon: '💬', key: 'sentences', label: t('sentences', 'Sentences'), complete: false },
    { icon: '🎙️', key: 'conversation', label: t('conversation', 'Conversation'), complete: false },
  ]

  const showPrompt = (promptKey, defaultPrompt) => setActivePrompt(t(promptKey, defaultPrompt))

  return (
    <main className="min-h-screen overflow-hidden bg-[#fffaf7] px-4 py-6 text-slate-900 sm:px-6">
      <div className="mx-auto flex w-full max-w-sm flex-col items-center select-none font-sans">
        <header className="mb-2 text-center">
          <h1 className="text-2xl font-black tracking-tight text-slate-900">VOXTECH</h1>
          <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
            {lang === 'ta' ? 'பேசு · கற்றுக்கொள் · வளர்' : 'Speak · Learn · Grow'}
          </p>
        </header>
        <ArrowSeparator />

        <div className="w-full">
          <button type="button" onClick={() => showPrompt('warmupPrompt', lang === 'ta' ? 'நீங்கள் தயாரானதும் தொடங்குங்கள். சிறிய ஒலிப் பயிற்சியுடன் தொடங்குவோம்.' : 'Ready when you are. Let’s begin with a short sound warm-up.')} className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-5 py-3 text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-rose-400/40 focus:outline-none focus:ring-4 focus:ring-rose-200">
            <span className="rounded-lg bg-white/20 p-1"><MicIcon /></span><span className="text-xs font-bold tracking-wide sm:text-sm">{t('startSpeechJourney', 'START MY SPEECH JOURNEY')}</span>
          </button>
          <ArrowSeparator />
          <button type="button" onClick={() => showPrompt('assessmentPrompt', lang === 'ta' ? 'விரைவு மதிப்பீடு தேர்ந்தெடுக்கப்பட்டது. உங்கள் தற்போதைய வரைபடம் தயாராக உள்ளது.' : 'Quick assessment selected. Your current map is ready to review.')} className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-amber-300 bg-amber-50 px-5 py-2.5 text-amber-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-100 focus:outline-none focus:ring-4 focus:ring-amber-200">
            <span className="rounded-lg bg-amber-200/60 p-1"><BrainIcon /></span><span className="text-xs font-bold tracking-wide sm:text-sm">{t('quickAssessment', 'QUICK ASSESSMENT')}</span>
          </button>
          <ArrowSeparator />

          <section id="speech-map" className="w-full rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-lg" aria-labelledby="speech-map-title">
            <h2 id="speech-map-title" className="mb-3 text-center text-xs font-bold uppercase tracking-wider text-slate-700">{t('yourSpeechMap', 'YOUR SPEECH MAP')}</h2>
            <div className="space-y-1.5">
              {steps.map((step, index) => <div key={step.key}>
                <div className={`flex items-center justify-between rounded-xl border p-2 ${step.complete ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50 opacity-75'}`}>
                  <span className="text-xs font-bold text-slate-700"><span aria-hidden="true">{step.icon}</span> {step.label}</span>
                  {step.complete ? <span className="text-xs font-bold text-emerald-600" aria-label="Complete">✓</span> : <span className="text-xs" aria-label="Locked">🔒</span>}
                </div>
                {index < steps.length - 1 && <div className="text-center text-xs text-slate-400" aria-hidden="true">↓</div>}
              </div>)}
            </div>
            {activePrompt && <p className="mt-3 rounded-lg bg-indigo-50 px-2.5 py-2 text-xs font-semibold text-indigo-800" role="status">{activePrompt}</p>}
          </section>

          <ArrowSeparator />
          <button type="button" onClick={() => navigate('/games')} className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2.5 text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-indigo-400/40 focus:outline-none focus:ring-4 focus:ring-indigo-200">
            <span className="rounded-lg bg-white/20 p-1"><GameQuestIcon /></span><span className="text-xs font-bold tracking-wide sm:text-sm">{t('todaysQuest', "TODAY'S QUEST")}</span>
          </button>
          <ArrowSeparator />
          <button type="button" onClick={() => navigate('/assistant')} className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-sky-300 bg-sky-50 px-5 py-2.5 text-sky-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-sky-100 focus:outline-none focus:ring-4 focus:ring-sky-200">
            <span className="rounded-lg bg-sky-200/60 p-1"><CoachIcon /></span><span className="text-xs font-bold tracking-wide sm:text-sm">{t('voxiAiCoach', 'VOXI AI COACH')}</span>
          </button>
          <ArrowSeparator />
          <button type="button" onClick={() => navigate('/journey')} className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-emerald-300 bg-emerald-50 px-5 py-2.5 text-emerald-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-100 focus:outline-none focus:ring-4 focus:ring-emerald-200">
            <span className="rounded-lg bg-emerald-200/60 p-1"><ProgressIcon /></span><span className="text-xs font-bold tracking-wide sm:text-sm">{t('progressParentMode', 'PROGRESS / PARENT MODE')}</span>
          </button>
        </div>
      </div>
    </main>
  )
}

export default SpeechJourneyFlow