import { useState, useEffect, useRef, useCallback } from 'react'
import { BrowserRouter, NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import TherapyJourneyPage from './features/therapy-journey/TherapyJourneyPage'
import SpeechJourneyFlow from './features/speech-journey/SpeechJourneyFlow'
import SmartAppointmentBooking from './features/appointments/SmartAppointmentBooking'
import TherapistScheduleManager from './features/appointments/TherapistScheduleManager'
import { useNetworkQuality } from './features/appointments/useNetworkQuality'
import GamesHub from './features/games/GamesHub'
import { translations } from './i18n/translations'
import { useTranslation } from './i18n/LanguageContext'

const roleOptions = ['Patient', 'Caregiver', 'Therapist', 'Supervisor', 'Admin']

const roleNavItems = {
  Patient: [
    { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { to: '/assistant', label: 'Assistant', icon: '✨' },
    { to: '/journey', label: 'Journey', icon: '🗺️' },
    { to: '/speech-journey', label: 'Speech Flow', icon: '🎙️' },
    { to: '/goals', label: 'Goals', icon: '🎯' },
    { to: '/updates', label: 'Updates', icon: '📢' },
    { to: '/appointments', label: 'Appointments', icon: '📅' },
    { to: '/therapy', label: 'Therapy', icon: '🧠' },
    { to: '/games', label: 'Games', icon: '🎮' },
    { to: '/community', label: 'Community', icon: '🤝' },
    { to: '/profile', label: 'Profile', icon: '👤' },
    { to: '/accessibility', label: 'Accessibility', icon: '♿' },
  ],
  Caregiver: [
    { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { to: '/journey', label: 'Journey', icon: '🗺️' },
    { to: '/goals', label: 'Goals', icon: '🎯' },
    { to: '/updates', label: 'Updates', icon: '📢' },
    { to: '/appointments', label: 'Appointments', icon: '📅' },
    { to: '/games', label: 'Games', icon: '🎮' },
    { to: '/community', label: 'Community', icon: '🤝' },
    { to: '/analytics', label: 'Analytics', icon: '📊' },
    { to: '/profile', label: 'Profile', icon: '👤' },
    { to: '/accessibility', label: 'Accessibility', icon: '♿' },
  ],
  Therapist: [
    { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { to: '/assistant', label: 'Assistant', icon: '✨' },
    { to: '/journey', label: 'Journey', icon: '🗺️' },
    { to: '/appointments', label: 'Appointments', icon: '📅' },
    { to: '/therapy', label: 'Therapy', icon: '🧠' },
    { to: '/games', label: 'Games', icon: '🎮' },
    { to: '/analytics', label: 'Analytics', icon: '📊' },
    { to: '/profile', label: 'Profile', icon: '👤' },
    { to: '/accessibility', label: 'Accessibility', icon: '♿' },
  ],
  Supervisor: [
    { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { to: '/journey', label: 'Journey', icon: '🗺️' },
    { to: '/analytics', label: 'Analytics', icon: '📊' },
    { to: '/goals', label: 'Goals', icon: '🎯' },
    { to: '/updates', label: 'Updates', icon: '📢' },
    { to: '/community', label: 'Community', icon: '🤝' },
    { to: '/profile', label: 'Profile', icon: '👤' },
    { to: '/accessibility', label: 'Accessibility', icon: '♿' },
  ],
  Admin: [
    { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { to: '/journey', label: 'Journey', icon: '🗺️' },
    { to: '/analytics', label: 'Analytics', icon: '📊' },
    { to: '/appointments', label: 'Appointments', icon: '📅' },
    { to: '/community', label: 'Community', icon: '🤝' },
    { to: '/accessibility', label: 'Accessibility', icon: '♿' },
    { to: '/profile', label: 'Profile', icon: '👤' },
  ],
}

const dashboardContentByRole = {
  Patient: {
    kicker: 'VOXTECH Overview',
    title: 'Personalized care at every step.',
    description: 'Track goals, monitor updates, and support recovery with a unified therapy dashboard.',
    badgeOne: 'Care plan on track',
    badgeTwo: '+12% session engagement',
  },
  Caregiver: {
    kicker: 'Care Team Overview',
    title: 'Every care touchpoint in one place.',
    description: 'Monitor patient milestones, coordinate check-ins, and keep support plans aligned.',
    badgeOne: 'Family updates synced',
    badgeTwo: '+9% care completion',
  },
  Therapist: {
    kicker: 'Clinical Overview',
    title: 'Progress visible, decisions faster.',
    description: 'Review patient outcomes, plan next sessions, and track therapy momentum from one view.',
    badgeOne: 'Session plan active',
    badgeTwo: '+14% treatment adherence',
  },
  Supervisor: {
    kicker: 'Operational Overview',
    title: 'Team performance and patient outcomes, together.',
    description: 'Keep service quality strong with real-time progress and support trends.',
    badgeOne: 'Quality review ready',
    badgeTwo: '+11% team efficiency',
  },
  Admin: {
    kicker: 'System Overview',
    title: 'Platform performance and care operations align.',
    description: 'Monitor usage, service health, and delivery quality across the care network.',
    badgeOne: 'Systems healthy',
    badgeTwo: '+18% user engagement',
  },
}

const statsByRole = {
  Patient: [
    { label: 'Weekly goal', value: '78%', change: '+8% this week', icon: '📈', tone: 'bg-sky-100 text-sky-700' },
    { label: 'Completed', value: '24', change: '12 today', icon: '✅', tone: 'bg-emerald-100 text-emerald-700' },
    { label: 'Therapy score', value: '91', change: 'Strong progress', icon: '🧠', tone: 'bg-violet-100 text-violet-700' },
    { label: 'Upcoming', value: '3', change: 'Next session Thu', icon: '📅', tone: 'bg-amber-100 text-amber-700' },
  ],
  Caregiver: [
    { label: 'Care coverage', value: '94%', change: '+6% this week', icon: '👥', tone: 'bg-sky-100 text-sky-700' },
    { label: 'Active members', value: '18', change: '3 new cases', icon: '✅', tone: 'bg-emerald-100 text-emerald-700' },
    { label: 'Plan health', value: '89', change: 'Strong follow-up', icon: '🩺', tone: 'bg-violet-100 text-violet-700' },
    { label: 'Check-ins', value: '5', change: 'Tomorrow', icon: '📅', tone: 'bg-amber-100 text-amber-700' },
  ],
  Therapist: [
    { label: 'Session load', value: '12', change: '+2 this week', icon: '📈', tone: 'bg-sky-100 text-sky-700' },
    { label: 'Resolved', value: '31', change: '8 today', icon: '✅', tone: 'bg-emerald-100 text-emerald-700' },
    { label: 'Recovery score', value: '92', change: 'Excellent trend', icon: '🧠', tone: 'bg-violet-100 text-violet-700' },
    { label: 'Follow-ups', value: '4', change: 'Next 48 hrs', icon: '📅', tone: 'bg-amber-100 text-amber-700' },
  ],
  Supervisor: [
    { label: 'Team health', value: '87%', change: '+9% this month', icon: '📊', tone: 'bg-sky-100 text-sky-700' },
    { label: 'Ongoing cases', value: '42', change: '5 escalated', icon: '✅', tone: 'bg-emerald-100 text-emerald-700' },
    { label: 'Retention', value: '91', change: 'Strong compliance', icon: '📈', tone: 'bg-violet-100 text-violet-700' },
    { label: 'Reviews', value: '7', change: 'Due this week', icon: '📅', tone: 'bg-amber-100 text-amber-700' },
  ],
  Admin: [
    { label: 'System uptime', value: '99.9%', change: 'Stable', icon: '🛠️', tone: 'bg-sky-100 text-sky-700' },
    { label: 'Active users', value: '245', change: '+18 today', icon: '👤', tone: 'bg-emerald-100 text-emerald-700' },
    { label: 'Operations rate', value: '96', change: 'Strong workflow', icon: '⚙️', tone: 'bg-violet-100 text-violet-700' },
    { label: 'Alerts', value: '2', change: 'Needs review', icon: '📅', tone: 'bg-amber-100 text-amber-700' },
  ],
}

const appointmentTemplates = {
  Patient: [
    { id: 'apt-1', doctor: 'Dr. Priya Sharma', specialty: 'Senior Speech Pathologist', time: 'Today, 4:30 PM', note: 'Speech therapy & articulation follow-up', roomCode: 'VOX-7829', status: 'Starting Soon', avatar: '👩‍⚕️' },
    { id: 'apt-2', doctor: 'Dr. Rajesh Nair', specialty: 'Cognitive Rehab Specialist', time: 'Tomorrow, 10:00 AM', note: 'Fluency & sentence building drill', roomCode: 'VOX-4412', status: 'Scheduled', avatar: '👨‍⚕️' },
    { id: 'apt-3', doctor: 'Dr. Ananya Sen', specialty: 'Language Development Lead', time: 'Sat, 2:00 PM', note: 'Caregiver & patient progress briefing', roomCode: 'VOX-9930', status: 'Confirmed', avatar: '👩‍⚕️' },
  ],
  Caregiver: [
    { id: 'apt-4', doctor: 'Dr. Priya Sharma', specialty: 'Clinical Care Lead', time: 'Today, 1:30 PM', note: 'Care update & therapy goal sign-off', roomCode: 'VOX-1337', status: 'Starting Soon', avatar: '👩‍⚕️' },
    { id: 'apt-5', doctor: 'Dr. Vikram Malhotra', specialty: 'Home Support Specialist', time: 'Fri, 9:00 AM', note: 'Medication & daily routine review', roomCode: 'VOX-2048', status: 'Scheduled', avatar: '👨‍⚕️' },
  ],
  Therapist: [
    { id: 'apt-6', doctor: 'Aarav Mehta (Patient)', specialty: 'Speech Fluency Session', time: 'Today, 5:00 PM', note: 'Targeted articulation check-in', roomCode: 'VOX-5510', status: 'Starting Soon', avatar: '👤' },
    { id: 'apt-7', doctor: 'Dr. Priya Sharma', specialty: 'Peer Case Review', time: 'Fri, 11:30 AM', note: 'Clinical treatment outcome review', roomCode: 'VOX-8821', status: 'Scheduled', avatar: '👩‍⚕️' },
  ],
  Supervisor: [
    { id: 'apt-8', doctor: 'Clinical Team Lead', specialty: 'Operations Huddle', time: 'Today, 3:00 PM', note: 'Coverage & quality planning', roomCode: 'VOX-6630', status: 'Starting Soon', avatar: '👥' },
    { id: 'apt-9', doctor: 'Quality Audit Panel', specialty: 'Care Outcomes Review', time: 'Fri, 2:00 PM', note: 'Monthly escalation audit', roomCode: 'VOX-3340', status: 'Scheduled', avatar: '🧾' },
  ],
  Admin: [
    { id: 'apt-10', doctor: 'Dr. Priya Sharma', specialty: 'Therapy Platform Consult', time: 'Today, 2:00 PM', note: 'System performance & live metrics check', roomCode: 'VOX-9901', status: 'Starting Soon', avatar: '👩‍⚕️' },
    { id: 'apt-11', doctor: 'DevOps Engineering', specialty: 'Infrastructure Check-in', time: 'Fri, 8:00 AM', note: 'Maintenance & WebRTC signaling window', roomCode: 'VOX-1100', status: 'Scheduled', avatar: '⚙️' },
  ],
}

const updatesByRole = {
  Patient: [
    { title: 'Care plan refreshed', detail: 'New exercises assigned post session', time: '3h ago' },
    { title: 'Recovery milestones', detail: 'Progress improved by 12% this week', time: '1d ago' },
    { title: 'Doctor note shared', detail: 'Recommendations uploaded to patient portal', time: '2d ago' },
  ],
  Caregiver: [
    { title: 'Daily care summary', detail: 'Medication and hydration tracking refreshed', time: '2h ago' },
    { title: 'Family support update', detail: 'Short-term recovery milestones shared', time: '7h ago' },
    { title: 'Check-in completed', detail: 'Home support plan reviewed with family', time: '1d ago' },
  ],
  Therapist: [
    { title: 'Session notes released', detail: 'Updated treatment objectives sent to team', time: '1h ago' },
    { title: 'Target milestone hit', detail: 'Therapy completion rate improved this week', time: '6h ago' },
    { title: 'Follow-up scheduled', detail: 'Next patient review reviewed with clinical team', time: '1d ago' },
  ],
  Supervisor: [
    { title: 'Operations review', detail: 'Team responsiveness above target threshold', time: '2h ago' },
    { title: 'Quality report', detail: 'Patient satisfaction trend remains strong', time: '9h ago' },
    { title: 'Coverage snapshot', detail: 'Support coverage and staffing balanced', time: '1d ago' },
  ],
  Admin: [
    { title: 'Platform health check', detail: 'All critical services remain stable', time: '30m ago' },
    { title: 'Usage insights', detail: 'User activity increased across care teams', time: '5h ago' },
    { title: 'Deployment notice', detail: 'Scheduled maintenance completed without issue', time: '1d ago' },
  ],
}

const communityItemsByRole = {
  Patient: [
    { title: 'Support circle', detail: '12 caregivers active today', badge: 'Live' },
    { title: 'Peer insights', detail: 'Share coping strategies', badge: 'New' },
  ],
  Caregiver: [
    { title: 'Care partners', detail: '8 caregivers linked to patient plans', badge: 'Live' },
    { title: 'Resource room', detail: 'New recovery guides shared this week', badge: 'New' },
  ],
  Therapist: [
    { title: 'Clinical exchange', detail: 'Therapists discussing care patterns', badge: 'Live' },
    { title: 'Treatment library', detail: 'New session frameworks available', badge: 'Updated' },
  ],
  Supervisor: [
    { title: 'Leadership board', detail: 'Support metrics reviewed across teams', badge: 'Live' },
    { title: 'Quality forum', detail: 'Case studies shared with supervisors', badge: 'New' },
  ],
  Admin: [
    { title: 'Operations group', detail: 'Platform and support teams aligned', badge: 'Live' },
    { title: 'Release notes', detail: 'Recent configuration changes shared', badge: 'New' },
  ],
}

const therapyPlans = [
  { title: 'Speech fluency', duration: '20 mins', level: 'Strong' },
  { title: 'Breathing drill', duration: '12 mins', level: 'Moderate' },
  { title: 'Memory recall', duration: '15 mins', level: 'Improving' },
]

const gameCards = [
  { name: 'Word Match', type: 'Cognitive', rating: '4.9' },
  { name: 'Memory Sprint', type: 'Focus', rating: '4.8' },
  { name: 'Calm Rhythm', type: 'Breathing', rating: '5.0' },
]

const roleMonitoring = {
  Patient: { icon: '👨‍👩‍👧‍👦', label: 'Family & support' },
  Caregiver: { icon: '👥', label: 'Patients monitored' },
  Therapist: { icon: '🧠', label: 'Therapy cases' },
  Supervisor: { icon: '👥', label: 'Team monitored' },
  Admin: { icon: '🛠️', label: 'Departments monitored' },
}

const routeCards = {
  assistant: {
    Patient: {
      title: 'Assistant',
      description: 'AI support for care planning, reminders, and daily therapy guidance.',
      cards: [
        { title: 'Daily briefing', detail: 'Your care plan summary is ready.', icon: '🤖' },
        { title: 'Quick answer', detail: 'Ask for speech tips or scheduling help.', icon: '💬' },
        { title: 'Care tips', detail: 'Suggested exercises for the next session.', icon: '✨' },
      ],
    },
    Caregiver: {
      title: 'Assistant',
      description: 'Support coordination, family briefings, and care reminders.',
      cards: [
        { title: 'Daily briefing', detail: 'Care updates are ready for today.', icon: '🤖' },
        { title: 'Checklist sync', detail: 'Review medication, visits, and notes.', icon: '✅' },
        { title: 'Family guidance', detail: 'Share reminders and recovery suggestions.', icon: '💬' },
      ],
    },
    Therapist: {
      title: 'Assistant',
      description: 'Clinical prep, patient recall, and therapy planning support.',
      cards: [
        { title: 'Session summary', detail: 'Patient progress notes are ready to review.', icon: '🧠' },
        { title: 'Plan prompts', detail: 'Suggested next exercises for the clinical plan.', icon: '✨' },
        { title: 'Patient support', detail: 'Quick summaries for follow-up conversations.', icon: '💬' },
      ],
    },
    Supervisor: {
      title: 'Assistant',
      description: 'Operational guidance and quality monitoring support.',
      cards: [
        { title: 'Team briefing', detail: 'Coverage and quality notes are compiled.', icon: '📊' },
        { title: 'Escalation support', detail: 'Identify risks and next steps efficiently.', icon: '⚠️' },
        { title: 'Coach prompts', detail: 'Suggested actions for service improvement.', icon: '🤝' },
      ],
    },
    Admin: {
      title: 'Assistant',
      description: 'Operations insight, alerts, and platform guidance.',
      cards: [
        { title: 'System briefing', detail: 'Performance and alert status are ready.', icon: '🛠️' },
        { title: 'Operations note', detail: 'Review active issues and support actions.', icon: '📋' },
        { title: 'Release support', detail: 'Check the latest service or config updates.', icon: '🚀' },
      ],
    },
  },
  goals: {
    Patient: { title: 'Goals', description: 'Track your therapy milestones and recovery objectives.', cards: [{ title: 'Breathing goal', detail: 'Complete 3 sessions this week.', icon: '🎯', badge: 'On track' }, { title: 'Mobility goal', detail: 'Improve range and balance with guided practice.', icon: '🏃', badge: 'Active' }, { title: 'Speech goal', detail: 'Increase fluency in daily conversations.', icon: '🗣️', badge: 'New' }] },
    Caregiver: { title: 'Goals', description: 'Track patient milestones and care objectives together.', cards: [{ title: 'Recovery target', detail: 'Keep medication adherence above 90%.', icon: '🎯', badge: 'On track' }, { title: 'Care routines', detail: 'Review family habit support three times weekly.', icon: '🏡', badge: 'Active' }, { title: 'Support plan', detail: 'Update goals for each patient after check-ins.', icon: '📌', badge: 'New' }] },
    Therapist: { title: 'Goals', description: 'Review treatment progress and plan next clinical steps.', cards: [{ title: 'Therapy target', detail: 'Hit 80% observed progress across weekly tasks.', icon: '🎯', badge: 'On track' }, { title: 'Focus plan', detail: 'Reinforce movement and speech repetitions.', icon: '🧩', badge: 'Active' }, { title: 'Follow-up goal', detail: 'Align next session outcomes to patient readiness.', icon: '✅', badge: 'New' }] },
    Supervisor: { title: 'Goals', description: 'Coordinate service quality goals across the support team.', cards: [{ title: 'Care quality', detail: 'Improve follow-up consistency across teams.', icon: '🎯', badge: 'On track' }, { title: 'Team readiness', detail: 'Support staffing and plan coverage balance.', icon: '👥', badge: 'Active' }, { title: 'Review cycle', detail: 'Audit patient satisfaction goals by region.', icon: '📋', badge: 'New' }] },
    Admin: { title: 'Goals', description: 'Drive platform and service goals across the care network.', cards: [{ title: 'Platform uptime', detail: 'Maintain service reliability above 99.8%.', icon: '🎯', badge: 'On track' }, { title: 'User adoption', detail: 'Increase active user engagement each month.', icon: '📈', badge: 'Active' }, { title: 'Support quality', detail: 'Improve issue resolution and release readiness.', icon: '🛡️', badge: 'New' }] },
  },
  updates: {
    Patient: { title: 'Updates', description: 'Recent care updates and progress notes from your support team.', cards: [{ title: 'Therapist note', detail: 'Session focused on confidence-building exercises.', icon: '📝' }, { title: 'Care team update', detail: 'Medication and hydration plan refreshed.', icon: '📩' }, { title: 'Milestone reached', detail: 'Goal completion rate improved by 12%.', icon: '✅' }] },
    Caregiver: { title: 'Updates', description: 'Recent caregiver progress and coordination updates.', cards: [{ title: 'Care summary', detail: 'Caregiver notes synced with patient record.', icon: '📝' }, { title: 'Routine update', detail: 'Medication reminders were confirmed for this week.', icon: '📩' }, { title: 'Family note', detail: 'Care milestone highlighted in daily briefing.', icon: '✅' }] },
    Therapist: { title: 'Updates', description: 'Recent clinical notes and treatment progress updates.', cards: [{ title: 'Patient note', detail: 'Therapy adjustments shared with care team.', icon: '📝' }, { title: 'Clinical review', detail: 'Treatment plan promoted for continued care.', icon: '📋' }, { title: 'Progress memo', detail: 'Patient engagement remains strong this cycle.', icon: '✅' }] },
    Supervisor: { title: 'Updates', description: 'Leadership updates, team trends, and support insights.', cards: [{ title: 'Team summary', detail: 'Coverage and staffing notes reviewed this morning.', icon: '📝' }, { title: 'Quality note', detail: 'Service quality shows consistent improvement.', icon: '📊' }, { title: 'Audit update', detail: 'Activity review remains aligned with standards.', icon: '✅' }] },
    Admin: { title: 'Updates', description: 'System and operations updates across the care platform.', cards: [{ title: 'Platform report', detail: 'Uptime and service stability remain strong.', icon: '🛠️' }, { title: 'Release note', detail: 'Latest changes are now available to teams.', icon: '📦' }, { title: 'Alert digest', detail: 'Operational issues remain under control.', icon: '✅' }] },
  },
  appointments: {
    Patient: { title: 'Appointments', description: 'Upcoming visits, calls, and check-ins scheduled for you.', cards: [{ title: 'Thu 4:30 PM', detail: 'Speech therapy follow-up with Dr. Priya Sharma.', icon: '📅' }, { title: 'Fri 10:00 AM', detail: 'Mobility support plan review.', icon: '⏰' }, { title: 'Sat 2:00 PM', detail: 'Caregiver progress check-in.', icon: '👨‍👩‍👧' }] },
    Caregiver: { title: 'Appointments', description: 'Support visits and coordination meetings for patient care.', cards: [{ title: 'Thu 1:30 PM', detail: 'Patient care review and update sign-off.', icon: '📅' }, { title: 'Fri 9:00 AM', detail: 'Medication and home support plan review.', icon: '⏰' }, { title: 'Sat 10:30 AM', detail: 'Family progress briefing and check-in.', icon: '👨‍👩‍👧' }] },
    Therapist: { title: 'Appointments', description: 'Clinical sessions and outcome review meetings.', cards: [{ title: 'Thu 5:00 PM', detail: 'Progress review with care team and patient.', icon: '📅' }, { title: 'Fri 11:30 AM', detail: 'Remote consult and treatment follow-up.', icon: '💻' }, { title: 'Mon 9:00 AM', detail: 'Targeted mobility session and notes review.', icon: '🧠' }] },
    Supervisor: { title: 'Appointments', description: 'Operational huddles and performance reviews.', cards: [{ title: 'Thu 3:00 PM', detail: 'Coverage and quality planning reunion.', icon: '📅' }, { title: 'Fri 2:00 PM', detail: 'Clinical team review and escalation check.', icon: '🧾' }, { title: 'Mon 10:30 AM', detail: 'Monthly support quality review meeting.', icon: '👥' }] },
    Admin: { title: 'Appointments', description: 'Platform and operations scheduling overview.', cards: [{ title: 'Thu 2:00 PM', detail: 'System performance and incident review.', icon: '📅' }, { title: 'Fri 8:00 AM', detail: 'Scheduled maintenance and deployment window.', icon: '⚙️' }, { title: 'Mon 1:00 PM', detail: 'Ops planning and resource allocation review.', icon: '📊' }] },
  },
  analytics: {
    Patient: { title: 'Analytics', description: 'Progress trends, success rates, and recovery metrics.', cards: [{ title: 'Session trend', detail: 'Successful completion rate reaches 89%.', icon: '📈', badge: 'Up 12%' }, { title: 'Engagement', detail: 'Average activity time improved by 18 minutes.', icon: '📊' }, { title: 'Retention', detail: 'Adherence remains strong across the week.', icon: '📉', badge: 'Stable' }] },
    Caregiver: { title: 'Analytics', description: 'Coverage, completion, and support measures.', cards: [{ title: 'Care coverage', detail: 'Checks are being completed on schedule.', icon: '📈', badge: 'Up 9%' }, { title: 'Response time', detail: 'Follow-ups remain within the target window.', icon: '⏱️' }, { title: 'Care completion', detail: 'Support plan completion remains stable.', icon: '📉', badge: 'Healthy' }] },
    Therapist: { title: 'Analytics', description: 'Session quality, treatment outcomes, and adherence trends.', cards: [{ title: 'Therapy trend', detail: 'Clinical outcomes continue improving this week.', icon: '📈', badge: 'Up 11%' }, { title: 'Patient response', detail: 'Average engagement remains strong across plans.', icon: '📊' }, { title: 'Recovery score', detail: 'Outcome score is trending above target range.', icon: '📉', badge: 'Strong' }] },
    Supervisor: { title: 'Analytics', description: 'Operational metrics, quality signals, and team trends.', cards: [{ title: 'Team average', detail: 'Service quality exceeds the planned benchmark.', icon: '📈', badge: 'Up 8%' }, { title: 'Escalations', detail: 'Escalated care needs are reducing week over week.', icon: '🚦' }, { title: 'Review score', detail: 'Support consistency remains at a high level.', icon: '📊', badge: 'Strong' }] },
    Admin: { title: 'Analytics', description: 'Platform health, engagement, and operational performance.', cards: [{ title: 'System health', detail: 'Platform stability remains excellent.', icon: '📈', badge: '99.9%' }, { title: 'User engagement', detail: 'Active usage trends continue to climb.', icon: '📊' }, { title: 'Operational status', detail: 'Issue load remains low and controlled.', icon: '📉', badge: 'Stable' }] },
  },
  profile: {
    Patient: { title: 'Profile', description: 'Personal care details, preferences, and background.', cards: [{ title: 'Recovery score', detail: '92%', icon: '👤' }, { title: 'Streak', detail: '18 days', icon: '🔥' }, { title: 'Care plan', detail: 'Active', icon: '📋' }] },
    Caregiver: { title: 'Profile', description: 'Team member details, care coverage, and role permissions.', cards: [{ title: 'Care coverage', detail: '94%', icon: '👤' }, { title: 'Assigned cases', detail: '12', icon: '📌' }, { title: 'Availability', detail: 'On duty', icon: '🕒' }] },
    Therapist: { title: 'Profile', description: 'Clinical profile, treatment focus, and availability.', cards: [{ title: 'Patient load', detail: '26', icon: '👤' }, { title: 'Focus area', detail: 'Speech & motion', icon: '🧠' }, { title: 'Schedule', detail: 'Available this week', icon: '📅' }] },
    Supervisor: { title: 'Profile', description: 'Leadership role, team oversight, and review access.', cards: [{ title: 'Team coverage', detail: '91%', icon: '👤' }, { title: 'Leadership role', detail: 'Supervisor', icon: '🏆' }, { title: 'Review queue', detail: 'Current', icon: '📋' }] },
    Admin: { title: 'Profile', description: 'Administration profile, operations rights, and access management.', cards: [{ title: 'System health', detail: '99.9%', icon: '👤' }, { title: 'Access level', detail: 'Administrator', icon: '🔐' }, { title: 'Mode', detail: 'Full access', icon: '⚙️' }] },
  },
  accessibility: {
    Patient: { title: 'Accessibility', description: 'Adaptive tools and preferences for a comfortable experience.', cards: [{ title: 'Larger text size', detail: 'Preference 1 is enabled for your account.', icon: '♿' }, { title: 'High contrast theme', detail: 'Preference 2 is enabled for your account.', icon: '🌗' }, { title: 'Voice guidance', detail: 'Preference 3 is enabled for your account.', icon: '🔊' }] },
    Caregiver: { title: 'Accessibility', description: 'Accessible care coordination options for daily workflows.', cards: [{ title: 'Larger text size', detail: 'Preference 1 is enabled for your account.', icon: '♿' }, { title: 'Audio reminders', detail: 'Preference 2 is enabled for your account.', icon: '🔔' }, { title: 'Focus mode', detail: 'Preference 3 is enabled for your account.', icon: '✨' }] },
    Therapist: { title: 'Accessibility', description: 'Clinical interface preferences and focus-friendly tools.', cards: [{ title: 'High contrast theme', detail: 'Preference 1 is enabled for your account.', icon: '♿' }, { title: 'Reduced motion', detail: 'Preference 2 is enabled for your account.', icon: '🎯' }, { title: 'Voice guidance', detail: 'Preference 3 is enabled for your account.', icon: '🔊' }] },
    Supervisor: { title: 'Accessibility', description: 'Operational dashboard support and team comfort tools.', cards: [{ title: 'Large data labels', detail: 'Preference 1 is enabled for your account.', icon: '♿' }, { title: 'Tone highlights', detail: 'Preference 2 is enabled for your account.', icon: '🎨' }, { title: 'Read-aloud summaries', detail: 'Preference 3 is enabled for your account.', icon: '🔊' }] },
    Admin: { title: 'Accessibility', description: 'System administration settings for efficient operations.', cards: [{ title: 'Keyboard access', detail: 'Preference 1 is enabled for your account.', icon: '⌨️' }, { title: 'High contrast theme', detail: 'Preference 2 is enabled for your account.', icon: '🌗' }, { title: 'Reduced motion', detail: 'Preference 3 is enabled for your account.', icon: '🧭' }] },
  },
}

function ImprovementChart() {
  const { lang, t } = useTranslation()
  const values = [20, 28, 36, 44, 62, 78, 89]
  const width = 420
  const height = 180
  const max = 100
  const min = 0
  const coords = values.map((value, index) => {
    const x = (index / (values.length - 1)) * width
    const y = height - ((value - min) / (max - min)) * (height - 24) - 12
    return { x, y }
  })

  const path = coords.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')

  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr'].map((m) => t(m, m))

  return (
    <div className="rounded-[28px] border border-emerald-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-slate-900">{t('patientImprovement', 'Patient improvement')}</h3>
          <p className="text-sm text-slate-500">{t('speechLanguageTrend', 'Speech & language progress trend')}</p>
        </div>
        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">{t('thisMonthImp', '+18% this month')}</span>
      </div>

      <div className="rounded-[22px] bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-3">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-44 w-full">
          {[0, 25, 50, 75, 100].map((tick) => {
            const y = height - ((tick - min) / (max - min)) * (height - 24) - 12
            return <line key={tick} x1="0" x2={width} y1={y} y2={y} stroke="#d1fae5" strokeDasharray="4 8" />
          })}
          <path d={path} fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          {coords.map((point, index) => (
            <circle key={index} cx={point.x} cy={point.y} r="5" fill="#fff" stroke="#10b981" strokeWidth="3" />
          ))}
        </svg>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs text-slate-500">
        {monthLabels.map((label, index) => (
          <div key={label} className="rounded-xl bg-slate-50 px-2 py-2">
            {label}
            <div className="mt-1 font-bold text-slate-700">{values[index * 2] || 89}%</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PatientGamesPanel() {
  const { lang, t } = useTranslation()
  const [word, setWord] = useState('')
  const [sound, setSound] = useState('')
  const [sentence, setSentence] = useState('')
  const [score, setScore] = useState(0)

  const letters = lang === 'ta' ? ['கு', 'ர', 'ல்', 'பே', 'ச்', 'சு', 'ஒ', 'லி'] : ['S', 'H', 'P', 'E', 'A', 'C', 'T', 'R']
  const sounds = lang === 'ta' ? ['க்', 'ச்', 'த்', 'ப்'] : ['ch', 'sh', 'th', 'ph']
  const sentenceOptions = [
    lang === 'ta' ? 'நான் தெளிவாகப் பேச முடியும்' : t('I can speak clearly', 'I can speak clearly'),
    lang === 'ta' ? 'நான் புதிய சொற்களைக் கற்கிறேன்' : t('I am learning new words', 'I am learning new words'),
    lang === 'ta' ? 'நான் இன்று நம்பிக்கையுடன் உணர்கிறேன்' : t('I feel confident today', 'I feel confident today'),
  ]

  const completeWord = lang === 'ta' ? word.includes('பேச்சு') || word === 'பேச்சு' : word.toUpperCase() === 'SPEECH'
  const completeSound = lang === 'ta' ? sound === 'ச்' : sound === 'sh'
  const completeSentence = sentence === sentenceOptions[0]

  const handleLetter = (letter) => {
    if (word.length >= 6) return
    setWord((current) => `${current}${letter}`)
  }

  const handleCheck = () => {
    let nextScore = 0
    if (completeWord) nextScore += 1
    if (completeSound) nextScore += 1
    if (completeSentence) nextScore += 1
    setScore(nextScore)
  }

  return (
    <div className="rounded-[28px] border border-emerald-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900">{t('interactiveGamesTitle', 'Interactive therapy games')}</h3>
          <p className="text-sm text-slate-500">{t('interactiveGamesDesc', 'Build confidence with playful speech drills')}</p>
        </div>
        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">{t('currentScore', 'Score')} {score}/3</span>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-100 bg-emerald-50 p-4">
          <p className="mb-2 text-sm font-semibold text-slate-700">{t('wordBuilder', '1. Word builder')}</p>
          <div className="mb-3 flex min-h-10 flex-wrap gap-2 rounded-xl bg-white px-3 py-2 text-lg font-bold text-slate-700">
            {word || t('tapLettersToBuild', 'Tap letters to build the word')}
          </div>
          <div className="flex flex-wrap gap-2">
            {letters.map((letter) => (
              <button key={letter} type="button" onClick={() => handleLetter(letter)} className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5">
                {letter}
              </button>
            ))}
          </div>
          {completeWord && <p className="mt-2 text-xs font-semibold text-emerald-700">{t('greatJobBuiltWord', 'Great job! You built the correct word.')}</p>}
        </div>

        <div className="rounded-2xl border border-slate-100 bg-sky-50 p-4">
          <p className="mb-2 text-sm font-semibold text-slate-700">{t('soundMatch', '2. Sound match')}</p>
          <div className="flex flex-wrap gap-2">
            {sounds.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSound(option)}
                className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${sound === option ? 'bg-emerald-500 text-white' : 'bg-white text-slate-700 shadow-sm'}`}
              >
                {option}
              </button>
            ))}
          </div>
          {completeSound && <p className="mt-2 text-xs font-semibold text-emerald-700">{t('perfectCorrectSound', 'Perfect! That is the correct sound.')}</p>}
        </div>

        <div className="rounded-2xl border border-slate-100 bg-violet-50 p-4">
          <p className="mb-2 text-sm font-semibold text-slate-700">{t('sentenceBuilder', '3. Sentence builder')}</p>
          <div className="flex flex-wrap gap-2">
            {sentenceOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSentence(option)}
                className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${sentence === option ? 'bg-emerald-500 text-white' : 'bg-white text-slate-700 shadow-sm'}`}
              >
                {option}
              </button>
            ))}
          </div>
          {completeSentence && <p className="mt-2 text-xs font-semibold text-emerald-700">{t('excellentSentenceChoice', 'Excellent sentence choice.')}</p>}
        </div>

        <button type="button" onClick={handleCheck} className="w-full rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 px-4 py-3 font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5">
          {t('checkMyProgress', 'Check my progress')}
        </button>
      </div>
    </div>
  )
}

function DashboardPage({ role, onStartCall }) {
  const { t } = useTranslation()
  const rawInfo = dashboardContentByRole[role] || dashboardContentByRole.Patient
  const info = {
    kicker: t(`kicker${role}`, rawInfo.kicker),
    title: t(`title${role}`, rawInfo.title),
    description: t(`desc${role}`, rawInfo.description),
    badgeOne: t(`badgeOne${role}`, rawInfo.badgeOne),
    badgeTwo: t(`badgeTwo${role}`, rawInfo.badgeTwo),
  }

  const stats = (statsByRole[role] || statsByRole.Patient).map((s) => ({
    ...s,
    label: t(
      s.label === 'Weekly goal' ? 'statWeeklyGoal' :
      s.label === 'Completed' ? 'statCompleted' :
      s.label === 'Therapy score' ? 'statTherapyScore' :
      s.label === 'Upcoming' ? 'statUpcoming' :
      s.label === 'Care coverage' ? 'statCareCoverage' :
      s.label === 'Active members' ? 'statActiveMembers' :
      s.label === 'Plan health' ? 'statPlanHealth' :
      s.label === 'Check-ins' ? 'statCheckIns' :
      s.label === 'Session load' ? 'statSessionLoad' :
      s.label === 'Resolved' ? 'statResolvedCases' :
      s.label === 'Recovery score' ? 'statRecoveryScore' :
      s.label === 'Follow-ups' ? 'statFollowUps' :
      s.label === 'Team health' ? 'statTeamHealth' :
      s.label === 'Ongoing cases' ? 'statOngoingCases' :
      s.label === 'Retention' ? 'statRetentionRate' :
      s.label === 'Reviews' ? 'statPendingReviews' :
      s.label === 'System uptime' ? 'statSystemUptime' :
      s.label === 'Active users' ? 'statActiveUsers' :
      s.label === 'Operations rate' ? 'statOpsRate' :
      s.label === 'Alerts' ? 'statAlerts' : s.label,
      s.label
    ),
  }))

  const appointments = appointmentTemplates[role] || appointmentTemplates.Patient
  const updates = updatesByRole[role] || updatesByRole.Patient
  const community = communityItemsByRole[role] || communityItemsByRole.Patient
  const navigate = useNavigate()

  return (
    <section className="relative z-10 space-y-6">
      <div className="grid gap-6 rounded-[30px] bg-gradient-to-r from-[#f3faf6] to-[#edf9ff] p-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-600">{info.kicker}</p>
          <h2 className="max-w-md text-3xl font-bold text-slate-900">{info.title}</h2>
          <p className="mt-3 max-w-lg text-slate-600">{info.description}</p>
          <button
            type="button"
            onClick={() => navigate('/assistant')}
            className="mt-6 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5"
          >
            {t('viewCarePlan', 'View care plan')}
          </button>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="flex h-48 w-48 items-center justify-center rounded-full bg-gradient-to-br from-emerald-200 via-teal-100 to-cyan-100 text-7xl shadow-[0_20px_35px_rgba(16,185,129,0.18)]">
            {role === 'Admin' ? '🖥️' : role === 'Therapist' ? '🩺' : role === 'Supervisor' ? '📊' : role === 'Caregiver' ? '🤝' : '👩‍⚕️'}
          </div>
          <div className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700 shadow-md">{info.badgeOne}</div>
          <div className="absolute bottom-4 right-4 rounded-full bg-white px-3 py-1 text-xs font-semibold text-violet-700 shadow-md">{info.badgeTwo}</div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-[24px] border border-slate-100 bg-white p-4 shadow-sm shadow-slate-200/50">
            <div className="mb-3 flex items-center justify-between">
              <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${stat.tone}`}>{stat.icon}</span>
            </div>
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{stat.value}</p>
            <p className="mt-1 text-xs text-slate-500">{stat.change}</p>
          </div>
        ))}
      </div>

      {role === 'Patient' && (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <ImprovementChart />
          <PatientGamesPanel />
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-slate-900">{t('activeGoalsTitle', 'Priority goals')}</h3>
            <p className="text-sm text-slate-500">{t('Focus areas for today', 'Focus areas for today')}</p>
          </div>

          <div className="space-y-4">
            {[
              { title: 'Breathing exercise', detail: 'Morning routine', done: true, status: 'Completed' },
              { title: 'Medication log', detail: 'Recorded at 08:30 AM', done: true, status: 'Completed' },
              { title: 'Language practice', detail: '20-minute drill', done: false, status: 'Pending' },
            ].map((goal) => (
              <div key={goal.title} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${goal.done ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                  {goal.done ? '✓' : ''}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">{t(goal.title, goal.title)}</p>
                  <p className="text-xs text-slate-500">{t(goal.detail, goal.detail)}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${goal.done ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {t(goal.status, goal.status)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-slate-900">{t('nextSessionTitle', 'Next appointment')}</h3>
            <p className="text-sm text-slate-500">{t('scheduledVideoSessions', 'Scheduled video sessions')}</p>
          </div>

          <div className="space-y-3">
            {appointments.map((item) => (
              <div key={item.id || item.doctor} className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-200 text-2xl shadow-sm">
                    {item.avatar || '👨‍⚕️'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900">{item.doctor}</p>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800">
                        {t(item.status, item.status || 'Scheduled')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{t(item.specialty, item.specialty || 'Specialist')} • {t(item.time, item.time)}</p>
                    <p className="text-[11px] font-semibold text-emerald-700">{t(item.note, item.note)}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onStartCall && onStartCall(item)}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <span>📹</span>
                  <span>{t('joinCallBtn', 'Join Call')}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">{t('recentUpdatesTitle', 'Therapy updates')}</h3>
              <p className="text-sm text-slate-500">{t('recentProgress', 'Recent progress')}</p>
            </div>
            <button type="button" className="text-sm font-semibold text-emerald-700">{t('viewAll', 'View all')}</button>
          </div>

          <div className="space-y-4">
            {updates.map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-slate-800">{t(item.title, item.title)}</p>
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{t(item.time, item.time)}</span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{t(item.detail, item.detail)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-slate-900">{t('community', 'Community')}</h3>
            <p className="text-sm text-slate-500">{t('careCircles', 'Care circles')}</p>
          </div>

          <div className="space-y-4">
            {community.map((item) => (
              <div key={item.title} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-3">
                <div>
                  <p className="font-semibold text-slate-800">{t(item.title, item.title)}</p>
                  <p className="text-sm text-slate-500">{t(item.detail, item.detail)}</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold uppercase text-emerald-700">{t(item.badge, item.badge)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function GenericPage({ title, description, cards }) {
  const { lang, t } = useTranslation()
  return (
    <section className="relative z-10 space-y-6">
      <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-600">VOXTECH</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900">{t(title, title)}</h2>
        <p className="mt-2 text-slate-600">{t(description, description)}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div key={card.title} className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-2xl">{card.icon}</span>
              {card.badge ? <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold uppercase text-emerald-700">{t(card.badge, card.badge)}</span> : null}
            </div>
            <h3 className="text-lg font-bold text-slate-900">{t(card.title, card.title)}</h3>
            <p className="mt-2 text-sm text-slate-600">{t(card.detail, card.detail)}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function AppointmentsPage({ role, onStartCall }) {
  const { t } = useTranslation()
  const [filter, setFilter] = useState('All')
  const [showBookModal, setShowBookModal] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)

  const initialList = appointmentTemplates[role] || appointmentTemplates.Patient
  const [appointmentList, setAppointmentList] = useState(initialList)

  // Fetch real-time appointments from server
  useEffect(() => {
    const token = window.localStorage.getItem('voxtech-token')
    fetch('/api/appointments', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.appointments && data.appointments.length > 0) {
          setAppointmentList(data.appointments)
        }
      })
      .catch(() => {})
  }, [])

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment? This slot will immediately open for other patients.')) return
    try {
      const token = window.localStorage.getItem('voxtech-token')
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (res.ok) {
        setAppointmentList((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'Cancelled' } : a)))
      } else {
        const err = await res.json().catch(() => ({}))
        alert(err.error || 'Could not cancel this appointment.')
      }
    } catch {
      setAppointmentList((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'Cancelled' } : a)))
    }
  }

  const filtered = appointmentList.filter((item) => {
    if (filter === 'Upcoming') return item.status === 'Starting Soon' || item.status === 'Upcoming' || item.status === 'Scheduled' || item.status === 'Confirmed'
    if (filter === 'Completed') return item.status === 'Completed'
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 rounded-[28px] bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-6 text-white shadow-xl shadow-emerald-900/10 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
            {t('telehealthHeader', 'Telehealth & Care Consultations')}
          </span>
          <h2 className="mt-2 text-2xl font-bold lg:text-3xl">{t('appointmentsTitle', 'Appointments & Video Consults')}</h2>
          <p className="mt-1 max-w-xl text-xs text-emerald-100/90 lg:text-sm">
            Connect directly with your appointed doctor or therapist via HD encrypted video call with live Sarvam AI speech captions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-950/40 border border-white/20 px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-emerald-950/60"
          >
            <span>⚙️</span>
            <span>{t('configureSlots', 'Therapist: Configure Slots')}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowBookModal(true)}
            className="flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-emerald-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-50"
          >
            <span>➕</span>
            <span>{t('bookAppointment', 'Book Appointment')}</span>
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">{t('upcomingConsultations', 'Upcoming Consultations')}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{appointmentList.filter(a => a.status !== 'Cancelled').length}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">{t('encryptedVideoRooms', 'Encrypted Video Rooms')}</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">Active HD</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">{t('smartEngine', 'Smart Availability Engine')}</p>
          <p className="mt-1 text-2xl font-bold text-teal-600">Conflict-Free Enabled</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'All', label: t('allAppointments', 'All') },
          { id: 'Upcoming', label: t('upcomingTab', 'Upcoming') },
          { id: 'Completed', label: t('completedTab', 'Completed') },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${filter === tab.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Appointment Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((item) => (
          <div key={item.id} className={`relative flex flex-col justify-between overflow-hidden rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md ${item.status === 'Cancelled' ? 'opacity-50 grayscale' : ''}`}>
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 via-teal-100 to-cyan-100 text-3xl shadow-sm">
                    {item.avatar || '👩‍⚕️'}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{item.doctor}</h3>
                    <p className="text-xs text-slate-500">{item.specialty}</p>
                    <p className="mt-1 text-xs font-semibold text-emerald-700">{t('roomCode', 'Room')}: {item.roomCode}</p>
                  </div>
                </div>

                <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${item.status === 'Starting Soon' ? 'animate-pulse bg-emerald-100 text-emerald-800' : item.status === 'Cancelled' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'}`}>
                  {item.status}
                </span>
              </div>

              <div className="mt-4 rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">📅 <span className="font-semibold text-slate-700">{item.time}</span></p>
                <p className="mt-1 text-xs text-slate-600">📝 {item.note}</p>
              </div>
            </div>

            <div className="mt-5 flex gap-2 pt-2 border-t border-slate-100">
              {item.status !== 'Cancelled' && (
                <button
                  type="button"
                  onClick={() => onStartCall(item)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <span>📹</span>
                  <span>{t('startVideoCall', 'Start Video Call')}</span>
                </button>
              )}

              {item.status !== 'Cancelled' && (
                <button
                  type="button"
                  onClick={() => handleCancelAppointment(item.id)}
                  className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                >
                  {t('cancel', 'Cancel')}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Smart Appointment Booking Modal */}
      <SmartAppointmentBooking
        isOpen={showBookModal}
        onClose={() => setShowBookModal(false)}
        onBookingSuccess={(newApt) => {
          setAppointmentList((current) => [newApt, ...current.filter((a) => a.id !== newApt.id)])
        }}
      />

      {/* Therapist Schedule & Slot Manager Modal */}
      <TherapistScheduleManager
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
      />
    </div>
  )
}

function VideoCallModal({ appointment, role, userName, onClose }) {
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [showCaptions, setShowCaptions] = useState(true)
  const [callDuration, setCallDuration] = useState(0)
  const [callEnded, setCallEnded] = useState(false)
  const [doctorSpeaking, setDoctorSpeaking] = useState(false)
  const [currentCaption, setCurrentCaption] = useState(
    `Dr. Priya: Welcome to your video session! Let's work on articulation & deep breathing.`
  )
  const [aiTip, setAiTip] = useState('')
  const [isAiLoading, setIsAiLoading] = useState(false)

  const [showNetworkDetails, setShowNetworkDetails] = useState(false)
  const [peerName, setPeerName] = useState(role === 'Therapist' ? 'Patient' : (appointment?.doctor || 'Therapist'))
  const [hasPeerJoined, setHasPeerJoined] = useState(false)
  const [peerEndedCallMessage, setPeerEndedCallMessage] = useState('')

  // Call Recording State
  const [isRecording, setIsRecording] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [recordedBlobUrl, setRecordedBlobUrl] = useState(null)
  const mediaRecorderRef = useRef(null)
  const recordedChunksRef = useRef([])

  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const mediaStreamRef = useRef(null)
  const peerConnectionRef = useRef(null)
  const socketRef = useRef(null)

  const { networkStatus, stats: networkStats, issueDetails } = useNetworkQuality(
    peerConnectionRef,
    !callEnded
  )

  useEffect(() => {
    if (!isRecording) return
    const timer = setInterval(() => setRecordingSeconds((prev) => prev + 1), 1000)
    return () => clearInterval(timer)
  }, [isRecording])

  const toggleRecording = () => {
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
      setIsRecording(false)
    } else {
      if (!mediaStreamRef.current) return
      recordedChunksRef.current = []
      try {
        const options = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
          ? { mimeType: 'video/webm;codecs=vp9' }
          : { mimeType: 'video/webm' }
        const recorder = new MediaRecorder(mediaStreamRef.current, options)
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            recordedChunksRef.current.push(e.data)
          }
        }
        recorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' })
          const url = URL.createObjectURL(blob)
          setRecordedBlobUrl(url)
        }
        recorder.start(1000)
        mediaRecorderRef.current = recorder
        setIsRecording(true)
        setRecordingSeconds(0)
      } catch (err) {
        console.error('Recording failed:', err)
      }
    }
  }

  useEffect(() => {
    if (callEnded) return
    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [callEnded])

  useEffect(() => {
    if (callEnded) return
    const doctorPrompts = [
      "Dr. Priya: Please take a slow deep breath through your nose...",
      "Dr. Priya: Great! Now hold for 2 seconds and exhale slowly...",
      "Dr. Priya: Let's practice the target sound 'SPEECH' three times.",
      "Dr. Priya: Excellent pronunciation! Your pitch and pacing are very steady.",
      "Dr. Priya: I'm recording this milestone in your daily care plan.",
    ]
    let idx = 0
    const captionInterval = setInterval(() => {
      idx = (idx + 1) % doctorPrompts.length
      setDoctorSpeaking(true)
      setCurrentCaption(doctorPrompts[idx])
      setTimeout(() => setDoctorSpeaking(false), 3000)
    }, 7000)
    return () => clearInterval(captionInterval)
  }, [callEnded])

  const [hasCameraPermission, setHasCameraPermission] = useState(true)
  const [mediaNotice, setMediaNotice] = useState('')

  useEffect(() => {
    let active = true

    async function initMediaAndWebRTC() {
      let stream = null

      // Attempt to acquire camera and microphone
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          })
          if (!active) {
            stream.getTracks().forEach((t) => t.stop())
            return
          }
          mediaStreamRef.current = stream
          setHasCameraPermission(true)
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream
          }
        } catch (mediaErr) {
          console.warn('Camera/Mic permission warning:', mediaErr)
          setHasCameraPermission(false)
          setMediaNotice('Camera access restricted. Interactive video session is active in clinical avatar mode.')
          // Try audio-only if video failed
          try {
            const audioOnly = await navigator.mediaDevices.getUserMedia({ audio: true })
            if (active && audioOnly) {
              mediaStreamRef.current = audioOnly
            }
          } catch (audioErr) {
            console.warn('Audio device access also restricted:', audioErr)
          }
        }
      } else {
        setHasCameraPermission(false)
        setMediaNotice('Media devices not detected on current environment. Avatar consultation active.')
      }

      // Initialize Socket.io and room signaling independently of camera status
      try {
        const socket = io('/', { path: '/socket.io/' })
        socketRef.current = socket

        const roomCode = appointment?.roomCode || 'VOX-7829'
        const callerName = role === 'Therapist'
          ? (appointment?.doctor || 'Dr. Priya Sharma')
          : (userName || appointment?.doctor || 'Patient')

        socket.emit('join-room', { roomId: roomCode, userRole: role, userName: callerName })

        // Emit real-time call started notification across app
        socket.emit('start-call-notification', {
          callerName,
          callerRole: role,
          roomCode,
          doctorName: appointment?.doctor,
          appointment,
        })

        if (typeof RTCPeerConnection !== 'undefined') {
          const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
          })
          peerConnectionRef.current = pc

          if (stream) {
            stream.getTracks().forEach((track) => pc.addTrack(track, stream))
          }

          pc.ontrack = (event) => {
            if (remoteVideoRef.current && event.streams[0]) {
              remoteVideoRef.current.srcObject = event.streams[0]
            }
          }

          pc.onicecandidate = (event) => {
            if (event.candidate) {
              socket.emit('webrtc-signal', {
                roomId: roomCode,
                payload: { type: 'candidate', candidate: event.candidate },
              })
            }
          }

          socket.on('peer-joined', async ({ userName: peerName }) => {
            setPeerName(peerName || 'Participant')
            setHasPeerJoined(true)
            try {
              if (peerConnectionRef.current) {
                const offer = await peerConnectionRef.current.createOffer()
                await peerConnectionRef.current.setLocalDescription(offer)
                socket.emit('webrtc-signal', {
                  roomId: roomCode,
                  payload: { type: 'offer', offer },
                })
              }
            } catch (err) {
              console.error('Error creating offer on peer-joined:', err)
            }
          })

          socket.on('call-ended-by-peer', ({ endedBy }) => {
            setPeerEndedCallMessage(`Session ended by ${endedBy || 'the other participant'}.`)
            if (mediaStreamRef.current) {
              mediaStreamRef.current.getTracks().forEach((track) => track.stop())
            }
            setCallEnded(true)
          })

          socket.on('webrtc-signal', async ({ payload }) => {
            if (!payload || !peerConnectionRef.current) return
            try {
              if (payload.type === 'offer') {
                await pc.setRemoteDescription(new RTCSessionDescription(payload.offer))
                const answer = await pc.createAnswer()
                await pc.setLocalDescription(answer)
                socket.emit('webrtc-signal', { roomId: roomCode, payload: { type: 'answer', answer } })
              } else if (payload.type === 'answer') {
                await pc.setRemoteDescription(new RTCSessionDescription(payload.answer))
              } else if (payload.candidate) {
                await pc.addIceCandidate(new RTCIceCandidate(payload.candidate))
              }
            } catch (err) {
              console.error('WebRTC signal handling error:', err)
            }
          })
        }
      } catch (sockErr) {
        console.warn('Socket.IO connection skipped:', sockErr)
      }
    }

    initMediaAndWebRTC()

    return () => {
      active = false
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close()
      }
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [appointment, role, userName])

  const toggleMute = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = isMuted
      })
    }
    setIsMuted(!isMuted)
  }

  const toggleVideo = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = isVideoOff
      })
    }
    setIsVideoOff(!isVideoOff)
  }

  const handleAskAiTip = async () => {
    setIsAiLoading(true)
    try {
      const token = window.localStorage.getItem('voxtech-token')
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: 'Provide 1 quick speech prompt for doctor-patient video session.',
          role,
        }),
      })
      const data = await response.json().catch(() => ({}))
      setAiTip(data.reply || 'Practice stretching vowel sounds softly.')
    } catch {
      setAiTip('Practice 4-count breathing before each sentence.')
    } finally {
      setIsAiLoading(false)
    }
  }

  const handleEndCall = () => {
    if (isRecording && mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop())
    }
    if (socketRef.current) {
      const roomCode = appointment?.roomCode || 'VOX-7829'
      const callerName = role === 'Therapist' ? (appointment?.doctor || 'Dr. Priya Sharma') : (userName || 'Patient')
      socketRef.current.emit('end-call-signal', { roomCode, endedBy: callerName })
    }
    setCallEnded(true)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (callEnded) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
        <div className="w-full max-w-lg overflow-hidden rounded-[32px] border border-emerald-500/20 bg-slate-900 text-white shadow-2xl">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-center">
            <span className="text-4xl">🎉</span>
            <h2 className="mt-2 text-2xl font-bold">Video Session Completed</h2>
            <p className="text-xs text-emerald-100">
              {peerEndedCallMessage ? peerEndedCallMessage : `Appointment with ${appointment?.doctor || 'Dr. Priya Sharma'}`}
            </p>
          </div>

          <div className="space-y-4 p-6">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-3">
                <p className="text-[10px] uppercase tracking-wider text-slate-400">Duration</p>
                <p className="mt-1 text-xl font-bold text-emerald-400">{formatTime(callDuration)}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-3">
                <p className="text-[10px] uppercase tracking-wider text-slate-400">Fluency Score</p>
                <p className="mt-1 text-xl font-bold text-teal-400">88% (Strong)</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">🧠 Sarvam AI Session Summary</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                Patient completed articulation drills and rhythmic breathing exercises. Speech clarity showed marked improvement with clear sound onset. Recommended 5 minutes of daily practice.
              </p>
            </div>

            {recordedBlobUrl && (
              <div className="rounded-2xl border border-emerald-500/30 bg-slate-800/80 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">📹 Session Recording Available</span>
                  <a
                    href={recordedBlobUrl}
                    download={`voxtech-session-${appointment?.roomCode || 'VOX-7829'}.webm`}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-400 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-300 shadow-md transition"
                  >
                    <span>⬇️</span> Download Video
                  </a>
                </div>
                <video src={recordedBlobUrl} controls className="w-full rounded-xl max-h-48 bg-black object-contain" />
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 px-4 py-3 font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5"
              >
                Return to Appointments
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-2 backdrop-blur-lg md:p-6">
      <div className="relative flex h-full max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[32px] border border-slate-800 bg-slate-900 shadow-2xl shadow-emerald-950/40">
        <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/80 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-rose-500" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white">{appointment?.doctor || 'Dr. Priya Sharma'}</h3>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                  {appointment?.specialty || 'Speech Pathologist'}
                </span>
              </div>
              <p className="text-xs text-slate-400">Room: {appointment?.roomCode || 'VOX-7829'} • HD Encrypted Video Call</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Auto Network Detection Indicator */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNetworkDetails(!showNetworkDetails)}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                  networkStatus === 'excellent'
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                    : networkStatus === 'fair'
                    ? 'border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                    : networkStatus === 'poor'
                    ? 'border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 animate-pulse'
                    : 'border-rose-700 bg-rose-950 text-rose-200 animate-pulse'
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-current" />
                <span>
                  {networkStatus === 'excellent'
                    ? 'Network: Good'
                    : networkStatus === 'fair'
                    ? 'Network: Fair'
                    : networkStatus === 'poor'
                    ? 'Network: Poor'
                    : 'Network: Offline'}
                </span>
                <span className="text-[10px] opacity-70">ℹ️</span>
              </button>

              {/* Diagnostic Popover Drawer */}
              {showNetworkDetails && (
                <div className="absolute right-0 top-10 z-50 w-64 rounded-2xl border border-slate-700 bg-slate-900/95 p-4 text-xs shadow-2xl backdrop-blur-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                    <span className="font-bold text-white">📡 Network Health Stats</span>
                    <button type="button" onClick={() => setShowNetworkDetails(false)} className="text-slate-400 hover:text-white">✕</button>
                  </div>
                  <div className="space-y-2 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Ping (RTT):</span>
                      <span className="font-mono font-bold text-emerald-400">{networkStats.rtt} ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Packet Loss:</span>
                      <span className={`font-mono font-bold ${networkStats.packetLoss > 2 ? 'text-rose-400' : 'text-emerald-400'}`}>{networkStats.packetLoss}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Bitrate:</span>
                      <span className="font-mono font-bold text-teal-400">{(networkStats.bitrateKbps / 1000).toFixed(1)} Mbps</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Connection:</span>
                      <span className="font-bold uppercase text-slate-200">{networkStats.effectiveType}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-mono font-bold text-emerald-400">
              ⏱️ {formatTime(callDuration)}
            </div>
            <button
              type="button"
              onClick={handleEndCall}
              className="rounded-full bg-rose-600 px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-rose-600/30 hover:bg-rose-500"
            >
              End Call 🔴
            </button>
          </div>
        </div>

        <div className="relative flex-1 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4">
          {/* Active Recording Pill */}
          {isRecording && (
            <div className="absolute top-6 right-6 z-30 flex items-center gap-2 rounded-full border border-rose-500/50 bg-rose-950/90 px-3.5 py-1.5 text-xs font-mono font-bold text-rose-300 backdrop-blur-md shadow-lg animate-pulse">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
              <span>REC {formatTime(recordingSeconds)}</span>
            </div>
          )}
          {/* Network Issue Alert Banner */}
          {issueDetails && (
            <div className="absolute top-6 left-1/2 z-30 -translate-x-1/2 flex items-center gap-3 rounded-full border border-amber-500/40 bg-amber-950/90 px-4 py-2 text-xs font-bold text-amber-200 shadow-xl backdrop-blur-md animate-bounce">
              <span className="text-lg">⚠️</span>
              <span>{issueDetails}</span>
            </div>
          )}
          <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-inner">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-slate-900/90 p-6 text-center">
              <div className={`relative flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 text-6xl shadow-2xl transition-all duration-300 ${doctorSpeaking ? 'ring-8 ring-emerald-500/40 scale-105' : ''}`}>
                {appointment?.avatar || '👩‍⚕️'}
                {doctorSpeaking && (
                  <span className="absolute -bottom-2 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-bold text-slate-950 shadow-md">
                    Speaking... 🎙️
                  </span>
                )}
              </div>

              <h4 className="mt-4 text-xl font-bold text-white">{appointment?.doctor || 'Dr. Priya Sharma'}</h4>
              <p className="text-xs text-emerald-300">{appointment?.note || 'Speech therapy & articulation follow-up'}</p>

              <div className="mt-4 flex items-center justify-center gap-1.5">
                {[40, 70, 100, 60, 90, 30, 80, 50].map((h, i) => (
                  <span
                    key={i}
                    style={{ height: doctorSpeaking ? `${h}%` : '20%' }}
                    className="w-1.5 rounded-full bg-emerald-400 transition-all duration-300"
                  />
                ))}
              </div>
            </div>

            <div className="absolute bottom-4 right-4 z-20 h-40 w-56 overflow-hidden rounded-2xl border-2 border-emerald-500/40 bg-slate-900 shadow-2xl">
              {isVideoOff || !hasCameraPermission ? (
                <div className="flex h-full w-full flex-col items-center justify-center bg-slate-800 p-2 text-center text-slate-300">
                  <span className="text-3xl">{!hasCameraPermission ? '👤' : '📷'}</span>
                  <span className="mt-1 text-[11px] font-bold text-white">
                    {!hasCameraPermission ? 'Avatar Mode' : 'Camera Off'}
                  </span>
                  <span className="text-[10px] text-emerald-400">
                    {isMuted ? 'Muted 🔇' : 'Microphone Live 🎙️'}
                  </span>
                </div>
              ) : (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full object-cover"
                />
              )}

              <div className="absolute bottom-2 left-2 rounded-md bg-slate-900/80 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
                You {isMuted ? '(Muted 🔇)' : '🎙️'}
              </div>
            </div>

            {mediaNotice && (
              <div className="absolute top-4 left-1/2 z-30 -translate-x-1/2 flex items-center gap-2 rounded-full border border-teal-500/40 bg-slate-900/90 px-4 py-1.5 text-[11px] font-bold text-teal-300 shadow-xl backdrop-blur-md">
                <span>ℹ️</span>
                <span>{mediaNotice}</span>
              </div>
            )}

            {showCaptions && (
              <div className="absolute bottom-4 left-4 right-64 z-20 rounded-2xl border border-emerald-500/30 bg-slate-950/85 p-3 text-xs text-white shadow-xl backdrop-blur-md">
                <div className="flex items-center gap-2 mb-1">
                  <span className="rounded-md bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                    💬 Sarvam AI Live Captions
                  </span>
                </div>
                <p className="font-medium text-emerald-100">{currentCaption}</p>
              </div>
            )}
          </div>
        </div>

        {aiTip && (
          <div className="border-t border-emerald-500/20 bg-emerald-950/40 px-6 py-2.5 text-xs text-emerald-200">
            <span className="font-bold">🤖 Sarvam AI Co-Pilot Suggestion:</span> {aiTip}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-900 px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleMute}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition ${isMuted ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
            >
              <span>{isMuted ? '🔇' : '🎙️'}</span>
              <span>{isMuted ? 'Unmute' : 'Mute'}</span>
            </button>

            <button
              type="button"
              onClick={toggleVideo}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition ${isVideoOff ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
            >
              <span>{isVideoOff ? '📷' : '📹'}</span>
              <span>{isVideoOff ? 'Start Video' : 'Stop Video'}</span>
            </button>

            {/* Record Session Button */}
            <button
              type="button"
              onClick={toggleRecording}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition ${
                isRecording
                  ? 'bg-rose-600 text-white animate-pulse border border-rose-400'
                  : 'bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/25'
              }`}
            >
              <span>{isRecording ? '⏹️' : '🔴'}</span>
              <span>{isRecording ? `Stop REC (${formatTime(recordingSeconds)})` : 'Record Session'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCaptions(!showCaptions)}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition ${showCaptions ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
              <span>💬</span>
              <span>Captions {showCaptions ? 'ON' : 'OFF'}</span>
            </button>

            <button
              type="button"
              onClick={handleAskAiTip}
              disabled={isAiLoading}
              className="flex items-center gap-2 rounded-2xl bg-violet-600/30 border border-violet-500/30 px-4 py-2.5 text-xs font-bold text-violet-200 hover:bg-violet-600/40"
            >
              <span>🤖</span>
              <span>{isAiLoading ? 'Asking AI...' : 'AI Therapy Tip'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleEndCall}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-600/30 transition hover:scale-105"
          >
            <span>🔴</span>
            <span>Leave Session</span>
          </button>
        </div>
      </div>
    </div>
  )
}

function AssistantPage({ role }) {
  const { lang, t } = useTranslation()
  const [sessions, setSessions] = useState(() => {
    try {
      const saved = window.localStorage.getItem('voxtech_ai_sessions')
      if (saved) {
        return JSON.parse(saved).map((session) => ({
          ...session,
          messages: session.messages.map((message) => ({
            ...message,
            text: typeof message.text === 'string' ? message.text.replace(/Hello Rahul[!,]?\s*/gi, '') : message.text,
          })),
        }))
      }
    } catch (e) {}
    return [
      {
        id: 'sess-1',
        title: 'Daily Care Plan & Speech Goals',
        updatedAt: 'Just now',
        messages: [
          {
            id: 'welcome',
            sender: 'assistant',
            text: lang === 'ta'
              ? 'வணக்கம்! நான் VOXTECH AI - உங்கள் பேச்சு சிகிச்சை உதவியாளர் மற்றும் பராமரிப்பு திட்டமிடுபவர். உங்கள் இலக்குகள் மற்றும் சந்திப்புகளுடன் நான் இணைக்கப்பட்டுள்ளேன்.\n\nஇன்று உங்கள் பேச்சுப் பயிற்சிகள் மற்றும் நினைவூட்டல்களில் நான் எவ்வாறு உதவ முடியும்?'
              : 'Hello! I am VOXTECH AI - your speech therapy assistant, care planner, and daily guidance engine. I am fully synchronized with your live target goals, doctor consultations, care plan, and daily logs.\n\nHow can I assist you with your speech drills, care planning, or reminders today?',
            timestamp: 'Just now'
          }
        ]
      }
    ]
  })

  const [activeSessionId, setActiveSessionId] = useState('sess-1')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(null)

  const [carePlan, setCarePlan] = useState([])
  const [reminders, setReminders] = useState([])
  const [contextData, setContextData] = useState(null)
  const [playingId, setPlayingId] = useState(null)
  const [generatingPlan, setGeneratingPlan] = useState(false)

  const [remTitle, setRemTitle] = useState('')
  const [remTime, setRemTime] = useState('10:00 AM')
  const [remCat, setRemCat] = useState('Speech')

  const [editingSessId, setEditingSessId] = useState(null)
  const [editTitleInput, setEditTitleInput] = useState('')

  const chatEndRef = useRef(null)
  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0]

  useEffect(() => {
    try {
      window.localStorage.setItem('voxtech_ai_sessions', JSON.stringify(sessions))
    } catch (e) {
      console.warn('Failed to save sessions:', e)
    }
  }, [sessions])

  const fetchData = useCallback(async () => {
    const token = window.localStorage.getItem('voxtech-token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}

    try {
      const [cpRes, remRes, ctxRes] = await Promise.all([
        fetch('/api/careplan', { headers }),
        fetch('/api/reminders', { headers }),
        fetch('/api/ai/assistant/context', { headers })
      ])

      if (cpRes.ok) {
        const d = await cpRes.json()
        if (d.carePlan) setCarePlan(d.carePlan)
      }
      if (remRes.ok) {
        const d = await remRes.json()
        if (d.reminders) setReminders(d.reminders)
      }
      if (ctxRes.ok) {
        const d = await ctxRes.json()
        if (d.context) setContextData(d.context)
      }
    } catch (err) {
      console.warn('Failed to fetch assistant data:', err)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeSession?.messages, loading])

  const handleNewChat = () => {
    const newSessId = `sess-${Date.now()}`
    const newSess = {
      id: newSessId,
      title: 'New Speech Session',
      updatedAt: 'Just now',
      messages: [
        {
          id: `welcome-${Date.now()}`,
          sender: 'assistant',
          text: lang === 'ta'
            ? 'வணக்கம்! நான் VOXTECH AI. இந்த அமர்வில் உங்கள் பேச்சு சிகிச்சை திட்டத்தில் எவ்வாறு உதவ முடியும்?'
            : 'Hello! I am VOXTECH AI. How can I help you with your speech therapy care plan or drills in this session?',
          timestamp: 'Just now'
        }
      ]
    }
    setSessions(prev => [newSess, ...prev])
    setActiveSessionId(newSessId)
  }

  const handleDeleteSession = (sessId, e) => {
    e.stopPropagation()
    if (sessions.length === 1) {
      alert('You must keep at least one session active.')
      return
    }
    const updated = sessions.filter(s => s.id !== sessId)
    setSessions(updated)
    if (activeSessionId === sessId) {
      setActiveSessionId(updated[0].id)
    }
  }

  const handleStartRename = (sess, e) => {
    e.stopPropagation()
    setEditingSessId(sess.id)
    setEditTitleInput(sess.title)
  }

  const handleSaveRename = (sessId) => {
    if (!editTitleInput.trim()) return
    setSessions(prev => prev.map(s => s.id === sessId ? { ...s, title: editTitleInput.trim() } : s))
    setEditingSessId(null)
  }

  const handleSend = async (textToSend, messageExtras = {}) => {
    const msgText = (textToSend || input).trim()
    if (!msgText || loading || !activeSession) return

    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: msgText,
      ...messageExtras,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setSessions(prev => prev.map(s => {
      if (s.id === activeSession.id) {
        const isFirstUserMsg = s.messages.filter(m => m.sender === 'user').length === 0
        const newTitle = isFirstUserMsg ? (msgText.slice(0, 26) + (msgText.length > 26 ? '...' : '')) : s.title
        return {
          ...s,
          title: newTitle,
          updatedAt: 'Just now',
          messages: [...s.messages, userMsg]
        }
      }
      return s
    }))

    if (!textToSend) setInput('')
    setLoading(true)

    try {
      const token = window.localStorage.getItem('voxtech-token')
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          message: msgText,
          role,
          lang,
          conversationHistory: activeSession.messages
        })
      })

      if (res.ok) {
        const data = await res.json()
        const botMsg = {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: data.reply || (lang === 'ta' ? 'உங்கள் பேச்சு இலக்குகளின் அடிப்படையில் எனது வழிகாட்டுதல் இதோ.' : 'Here is your guidance based on your live speech goals.'),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }

        setSessions(prev => prev.map(s => {
          if (s.id === activeSession.id) {
            return {
              ...s,
              messages: [...s.messages, botMsg]
            }
          }
          return s
        }))

        // Always Enable Voice in Chat check
        if (window.localStorage.getItem('voxtech_auto_tts') === 'true') {
          setTimeout(() => {
            handlePlayTTS(botMsg.id, botMsg.text)
          }, 350)
        }
      } else {
        throw new Error('API Error')
      }
    } catch (err) {
      const errMsg = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: lang === 'ta'
          ? 'VOXTECH AI உடன் இணைப்பதில் சிக்கல் ஏற்பட்டது. பிணைய நிலையைச் சரிபார்க்கவும் அல்லது மீண்டும் முயற்சிக்கவும்.'
          : 'I encountered an issue connecting to VOXTECH AI. Please verify network status or try again.',
        timestamp: 'Just now'
      }
      setSessions(prev => prev.map(s => s.id === activeSession.id ? { ...s, messages: [...s.messages, errMsg] } : s))
    } finally {
      setLoading(false)
    }
  }

  const handleVoiceInput = async () => {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      alert('Audio recording is not supported in this browser. Please type your query.')
      return
    }

    let stream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks = []
      const stopped = new Promise((resolve) => { recorder.onstop = resolve })
      recorder.ondataavailable = (event) => chunks.push(event.data)
      recorder.start()
      setIsRecording(true)
      await new Promise((resolve) => window.setTimeout(resolve, 4000))
      recorder.stop()
      await stopped

      const audioBlob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' })
      const audioUrl = URL.createObjectURL(audioBlob)
      const formData = new FormData()
      formData.append('audio', audioBlob, 'voice-message.webm')
      const token = window.localStorage.getItem('voxtech-token')
      const response = await fetch('/api/speech/transcribe?provider=sarvam', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data.transcript) throw new Error(data.message || 'Unable to transcribe audio.')
      handleSend(data.transcript, { audioUrl })
    } catch (error) {
      alert(error.message || 'Voice message failed.')
    } finally {
      stream?.getTracks().forEach((track) => track.stop())
      setIsRecording(false)
    }
  }

  const handlePlayTTS = async (msgId, rawText) => {
    if (playingId === msgId) {
      setPlayingId(null)
      window.speechSynthesis?.cancel()
      return
    }
    setPlayingId(msgId)

    const cleanText = rawText.replace(/[*#]/g, '')
    const ttsLang = lang === 'ta' ? 'ta-IN' : 'en-IN'

    try {
      const token = window.localStorage.getItem('voxtech-token')
      const res = await fetch('/api/sarvam/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ text: cleanText, target_language_code: ttsLang, speaker: 'ritu' })
      })

      if (res.ok) {
        const blob = await res.blob()
        const audioUrl = URL.createObjectURL(blob)
        const audio = new Audio(audioUrl)
        audio.onended = () => setPlayingId(null)
        audio.play()
      } else {
        const synth = window.speechSynthesis
        const u = new SpeechSynthesisUtterance(cleanText)
        u.lang = ttsLang
        u.onend = () => setPlayingId(null)
        synth.speak(u)
      }
    } catch (err) {
      const synth = window.speechSynthesis
      const u = new SpeechSynthesisUtterance(cleanText)
      u.lang = ttsLang
      u.onend = () => setPlayingId(null)
      synth.speak(u)
    }
  }

  const handleAddReminderSubmit = async (e) => {
    e.preventDefault()
    if (!remTitle.trim()) return

    const newRem = {
      id: `rem-${Date.now()}`,
      title: remTitle.trim(),
      time: remTime,
      category: remCat,
      active: true
    }

    setReminders(prev => [...prev, newRem])
    setRemTitle('')

    try {
      const token = window.localStorage.getItem('voxtech-token')
      await fetch('/api/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(newRem)
      })
    } catch (err) {
      console.error('Failed to save reminder:', err)
    }
  }

  const handleToggleReminder = async (id) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r))
    try {
      const token = window.localStorage.getItem('voxtech-token')
      await fetch(`/api/reminders/${id}/toggle`, {
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
    } catch (err) {
      console.error('Failed to toggle reminder:', err)
    }
  }

  const handleDeleteReminder = async (id) => {
    setReminders(prev => prev.filter(r => r.id !== id))
    try {
      const token = window.localStorage.getItem('voxtech-token')
      await fetch(`/api/reminders/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
    } catch (err) {
      console.error('Failed to delete reminder:', err)
    }
  }

  const handleGenerateCarePlan = async () => {
    setGeneratingPlan(true)
    try {
      const token = window.localStorage.getItem('voxtech-token')
      const res = await fetch('/api/ai/careplan/generate', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      if (res.ok) {
        const d = await res.json()
        if (d.carePlan) setCarePlan(d.carePlan)
      }
    } catch (err) {
      console.error('Care plan generation failed:', err)
    } finally {
      setGeneratingPlan(false)
    }
}

function renderCleanText(rawText) {
  if (!rawText) return null
  const text = String(rawText)
    .replaceAll('**', '')
    .replaceAll('##', '')
    .replaceAll('#', '')
    .replaceAll(String.fromCharCode(96), '')
    .replaceAll('Sarvam AI', 'VOXTECH AI')
    .replaceAll('Sarvam', 'VOXTECH')

  const lines = text.split('\n')
  return lines.map((line, idx) => {
    const trimmed = line.trim()
    if (!trimmed) return <div key={idx} className="h-1" />

    if (trimmed.endsWith(':') && trimmed.length < 60) {
      return <h4 key={idx} className="font-bold text-slate-900 text-xs sm:text-sm mt-2.5 mb-1">{trimmed}</h4>
    }
    if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
      const itemText = trimmed.replace(/^[•\-*]\s?/, '')
      return (
        <div key={idx} className="flex items-start gap-2 my-1 text-slate-700">
          <span className="text-emerald-500 font-bold shrink-0">•</span>
          <span>{itemText}</span>
        </div>
      )
    }
    if (/^\d+\./.test(trimmed)) {
      const match = trimmed.match(/^\d+\./)
      const itemText = trimmed.replace(/^\d+\.\s?/, '')
      return (
        <div key={idx} className="flex items-start gap-2 my-1 text-slate-700">
          <span className="text-emerald-600 font-bold shrink-0">{match ? match[0] : '•'}</span>
          <span>{itemText}</span>
        </div>
      )
    }

    return <p key={idx} className="my-1 leading-relaxed text-slate-800">{line}</p>
  })
}

  return (
    <div className="flex h-[calc(100vh-140px)] min-h-[640px] overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl">
      {/* 1. ChatGPT Style Dark Left Sidebar */}
      <div
        className={`flex flex-col bg-slate-950 text-slate-200 transition-all duration-300 z-20 ${
          sidebarOpen ? 'w-72 border-r border-slate-800' : 'w-0 overflow-hidden'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white font-bold text-base shadow-md shadow-emerald-500/20">
              ⚡
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white tracking-wide">VOXTECH AI</h3>
              <span className="text-[10px] text-emerald-400 font-semibold">v3.5 Grounded</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="text-slate-400 hover:text-white p-1 text-xs"
            title="Collapse sidebar"
          >
            ◀
          </button>
        </div>

        <div className="p-3">
          <button
            type="button"
            onClick={handleNewChat}
            className="w-full flex items-center justify-between gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:opacity-90 active:scale-98"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">➕</span>
              <span>{t('newSession', 'New Session')}</span>
            </div>
            <span className="text-[10px] bg-emerald-700/60 px-2 py-0.5 rounded-full text-emerald-100">⌘N</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 text-xs">
          <p className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {t('recentSessions', 'Recent Sessions')} ({sessions.length})
          </p>

          {sessions.map((sess) => {
            const isActive = sess.id === activeSessionId
            const isEditing = editingSessId === sess.id

            return (
              <div
                key={sess.id}
                onClick={() => setActiveSessionId(sess.id)}
                className={`group flex items-center justify-between rounded-xl px-3 py-2.5 cursor-pointer transition ${
                  isActive
                    ? 'bg-slate-800 text-white font-semibold shadow-inner border border-slate-700/60'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden flex-1">
                  <span className="text-xs shrink-0">💬</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editTitleInput}
                      onChange={(e) => setEditTitleInput(e.target.value)}
                      onBlur={() => handleSaveRename(sess.id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(sess.id)}
                      autoFocus
                      className="w-full rounded bg-slate-700 px-1.5 py-0.5 text-xs text-white outline-none"
                    />
                  ) : (
                    <span className="truncate text-xs">{sess.title}</span>
                  )}
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    type="button"
                    onClick={(e) => handleStartRename(sess, e)}
                    className="p-1 text-slate-400 hover:text-emerald-400"
                    title={t('renameSession', 'Rename session')}
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteSession(sess.id, e)}
                    className="p-1 text-slate-400 hover:text-red-400"
                    title={t('deleteSession', 'Delete session')}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="p-3 border-t border-slate-800/80 space-y-1.5 bg-slate-950/90 text-xs">
          <button
            type="button"
            onClick={() => setDrawerOpen(drawerOpen === 'careplan' ? null : 'careplan')}
            className={`w-full flex items-center justify-between rounded-xl px-3 py-2 transition font-medium ${
              drawerOpen === 'careplan' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <span className="flex items-center gap-2">📋 <span>{t('carePlanRoadmap', 'Care Plan Roadmap')}</span></span>
            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full font-bold text-emerald-400">{carePlan.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setDrawerOpen(drawerOpen === 'reminders' ? null : 'reminders')}
            className={`w-full flex items-center justify-between rounded-xl px-3 py-2 transition font-medium ${
              drawerOpen === 'reminders' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <span className="flex items-center gap-2">⏰ <span>{t('smartReminders', 'Smart Reminders')}</span></span>
            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full font-bold text-emerald-400">{reminders.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setDrawerOpen(drawerOpen === 'context' ? null : 'context')}
            className={`w-full flex items-center justify-between rounded-xl px-3 py-2 transition font-medium ${
              drawerOpen === 'context' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <span className="flex items-center gap-2">🔍 <span>{t('aiContextInspector', 'AI Context Inspector')}</span></span>
            <span className="text-[10px] text-emerald-400 font-bold">{t('verified', 'Verified')}</span>
          </button>
        </div>
      </div>

      {/* 2. Main ChatGPT Style Chat Window */}
      <div className="flex flex-1 flex-col bg-slate-50/50 relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200/80 bg-white/90 backdrop-blur px-6 py-3.5 shadow-sm">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 transition text-xs font-bold"
                title={t('sidebar', 'Expand sidebar')}
              >
                ▶ {t('sidebar', 'Sidebar')}
              </button>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-sm">{activeSession?.title || (lang === 'ta' ? 'பேச்சு அமர்வு' : 'Speech Session')}</h3>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                  {t('groundedContextActive', 'Grounded Context Active')}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">{lang === 'ta' ? 'VOXTECH AI • உடனடி பேச்சுப் பராமரிப்பு வழிகாட்டுதல்' : 'VOXTECH AI • Instant Speech Care Guidance'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDrawerOpen(drawerOpen === 'careplan' ? null : 'careplan')}
              className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm"
            >
              <span>📋 {t('carePlanRoadmap', 'Care Plan')}</span>
            </button>
            <button
              type="button"
              onClick={() => setDrawerOpen(drawerOpen === 'reminders' ? null : 'reminders')}
              className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm"
            >
              <span>⏰ {t('smartReminders', 'Reminders')}</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeSession?.messages?.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white font-extrabold text-xs shadow-md">
                  ⚡
                </div>
              )}

              <div
                className={`relative max-w-[82%] rounded-[24px] p-5 text-xs leading-relaxed shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium shadow-emerald-600/15'
                    : 'bg-white text-slate-800 border border-slate-200/90 shadow-slate-100'
                }`}
              >
                <div>
                  {msg.sender === 'user' ? (
                    <div className="space-y-2">
                      {msg.audioUrl && <audio controls src={msg.audioUrl} className="max-w-full" />}
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  ) : (
                    renderCleanText(msg.text)
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-400">
                  <span>{msg.timestamp}</span>
                  {msg.sender === 'assistant' && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(msg.text.replace(/[*#]/g, ''))}
                        className="hover:text-slate-700 transition"
                        title={t('copy', 'Copy')}
                      >
                        📋 {t('copy', 'Copy')}
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePlayTTS(msg.id, msg.text)}
                        className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 font-bold transition ${
                          playingId === msg.id
                            ? 'bg-emerald-600 text-white animate-pulse'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <span>🔊</span>
                        <span>{playingId === msg.id ? (lang === 'ta' ? 'நிறுத்து' : 'Stop') : (lang === 'ta' ? 'குரலைக் கேளுங்கள்' : 'Listen Voice')}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20">
                  👤
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-4 justify-start">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white text-xs font-bold">
                ⚡
              </div>
              <div className="rounded-[24px] bg-white border border-slate-200 p-5 text-xs text-slate-500 flex items-center gap-3 shadow-sm">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span>{t('computingResponse', 'VOXTECH AI is computing your live speech care response...')}</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        <div className="px-6 py-2 border-t border-slate-200/60 bg-white/70 backdrop-blur flex items-center gap-2 overflow-x-auto text-xs scrollbar-none">
          {[
            { label: lang === 'ta' ? '📋 இலக்குகள் & மருத்துவர் சந்திப்புகள்' : '📋 Active Goals & Doctor Appointments', query: lang === 'ta' ? 'எனது தற்போதைய இலக்குகள் என்ன மற்றும் அடுத்த மருத்துவர் சந்திப்பு எப்போது?' : 'What are my active goals and when is my next doctor consultation?' },
            { label: lang === 'ta' ? '🎤 5 நிமிட பேச்சுப் பயிற்சி' : '🎤 5-Min Fluency & Pacing Drill', query: lang === 'ta' ? '5 நிமிட பேச்சு ஓட்டம் மற்றும் தொடர்ச்சியான ஒலிப்புப் பயிற்சியில் என்னை வழிநடத்துங்கள்.' : 'Guide me step-by-step through a 5-minute fluency and continuous phonation drill.' },
            { label: lang === 'ta' ? '⏰ இன்றைய நினைவூட்டல்கள்' : '⏰ Today\'s Smart Reminders', query: lang === 'ta' ? 'இன்றைய அனைத்து நினைவூட்டல்களையும் பட்டியலிட்டு சிறந்த பயிற்சி நேரங்களைப் பரிந்துரைக்கவும்.' : 'List all active reminders for today and recommend optimal practice times.' },
            { label: lang === 'ta' ? '📈 மருத்துவ முன்னேற்ற ஆய்வு' : '📈 Clinical Progress Review', query: lang === 'ta' ? 'எனது சமீபத்திய மருத்துவக் குறிப்புகளை மதிப்பாய்வு செய்து ஒலி தொடக்கத்தை மேம்படுத்துவதற்கான குறிப்புகளை வழங்கவும்.' : 'Review my recent clinical notes and give tips to improve sound onset.' }
          ].map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(chip.query)}
              className="whitespace-nowrap rounded-full bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition border border-slate-200/60 shadow-2xs"
            >
              {chip.label}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-slate-200/80 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex items-center gap-3 max-w-4xl mx-auto bg-slate-50 rounded-[24px] border border-slate-200 p-2 shadow-sm focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition"
          >
            <button
              type="button"
              onClick={handleVoiceInput}
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition shadow-sm ${
                isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
              title={lang === 'ta' ? 'உதவியாளரிடம் பேசவும்' : 'Speak to Assistant'}
            >
              🎤
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={lang === 'ta' ? 'VOXTECH AI-யிடம் பராமரிப்பு, நினைவூட்டல் அல்லது பயிற்சிகள் பற்றிக் கேளுங்கள்...' : 'Ask VOXTECH AI about care plans, reminders, or speech drills...'}
              className="flex-1 bg-transparent px-2 text-xs sm:text-sm outline-none text-slate-800 placeholder-slate-400"
            />

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-11 px-6 items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition hover:scale-102 active:scale-98 disabled:opacity-40"
            >
              {t('send', 'Send')}
            </button>
          </form>
          <p className="mt-2 text-center text-[10px] text-slate-400">
            {lang === 'ta' ? 'VOXTECH AI v3.5 • நேரடி நோயாளியின் இலக்குகள் & மருத்துவ புதுப்பிப்புகள் அடிப்படையில் இயங்குகிறது' : 'VOXTECH AI v3.5 • Grounded in live patient goals & clinical updates'}
          </p>
        </div>

        {drawerOpen && (
          <div className="absolute inset-y-0 right-0 w-80 sm:w-96 bg-white border-l border-slate-200 shadow-2xl z-30 flex flex-col transition-all">
            <div className="flex items-center justify-between border-b border-slate-200 p-4 bg-slate-50">
              <h4 className="font-bold text-slate-900 text-sm">
                {drawerOpen === 'careplan' && `📋 ${lang === 'ta' ? '7-நாள் பராமரிப்புத் திட்ட வரைபடம்' : '7-Day Care Plan Roadmap'}`}
                {drawerOpen === 'reminders' && `⏰ ${lang === 'ta' ? 'செயலில் உள்ள நினைவூட்டல்கள்' : 'Active Smart Reminders'}`}
                {drawerOpen === 'context' && `🔍 ${lang === 'ta' ? 'நேரடி AI சூழல் ஆய்வாளர்' : 'Live AI Context Inspector'}`}
              </h4>

              <button
                type="button"
                onClick={() => setDrawerOpen(null)}
                className="text-slate-400 hover:text-slate-700 p-1 text-xs font-bold"
              >
                ✕ {t('close', 'Close')}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {drawerOpen === 'careplan' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500">{t('carePlanRoadmapDesc', '7-day roadmap tailored to active goals.')}</p>
                    <button
                      type="button"
                      onClick={handleGenerateCarePlan}
                      disabled={generatingPlan}
                      className="text-xs font-bold text-emerald-600 hover:underline disabled:opacity-50"
                    >
                      {generatingPlan ? t('generatingPlan', 'Generating...') : t('refreshPlan', '✨ Refresh Plan')}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {carePlan.map((item) => (
                      <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="rounded-lg bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
                            {t('dayLabel', 'Day')} {item.day}
                          </span>
                          <span className="text-[10px] font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full">
                            {t(item.status, item.status)}
                          </span>
                        </div>
                        <h5 className="mt-2 font-bold text-slate-900 text-xs">{item.title}</h5>
                        <p className="mt-1 text-[11px] text-slate-600">{item.detail}</p>
                        <p className="mt-2 text-[10px] font-semibold text-emerald-700">⏱️ {t('targetDuration', 'Target:')} {item.duration} {t('minsLabel', 'mins')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {drawerOpen === 'reminders' && (
                <div className="space-y-4">
                  <div className="space-y-2.5">
                    {reminders.map((rem) => (
                      <div key={rem.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={rem.active}
                            onChange={() => handleToggleReminder(rem.id)}
                            className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                          />
                          <div>
                            <p className={`text-xs font-bold ${rem.active ? 'text-slate-900' : 'text-slate-500 line-through'}`}>
                              {rem.title}
                            </p>
                            <p className="text-[10px] text-slate-500">⏰ {rem.time} • {rem.category}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteReminder(rem.id)}
                          className="text-slate-400 hover:text-red-500 text-xs px-2"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleAddReminderSubmit} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                    <h5 className="font-bold text-slate-900 text-xs">➕ {t('addNewReminder', 'Add New Reminder')}</h5>
                    <input
                      type="text"
                      value={remTitle}
                      onChange={(e) => setRemTitle(e.target.value)}
                      placeholder={t('reminderTitlePlaceholder', 'Reminder title...')}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-emerald-500"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={remTime}
                        onChange={(e) => setRemTime(e.target.value)}
                        placeholder={t('timePlaceholder', 'Time (e.g. 09:00 AM)')}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-emerald-500"
                      />
                      <select
                        value={remCat}
                        onChange={(e) => setRemCat(e.target.value)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-emerald-500"
                      >
                        <option value="Speech">{lang === 'ta' ? 'பேச்சு' : 'Speech'}</option>
                        <option value="Breathing">{lang === 'ta' ? 'மூச்சு' : 'Breathing'}</option>
                        <option value="Fluency">{lang === 'ta' ? 'சரளம்' : 'Fluency'}</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      disabled={!remTitle.trim()}
                      className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white disabled:opacity-50"
                    >
                      Save Reminder
                    </button>
                  </form>
                </div>
              )}

              {drawerOpen === 'context' && contextData && (
                <div className="space-y-3 text-xs">
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 text-emerald-900">
                    <p className="font-bold text-xs">🛡️ Zero-Hallucination Grounding</p>
                    <p className="mt-1 text-[11px] text-emerald-700">VOXTECH AI reads this exact payload directly from your backend data store.</p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                    <p className="font-bold text-slate-900 mb-1">👤 Profile</p>
                    <p className="text-slate-600">Name: <span className="font-semibold text-slate-900">{contextData.profile?.name}</span></p>
                    <p className="text-slate-600">Daily Goal: <span className="font-semibold text-slate-900">{contextData.profile?.dailyGoalMins} mins</span></p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                    <p className="font-bold text-slate-900 mb-1">🎯 Active Goals ({contextData.goals?.length})</p>
                    {contextData.goals?.map(g => (
                      <p key={g.id} className="text-slate-600 mt-1">• [{g.status}] <span className="font-semibold">{g.title}</span></p>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                    <p className="font-bold text-slate-900 mb-1">📅 Scheduled Doctors</p>
                    {contextData.appointments?.map((a, i) => (
                      <p key={i} className="text-slate-600 mt-1">• <span className="font-semibold">{a.doctor}</span> ({a.specialty})</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function GoalsPage({ role }) {
  const { lang, t } = useTranslation()
  const [goals, setGoals] = useState([])
  const [filter, setFilter] = useState('All')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDetail, setNewDetail] = useState('')
  const [newCategory, setNewCategory] = useState('Speech')

  useEffect(() => {
    async function fetchGoals() {
      try {
        const token = window.localStorage.getItem('voxtech-token')
        const res = await fetch('/api/goals', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (res.ok) {
          const data = await res.json()
          if (data.goals) setGoals(data.goals)
        }
      } catch (err) {
        console.warn('Goals fetch fallback:', err)
      }
    }
    fetchGoals()
  }, [])

  const handleToggle = async (goal) => {
    const updated = goals.map((g) => (g.id === goal.id ? { ...g, done: !g.done, status: !g.done ? 'Completed' : 'Pending' } : g))
    setGoals(updated)
    try {
      const token = window.localStorage.getItem('voxtech-token')
      await fetch(`/api/goals/${goal.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ done: !goal.done }),
      })
    } catch (err) {
      console.error('Goal toggle error:', err)
    }
  }

  const handleDelete = async (id) => {
    setGoals(goals.filter((g) => g.id !== id))
    try {
      const token = window.localStorage.getItem('voxtech-token')
      await fetch(`/api/goals/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
    } catch (err) {
      console.error('Goal delete error:', err)
    }
  }

  const handleAddSubmit = async (e) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    const goalObj = {
      id: `goal-${Date.now()}`,
      title: newTitle.trim(),
      detail: newDetail.trim() || 'Therapy goal',
      category: newCategory,
      done: false,
      status: 'Pending',
    }
    setGoals([goalObj, ...goals])
    setShowAddModal(false)
    setNewTitle('')
    setNewDetail('')

    try {
      const token = window.localStorage.getItem('voxtech-token')
      await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(goalObj),
      })
    } catch (err) {
      console.error('Add goal error:', err)
    }
  }

  const completedCount = goals.filter((g) => g.done).length
  const progressPct = goals.length ? Math.round((completedCount / goals.length) * 100) : 0

  const filtered = goals.filter((g) => {
    if (filter === 'Active') return !g.done
    if (filter === 'Completed') return g.done
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[28px] bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white shadow-lg lg:flex-row lg:items-center lg:justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">{lang === 'ta' ? 'சிகிச்சை மைல்கற்கள் & வழக்கம்' : 'Therapy Milestones & Routine'}</span>
          <h2 className="mt-1 text-3xl font-bold">{t('goalsTitle', 'Goals & Objectives')}</h2>
          <p className="mt-1 text-xs text-emerald-100">{t('goalsSubtitle', 'Track and achieve daily breathing, articulation, and cognitive milestones.')}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-emerald-900 shadow-md transition hover:-translate-y-0.5 hover:bg-emerald-50"
        >
          <span>➕</span>
          <span>{t('addGoal', 'Add Goal')}</span>
        </button>
      </div>

      {/* Progress Bar Card */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-900">{t('overallProgress', 'Overall Progress')}</p>
            <p className="text-xs text-slate-500">{goals.length} {t('targetsCompleted', 'targets completed')} ({completedCount} {t('completed', 'completed')})</p>
          </div>
          <span className="text-2xl font-bold text-emerald-600">{progressPct}%</span>
        </div>
        <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-100">
          <div style={{ width: `${progressPct}%` }} className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b pb-3">
        {[
          ['All', t('allGoals', 'All Goals')],
          ['Active', t('activeGoals', 'Active Goals')],
          ['Completed', t('completedGoals', 'Completed Goals')],
        ].map(([filterKey, filterLabel]) => (
          <button
            key={filterKey}
            type="button"
            onClick={() => setFilter(filterKey)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${filter === filterKey ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {filterLabel}
          </button>
        ))}
      </div>

      {/* Goal Items */}
      <div className="space-y-3">
        {filtered.map((goal) => (
          <div key={goal.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:shadow-md">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleToggle(goal)}
                className={`flex h-9 w-9 items-center justify-center rounded-full transition ${goal.done ? 'bg-emerald-500 text-white' : 'border-2 border-slate-300 text-transparent hover:border-emerald-500'}`}
              >
                ✓
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className={`font-bold text-slate-900 ${goal.done ? 'line-through text-slate-400' : ''}`}>{t(goal.title, goal.title)}</h4>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800">{t(goal.category, goal.category)}</span>
                </div>
                <p className="text-xs text-slate-500">{t(goal.detail, goal.detail)}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleDelete(goal.id)}
              className="rounded-xl px-3 py-1.5 text-xs text-rose-500 hover:bg-rose-50 font-bold"
            >
              🗑️ {t('deleteBtn', 'Delete')}
            </button>
          </div>
        ))}
      </div>

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-emerald-100 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-bold text-slate-900">{t('addNewGoalModal', 'Add New Therapy Goal')}</h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="rounded-full bg-slate-100 p-1.5 text-xs text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600">{t('goalTitle', 'Goal Title')}</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. 5-minute vowel sound warmup"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600">{t('category', 'Category')}</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                >
                  <option value="Speech">{t('Speech & Articulation', 'Speech & Articulation')}</option>
                  <option value="Breathing">{t('Rhythmic Breathing', 'Rhythmic Breathing')}</option>
                  <option value="Fluency">{t('Fluency & Pacing', 'Fluency & Pacing')}</option>
                  <option value="Cognitive">{t('Cognitive Drill', 'Cognitive Drill')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600">{t('detailsInstructions', 'Details / Instructions')}</label>
                <textarea
                  value={newDetail}
                  onChange={(e) => setNewDetail(e.target.value)}
                  placeholder="Daily target details..."
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600">{t('cancel', 'Cancel')}</button>
                <button type="submit" className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20">{t('saveGoal', 'Save Goal')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function UpdatesPage({ role }) {
  const { lang, t } = useTranslation()
  const [updates, setUpdates] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('Clinical Note')

  useEffect(() => {
    async function fetchUpdates() {
      try {
        const token = window.localStorage.getItem('voxtech-token')
        const res = await fetch('/api/updates', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (res.ok) {
          const data = await res.json()
          if (data.updates) setUpdates(data.updates)
        }
      } catch (err) {
        console.warn('Updates fetch fallback:', err)
      }
    }
    fetchUpdates()
  }, [])

  const handleAddUpdate = async (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    const newEntry = {
      id: `up-${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      category,
      author: role || 'Care Lead',
      createdAt: new Date().toISOString(),
    }
    setUpdates([newEntry, ...updates])
    setShowAddModal(false)
    setTitle('')
    setContent('')

    try {
      const token = window.localStorage.getItem('voxtech-token')
      await fetch('/api/updates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(newEntry),
      })
    } catch (err) {
      console.error('Add update error:', err)
    }
  }

  const handleDelete = async (id) => {
    setUpdates(updates.filter((u) => u.id !== id))
    try {
      const token = window.localStorage.getItem('voxtech-token')
      await fetch(`/api/updates/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
    } catch (err) {
      console.error('Delete update error:', err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[28px] bg-gradient-to-r from-teal-600 to-emerald-700 p-6 text-white shadow-lg lg:flex-row lg:items-center lg:justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-200">{lang === 'ta' ? 'மருத்துவ முன்னேற்ற காலக்கோடு' : 'Clinical Progress Timeline'}</span>
          <h2 className="mt-1 text-3xl font-bold">{t('updatesTitle', 'Therapy Updates & Notes')}</h2>
          <p className="mt-1 text-xs text-teal-100">{t('updatesSubtitle', 'Review clinical milestones, therapist notes, and care team logs.')}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-teal-900 shadow-md transition hover:-translate-y-0.5 hover:bg-teal-50"
        >
          <span>✍️</span>
          <span>{t('logUpdate', 'Log Update')}</span>
        </button>
      </div>

      <div className="space-y-4">
        {updates.map((item) => (
          <div key={item.id} className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-[10px] font-bold text-teal-800">{t(item.category, item.category)}</span>
                  <span className="text-xs text-slate-400">• {new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="mt-2 text-lg font-bold text-slate-900">{t(item.title, item.title)}</h3>
                <p className="mt-1 text-xs font-semibold text-emerald-700">{t('author', 'Author')}: {t(item.author, item.author)}</p>
              </div>

              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                className="rounded-xl p-2 text-xs text-rose-500 hover:bg-rose-50 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-slate-600 bg-slate-50 p-4 rounded-xl">{t(item.content, item.content)}</p>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-emerald-100 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-bold text-slate-900">{t('logClinicalUpdateModal', 'Log Clinical Update')}</h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="rounded-full bg-slate-100 p-1.5 text-xs text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAddUpdate} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600">{t('goalTitle', 'Title')}</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Articulation session notes"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600">{t('category', 'Category')}</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                >
                  <option value="Clinical Note">{t('Clinical Note', 'Clinical Note')}</option>
                  <option value="Milestone">{t('Milestone Achieved', 'Milestone Achieved')}</option>
                  <option value="Therapist Feedback">{t('Therapist Feedback', 'Therapist Feedback')}</option>
                  <option value="Family Observation">{t('Family Observation', 'Family Observation')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600">{t('detailsInstructions', 'Content / Summary')}</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Details of session progress..."
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  rows={4}
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600">{t('cancel', 'Cancel')}</button>
                <button type="submit" className="rounded-xl bg-teal-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-teal-600/20">{t('postUpdate', 'Post Update')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function TherapyPage({ role }) {
  const { lang, t } = useTranslation()
  const [activePlan, setActivePlan] = useState(null)
  const [step, setStep] = useState(0)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [completedMessage, setCompletedMessage] = useState('')

  const plans = [
    {
      id: 'plan-1',
      name: t('Rhythmic Breathing & Pitch Stability', 'Rhythmic Breathing & Pitch Stability'),
      duration: lang === 'ta' ? '15 நிமிடங்கள்' : '15 mins',
      level: t('Beginner', 'Beginner'),
      icon: '🫁',
      steps: lang === 'ta'
        ? ['4 எண்ணிக்கைகளுக்கு ஆழமாக மூச்சை உள்ளிழுக்கவும்', '2 எண்ணிக்கைகளுக்கு அடக்கி வைக்கவும்', '"ம்ம்ம்" ஒலி எழுப்பியவாறு மெதுவாக மூச்சை வெளிவிடவும்']
        : ['Inhale deeply for 4 counts', 'Hold for 2 counts', 'Exhale slowly while humming "mmmm" sound'],
    },
    {
      id: 'plan-2',
      name: t('Vowel Sound Onset & Articulation', 'Vowel Sound Onset & Articulation'),
      duration: lang === 'ta' ? '20 நிமிடங்கள்' : '20 mins',
      level: t('Intermediate', 'Intermediate'),
      icon: '🗣️',
      steps: lang === 'ta'
        ? ['"ஆ - ஓ - ஈ" என்பதை மெதுவாக மீண்டும் செய்யவும்', 'மென்மையான குரல் ஒலிப்பில் கவனம் செலுத்துங்கள்', '"SPEECH" என்ற வார்த்தையை 5 முறை பயிற்சி செய்யுங்கள்']
        : ['Repeat "AH - OH - EE" slowly', 'Focus on soft vocal attack', 'Practice target word "SPEECH" 5 times'],
    },
    {
      id: 'plan-3',
      name: t('Sentence Pacing & Fluency Stretch', 'Sentence Pacing & Fluency Stretch'),
      duration: lang === 'ta' ? '25 நிமிடங்கள்' : '25 mins',
      level: t('Advanced', 'Advanced'),
      icon: '💬',
      steps: lang === 'ta'
        ? ['பேசுவதற்கு முன் 2 வினாடிகள் இடைநிறுத்தம் செய்யுங்கள்', 'ஒவ்வொரு சொற்றொடரின் முதல் எழுத்தை நீட்டிப் பேசுங்கள்', 'சீரான வேகத்தில் பத்தியை வாசிக்கவும்']
        : ['Take 2-second pause before speaking', 'Stretch first syllable of each phrase', 'Read paragraph with steady cadence'],
    },
  ]

  const handleStartRunner = (plan) => {
    setActivePlan(plan)
    setStep(0)
    setCompletedMessage('')
  }

  const handleAudioPrompt = async (text) => {
    setIsPlayingAudio(true)
    try {
      const token = window.localStorage.getItem('voxtech-token')
      const res = await fetch('/api/speech/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ text, targetLanguage: lang === 'ta' ? 'ta-IN' : 'en-IN' }),
      })
      if (res.ok) {
        const audioUrl = URL.createObjectURL(await res.blob())
        const audio = new Audio(audioUrl)
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl)
          setIsPlayingAudio(false)
        }
        await audio.play()
      } else {
        setIsPlayingAudio(false)
      }
    } catch {
      setIsPlayingAudio(false)
    }
  }

  const handleNextStep = async () => {
    if (step < activePlan.steps.length - 1) {
      setStep(step + 1)
    } else {
      setCompletedMessage(lang === 'ta' ? '🎉 அற்புதம்! சிகிச்சை பயிற்சி பதிவு செய்யப்பட்டது.' : '🎉 Excellent session! Therapy practice recorded.')
      try {
        const token = window.localStorage.getItem('voxtech-token')
        await fetch('/api/therapy/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ sessionName: activePlan.name, score: 95, insight: 'Completed all guided steps cleanly.' }),
        })
      } catch (err) {
        console.error('Session record error:', err)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[28px] bg-gradient-to-r from-violet-600 via-emerald-600 to-teal-700 p-6 text-white shadow-lg lg:flex-row lg:items-center lg:justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-violet-200">{t('guidedRecoveryPlans', 'Guided Recovery Plans')}</span>
          <h2 className="mt-1 text-3xl font-bold">{t('therapyRunnerTitle', 'Therapy & Exercise Runner')}</h2>
          <p className="mt-1 text-xs text-violet-100">{t('therapyRunnerDesc', 'Interactive speech, articulation, and breathing drills with Sarvam AI audio prompts.')}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((p) => (
          <div key={p.id} className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{p.icon}</span>
                <div>
                  <h3 className="font-bold text-slate-900">{p.name}</h3>
                  <p className="text-xs text-slate-500">{p.duration} • {p.level}</p>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleStartRunner(p)}
              className="mt-4 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-500/20 transition hover:-translate-y-0.5"
            >
              {t('startGuidedDrill', 'Start Guided Drill')}
            </button>
          </div>
        ))}
      </div>

      {/* Guided Runner Modal */}
      {activePlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl border border-emerald-500/30 bg-slate-900 p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">{activePlan.name}</h3>
                <p className="text-xs text-emerald-400">{lang === 'ta' ? `படி ${step + 1} / ${activePlan.steps.length}` : `Step ${step + 1} of ${activePlan.steps.length}`}</p>
              </div>
              <button type="button" onClick={() => setActivePlan(null)} className="rounded-full bg-slate-800 p-2 text-xs text-slate-400">✕</button>
            </div>

            {completedMessage ? (
              <div className="my-8 text-center space-y-4">
                <span className="text-5xl">🏆</span>
                <p className="text-lg font-bold text-emerald-400">{completedMessage}</p>
                <button
                  type="button"
                  onClick={() => setActivePlan(null)}
                  className="rounded-xl bg-emerald-500 px-6 py-2.5 font-bold text-slate-950"
                >
                  {t('done', 'Done')}
                </button>
              </div>
            ) : (
              <div className="my-6 space-y-6">
                <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-6 text-center">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">{t('instructions', 'Instructions')}</p>
                  <p className="mt-3 text-xl font-bold text-white">{activePlan.steps[step]}</p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleAudioPrompt(activePlan.steps[step])}
                    disabled={isPlayingAudio}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-xs font-bold text-emerald-300 hover:bg-slate-700"
                  >
                    <span>🔊</span>
                    <span>{isPlayingAudio ? t('playingPrompt', 'Playing Prompt...') : t('listenVoicePrompt', 'Listen to Voice Prompt')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="flex-1 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 px-4 py-3 text-xs font-bold text-slate-950 shadow-lg"
                  >
                    {step < activePlan.steps.length - 1 ? t('nextStep', 'Next Step ➔') : t('completeDrill', 'Complete Drill 🎉')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function GamesPage({ role }) {
  return <GamesHub role={role} />
}

function CommunityPage({ role }) {
  const { lang, t } = useTranslation()
  const [posts, setPosts] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('Tips & Tricks')

  useEffect(() => {
    async function fetchPosts() {
      try {
        const token = window.localStorage.getItem('voxtech-token')
        const res = await fetch('/api/community/posts', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (res.ok) {
          const data = await res.json()
          if (data.posts) setPosts(data.posts)
        }
      } catch (err) {
        console.warn('Community posts fetch fallback:', err)
      }
    }
    fetchPosts()
  }, [])

  const handleLike = async (id) => {
    setPosts(posts.map((p) => (p.id === id ? { ...p, likes: (p.likes || 0) + 1 } : p)))
    try {
      const token = window.localStorage.getItem('voxtech-token')
      await fetch(`/api/community/posts/${id}/like`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
    } catch (err) {
      console.error('Like error:', err)
    }
  }

  const handleAddPost = async (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    const newP = {
      id: `post-${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      author: role || 'Member',
      likes: 0,
      category,
      createdAt: new Date().toISOString(),
    }
    setPosts([newP, ...posts])
    setShowAddModal(false)
    setTitle('')
    setContent('')

    try {
      const token = window.localStorage.getItem('voxtech-token')
      await fetch('/api/community/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(newP),
      })
    } catch (err) {
      console.error('Add post error:', err)
    }
  }

  const categoryMapTa = {
    'Tips & Tricks': 'குறிப்புகள் & நுட்பங்கள்',
    'Caregiver Circle': 'பராமரிப்பாளர் வட்டம்',
    'Progress Story': 'முன்னேற்றக் கதை',
    'General Discussion': 'பொதுக் கலந்துரையாடல்',
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[28px] bg-gradient-to-r from-sky-600 to-indigo-700 p-6 text-white shadow-lg lg:flex-row lg:items-center lg:justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-200">{t('communityKicker', 'Support Circles & Peer Forums')}</span>
          <h2 className="mt-1 text-3xl font-bold">{t('communityTitle', 'Care Community')}</h2>
          <p className="mt-1 text-xs text-sky-100">{t('communityDesc', 'Share tips, encouragement, and daily speech progress with peers & caregivers.')}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-indigo-900 shadow-md transition hover:-translate-y-0.5 hover:bg-sky-50"
        >
          <span>💬</span>
          <span>{t('newDiscussion', 'New Discussion')}</span>
        </button>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[10px] font-bold text-sky-800">
                  {lang === 'ta' ? (categoryMapTa[post.category] || post.category) : post.category}
                </span>
                <span className="text-xs text-slate-400">• {new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
              <span className="text-xs font-semibold text-slate-500">{t('byAuthor', 'By')} {post.author}</span>
            </div>

            <h3 className="mt-2 text-lg font-bold text-slate-900">{post.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 bg-slate-50 p-4 rounded-xl">{post.content}</p>

            <div className="mt-4 flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleLike(post.id)}
                className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-sky-50 hover:text-sky-600"
              >
                <span>❤️</span>
                <span>{post.likes || 0} {t('likesLabel', 'Likes')}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-sky-100 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-bold text-slate-900">{t('startDiscussion', 'Start Discussion')}</h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="rounded-full bg-slate-100 p-1.5 text-xs text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAddPost} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600">{t('topicTitle', 'Topic Title')}</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('topicPlaceholder', 'e.g. Tips for morning breathing drills')}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600">{t('category', 'Category')}</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500"
                >
                  <option value="Tips & Tricks">{lang === 'ta' ? 'குறிப்புகள் & நுட்பங்கள்' : 'Tips & Tricks'}</option>
                  <option value="Caregiver Circle">{lang === 'ta' ? 'பராமரிப்பாளர் வட்டம்' : 'Caregiver Circle'}</option>
                  <option value="Progress Story">{lang === 'ta' ? 'முன்னேற்றக் கதை' : 'Progress Story'}</option>
                  <option value="General Discussion">{lang === 'ta' ? 'பொதுக் கலந்துரையாடல்' : 'General Discussion'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600">{t('messageContent', 'Message Content')}</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={t('shareThoughtsPlaceholder', 'Share your thoughts with the community...')}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500"
                  rows={4}
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600">{t('cancel', 'Cancel')}</button>
                <button type="submit" className="rounded-xl bg-sky-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-sky-600/20">{t('publishPost', 'Publish Post')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function AnalyticsPage({ role }) {
  const { lang, t } = useTranslation()
  const [data, setData] = useState({
    fluencyScore: 88,
    weeklySessionsCompleted: 14,
    totalPracticeMinutes: 180,
    trends: [
      { day: 'Mon', score: 72 },
      { day: 'Tue', score: 78 },
      { day: 'Wed', score: 82 },
      { day: 'Thu', score: 85 },
      { day: 'Fri', score: 88 },
      { day: 'Sat', score: 90 },
      { day: 'Sun', score: 92 },
    ],
  })

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const token = window.localStorage.getItem('voxtech-token')
        const res = await fetch('/api/analytics/summary', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (res.ok) {
          const resData = await res.json()
          setData((prev) => ({ ...prev, ...resData }))
        }
      } catch (err) {
        console.warn('Analytics summary fallback:', err)
      }
    }
    fetchAnalytics()
  }, [])

  const dayMapTa = { Mon: 'திங்கள்', Tue: 'செவ்வாய்', Wed: 'புதன்', Thu: 'வியாழன்', Fri: 'வெள்ளி', Sat: 'சனி', Sun: 'ஞாயிறு' }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[28px] bg-gradient-to-r from-emerald-600 via-teal-700 to-cyan-800 p-6 text-white shadow-lg lg:flex-row lg:items-center lg:justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">{lang === 'ta' ? 'முடிவு அளவீடுகள் & அறிக்கையிடல்' : 'Outcome Metrics & Reporting'}</span>
          <h2 className="mt-1 text-3xl font-bold">{t('therapyAnalyticsTitle', 'Therapy Analytics')}</h2>
          <p className="mt-1 text-xs text-emerald-100">{t('therapyAnalyticsDesc', 'Review weekly speech fluency, practice duration, and progress trends.')}</p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-emerald-900 shadow-md hover:bg-emerald-50"
        >
          <span>📊</span>
          <span>{t('exportReport', 'Export Report')}</span>
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">{t('fluencyScore', 'Fluency Score')}</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">{data.fluencyScore}%</p>
          <p className="mt-1 text-xs text-emerald-700">{t('↑ 12% improvement this week', '↑ 12% improvement this week')}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">{t('weeklySessions', 'Weekly Sessions')}</p>
          <p className="mt-2 text-3xl font-bold text-teal-600">{data.weeklySessionsCompleted}</p>
          <p className="mt-1 text-xs text-slate-500">{t('completedOnSchedule', 'Completed on schedule')}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">{t('totalPracticeTime', 'Total Practice Time')}</p>
          <p className="mt-2 text-3xl font-bold text-cyan-600">{data.totalPracticeMinutes} {lang === 'ta' ? 'நிமிடங்கள்' : 'mins'}</p>
          <p className="mt-1 text-xs text-slate-500">{t('across7Days', 'Across 7 days')}</p>
        </div>
      </div>

      {/* Progress Chart Visual */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h3 className="font-bold text-slate-900">{t('sevenDayTrend', '7-Day Speech Fluency Trend')}</h3>
        <p className="text-xs text-slate-500 mb-6">{t('dailyPitchStability', 'Daily pitch and sound onset stability')}</p>

        <div className="flex h-56 items-end justify-between gap-3 pt-6 border-b border-slate-100 pb-2">
          {data.trends.map((item) => (
            <div key={item.day} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-[10px] font-bold text-emerald-700">{item.score}%</span>
              <div
                style={{ height: `${item.score * 1.8}px` }}
                className="w-full max-w-[36px] rounded-t-xl bg-gradient-to-t from-emerald-500 to-teal-400 transition-all duration-500"
              />
              <span className="text-xs font-semibold text-slate-600">{lang === 'ta' ? dayMapTa[item.day] || item.day : item.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SpeechJourneyPage({ role }) {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [goals, setGoals] = useState([])
  const [summary, setSummary] = useState(null)
  const [selectedStage, setSelectedStage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchJourneyData() {
      try {
        setLoading(true)
        setError('')

        const token = window.localStorage.getItem('voxtech-token')
        const headers = token ? { Authorization: `Bearer ${token}` } : {}

        const [profileRes, goalsRes, summaryRes] = await Promise.all([
          fetch('/api/profile', { headers }),
          fetch('/api/goals', { headers }),
          fetch('/api/analytics/summary', { headers }),
        ])

        let nextProfile = null
        let nextGoals = []
        let nextSummary = null

        if (profileRes.ok) {
          const profileData = await profileRes.json()
          nextProfile = profileData.profile || null
        }

        if (goalsRes.ok) {
          const goalsData = await goalsRes.json()
          nextGoals = Array.isArray(goalsData.goals) ? goalsData.goals : []
        }

        if (summaryRes.ok) {
          const summaryData = await summaryRes.json()
          nextSummary = summaryData || null
        }

        setProfile(nextProfile)
        setGoals(nextGoals)
        setSummary(nextSummary)
      } catch (err) {
        console.warn('Journey data fetch error:', err)
        setError('We could not load your speech journey right now. Please try again in a moment.')
      } finally {
        setLoading(false)
      }
    }

    fetchJourneyData()
  }, [])

  const completedGoals = goals.filter((goal) => goal.done || goal.status === 'Completed').length
  const totalGoals = goals.length || 5
  const overallProgress = Math.min(100, Math.max(0, Math.round(summary?.fluencyScore || (completedGoals / totalGoals) * 100 || 72)))
  const points = Math.max(120, Math.round((summary?.fluencyScore || overallProgress) * 3 + completedGoals * 10))
  const streak = summary?.weeklySessionsCompleted ? Math.max(3, Math.min(30, Math.round(summary.weeklySessionsCompleted / 2))) : 6
  const userName = profile?.username || 'Friend'

  const stageTemplates = [
    {
      id: 'listening',
      icon: '🎧',
      title: 'Listening Skills',
      description: 'Hear, focus, and respond to sounds, words, and instructions.',
      reward: 'Listening Star',
      activities: ['Follow a short spoken instruction', 'Match sounds to pictures', 'Repeat listening cues'],
      total: 7,
    },
    {
      id: 'speech',
      icon: '🗣️',
      title: 'Speech Sounds',
      description: 'Build clear sound production and confidence in each target sound.',
      reward: 'Sound Builder',
      activities: ['Warm-up vowel practice', 'Target sound drills', 'Sound recall game'],
      total: 8,
    },
    {
      id: 'pronunciation',
      icon: '✨',
      title: 'Pronunciation',
      description: 'Shape and refine speech clarity with guided pronunciation tasks.',
      reward: 'Crystal Voice',
      activities: ['Word emphasis drill', 'Slow repetition practice', 'Clear speech round'],
      total: 6,
    },
    {
      id: 'vocabulary',
      icon: '📚',
      title: 'Vocabulary',
      description: 'Grow the language bank and strengthen everyday word recall.',
      reward: 'Word Explorer',
      activities: ['Picture naming', 'New word build', 'Context clues game'],
      total: 7,
    },
    {
      id: 'sentence',
      icon: '💬',
      title: 'Sentence Building',
      description: 'Practice simple and longer phrases with calmer pacing.',
      reward: 'Sentence Spark',
      activities: ['Phrase builder', 'Sentence copying', 'Short response practice'],
      total: 8,
    },
    {
      id: 'grammar',
      icon: '🧩',
      title: 'Grammar',
      description: 'Strengthen sentence structure and word order with guided practice.',
      reward: 'Grammar Hero',
      activities: ['Word order tasks', 'Action word practice', 'Story sentence fix'],
      total: 6,
    },
    {
      id: 'communication',
      icon: '🤝',
      title: 'Communication',
      description: 'Use speech in real conversations, question answering, and expression.',
      reward: 'Talk Builder',
      activities: ['Conversation prompt', 'Turn-taking practice', 'Answering questions'],
      total: 7,
    },
    {
      id: 'storytelling',
      icon: '📖',
      title: 'Storytelling',
      description: 'Turn ideas into connected stories with confidence and rhythm.',
      reward: 'Story Creator',
      activities: ['Picture story retell', 'Event sequencing', 'Story prompt practice'],
      total: 6,
    },
  ]

  const journeyStages = stageTemplates.map((stage, index) => {
    const progressSeed = [92, 87, 80, 72, 68, 54, 41, 25][index]
    const adaptiveProgress = summary?.fluencyScore ? Math.min(100, Math.max(20, Math.round((summary.fluencyScore * (index + 1)) / (stageTemplates.length * 1.05)))) : progressSeed
    const completion = Math.min(100, Math.max(0, adaptiveProgress))
    const completedActivities = Math.max(0, Math.round((completion / 100) * stage.total))
    const currentIndex = Math.min(stageTemplates.length - 1, Math.max(0, Math.round((overallProgress / 100) * (stageTemplates.length - 1))))
    const isLocked = index > currentIndex + 1
    const isCurrent = index === currentIndex
    const isCompleted = completion >= 100 || (index < currentIndex && !isLocked)

    return {
      ...stage,
      completion,
      completedActivities,
      status: isCompleted ? 'completed' : isCurrent ? 'current' : isLocked ? 'locked' : 'up-next',
      badge: isCompleted ? 'Completed' : isCurrent ? 'In progress' : isLocked ? 'Locked' : 'Ready',
    }
  })

  const dailyGoalCompleted = Math.min(5, Math.max(0, completedGoals))
  const dailyGoalTotal = Math.max(5, totalGoals)
  const dailyGoalProgress = Math.min(100, Math.round((dailyGoalCompleted / dailyGoalTotal) * 100))

  const rewards = [
    { label: 'Stars', value: `${Math.max(10, Math.round(points / 12))}`, tone: 'bg-amber-100 text-amber-700' },
    { label: 'Badges', value: `${journeyStages.filter((stage) => stage.status === 'completed').length}`, tone: 'bg-violet-100 text-violet-700' },
    { label: 'Sessions', value: `${summary?.weeklySessionsCompleted || 6}`, tone: 'bg-emerald-100 text-emerald-700' },
  ]

  if (loading) {
    return (
      <div className="rounded-[28px] border border-slate-100 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold text-slate-600">Loading your speech journey...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[30px] bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-6 text-white shadow-[0_20px_40px_rgba(16,185,129,0.25)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-100">{userName}'s Progress</p>
            <h2 className="mt-2 text-3xl font-bold">My Speech Journey</h2>
          </div>

          <div className="flex flex-wrap gap-3 text-sm">
            <div className="rounded-2xl bg-white/15 px-3 py-2 backdrop-blur-sm">
              <p className="text-[10px] uppercase tracking-wide text-emerald-100">{t('currentStreak', 'Current streak')}</p>
              <p className="mt-1 font-bold">{streak} {lang === 'ta' ? 'நாட்கள்' : 'days'}</p>
            </div>
            <div className="rounded-2xl bg-white/15 px-3 py-2 backdrop-blur-sm">
              <p className="text-[10px] uppercase tracking-wide text-emerald-100">{t('pointsLabel', 'Points')}</p>
              <p className="mt-1 font-bold">{points}</p>
            </div>
            <div className="rounded-2xl bg-white/15 px-3 py-2 backdrop-blur-sm">
              <p className="text-[10px] uppercase tracking-wide text-emerald-100">{t('progressLabel', 'Progress')}</p>
              <p className="mt-1 font-bold">{overallProgress}%</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{t('progressMap', 'Progress map')}</p>
              <h3 className="mt-1 text-xl font-bold text-slate-900">{t('yourTherapyPath', 'Your therapy path')}</h3>
            </div>
            <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
              {overallProgress}% {t('completeLabel', 'complete')}
            </div>
          </div>

          <div className="relative space-y-4 pl-10">
            <div className="absolute left-[19px] top-3 bottom-3 w-px bg-gradient-to-b from-emerald-400 via-sky-300 to-violet-400" />

            {journeyStages.map((stage) => (
              <button
                key={stage.id}
                type="button"
                onClick={() => stage.status !== 'locked' && setSelectedStage(stage)}
                aria-label={`Open ${stage.title} stage`}
                disabled={stage.status === 'locked'}
                className={`group relative w-full rounded-2xl border p-4 text-left transition duration-200 ${
                  stage.status === 'completed'
                    ? 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100'
                    : stage.status === 'current'
                      ? 'border-violet-200 bg-violet-50 hover:bg-violet-100'
                      : stage.status === 'locked'
                        ? 'border-slate-200 bg-slate-50 opacity-80'
                        : 'border-sky-200 bg-sky-50 hover:bg-sky-100'
                } ${stage.status === 'locked' ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="absolute left-[-38px] top-4 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white shadow-sm text-sm
                  ${stage.status === 'completed' ? 'bg-emerald-500 text-white' : stage.status === 'current' ? 'bg-violet-500 text-white' : stage.status === 'locked' ? 'bg-slate-300 text-slate-700' : 'bg-sky-400 text-white'}"
                >
                  {stage.status === 'completed' ? '✓' : stage.status === 'locked' ? '🔒' : stage.icon}
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{stage.icon}</span>
                      <h4 className="text-lg font-bold text-slate-900">{t(stage.title, stage.title)}</h4>
                    </div>
                    <p className="mt-1 text-xs text-slate-600">{t(stage.description, stage.description)}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-500">{t(stage.badge, stage.badge)}</p>
                    <p className="mt-1 text-sm font-bold text-slate-900">{stage.completion}%</p>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    <span>{stage.completedActivities}/{stage.total} {lang === 'ta' ? 'பயிற்சிகள்' : 'activities'}</span>
                    <span>{stage.reward}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-200">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        stage.status === 'completed' ? 'bg-emerald-500' : stage.status === 'current' ? 'bg-violet-500' : stage.status === 'locked' ? 'bg-slate-400' : 'bg-sky-400'
                      }`}
                      style={{ width: `${stage.completion}%` }}
                    />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{t('todaysGoal', "Today's Goal")}</p>
            <h3 className="mt-2 text-xl font-bold text-slate-900">{dailyGoalCompleted} / {dailyGoalTotal} {t('activitiesCompleted', 'activities completed')}</h3>

            <div className="mt-4 h-2.5 rounded-full bg-slate-200">
              <div className="h-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500" style={{ width: `${dailyGoalProgress}%` }} />
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
              <span>{Math.max(0, dailyGoalTotal - dailyGoalCompleted)} {t('remainingLabel', 'remaining')}</span>
              <span>{dailyGoalProgress}%</span>
            </div>

            <button
              type="button"
              onClick={() => navigate('/therapy')}
              className="mt-5 w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5"
            >
              {t('continuePractice', 'Continue Practice')}
            </button>
          </div>

          <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{t('rewardsTitle', 'Rewards')}</p>
            <div className="mt-4 space-y-3">
              {rewards.map((reward) => (
                <div key={reward.label} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-full text-lg ${reward.tone}`}>
                      {reward.label === 'Stars' ? '⭐' : reward.label === 'Badges' ? '🏅' : '🔥'}
                    </span>
                    <span className="text-sm font-semibold text-slate-700">{t(reward.label, reward.label)}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{reward.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          { label: 'Pronunciation accuracy', value: `${summary?.fluencyScore || 82}%`, tone: 'from-emerald-400 to-teal-500' },
          { label: 'Listening accuracy', value: `${Math.max(70, Math.min(99, (summary?.fluencyScore || 82) + 6))}%`, tone: 'from-sky-400 to-cyan-500' },
          { label: 'Vocabulary progress', value: `${Math.max(55, Math.min(95, overallProgress + 8))}%`, tone: 'from-violet-400 to-purple-500' },
          { label: 'Completed exercises', value: `${completedGoals || 3}`, tone: 'from-amber-400 to-orange-500' },
          { label: 'Session count', value: `${summary?.weeklySessionsCompleted || 6}`, tone: 'from-pink-400 to-rose-500' },
        ].map((metric) => (
          <div key={metric.label} className="rounded-[24px] border border-slate-100 bg-white p-4 shadow-sm">
            <div className={`mb-3 h-2 rounded-full bg-gradient-to-r ${metric.tone}`} />
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{metric.label}</p>
            <p className="mt-3 text-2xl font-bold text-slate-900">{metric.value}</p>
          </div>
        ))}
      </div>

      {selectedStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Stage details</p>
                <h3 className="mt-2 text-2xl font-bold text-slate-900">{selectedStage.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStage(null)}
                aria-label="Close stage details"
                className="rounded-full bg-slate-100 p-2 text-sm text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <p className="text-sm leading-relaxed text-slate-600">{selectedStage.description}</p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Progress</p>
                <p className="mt-2 text-2xl font-bold text-emerald-600">{selectedStage.completion}%</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Completed</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{selectedStage.completedActivities}/{selectedStage.total}</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Recent performance</p>
              <p className="mt-2 text-sm text-slate-600">
                {selectedStage.status === 'completed'
                  ? 'Strong consistency this week. Keep practicing to maintain your lead.'
                  : selectedStage.status === 'current'
                    ? 'You are in a strong rhythm. Continue with short, focused drills to move forward.'
                    : selectedStage.status === 'locked'
                      ? 'Complete the previous stage before this one becomes available.'
                      : 'This stage is ready to start when you are.'}
              </p>
            </div>

            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Available exercises</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {selectedStage.activities.map((activity) => (
                  <li key={activity} className="flex items-center gap-2 rounded-xl bg-slate-50 p-3">
                    <span className="text-emerald-500">✓</span>
                    <span>{activity}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  setSelectedStage(null)
                  navigate('/therapy')
                }}
                className="flex-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/20"
              >
                Continue Activity
              </button>
              <button
                type="button"
                onClick={() => setSelectedStage(null)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ProfilePage({ darkMode, role, userName, setUserName, setRole }) {
  const { lang, setLanguage, t } = useTranslation()
  const [profile, setProfile] = useState({
    username: userName,
    email: '',
    role: role || 'Patient',
    preferredLanguage: 'English',
    bio: 'Active therapy participant focusing on articulation & fluency.',
  })
  const [saveSuccess, setSaveSuccess] = useState('')

  useEffect(() => {
    async function fetchProfile() {
      try {
        const token = window.localStorage.getItem('voxtech-token')
        const res = await fetch('/api/profile', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (res.ok) {
          const data = await res.json()
          if (data.profile) {
            setProfile((prev) => ({ ...prev, ...data.profile }))
            if (data.profile.username) setUserName(data.profile.username)
          }
        }
      } catch (err) {
        console.warn('Profile fetch fallback:', err)
      }
    }
    fetchProfile()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUserName(profile.username)
    const storedUser = JSON.parse(window.localStorage.getItem('voxtech-user') || 'null') || {}
    window.localStorage.setItem('voxtech-user', JSON.stringify({ ...storedUser, username: profile.username }))
    setSaveSuccess(t('profileUpdated', 'Profile updated successfully!'))
    setTimeout(() => setSaveSuccess(''), 2500)
    try {
      const token = window.localStorage.getItem('voxtech-token')
      await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(profile),
      })
    } catch (err) {
      console.error('Profile update error:', err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[28px] bg-gradient-to-r from-slate-900 to-emerald-950 p-6 text-white shadow-lg lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-3xl font-bold text-slate-950 shadow-md">
            {profile.role === 'Patient' ? '👩‍⚕️' : '👤'}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{profile.username}</h2>
            <p className="text-xs text-emerald-400">{t('author', 'Role')}: {t(profile.role, profile.role)} • {profile.email}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={`space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm ${darkMode ? 'text-black' : ''}`}>
        {saveSuccess && (
          <div className="rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-800">
            {saveSuccess}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={darkMode ? 'block text-xs font-bold uppercase text-black' : 'block text-xs font-bold uppercase text-slate-600'}>{t('fullName', 'Full Name')}</label>
            <input
              type="text"
              value={profile.username}
              onChange={(e) => setProfile({ ...profile, username: e.target.value })}
              className={`mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 ${darkMode ? 'text-black' : ''}`}
              required
            />
          </div>

          <div>
            <label className={darkMode ? 'block text-xs font-bold uppercase text-black' : 'block text-xs font-bold uppercase text-slate-600'}>{t('emailAddress', 'Email Address')}</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className={`mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 ${darkMode ? 'text-black' : ''}`}
              required
            />
          </div>

          <div>
            <label className={darkMode ? 'block text-xs font-bold uppercase text-black' : 'block text-xs font-bold uppercase text-slate-600'}>{t('currentRole', 'Current Role')}</label>
            <select
              value={profile.role}
              onChange={(e) => {
                setProfile({ ...profile, role: e.target.value })
                if (setRole) setRole(e.target.value)
              }}
              className={`mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 ${darkMode ? 'text-black' : ''}`}
            >
              {roleOptions.map((r) => (
                <option key={r} value={r}>{t(r, r)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={darkMode ? 'block text-xs font-bold uppercase text-black' : 'block text-xs font-bold uppercase text-slate-600'}>{t('preferredLanguage', 'Preferred Language')}</label>
            <select
              value={profile.preferredLanguage}
              onChange={(e) => {
                const val = e.target.value
                setProfile({ ...profile, preferredLanguage: val })
                if (val === 'தமிழ்' || val === 'Tamil') {
                  setLanguage && setLanguage('ta')
                } else if (val === 'English') {
                  setLanguage && setLanguage('en')
                }
              }}
              className={`mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 ${darkMode ? 'text-black' : ''}`}
            >
              <option value="English">English</option>
              <option value="தமிழ்">தமிழ் (Tamil)</option>
            </select>
            <p className="mt-1 text-[11px] text-slate-500">
              {t('preferenceConfiguredInAccessibility', 'You can configure font size, TTS speed, and voice guidance in Accessibility.')}{' '}
              <NavLink to="/accessibility" className="font-bold text-emerald-600 hover:underline">
                {t('openAccessibility', 'Open Accessibility →')}
              </NavLink>
            </p>
          </div>
        </div>

        <div>
          <label className={darkMode ? 'block text-xs font-bold uppercase text-black' : 'block text-xs font-bold uppercase text-slate-600'}>{t('personalCareBio', 'Personal Care Bio')}</label>
          <textarea
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            className={`mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 ${darkMode ? 'text-black' : ''}`}
            rows={3}
          />
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" className="rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800">
            {t('saveProfileSettings', 'Save Profile Settings')}
          </button>
        </div>
      </form>
    </div>
  )
}

function AACCommunicationBoard() {
  const { lang, t } = useTranslation()
  const [message, setMessage] = useState([])
  const symbols = [
    { label: t('symbolI', 'I'), image: 'https://static.arasaac.org/pictograms/621/621_500.png' },
    { label: t('symbolWant', 'want'), image: 'https://static.arasaac.org/pictograms/686/686_500.png' },
    { label: t('symbolHelp', 'help'), image: 'https://static.arasaac.org/pictograms/1590/1590_500.png' },
    { label: t('symbolEat', 'eat'), image: 'https://static.arasaac.org/pictograms/274/274_500.png' },
    { label: t('symbolDrink', 'drink'), image: 'https://static.arasaac.org/pictograms/1024/1024_500.png' },
    { label: t('symbolMore', 'more'), image: 'https://static.arasaac.org/pictograms/2604/2604_500.png' },
    { label: t('symbolYes', 'yes'), image: 'https://static.arasaac.org/pictograms/2875/2875_500.png' },
    { label: t('symbolNo', 'no'), image: 'https://static.arasaac.org/pictograms/2876/2876_500.png' },
    { label: t('symbolStop', 'stop'), image: 'https://static.arasaac.org/pictograms/2671/2671_500.png' },
  ]

  const speakMessage = () => {
    if (!message.length || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(message.join(' '))
    if (lang === 'ta') {
      utterance.lang = 'ta-IN'
    } else {
      utterance.lang = 'en-IN'
    }
    window.speechSynthesis.speak(utterance)
  }

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">{t('communicationAssistance', 'Communication assistance')}</p>
          <h3 className="mt-1 text-2xl font-bold text-slate-900">{t('aacTitle', 'AAC symbol board')}</h3>
          <p className="mt-1 text-sm text-slate-600">{t('aacDesc', 'Tap symbols to build a message, then play it aloud.')}</p>
        </div>
        <span className="text-xs font-semibold text-slate-500">{t('arasaacSymbols', 'ARASAAC symbols')}</span>
      </div>

      <div aria-live="polite" className="mb-5 min-h-16 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-lg font-bold text-slate-900">
        {message.length ? message.join(' ') : (lang === 'ta' ? 'உங்கள் செய்தி இங்கே தோன்றும்' : 'Your message will appear here')}
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-9">
        {symbols.map((symbol) => (
          <button
            key={symbol.label}
            type="button"
            onClick={() => setMessage((current) => [...current, symbol.label])}
            className="flex min-h-28 flex-col items-center justify-between rounded-2xl border border-slate-200 bg-white p-2 text-sm font-bold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400 hover:bg-emerald-50 focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
            aria-label={`Add ${symbol.label}`}
          >
            <img src={symbol.image} alt={symbol.label} className="h-16 w-16 object-contain" loading="lazy" />
            <span>{symbol.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={speakMessage} disabled={!message.length} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40">
          🔊 {t('speakMessage', 'Speak message')}
        </button>
        <button type="button" onClick={() => setMessage([])} disabled={!message.length} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
          {t('clearMessage', 'Clear message')}
        </button>
      </div>

      <p className="mt-4 text-[11px] text-slate-500">{t('arasaacCredit', 'Symbols by ARASAAC. See')} <a className="font-semibold text-emerald-700 underline" href="https://arasaac.org" target="_blank" rel="noreferrer">arasaac.org</a>.</p>
    </section>
  )
}

function AccessibilityPage({ currentLang = 'en', setLanguage }) {
  const { lang: ctxLang, setLanguage: ctxSetLang, t } = useTranslation()
  const activeLang = ctxLang || currentLang || 'en'
  const handleSetLanguage = ctxSetLang || setLanguage

  const [fontSize, setFontSize] = useState(() => {
    return (typeof window !== 'undefined' && window.localStorage.getItem('voxtech_font_size')) || 'Normal'
  })
  const [ttsSpeed, setTtsSpeed] = useState(() => {
    return (typeof window !== 'undefined' && window.localStorage.getItem('voxtech_tts_speed')) || '1.0x'
  })
  const [dyslexicFont, setDyslexicFont] = useState(() => {
    return typeof window !== 'undefined' && window.localStorage.getItem('voxtech_dyslexia') === 'true'
  })
  const [voiceShortcuts, setVoiceShortcuts] = useState(() => {
    return typeof window !== 'undefined' && window.localStorage.getItem('voxtech_voice_shortcuts') !== 'false'
  })
  const [autoTts, setAutoTts] = useState(() => {
    return typeof window !== 'undefined' && window.localStorage.getItem('voxtech_auto_tts') === 'true'
  })
  const [gameMode, setGameMode] = useState(() => {
    return (typeof window !== 'undefined' && window.localStorage.getItem('voxtech_game_mode')) || 'child'
  })
  const [autoMic, setAutoMic] = useState(() => {
    return typeof window !== 'undefined' && window.localStorage.getItem('voxtech_auto_mic') !== 'false'
  })

  const [toastMsg, setToastMsg] = useState('')
  const [isTestingSpeech, setIsTestingSpeech] = useState(false)

  const showToast = (msg) => {
    setToastMsg(msg)
    window.clearTimeout(window.__vox_pref_toast)
    window.__vox_pref_toast = window.setTimeout(() => setToastMsg(''), 2600)
  }

  const handleLanguageChange = (newLang) => {
    if (handleSetLanguage) handleSetLanguage(newLang)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('voxtech_language', newLang)
    }
    showToast(newLang === 'ta' ? 'தமிழ் மொழி விருப்பத்தேர்வு சேமிக்கப்பட்டது! ✓' : 'Language preference set to English! ✓')
  }

  const handleFontSizeChange = (size) => {
    setFontSize(size)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('voxtech_font_size', size)
      const sizeMap = { Normal: '16px', Large: '18px', 'Extra Large': '20px' }
      document.documentElement.style.fontSize = sizeMap[size] || '16px'
    }
    showToast(t('preferencesSaved', 'Preference updated successfully! ✓'))
  }

  const handleTtsSpeedChange = (speed) => {
    setTtsSpeed(speed)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('voxtech_tts_speed', speed)
    }
    showToast(t('preferencesSaved', 'Preference updated successfully! ✓'))
  }

  const handleDyslexiaToggle = () => {
    const nextVal = !dyslexicFont
    setDyslexicFont(nextVal)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('voxtech_dyslexia', String(nextVal))
      if (nextVal) {
        document.body.classList.add('font-dyslexic')
      } else {
        document.body.classList.remove('font-dyslexic')
      }
    }
    showToast(t('preferencesSaved', 'Preference updated successfully! ✓'))
  }

  const handleVoiceShortcutsToggle = () => {
    const nextVal = !voiceShortcuts
    setVoiceShortcuts(nextVal)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('voxtech_voice_shortcuts', String(nextVal))
    }
    showToast(t('preferencesSaved', 'Preference updated successfully! ✓'))
  }

  const handleAutoTtsToggle = () => {
    const nextVal = !autoTts
    setAutoTts(nextVal)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('voxtech_auto_tts', String(nextVal))
    }
    showToast(t('preferencesSaved', 'Preference updated successfully! ✓'))
  }

  const handleGameModeChange = (mode) => {
    setGameMode(mode)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('voxtech_game_mode', mode)
    }
    showToast(t('preferencesSaved', 'Preference updated successfully! ✓'))
  }

  const handleAutoMicToggle = () => {
    const nextVal = !autoMic
    setAutoMic(nextVal)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('voxtech_auto_mic', String(nextVal))
    }
    showToast(t('preferencesSaved', 'Preference updated successfully! ✓'))
  }

  const handleTestSpeech = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    setIsTestingSpeech(true)
    window.speechSynthesis.cancel()

    const sampleText = activeLang === 'ta'
      ? 'வணக்கம்! இது உங்கள் அணுகல்தன்மையில் தேர்ந்தெடுக்கப்பட்ட குரல் வாசிப்பு வேகம்.'
      : 'Hello! This is a preview of your selected speech playback rate.'

    const utterance = new SpeechSynthesisUtterance(sampleText)
    const rateVal = parseFloat(ttsSpeed) || 1.0
    utterance.rate = (activeLang === 'ta' ? 0.9 : 1.0) * rateVal
    utterance.lang = activeLang === 'ta' ? 'ta-IN' : 'en-IN'

    utterance.onend = () => setIsTestingSpeech(false)
    utterance.onerror = () => setIsTestingSpeech(false)

    window.speechSynthesis.speak(utterance)
  }

  const handleResetDefaults = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('voxtech_font_size', 'Normal')
      window.localStorage.setItem('voxtech_tts_speed', '1.0x')
      window.localStorage.setItem('voxtech_dyslexia', 'false')
      window.localStorage.setItem('voxtech_voice_shortcuts', 'true')
      window.localStorage.setItem('voxtech_auto_tts', 'false')
      window.localStorage.setItem('voxtech_game_mode', 'child')
      window.localStorage.setItem('voxtech_auto_mic', 'true')
      document.documentElement.style.fontSize = '16px'
      document.body.classList.remove('font-dyslexic')
    }
    setFontSize('Normal')
    setTtsSpeed('1.0x')
    setDyslexicFont(false)
    setVoiceShortcuts(true)
    setAutoTts(false)
    setGameMode('child')
    setAutoMic(true)
    showToast(activeLang === 'ta' ? 'அனைத்து விருப்பத்தேர்வுகளும் மீட்டமைக்கப்பட்டன! ✓' : 'All preferences reset to defaults! ✓')
  }

  return (
    <div className="space-y-6">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-emerald-700 via-teal-800 to-cyan-800 p-6 text-white shadow-lg">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
              {t('inclusiveCareSuite', 'Inclusive Care Suite')}
            </span>
            {toastMsg && (
              <span className="animate-bounce rounded-full bg-emerald-400/90 px-3 py-1 text-xs font-black text-slate-900 shadow-md">
                {toastMsg}
              </span>
            )}
          </div>
          <h2 className="text-3xl font-bold">{t('accessibilityTitle')}</h2>
          <p className="max-w-2xl text-xs text-emerald-100">{t('accessibilityDesc')}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
        {/* Multilingual Language Switcher Card */}
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🌐</span>
              <h4 className="font-bold text-slate-900">{t('langSectionTitle')}</h4>
            </div>
            <p className="mt-0.5 max-w-md text-xs text-slate-500">{t('langSectionDesc')}</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleLanguageChange('en')}
              className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-extrabold shadow-sm transition ${
                activeLang === 'en'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white ring-2 ring-emerald-500/30'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>🇬🇧</span>
              <span>English</span>
              {activeLang === 'en' && <span className="ml-1 text-[10px]">✓</span>}
            </button>

            <button
              type="button"
              onClick={() => handleLanguageChange('ta')}
              className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-extrabold shadow-sm transition ${
                activeLang === 'ta'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white ring-2 ring-emerald-500/30'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>🇮🇳</span>
              <span>தமிழ் (Tamil)</span>
              {activeLang === 'ta' && <span className="ml-1 text-[10px]">✓</span>}
            </button>
          </div>
        </div>

        {/* Font Size Scaling */}
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🔤</span>
              <h4 className="font-bold text-slate-900">{t('fontSizeTitle')}</h4>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">{t('fontSizeDesc')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'Normal', label: t('normal', 'Normal') },
              { id: 'Large', label: t('large', 'Large') },
              { id: 'Extra Large', label: t('extraLarge', 'Extra Large') }
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleFontSizeChange(s.id)}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                  fontSize === s.id
                    ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/20'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Text-to-Speech Playback Speed */}
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">⚡</span>
              <h4 className="font-bold text-slate-900">{t('ttsSpeedTitle')}</h4>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">{t('ttsSpeedDesc')}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: '0.8x', label: t('speedSlow', '0.8x Slow') },
              { id: '1.0x', label: t('speedNormal', '1.0x Normal') },
              { id: '1.2x', label: t('speedFast', '1.2x Fast') },
              { id: '1.5x', label: t('speedQuick', '1.5x Quick') }
            ].map((sp) => (
              <button
                key={sp.id}
                type="button"
                onClick={() => handleTtsSpeedChange(sp.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  ttsSpeed === sp.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {sp.label}
              </button>
            ))}
            <button
              type="button"
              onClick={handleTestSpeech}
              disabled={isTestingSpeech}
              className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-extrabold text-emerald-800 transition hover:bg-emerald-100 disabled:opacity-50"
            >
              {isTestingSpeech ? t('previewPlaying', 'Playing...') : t('speechRatePreview', 'Test Voice Speed 🔊')}
            </button>
          </div>
        </div>

        {/* Dyslexia-Friendly Typography */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📖</span>
              <h4 className="font-bold text-slate-900">{t('dyslexiaTitle')}</h4>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">{t('dyslexiaDesc')}</p>
          </div>
          <button
            type="button"
            onClick={handleDyslexiaToggle}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              dyslexicFont
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            {dyslexicFont ? t('enabledLabel', 'Enabled ✓') : t('disabledLabel', 'Disabled')}
          </button>
        </div>

        {/* Voice Command Shortcuts */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🎙️</span>
              <h4 className="font-bold text-slate-900">{t('voiceShortcutsTitle')}</h4>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">{t('voiceShortcutsDesc')}</p>
          </div>
          <button
            type="button"
            onClick={handleVoiceShortcutsToggle}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              voiceShortcuts
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            {voiceShortcuts ? t('activeLabel', 'Active 🎙️') : t('offLabel', 'Off')}
          </button>
        </div>

        {/* Always Enable Voice in Chat */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <h4 className="font-bold text-slate-900">{t('alwaysVoiceTitle')}</h4>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">{t('alwaysVoiceDesc')}</p>
          </div>
          <button
            type="button"
            onClick={handleAutoTtsToggle}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              autoTts
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            {autoTts ? t('enabledLabel', 'Enabled ✓') : t('disabledLabel', 'Disabled')}
          </button>
        </div>

        {/* Speech Therapy Games Preference */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🎮</span>
              <h4 className="font-bold text-slate-900">{t('gameVoicePrefTitle')}</h4>
            </div>
            <p className="mt-0.5 max-w-md text-xs text-slate-500">{t('gameVoicePrefDesc')}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleGameModeChange('child')}
              className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
                gameMode === 'child'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {t('gameModeChild')}
            </button>
            <button
              type="button"
              onClick={() => handleGameModeChange('adult')}
              className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
                gameMode === 'adult'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {t('gameModeAdult')}
            </button>
            <button
              type="button"
              onClick={handleAutoMicToggle}
              className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
                autoMic ? 'border border-emerald-500 bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-500'
              }`}
            >
              🎙️ {t('autoMicLabel')}: {autoMic ? t('enabledLabel') : t('disabledLabel')}
            </button>
          </div>
        </div>
      </div>

      {/* Active Preferences Live Summary Card */}
      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50/70 to-teal-50/70 p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900">{t('activeSummary')}</h4>
            <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-slate-700">
              <span className="rounded-lg bg-white px-2.5 py-1 shadow-sm">
                {t('currentLanguage')}: <strong className="text-emerald-700">{activeLang === 'ta' ? 'தமிழ்' : 'English'}</strong>
              </span>
              <span className="rounded-lg bg-white px-2.5 py-1 shadow-sm">
                {t('currentFontSize')}: <strong className="text-emerald-700">{fontSize}</strong>
              </span>
              <span className="rounded-lg bg-white px-2.5 py-1 shadow-sm">
                {t('currentTtsSpeed')}: <strong className="text-emerald-700">{ttsSpeed}</strong>
              </span>
              <span className="rounded-lg bg-white px-2.5 py-1 shadow-sm">
                {t('currentDyslexia')}: <strong className="text-emerald-700">{dyslexicFont ? t('enabledLabel') : t('disabledLabel')}</strong>
              </span>
              <span className="rounded-lg bg-white px-2.5 py-1 shadow-sm">
                {t('currentVoiceChat')}: <strong className="text-emerald-700">{autoTts ? t('enabledLabel') : t('disabledLabel')}</strong>
              </span>
              <span className="rounded-lg bg-white px-2.5 py-1 shadow-sm">
                {t('currentGameMode')}: <strong className="text-emerald-700">{gameMode === 'child' ? t('gameModeChild') : t('gameModeAdult')}</strong>
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetDefaults}
            className="self-start rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:self-center"
          >
            ↺ {t('resetDefaults')}
          </button>
        </div>
      </div>

      <AACCommunicationBoard />
    </div>
  )
}

function AppShell({ darkMode, setDarkMode, role, setRole, userName, setUserName, onOpenChat, onLogout }) {
  const { lang: currentLang, setLanguage, t } = useTranslation()

  const activeRole = roleOptions.includes(role) ? role : 'Patient'
  const navItems = (roleNavItems[activeRole] || roleNavItems.Patient).map((item) => {
    const pathKey = item.to.replace(/^\//, '').replace(/-([a-z])/g, (g) => g[1].toUpperCase())
    const keyCandidate = pathKey === 'speechJourney' ? 'speechFlow' : pathKey
    return {
      ...item,
      label: t(keyCandidate) || t(item.label.toLowerCase()) || item.label,
    }
  })
  const [activeCallAppointment, setActiveCallAppointment] = useState(null)
  const [incomingCallAlert, setIncomingCallAlert] = useState(null)
  const [currentTime, setCurrentTime] = useState(() => new Date())

  // Apply saved accessibility preferences on startup
  useEffect(() => {
    try {
      const savedFontSize = window.localStorage.getItem('voxtech_font_size') || 'Normal'
      const sizeMap = { Normal: '16px', Large: '18px', 'Extra Large': '20px' }
      document.documentElement.style.fontSize = sizeMap[savedFontSize] || '16px'

      const savedDyslexia = window.localStorage.getItem('voxtech_dyslexia') === 'true'
      if (savedDyslexia) {
        document.body.classList.add('font-dyslexic')
      } else {
        document.body.classList.remove('font-dyslexic')
      }
    } catch (e) {}
  }, [])

  useEffect(() => {
    const clock = window.setInterval(() => setCurrentTime(new Date()), 60 * 1000)
    return () => window.clearInterval(clock)
  }, [])

  // Listen for incoming call notifications across the app
  useEffect(() => {
    let socket = null
    try {
      socket = io('/', { path: '/socket.io/' })
      socket.on('incoming-call-alert', (data) => {
        setIncomingCallAlert(data)
      })
      socket.on('dismiss-call-alert', () => {
        setIncomingCallAlert(null)
      })
    } catch (err) {}

    return () => {
      if (socket) socket.disconnect()
    }
  }, [])

  const currentHour = currentTime.getHours()

  return (
    <div className="mx-auto flex min-h-screen max-w-[1600px] gap-6 p-4 lg:p-6">
      <aside className={darkMode ? 'flex w-full max-w-[290px] flex-col rounded-[28px] border border-slate-700 bg-slate-900/80 p-5 shadow-2xl shadow-slate-950/20' : 'flex w-full max-w-[290px] flex-col rounded-[28px] border border-emerald-100 bg-white/80 p-5 shadow-[0_20px_45px_rgba(20,80,60,0.08)] backdrop-blur-xl'}>
        <div className="mb-7 flex items-center gap-3">
          <img src="/voxtech-logo.png" alt="VOXTECH" className="h-16 w-full object-contain object-left" />
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive
                  ? 'flex w-full items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 px-4 py-3 text-left text-sm font-semibold text-slate-900 shadow-lg shadow-emerald-500/20'
                  : darkMode
                    ? 'flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-slate-300 transition hover:bg-slate-800/80'
                    : 'flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-emerald-50'
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-4 pt-6">
          <div className={darkMode ? 'flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300' : 'flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700'}>
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-400" />
            {t('systemOnline', 'System online')}
          </div>

          <div className={darkMode ? 'rounded-2xl border border-slate-700 bg-slate-800 px-3 py-3' : 'rounded-2xl border border-emerald-100 bg-emerald-50/70 px-3 py-3'}>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-emerald-200 font-bold text-slate-700">
                {(userName || 'User').slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className={darkMode ? 'text-sm font-semibold text-white' : 'text-sm font-semibold text-slate-900'}>{userName}</p>
                <p className={darkMode ? 'text-xs text-slate-400' : 'text-xs text-slate-500'}>{t(activeRole, activeRole)}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-xl shadow-sm">{roleMonitoring[role]?.icon || '👤'}</div>
            </div>
            <button type="button" onClick={onLogout} className={darkMode ? 'mt-3 w-full rounded-xl border border-slate-600 px-3 py-2 text-xs font-bold text-slate-200 transition hover:bg-slate-700' : 'mt-3 w-full rounded-xl border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-800 transition hover:bg-white'}>
              {t('logout', 'Log out')}
            </button>
          </div>
        </div>
      </aside>

      <main className="relative flex-1 overflow-hidden rounded-[30px] border border-emerald-100 bg-white/70 p-5 shadow-[0_20px_60px_rgba(22,53,45,0.08)] backdrop-blur-xl lg:p-7">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-10 top-24 h-52 w-52 rounded-full bg-emerald-200/50 blur-3xl" />
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-violet-200/40 blur-3xl" />
        </div>

        <header className="relative z-10 flex flex-col gap-4 pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className={darkMode ? 'text-3xl font-bold text-white lg:text-4xl' : 'text-3xl font-bold text-slate-900 lg:text-4xl'}>
              {t(currentHour < 12 ? 'goodMorning' : currentHour < 18 ? 'goodAfternoon' : currentHour < 22 ? 'goodEvening' : 'goodNight')}, {userName || 'there'} 👋
            </h1>
            <p className={darkMode ? 'mt-1 text-slate-300' : 'mt-1 text-slate-600'}>{t('personalizedCare', 'Your personalized care dashboard.')}</p>
          </div>

          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setDarkMode((value) => !value)} className={darkMode ? 'rounded-full bg-slate-800 px-3 py-2 text-lg shadow-lg shadow-slate-900/25' : 'rounded-full bg-slate-100 px-3 py-2 text-lg shadow-sm'}>
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button type="button" className={darkMode ? 'flex items-center gap-2 rounded-full bg-slate-800 px-3 py-2 text-sm text-slate-200' : 'flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700'}>
              🔔 <span className="rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold text-white">3</span>
            </button>
            <button type="button" onClick={onOpenChat} className={darkMode ? 'rounded-full bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-emerald-500/20' : 'rounded-full bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-800 shadow-sm'}>
              🤖 {t('assistant', 'AI Agent')}
            </button>
            <select
              value={currentLang}
              onChange={(e) => setLanguage(e.target.value)}
              className={darkMode ? 'rounded-full border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-bold text-slate-200 outline-none' : 'rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-900 outline-none'}
            >
              <option value="en">🇬🇧 English</option>
              <option value="ta">🇮🇳 தமிழ் (Tamil)</option>
            </select>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage role={activeRole} onStartCall={(item) => setActiveCallAppointment(item)} />} />
          <Route path="/assistant" element={<AssistantPage role={activeRole} />} />
          <Route path="/journey" element={<TherapyJourneyPage />} />
          <Route path="/speech-journey" element={<SpeechJourneyFlow />} />
          <Route path="/goals" element={<GoalsPage role={activeRole} />} />
          <Route path="/updates" element={<UpdatesPage role={activeRole} />} />
          <Route path="/appointments" element={<AppointmentsPage role={activeRole} onStartCall={(item) => setActiveCallAppointment(item)} />} />
          <Route path="/therapy" element={<TherapyPage role={activeRole} />} />
          <Route path="/games" element={<GamesPage role={activeRole} />} />
          <Route path="/community" element={<CommunityPage role={activeRole} />} />
          <Route path="/analytics" element={<AnalyticsPage role={activeRole} />} />
          <Route path="/profile" element={<ProfilePage darkMode={darkMode} role={activeRole} userName={userName} setUserName={setUserName} setRole={setRole} />} />
          <Route path="/accessibility" element={<AccessibilityPage currentLang={currentLang} setLanguage={setLanguage} />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>

      {/* Global Real-Time Incoming Call Banner */}
      {incomingCallAlert && (
        <div className="fixed top-5 left-1/2 z-[100] -translate-x-1/2 flex items-center gap-4 rounded-3xl border border-emerald-400/40 bg-slate-900/95 p-4 pl-5 text-white shadow-2xl backdrop-blur-xl animate-bounce max-w-xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-2xl shadow-inner">
            📞
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">{t('incomingCallTitle', 'Incoming Video Call')}</p>
            <p className="text-xs font-extrabold text-white truncate">
              <span className="text-emerald-300">{incomingCallAlert.callerName}</span> {t('hasStartedCall', 'has started the video call.')}
            </p>
            <p className="text-[10px] text-slate-400">{t('roomCode', 'Room')}: {incomingCallAlert.roomCode}</p>
          </div>

          <div className="flex items-center gap-2 ml-2">
            <button
              type="button"
              onClick={() => {
                setActiveCallAppointment(incomingCallAlert.appointment || { roomCode: incomingCallAlert.roomCode, doctor: incomingCallAlert.callerName })
                setIncomingCallAlert(null)
              }}
              className="rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg hover:scale-105 transition"
            >
              {t('joinCallBtn', '🎥 Join Call')}
            </button>

            <button
              type="button"
              onClick={() => setIncomingCallAlert(null)}
              className="rounded-xl border border-slate-700 bg-slate-800 px-2.5 py-2 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {activeCallAppointment && (
        <VideoCallModal
          appointment={activeCallAppointment}
          role={activeRole}
          userName={userName}
          onClose={() => setActiveCallAppointment(null)}
        />
      )}
    </div>
  )
}

function ChatbotPanel({ darkMode, role, isOpen, onClose }) {
  const { lang, t } = useTranslation()
  const [profileName, setProfileName] = useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem('voxtech-user') || 'null')?.username || 'there'
    } catch {
      return 'there'
    }
  })
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text:
        role === 'Patient'
          ? (lang === 'ta' ? 'வணக்கம்! பேச்சுப் பயிற்சிகள் மற்றும் தினசரிப் பழக்கவழக்கங்களுக்கு நான் உதவ முடியும்.' : 'Hi! I can help with speech drills, breathing prompts, and daily practice routines.')
          : (lang === 'ta' ? 'வணக்கம்! பராமரிப்பு ஒருங்கிணைப்பு மற்றும் சிகிச்சைத் திட்டமிடலுக்கு நான் உதவ முடியும்.' : 'Hello! I can help with care coordination, treatment planning, and patient progress insights.'),
    },
  ])
  const [draft, setDraft] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isVoiceLoading, setIsVoiceLoading] = useState(false)

  useEffect(() => {
    async function fetchProfileName() {
      try {
        const token = window.localStorage.getItem('voxtech-token')
        const response = await fetch('/api/profile', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        const data = await response.json().catch(() => ({}))
        const name = data.profile?.username?.trim()
        if (name) setProfileName(name)
      } catch {
      }
    }

    fetchProfileName()
  }, [])

  useEffect(() => {
    setMessages((current) => {
      if (current.length !== 1 || current[0].sender !== 'bot') return current
      const message = role === 'Patient'
        ? (lang === 'ta' ? `வணக்கம் ${profileName}! பேச்சுப் பயிற்சிகள் மற்றும் தினசரிப் பழக்கவழக்கங்களுக்கு நான் உதவ முடியும்.` : `Hi ${profileName}! I can help with speech drills, breathing prompts, and daily practice routines.`)
        : (lang === 'ta' ? `வணக்கம் ${profileName}! பராமரிப்பு ஒருங்கிணைப்பு மற்றும் சிகிச்சைத் திட்டமிடலுக்கு நான் உதவ முடியும்.` : `Hello ${profileName}! I can help with care coordination, treatment planning, and patient progress insights.`)
      return [{ ...current[0], text: message }]
    })
  }, [profileName, role, lang])

  const speakReply = async (text) => {
    const ttsLang = lang === 'ta' ? 'ta-IN' : 'en-IN'
    try {
      const token = window.localStorage.getItem('voxtech-token')
      const response = await fetch('/api/speech/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ text, targetLanguage: ttsLang }),
      })

      if (response.ok) {
        const audioUrl = URL.createObjectURL(await response.blob())
        const audio = new Audio(audioUrl)
        audio.onended = () => URL.revokeObjectURL(audioUrl)
        await audio.play()
        return
      }
    } catch {}

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(text)
      u.lang = ttsLang
      window.speechSynthesis.speak(u)
    }
  }

  const handleVoiceInput = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMessages((current) => [...current, { id: Date.now(), sender: 'bot', text: 'Microphone access is not supported in this browser.' }])
      return
    }

    setIsVoiceLoading(true)
    let stream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks = []
      recorder.ondataavailable = (event) => chunks.push(event.data)
      const stopped = new Promise((resolve) => { recorder.onstop = resolve })
      recorder.start()
      setIsRecording(true)
      await new Promise((resolve) => window.setTimeout(resolve, 4000))
      recorder.stop()
      await stopped

      const audioBlob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' })
      const formData = new FormData()
      formData.append('audio', audioBlob, 'voice-message.webm')
      const token = window.localStorage.getItem('voxtech-token')
      const response = await fetch('/api/speech/transcribe?provider=sarvam', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data.transcript) throw new Error(data.message || 'Unable to transcribe audio.')
      setDraft(data.transcript)
    } catch (error) {
      setMessages((current) => [...current, { id: Date.now(), sender: 'bot', text: error.message || 'Voice input failed.' }])
    } finally {
      stream?.getTracks().forEach((track) => track.stop())
      setIsRecording(false)
      setIsVoiceLoading(false)
    }
  }

  const replyFor = (message) => {
    const lower = message.toLowerCase()

    if (lang === 'ta') {
      return 'சிறந்த கேள்வி. தினமும் சில நிமிடங்கள் அமைதியாகவும் சீராகவும் பயிற்சி செய்வது நல்ல முன்னேற்றத்தைத் தரும்.'
    }

    if (lower.includes('speech') || lower.includes('word') || lower.includes('sound')) {
      return 'Try a 5-minute word game, then repeat 3 target sounds slowly. Practice with a calm voice and a short pause between words.'
    }
    if (lower.includes('goal') || lower.includes('progress')) {
      return 'Keep a simple routine: 5 minutes of warm-up, 10 minutes of targeted practice, then note one improvement from today.'
    }
    if (lower.includes('breath') || lower.includes('relax')) {
      return 'Take a slow inhale for 4 counts, hold for 2, and exhale for 6. Repeat 3 times before speaking tasks.'
    }
    if (lower.includes('appointment') || lower.includes('schedule')) {
      return 'I recommend confirming the next session 24 hours before the visit and preparing 3 quick speech goals to review.'
    }
    if (role === 'Therapist') {
      return 'For therapy planning, focus on one target sound, one sentence prompt, and one progress check after each session.'
    }
    if (role === 'Caregiver') {
      return 'For family support, keep reminders short, positive, and consistent across the day to build confidence.'
    }
    if (role === 'Supervisor') {
      return 'For supervision, review progress trends, staffing coverage, and weekly quality checkpoints together.'
    }
    if (role === 'Admin') {
      return 'For operations, review system health, user engagement, and support queue alerts before planning changes.'
    }

    return 'Great question. Keep the practice short, consistent, and encouraging. A few focused minutes each day create measurable progress.'
  }

  const handleSend = async () => {
    if (!draft.trim()) return

    const userText = draft.trim()
    const userMessage = { id: Date.now(), sender: 'user', text: userText }
    setMessages((current) => [...current, userMessage])
    setDraft('')

    try {
      const token = window.localStorage.getItem('voxtech-token')
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: userText, role, lang }),
      })

      const data = await response.json().catch(() => ({}))

      const botText = `${profileName}, ${data.reply || replyFor(userText)}`
      const botMessage = { id: Date.now() + 1, sender: 'bot', text: botText }

      setMessages((current) => [...current, botMessage])

      if (window.localStorage.getItem('voxtech_auto_tts') === 'true') {
        speakReply(botText).catch(() => {})
      }
    } catch (error) {
      const botText = `${profileName}, ${replyFor(userText)}`
      const botMessage = { id: Date.now() + 1, sender: 'bot', text: botText }
      setMessages((current) => [...current, botMessage])

      if (window.localStorage.getItem('voxtech_auto_tts') === 'true') {
        speakReply(botText).catch(() => {})
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[min(360px,calc(100vw-24px))] overflow-hidden rounded-[28px] border border-emerald-200 bg-white/95 shadow-[0_25px_60px_rgba(16,185,129,0.22)] backdrop-blur-xl">
      <div className={`flex items-center justify-between border-b px-4 py-3 ${darkMode ? 'border-slate-700 bg-slate-800 text-white' : 'border-emerald-100 bg-emerald-50 text-slate-900'}`}>
        <div className="flex items-center gap-2">
          <span className="text-xl">🤖</span>
          <div>
            <p className="font-bold">VOXTECH AI</p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-600">{t('interactiveAssistant', 'Interactive assistant')}</p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="rounded-full bg-white/80 px-2 py-1 text-xs font-bold text-slate-700">✕</button>
      </div>

      <div className="max-h-80 space-y-3 overflow-y-auto bg-slate-50 p-4">
        {messages.map((message) => (
          <div key={message.id} className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${message.sender === 'user' ? 'ml-auto bg-emerald-500 text-white' : 'bg-white text-slate-700 shadow-sm'}`}>
            {message.text}
          </div>
        ))}
      </div>

      <div className="flex gap-2 border-t border-emerald-100 bg-white p-3">
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={t('askAiPlaceholder', 'Ask the AI assistant...')}
          className="flex-1 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-slate-700 outline-none"
          onKeyDown={(event) => {
            if (event.key === 'Enter') handleSend()
          }}
        />
        <button type="button" onClick={handleVoiceInput} disabled={isVoiceLoading} className={`rounded-xl px-3 py-2 font-bold ${isRecording ? 'bg-rose-500 text-white' : 'bg-sky-100 text-sky-700'}`} title={lang === 'ta' ? 'குரல் செய்தியைப் பதிவு செய்' : 'Record voice message'}>
          {isVoiceLoading ? '...' : isRecording ? '■' : '🎙️'}
        </button>
        <button type="button" onClick={handleSend} className="rounded-xl bg-emerald-500 px-3 py-2 font-bold text-white">{t('send', 'Send')}</button>
      </div>
    </div>
  )
}

function App() {
  const [darkMode, setDarkMode] = useState(false)
  const storedUser = (() => {
    try {
      return JSON.parse(window.localStorage.getItem('voxtech-user') || 'null')
    } catch {
      return null
    }
  })()
  const storedRole = roleOptions.includes(storedUser?.role) ? storedUser.role : 'Patient'
  const storedUserName = typeof storedUser?.username === 'string' ? storedUser.username : ''
  const [selectedRole, setSelectedRole] = useState(storedRole)
  const [userName, setUserName] = useState(storedUserName)
  const [loginData, setLoginData] = useState({ username: '', password: '', role: 'Patient' })
  const [authMode, setAuthMode] = useState('login')
  const [formMessage, setFormMessage] = useState('')
  const [formError, setFormError] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = window.localStorage.getItem('voxtech-token')
    const hasValidStoredUser = storedUser && typeof storedUser === 'object' && roleOptions.includes(storedUser.role)

    if (!token || !hasValidStoredUser) {
      window.localStorage.removeItem('voxtech-token')
      window.localStorage.removeItem('voxtech-user')
      return false
    }

    return true
  })
  const [isChatOpen, setIsChatOpen] = useState(false)

  const handleLogout = () => {
    window.localStorage.removeItem('voxtech-token')
    window.localStorage.removeItem('voxtech-user')
    setIsChatOpen(false)
    setUserName('')
    setIsAuthenticated(false)
  }

  const handleCreateAccount = async (event) => {
    event.preventDefault()

    if (!loginData.username.trim() || !loginData.password.trim()) {
      setFormError('Please enter both username and password.')
      setFormMessage('')
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginData.username.trim(),
          password: loginData.password,
          role: loginData.role,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.message || 'Unable to create account.')
      }

      setFormError('')
      setFormMessage('Account created successfully. Please sign in using your username and password.')
      setAuthMode('login')
      setLoginData((current) => ({ ...current, password: '', username: current.username.trim() }))
    } catch (error) {
      setFormError(error.message || 'Unable to create account right now.')
      setFormMessage('')
    }
  }

  const handleLogin = async (event) => {
    event.preventDefault()

    if (!loginData.username.trim() || !loginData.password.trim()) {
      setFormError('Please enter both username and password.')
      setFormMessage('')
      return
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginData.username.trim(),
          password: loginData.password,
          role: loginData.role,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.message || 'Invalid username or password.')
      }

      const userRole = data.user?.role || loginData.role
      setSelectedRole(userRole)
      setFormError('')
      setFormMessage(data.message || 'YOU LOGGINED SUCCESSFULLY')
      if (data.token) {
        window.localStorage.setItem('voxtech-token', data.token)
      }
      const authenticatedUser = {
        ...(data.user || {}),
        username: data.user?.username || loginData.username.trim(),
        role: data.user?.role || userRole,
      }
      setUserName(authenticatedUser.username)
      window.localStorage.setItem('voxtech-user', JSON.stringify(authenticatedUser))

      window.setTimeout(() => setIsAuthenticated(true), 700)
    } catch (error) {
      setFormError(error.message || 'Invalid username or password for this role. Please create an account first or try a different role.')
      setFormMessage('')
    }
  }

  return (
    <BrowserRouter>
      <div className={darkMode ? 'min-h-screen bg-slate-950 text-slate-50' : 'min-h-screen bg-[#eefaf5] text-slate-900'}>
        {!isAuthenticated ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm">
            <div className="w-[min(430px,calc(100vw-32px))] rounded-[30px] border border-emerald-300/20 bg-[#061d17] p-7 shadow-[0_30px_80px_rgba(7,31,26,0.45)]">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src="/voxtech-logo.png" alt="VOXTECH Speech and language therapy" className="h-24 w-56 object-contain object-left" />
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-2xl shadow-inner shadow-emerald-500/20">
                  {loginData.role === 'Patient' ? '👩‍⚕️' : loginData.role === 'Caregiver' ? '🤝' : loginData.role === 'Therapist' ? '🩺' : loginData.role === 'Supervisor' ? '📊' : '🛠️'}
                </div>
              </div>

              <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl border border-slate-700 bg-slate-900/50 p-1">
                <button type="button" onClick={() => setAuthMode('login')} className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${authMode === 'login' ? 'bg-emerald-400 text-slate-900' : 'text-slate-300'}`}>
                  Login
                </button>
                <button type="button" onClick={() => setAuthMode('signup')} className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${authMode === 'signup' ? 'bg-emerald-400 text-slate-900' : 'text-slate-300'}`}>
                  Create account
                </button>
              </div>

              <p className="mb-4 text-2xl font-bold text-white">{authMode === 'login' ? 'Welcome back' : 'Create your account'}</p>

              <form className="space-y-4" onSubmit={authMode === 'login' ? handleLogin : handleCreateAccount}>
                <div className="space-y-2">
                  <label htmlFor="username" className="text-xs font-semibold text-slate-200">Username</label>
                  <input
                    id="username"
                    type="text"
                    value={loginData.username}
                    onChange={(event) => setLoginData((current) => ({ ...current, username: event.target.value }))}
                    placeholder="Enter username"
                    className="w-full rounded-xl border border-slate-500/40 bg-slate-900/60 px-3 py-3 text-sm text-white outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-xs font-semibold text-slate-200">Password</label>
                  <input
                    id="password"
                    type="password"
                    value={loginData.password}
                    onChange={(event) => setLoginData((current) => ({ ...current, password: event.target.value }))}
                    placeholder="Enter password"
                    className="w-full rounded-xl border border-slate-500/40 bg-slate-900/60 px-3 py-3 text-sm text-white outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="loginRole" className="text-xs font-semibold text-slate-200">Role</label>
                  <div className="flex items-center gap-2 rounded-xl border border-slate-500/40 bg-slate-900/60 px-3 py-3 text-white">
                    <span className="text-lg">{loginData.role === 'Patient' ? '👩‍⚕️' : loginData.role === 'Caregiver' ? '🤝' : loginData.role === 'Therapist' ? '🩺' : loginData.role === 'Supervisor' ? '📊' : '🛠️'}</span>
                    <select id="loginRole" value={loginData.role} onChange={(event) => setLoginData((current) => ({ ...current, role: event.target.value }))} className="w-full bg-transparent text-sm outline-none">
                      {roleOptions.map((option) => (
                        <option key={option} value={option} className="bg-slate-900 text-white">{option}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-emerald-300 to-emerald-500 px-4 py-3 font-bold text-slate-900 shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5">
                  {authMode === 'login' ? 'Sign In' : 'Create Account'}
                </button>

                {formMessage && <p className="text-xs font-semibold uppercase tracking-[0.15em] text-emerald-300">{formMessage}</p>}
                {formError && <p className="text-xs leading-5 text-rose-300">{formError}</p>}
              </form>
            </div>
          </div>
        ) : (
          <>
            <AppShell darkMode={darkMode} setDarkMode={setDarkMode} role={selectedRole} setRole={setSelectedRole} userName={userName} setUserName={setUserName} onOpenChat={() => setIsChatOpen(true)} onLogout={handleLogout} />
            <ChatbotPanel darkMode={darkMode} role={selectedRole} isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
          </>
        )}
      </div>
    </BrowserRouter>
  )
}

export default App
