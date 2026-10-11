import { useState, useEffect } from 'react'
import { useTranslation } from '../../i18n/LanguageContext'

export default function TherapistGameConfigModal({ isOpen, onClose, role }) {
  const { lang, t } = useTranslation()
  const [config, setConfig] = useState({
    mode: 'child',
    targetSound: 's',
    soundPosition: 'initial',
    difficulty: 'intermediate',
    activeVocabularyTheme: 'animals',
    practiceFrequencyDailyMins: 15,
    aacEnabled: true,
    autoReadPrompts: true,
    speechRate: 0.9,
    encouragementTone: 'high',
  })
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')

  useEffect(() => {
    if (!isOpen) return
    async function fetchConfig() {
      try {
        const token = window.localStorage.getItem('voxtech-token')
        const res = await fetch('/api/games/config', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (res.ok) {
          const data = await res.json()
          if (data.config) setConfig(data.config)
        }
      } catch (err) {
        console.warn('Game config fetch fallback:', err)
      }
    }
    fetchConfig()
  }, [isOpen])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSavedMsg('')
    try {
      const token = window.localStorage.getItem('voxtech-token')
      const res = await fetch('/api/games/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(config),
      })
      if (res.ok) {
        setSavedMsg(lang === 'ta' ? 'அமைப்புகள் வெற்றிகரமாக சேமிக்கப்பட்டன!' : 'Therapist configuration updated successfully!')
        setTimeout(() => {
          setSavedMsg('')
          onClose()
        }, 1200)
      }
    } catch (err) {
      console.error('Config save error:', err)
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-xl rounded-3xl border border-slate-700 bg-slate-900 p-6 text-slate-100 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 text-xl font-bold">
              ⚙️
            </span>
            <div>
              <h3 className="text-lg font-bold text-white">
                {t('therapistConfigBtn', 'Therapist Settings & Clinical Targets')}
              </h3>
              <p className="text-xs text-slate-400">
                {t('configureTargetsDesc', 'Customize phonemes, vocabulary themes, and difficulty for patient voice sessions.')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-800 p-2 text-xs text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* Default Mode Preference */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-300 block mb-1">
                {t('defaultModeLabel', 'Default Therapy Mode')}
              </label>
              <select
                value={config.mode || 'child'}
                onChange={(e) => setConfig({ ...config, mode: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-slate-200 outline-none focus:border-emerald-500"
              >
                <option value="child">{lang === 'ta' ? '🧸 குழந்தைகள் முறை (ஜூனியர் தேடல்)' : '🧸 Child Mode (Junior Quest)'}</option>
                <option value="adult">{lang === 'ta' ? '💼 பெரியவர்கள் முறை (குரல் அரங்கம்)' : '💼 Adult Mode (Clinical Voice Studio)'}</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">
                {t('difficultyLabel', 'Difficulty Tier')}
              </label>
              <select
                value={config.difficulty || 'intermediate'}
                onChange={(e) => setConfig({ ...config, difficulty: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-slate-200 outline-none focus:border-emerald-500"
              >
                <option value="beginner">{lang === 'ta' ? '🌱 தொடக்கநிலை (தனிச் சொற்கள்)' : '🌱 Beginner (Single Words & Cues)'}</option>
                <option value="intermediate">{lang === 'ta' ? '🌿 இடைநிலை (வாக்கியங்கள் & வேகம்)' : '🌿 Intermediate (Phrases & Pacing)'}</option>
                <option value="advanced">{lang === 'ta' ? '🌳 மேம்பட்ட நிலை (முழு உரையாடல்)' : '🌳 Advanced (Full Discourse & Cadence)'}</option>
              </select>
            </div>
          </div>

          {/* Target Phoneme & Position */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-300 block mb-1">
                {t('clinicalTargetPhoneme', 'Clinical Target Sound')}
              </label>
              <select
                value={config.targetSound || 's'}
                onChange={(e) => setConfig({ ...config, targetSound: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-slate-200 outline-none focus:border-emerald-500"
              >
                <option value="s">/s/ (Sun, Safari, Castle, Snake)</option>
                <option value="r">/r/ (Rabbit, River, Roar, Red)</option>
                <option value="l">/l/ (Lion, Lemon, Light, Ball)</option>
                <option value="k">/k/ (Kite, King, Cup, Duck)</option>
                <option value="th">/th/ (Think, Thumb, Bath, Tooth)</option>
                <option value="sa">/ச/ (சூரியன், சஃபாரி - Tamil)</option>
                <option value="ra">/ர/ (முயல், ஆறு - Tamil)</option>
                <option value="la">/ல/ (சிங்கம், பந்து - Tamil)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">
                {t('soundPosition', 'Phoneme Word Position')}
              </label>
              <select
                value={config.soundPosition || 'initial'}
                onChange={(e) => setConfig({ ...config, soundPosition: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-slate-200 outline-none focus:border-emerald-500"
              >
                <option value="initial">{lang === 'ta' ? 'தொடக்க நிலை (சொல்லின் தொடக்கம்)' : 'Initial Position (Word Beginning)'}</option>
                <option value="medial">{lang === 'ta' ? 'இடை நிலை (சொல்லின் நடுவில்)' : 'Medial Position (Middle of Word)'}</option>
                <option value="final">{lang === 'ta' ? 'இறுதி நிலை (சொல்லின் முடிவில்)' : 'Final Position (Word Ending)'}</option>
              </select>
            </div>
          </div>

          {/* Vocabulary Pack Theme & Frequency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-300 block mb-1">
                {t('vocabPackTheme', 'Active Vocabulary Pack')}
              </label>
              <select
                value={config.activeVocabularyTheme || 'animals'}
                onChange={(e) => setConfig({ ...config, activeVocabularyTheme: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-slate-200 outline-none focus:border-emerald-500"
              >
                <option value="animals">{lang === 'ta' ? '🦁 சஃபாரி & விலங்குகள் தலைப்பு' : '🦁 Safari & Animals Theme'}</option>
                <option value="everyday">{lang === 'ta' ? '🏠 வீட்டுப் பொருட்கள் & அன்றாடப் பயன்பாடு' : '🏠 Everyday Household & Objects'}</option>
                <option value="food">{lang === 'ta' ? '🍎 உணவு & ஊட்டச்சத்து சொல்லகராதி' : '🍎 Food & Nutrition Vocabulary'}</option>
                <option value="workplace">{lang === 'ta' ? '💼 பணியிடம் & அலுவல் கூட்டங்கள்' : '💼 Executive Workplace & Meetings'}</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">
                {t('dailyPrescribedMins', 'Daily Practice Prescription')}
              </label>
              <select
                value={config.practiceFrequencyDailyMins || 15}
                onChange={(e) => setConfig({ ...config, practiceFrequencyDailyMins: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-slate-200 outline-none focus:border-emerald-500"
              >
                <option value={10}>{lang === 'ta' ? 'தினசரி 10 நிமிடங்கள்' : '10 minutes daily'}</option>
                <option value={15}>{lang === 'ta' ? 'தினசரி 15 நிமிடங்கள் (நிலையானது)' : '15 minutes daily (Standard)'}</option>
                <option value={20}>{lang === 'ta' ? 'தினசரி 20 நிமிடங்கள் (தீவிரமானது)' : '20 minutes daily (Intensive)'}</option>
                <option value={30}>{lang === 'ta' ? 'தினசரி 30 நிமிடங்கள் (முழுமையானது)' : '30 minutes daily (Comprehensive)'}</option>
              </select>
            </div>
          </div>

          {/* AAC Accessibility Toggles */}
          <div className="rounded-xl bg-slate-950/60 p-3.5 border border-slate-800 space-y-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={config.aacEnabled ?? true}
                onChange={(e) => setConfig({ ...config, aacEnabled: e.target.checked })}
                className="rounded accent-emerald-500 h-4 w-4"
              />
              <span className="font-bold text-slate-200">
                {t('enableAacAlways', 'Always enable AAC communication symbols for non-verbal support')}
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={config.autoReadPrompts ?? true}
                onChange={(e) => setConfig({ ...config, autoReadPrompts: e.target.checked })}
                className="rounded accent-emerald-500 h-4 w-4"
              />
              <span className="font-bold text-slate-200">
                {t('autoTtsPrompts', 'Automatically speak prompts aloud using AI voice on step changes')}
              </span>
            </label>
          </div>

          {savedMsg && (
            <p className="text-emerald-400 font-bold text-center animate-bounce">
              {savedMsg}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white"
            >
              {t('cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-2.5 text-xs font-extrabold text-slate-950 shadow-lg hover:scale-105 transition"
            >
              {saving ? t('saving', 'Saving...') : t('saveSettings', 'Save Configuration')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
