import { useState, useEffect } from 'react'
import { useTranslation } from '../../i18n/LanguageContext'

export default function TherapistScheduleManager({ isOpen, onClose, onScheduleUpdated }) {
  const { t } = useTranslation()
  const [therapists, setTherapists] = useState([])
  const [selectedTherapistId, setSelectedTherapistId] = useState('doc-1')

  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [breakStart, setBreakStart] = useState('13:00')
  const [breakEnd, setBreakEnd] = useState('14:00')
  const [workDays, setWorkDays] = useState([1, 2, 3, 4, 5])
  const [slotDuration, setSlotDuration] = useState(30)
  const [bufferMinutes, setBufferMinutes] = useState(15)
  const [blockedDates, setBlockedDates] = useState([])
  const [newBlockedDate, setNewBlockedDate] = useState('')

  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState('')
  const [saveError, setSaveError] = useState('')

  // New Therapist Onboarding State
  const [showAddTherapist, setShowAddTherapist] = useState(false)
  const [newName, setNewName] = useState('')
  const [newSpecialty, setNewSpecialty] = useState('Pediatric Speech Pathologist')
  const [newAvatar, setNewAvatar] = useState('👩‍⚕️')
  const [newBio, setNewBio] = useState('Certified speech therapist focusing on articulation, fluency, and vocal rehabilitation.')
  const [isCreatingTherapist, setIsCreatingTherapist] = useState(false)

  const daysOfWeekMap = [
    { label: t('daySun', 'Sun'), value: 0 },
    { label: t('dayMon', 'Mon'), value: 1 },
    { label: t('dayTue', 'Tue'), value: 2 },
    { label: t('dayWed', 'Wed'), value: 3 },
    { label: t('dayThu', 'Thu'), value: 4 },
    { label: t('dayFri', 'Fri'), value: 5 },
    { label: t('daySat', 'Sat'), value: 6 },
  ]

  // Load therapists on mount or when opened
  useEffect(() => {
    if (!isOpen) return
    fetch('/api/therapists')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.therapists && data.therapists.length > 0) {
          setTherapists(data.therapists)
          populateTherapistForm(data.therapists, selectedTherapistId)
        }
      })
      .catch(() => {})
  }, [isOpen])

  const populateTherapistForm = (therapistList, id) => {
    const doc = therapistList.find((t) => t.id === id) || therapistList[0]
    if (!doc) return
    setSelectedTherapistId(doc.id)
    setStartTime(doc.workingHours?.start || '09:00')
    setEndTime(doc.workingHours?.end || '17:00')
    setBreakStart(doc.workingHours?.breakStart || '13:00')
    setBreakEnd(doc.workingHours?.breakEnd || '14:00')
    setWorkDays(doc.workDays || [1, 2, 3, 4, 5])
    setSlotDuration(doc.slotDurationMinutes || 30)
    setBufferMinutes(doc.bufferMinutes ?? 15)
    setBlockedDates(doc.blockedDates || [])
  }

  const handleSelectTherapist = (id) => {
    populateTherapistForm(therapists, id)
  }

  const toggleWorkDay = (dayVal) => {
    setWorkDays((prev) =>
      prev.includes(dayVal) ? prev.filter((d) => d !== dayVal) : [...prev, dayVal].sort()
    )
  }

  const handleAddBlockedDate = () => {
    if (!newBlockedDate) return
    if (blockedDates.includes(newBlockedDate)) return
    setBlockedDates([...blockedDates, newBlockedDate].sort())
    setNewBlockedDate('')
  }

  const handleRemoveBlockedDate = (dateStr) => {
    setBlockedDates(blockedDates.filter((d) => d !== dateStr))
  }

  const handleCreateTherapist = async (e) => {
    e.preventDefault()
    if (!newName.trim()) {
      setSaveError('Please enter the therapist name.')
      return
    }

    setIsCreatingTherapist(true)
    setSaveError('')
    setSaveSuccess('')

    const payload = {
      name: newName.trim(),
      specialty: newSpecialty.trim(),
      avatar: newAvatar,
      bio: newBio.trim(),
      workingHours: {
        start: startTime,
        end: endTime,
        breakStart,
        breakEnd,
      },
      workDays,
      slotDurationMinutes: Number(slotDuration),
      bufferMinutes: Number(bufferMinutes),
    }

    try {
      const res = await fetch('/api/therapists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        const data = await res.json()
        const updatedList = data.therapists || [...therapists, data.therapist]
        setTherapists(updatedList)
        setSelectedTherapistId(data.therapist.id)
        setShowAddTherapist(false)
        setSaveSuccess(`🎉 Welcome ${data.therapist.name}! Your profile and appointment slots are now live for patient bookings.`)
        if (onScheduleUpdated) onScheduleUpdated(data.therapist)
        setNewName('')
      } else {
        const err = await res.json()
        setSaveError(err.error || 'Failed to create therapist profile.')
      }
    } catch {
      setSaveError('Network error registering new therapist.')
    } finally {
      setIsCreatingTherapist(false)
    }
  }

  const handleSaveSchedule = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setSaveSuccess('')
    setSaveError('')

    const payload = {
      workingHours: {
        start: startTime,
        end: endTime,
        breakStart,
        breakEnd,
      },
      workDays,
      slotDurationMinutes: Number(slotDuration),
      bufferMinutes: Number(bufferMinutes),
      blockedDates,
    }

    try {
      const res = await fetch(`/api/therapists/${selectedTherapistId}/schedule`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        const data = await res.json()
        setSaveSuccess(`✅ ${data.message || 'Schedule updated successfully!'}`)
        if (onScheduleUpdated) onScheduleUpdated(data.therapist)
        setTimeout(() => {
          setSaveSuccess('')
        }, 3000)
      } else {
        const err = await res.json()
        setSaveError(err.error || 'Failed to update schedule.')
      }
    } catch {
      setSaveError('Network error updating therapist schedule.')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-md">
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-[32px] border border-teal-100 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-teal-700 via-emerald-700 to-cyan-800 px-6 py-5 text-white">
          <div>
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider backdrop-blur-md">
              Therapist Portal
            </span>
            <h2 className="mt-1 text-xl font-extrabold lg:text-2xl">{t('therapistPortalTitle', 'Manage Availability & Time Slots')}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-sm font-bold text-white transition hover:bg-white/30"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSaveSchedule} className="flex-1 overflow-y-auto p-6 space-y-6">
          {saveSuccess && (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800">
              {saveSuccess}
            </div>
          )}
          {saveError && (
            <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-bold text-rose-800">
              ⚠️ {saveError}
            </div>
          )}

          {/* Practitioner Profile Selector & Onboarding Header */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  {t('selectPractitioner', 'Practitioner Profile')}
                </label>
                <p className="text-[11px] text-slate-400">Select an existing therapist or register a new clinician profile.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddTherapist(!showAddTherapist)}
                className="flex items-center gap-1.5 rounded-xl border border-teal-500/40 bg-teal-50 px-3.5 py-1.5 text-xs font-bold text-teal-800 shadow-sm transition hover:bg-teal-100"
              >
                <span>{showAddTherapist ? '✕ Cancel' : '➕ Register New Therapist'}</span>
              </button>
            </div>

            {showAddTherapist ? (
              <div className="rounded-2xl border-2 border-teal-500/40 bg-gradient-to-br from-teal-50/70 to-emerald-50/70 p-5 shadow-sm space-y-4 mb-4">
                <div className="flex items-center justify-between border-b border-teal-200/60 pb-2">
                  <h4 className="text-sm font-extrabold text-teal-950">👩‍⚕️ New Clinician Registration</h4>
                  <span className="rounded-full bg-teal-200/60 px-2 py-0.5 text-[10px] font-bold text-teal-900">Immediate Patient Booking</span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700">Full Name *</label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. Dr. Kavitha Rajan"
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold outline-none focus:border-teal-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700">Clinical Specialty</label>
                    <input
                      type="text"
                      value={newSpecialty}
                      onChange={(e) => setNewSpecialty(e.target.value)}
                      placeholder="e.g. Pediatric Speech & AAC"
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold outline-none focus:border-teal-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700">Profile Icon / Avatar</label>
                    <div className="mt-1 flex gap-2">
                      {['👩‍⚕️', '👨‍⚕️', '🩺', '🧠', '🌟', '👤'].map((av) => (
                        <button
                          key={av}
                          type="button"
                          onClick={() => setNewAvatar(av)}
                          className={`flex h-10 w-10 items-center justify-center rounded-xl border text-xl transition ${
                            newAvatar === av
                              ? 'border-teal-600 bg-white shadow-md ring-2 ring-teal-500/30 scale-105'
                              : 'border-slate-200 bg-slate-50 hover:bg-white'
                          }`}
                        >
                          {av}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700">Clinical Bio</label>
                    <input
                      type="text"
                      value={newBio}
                      onChange={(e) => setNewBio(e.target.value)}
                      placeholder="Specializes in speech clarity and fluency..."
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleCreateTherapist}
                    disabled={isCreatingTherapist || !newName.trim()}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-teal-700/20 transition hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    <span>{isCreatingTherapist ? 'Publishing...' : '🚀 Register Clinician & Publish Slots'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-3">
                {therapists.map((doc) => (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => handleSelectTherapist(doc.id)}
                    className={`flex items-center gap-2.5 rounded-2xl border p-3 text-left transition ${
                      doc.id === selectedTherapistId
                        ? 'border-teal-600 bg-teal-50 shadow-sm ring-2 ring-teal-600/20 font-bold'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-2xl">{doc.avatar}</span>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-900 truncate">{doc.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{doc.specialty}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Consultation Hours */}
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">{t('shiftHoursTitle', 'Daily Consultation Hours')}</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500">{t('shiftStart', 'Shift Start Time')}</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold outline-none focus:border-teal-500"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500">{t('shiftEnd', 'Shift End Time')}</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold outline-none focus:border-teal-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Lunch / Break Hours */}
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">{t('breakHoursTitle', 'Lunch / Break Hours (Auto-Blocked)')}</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500">{t('breakStartLabel', 'Break Start Time')}</label>
                <input
                  type="time"
                  value={breakStart}
                  onChange={(e) => setBreakStart(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold outline-none focus:border-teal-500"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500">{t('breakEndLabel', 'Break End Time')}</label>
                <input
                  type="time"
                  value={breakEnd}
                  onChange={(e) => setBreakEnd(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold outline-none focus:border-teal-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Active Work Days */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              {t('workDaysLabel', 'Working Days')}
            </label>
            <div className="flex flex-wrap gap-2">
              {daysOfWeekMap.map((d) => {
                const isActive = workDays.includes(d.value)
                return (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => toggleWorkDay(d.value)}
                    className={`rounded-2xl border px-4 py-2 text-xs font-bold transition ${
                      isActive
                        ? 'border-teal-600 bg-teal-600 text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {d.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Slot Duration & Buffer */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                {t('slotDurationLabel', 'Slot Duration')}
              </label>
              <select
                value={slotDuration}
                onChange={(e) => setSlotDuration(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold outline-none focus:border-teal-500"
              >
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                {t('bufferWindowLabel', 'Buffer Window Between Sessions')}
              </label>
              <select
                value={bufferMinutes}
                onChange={(e) => setBufferMinutes(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold outline-none focus:border-teal-500"
              >
                <option value={0}>0 Minutes</option>
                <option value={10}>10 Minutes</option>
                <option value={15}>15 Minutes</option>
                <option value={20}>20 Minutes</option>
              </select>
            </div>
          </div>

          {/* Block Specific Dates / Leaves */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('blockedDatesLabel', 'Block Out Dates / Leave Days')}
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={newBlockedDate}
                onChange={(e) => setNewBlockedDate(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-teal-500"
              />
              <button
                type="button"
                onClick={handleAddBlockedDate}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
              >
                {t('blockDateBtn', '➕ Block Date')}
              </button>
            </div>

            {blockedDates.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {blockedDates.map((dateStr) => (
                  <span
                    key={dateStr}
                    className="flex items-center gap-1.5 rounded-xl bg-rose-50 border border-rose-200 px-3 py-1 text-xs font-bold text-rose-800"
                  >
                    <span>🚫 {dateStr}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveBlockedDate(dateStr)}
                      className="ml-1 text-rose-500 hover:text-rose-900"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              {t('cancel', 'Cancel')}
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-2.5 text-xs font-extrabold text-white shadow-lg transition hover:from-teal-500 hover:to-emerald-500"
            >
              {isSaving ? 'Saving...' : t('saveScheduleBtn', 'Save Availability & Slots')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
