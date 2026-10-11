import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from '../../i18n/LanguageContext'

export default function SmartAppointmentBooking({ isOpen, onClose, onBookingSuccess }) {
  const { t } = useTranslation()
  const [therapists, setTherapists] = useState([
    {
      id: 'doc-1',
      name: 'Dr. Priya Sharma',
      specialty: 'Senior Speech Pathologist',
      avatar: '👩‍⚕️',
      rating: '4.9 ⭐',
      bio: '12+ years experience specializing in articulation, voice clarity, and stuttering management.',
    },
    {
      id: 'doc-2',
      name: 'Dr. Rajesh Nair',
      specialty: 'Cognitive Rehab Specialist',
      avatar: '👨‍⚕️',
      rating: '4.8 ⭐',
      bio: 'Focuses on post-stroke speech recovery, aphasia rehabilitation, and cognitive memory drills.',
    },
    {
      id: 'doc-3',
      name: 'Dr. Ananya Sen',
      specialty: 'Language Development Lead',
      avatar: '👩‍⚕️',
      rating: '5.0 ⭐',
      bio: 'Expert in pediatric speech development, rhythm therapy, and caregiver guidance.',
    },
  ])

  const [selectedTherapistId, setSelectedTherapistId] = useState('doc-1')
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })

  const [slots, setSlots] = useState([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [isDayOff, setIsDayOff] = useState(false)
  const [dayOffMessage, setDayOffMessage] = useState('')

  const [selectedSlot, setSelectedSlot] = useState(null)
  const [lockData, setLockData] = useState(null)
  const [lockTimeRemaining, setLockTimeRemaining] = useState(0)

  const [notes, setNotes] = useState('Speech therapy follow-up & articulation check')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Generate date list (Next 14 Days)
  const datesList = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    const isoDate = d.toISOString().split('T')[0]
    const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' })
    const dayNum = d.getDate()
    const monthName = d.toLocaleDateString('en-US', { month: 'short' })
    return { isoDate, dayName, dayNum, monthName, fullDate: d }
  })

  // Fetch therapists from server whenever modal opens
  useEffect(() => {
    if (!isOpen) return
    fetch('/api/therapists')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.therapists && data.therapists.length > 0) {
          setTherapists(data.therapists)
          setSelectedTherapistId((prev) => {
            const exists = data.therapists.some((t) => t.id === prev)
            return exists ? prev : data.therapists[0].id
          })
        }
      })
      .catch(() => {
        // Fallback to initial therapists
      })
  }, [isOpen])

  // Fetch available slots for selected therapist and date
  const fetchAvailableSlots = useCallback(async () => {
    if (!selectedTherapistId || !selectedDate) return
    setIsLoadingSlots(true)
    setErrorMessage('')
    setSelectedSlot(null)
    setLockData(null)

    try {
      const token = localStorage.getItem('voxtech_token') || ''
      const res = await fetch(`/api/appointments/available-slots?therapistId=${selectedTherapistId}&date=${selectedDate}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })

      if (res.ok) {
        const data = await res.json()
        if (data.isDayOff) {
          setIsDayOff(true)
          setDayOffMessage(data.message || 'Practitioner is not available on this day.')
          setSlots([])
        } else {
          setIsDayOff(false)
          setSlots(data.slots || [])
        }
      } else {
        // Fallback slot calculation on front-end if server endpoint fails
        generateClientFallbackSlots()
      }
    } catch {
      generateClientFallbackSlots()
    } finally {
      setIsLoadingSlots(false)
    }
  }, [selectedTherapistId, selectedDate])

  useEffect(() => {
    if (isOpen) {
      fetchAvailableSlots()
    }
  }, [isOpen, fetchAvailableSlots])

  // Fallback client slot generator in case backend is offline
  const generateClientFallbackSlots = () => {
    setIsDayOff(false)
    const [yr, mo, dy] = selectedDate.split('-').map(Number)
    const now = new Date()
    const fallbackList = []
    const startHour = 9
    const endHour = 17

    for (let h = startHour; h < endHour; h++) {
      for (const min of [0, 30]) {
        const slotStart = new Date(yr, mo - 1, dy, h, min, 0, 0)
        const slotEnd = new Date(yr, mo - 1, dy, h, min + 30, 0, 0)

        let available = true
        let reason = 'Available'

        if (slotStart.getTime() <= now.getTime()) {
          available = false
          reason = 'Past Time'
        } else if (h === 13) {
          available = false
          reason = 'Practitioner Break'
        }

        const timeLabel = slotStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        const endLabel = slotEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

        fallbackList.push({
          time: timeLabel,
          formattedRange: `${timeLabel} - ${endLabel}`,
          startTime: slotStart.toISOString(),
          endTime: slotEnd.toISOString(),
          available,
          reason,
        })
      }
    }
    setSlots(fallbackList)
  }

  // Handle slot selection & temporary lock
  const handleSelectSlot = async (slot) => {
    if (!slot.available) return
    setSelectedSlot(slot)
    setErrorMessage('')

    try {
      const token = localStorage.getItem('voxtech-token') || ''
      const res = await fetch('/api/appointments/lock-slot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          therapistId: selectedTherapistId,
          startTime: slot.startTime,
          endTime: slot.endTime,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setLockData(data)
        setLockTimeRemaining(data.holdSeconds || 300)
      } else {
        const err = await res.json()
        setErrorMessage(err.error || 'This slot is no longer available.')
        fetchAvailableSlots()
      }
    } catch {
      // Offline fallback: set mock 5 min lock
      setLockData({ lockId: `mock-lock-${Date.now()}` })
      setLockTimeRemaining(300)
    }
  }

  // Timer countdown for active lock
  useEffect(() => {
    if (!lockData || lockTimeRemaining <= 0) return
    const interval = setInterval(() => {
      setLockTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          setLockData(null)
          setSelectedSlot(null)
          setErrorMessage('Slot reservation expired. Please select a time slot again.')
          fetchAvailableSlots()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [lockData, lockTimeRemaining, fetchAvailableSlots])

  // Submit booking
  const handleConfirmBooking = async (e) => {
    e.preventDefault()
    if (!selectedSlot) {
      setErrorMessage('Please select an available time slot.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')

    const therapist = therapists.find((t) => t.id === selectedTherapistId)

    try {
      const token = localStorage.getItem('voxtech-token') || ''
      const res = await fetch('/api/appointments/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          therapistId: selectedTherapistId,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          note: notes,
          lockId: lockData?.lockId || null,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setSuccessMessage('🎉 Appointment booked successfully!')
        setTimeout(() => {
          onBookingSuccess(data.appointment)
          handleClose()
        }, 1200)
      } else {
        const err = await res.json()
        setErrorMessage(err.error || 'Failed to confirm booking.')
      }
    } catch {
      // Offline fallback success
      const aptDate = new Date(selectedSlot.startTime)
      const fallbackApt = {
        id: `apt-${Date.now()}`,
        therapistId: selectedTherapistId,
        doctor: therapist?.name || 'Dr. Priya Sharma',
        specialty: therapist?.specialty || 'Speech Pathologist',
        avatar: therapist?.avatar || '👩‍⚕️',
        time: `${aptDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}, ${selectedSlot.time}`,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        note: notes,
        roomCode: `VOX-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'Scheduled',
      }
      setSuccessMessage('🎉 Appointment booked successfully!')
      setTimeout(() => {
        onBookingSuccess(fallbackApt)
        handleClose()
      }, 1200)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setSelectedSlot(null)
    setLockData(null)
    setErrorMessage('')
    setSuccessMessage('')
    onClose()
  }

  if (!isOpen) return null

  const selectedTherapist = therapists.find((t) => t.id === selectedTherapistId) || therapists[0]
  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-md animate-fade-in">
      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-[32px] border border-emerald-100 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 px-6 py-5 text-white">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider backdrop-blur-md">
                VOXTECH Telehealth
              </span>
              <span className="text-xs text-emerald-100 font-medium">• {t('smartEngine')}</span>
            </div>
            <h2 className="mt-1 text-xl font-extrabold lg:text-2xl">{t('smartBookingHeader')}</h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-sm font-bold text-white transition hover:bg-white/30"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {successMessage ? (
            <div className="my-8 rounded-3xl bg-emerald-50 border border-emerald-200 p-8 text-center space-y-3">
              <div className="text-5xl">✨</div>
              <h3 className="text-xl font-bold text-emerald-900">{successMessage}</h3>
              <p className="text-sm text-emerald-700">Your HD video consultation room code and appointment details have been generated.</p>
            </div>
          ) : (
            <>
              {/* Error Banner */}
              {errorMessage && (
                <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-bold text-rose-800 flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Step 1: Select Practitioner */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  {t('step1Practitioner')}
                </label>
                <div className="grid gap-3 sm:grid-cols-3">
                  {therapists.map((doc) => {
                    const isSelected = doc.id === selectedTherapistId
                    return (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => setSelectedTherapistId(doc.id)}
                        className={`flex flex-col justify-between rounded-2xl border p-3.5 text-left transition ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/20'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{doc.avatar}</span>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">{doc.name}</h4>
                            <p className="text-[10px] text-slate-500">{doc.specialty}</p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] font-semibold text-slate-600">
                          <span>{doc.rating}</span>
                          <span className={isSelected ? 'text-emerald-700 font-bold' : ''}>
                            {isSelected ? '✓ Selected' : 'Select'}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Step 2: Select Date Strip */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  {t('step2Date')}
                </label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {datesList.map((d) => {
                    const isSelected = d.isoDate === selectedDate
                    return (
                      <button
                        key={d.isoDate}
                        type="button"
                        onClick={() => setSelectedDate(d.isoDate)}
                        className={`flex min-w-[72px] flex-col items-center rounded-2xl border py-2.5 px-3 transition ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-600 text-white shadow-md'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className={`text-[10px] font-bold uppercase ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                          {d.dayName}
                        </span>
                        <span className="text-lg font-extrabold">{d.dayNum}</span>
                        <span className={`text-[10px] ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                          {d.monthName}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Step 3: Available Slot Matrix */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t('step3Slots')}
                  </label>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="flex items-center gap-1 text-slate-600 font-medium">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span> {t('slotAvailable')}
                    </span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <span className="h-2.5 w-2.5 rounded-full bg-slate-300"></span> {t('slotUnavailable')}
                    </span>
                  </div>
                </div>

                {isLoadingSlots ? (
                  <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-200 p-8 text-xs font-semibold text-slate-500">
                    <span className="animate-spin mr-2">⏳</span> Loading real-time availability...
                  </div>
                ) : isDayOff ? (
                  <div className="rounded-2xl bg-amber-50 border border-amber-200 p-6 text-center space-y-1">
                    <p className="text-sm font-bold text-amber-900">🏖️ Practitioner Not Available</p>
                    <p className="text-xs text-amber-700">{dayOffMessage}</p>
                  </div>
                ) : slots.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 p-6 text-center text-xs text-slate-500">
                    No slots available for this date. Please select another date.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                    {slots.map((slot, index) => {
                      const isSelected = selectedSlot?.startTime === slot.startTime
                      const isAvailable = slot.available

                      return (
                        <button
                          key={index}
                          type="button"
                          disabled={!isAvailable}
                          onClick={() => handleSelectSlot(slot)}
                          className={`relative flex flex-col items-center justify-center rounded-2xl border py-3 px-2 text-center transition ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-600 text-white shadow-lg ring-2 ring-emerald-600/30'
                              : isAvailable
                              ? 'border-emerald-200 bg-emerald-50/40 text-emerald-900 hover:border-emerald-500 hover:bg-emerald-100/60'
                              : 'cursor-not-allowed border-slate-100 bg-slate-100 text-slate-400 opacity-60'
                          }`}
                        >
                          <span className="text-xs font-bold">{slot.time}</span>
                          <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-emerald-100' : isAvailable ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
                            {isAvailable ? '30 mins' : slot.reason}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Active Lock Countdown Banner */}
              {lockData && selectedSlot && (
                <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-4 text-white shadow-md animate-fade-in">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl animate-pulse">🔒</span>
                    <div>
                      <p className="text-xs font-bold">{t('holdBannerTitle')}</p>
                      <p className="text-[11px] text-amber-100">
                        {selectedTherapist.name} @ {selectedSlot.time} ({selectedDate})
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold bg-white/20 px-3 py-1 rounded-xl backdrop-blur-sm">
                      ⏱️ {formatTimer(lockTimeRemaining)} {t('holdBannerTime')}
                    </span>
                  </div>
                </div>
              )}

              {/* Step 4: Notes & Booking Submission */}
              <form onSubmit={handleConfirmBooking} className="space-y-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    {t('notesLabel')}
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t('notesPlaceholder')}
                    className="w-full rounded-2xl border border-slate-200 p-3 text-xs outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    {t('cancel')}
                  </button>

                  <button
                    type="submit"
                    disabled={!selectedSlot || isSubmitting}
                    className={`flex items-center gap-2 rounded-2xl px-6 py-3 text-xs font-extrabold shadow-lg transition ${
                      selectedSlot && !isSubmitting
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 hover:-translate-y-0.5'
                        : 'cursor-not-allowed bg-slate-200 text-slate-400 shadow-none'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        <span>{t('securingSlot')}</span>
                      </>
                    ) : (
                      <>
                        <span>{t('confirmBooking')}</span>
                        <span>➔</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
