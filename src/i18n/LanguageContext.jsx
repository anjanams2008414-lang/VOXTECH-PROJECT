import { createContext, useContext, useState } from 'react'
import { translations } from './translations'

const dynamicPhraseMapTa = {
  'Senior Speech Pathologist': 'மூத்த பேச்சு நோயியல் நிபுணர்',
  'Cognitive Rehab Specialist': 'அறிவாற்றல் மறுவாழ்வு நிபுணர்',
  'Language Development Lead': 'மொழி வளர்ச்சித் தலைவர்',
  'Clinical Care Lead': 'மருத்துவப் பராமரிப்புத் தலைவர்',
  'Home Support Specialist': 'வீட்டு ஆதரவு நிபுணர்',
  'Speech Fluency Session': 'பேச்சு ஓட்ட அமர்வு',
  'Peer Case Review': 'சிகிச்சையாளர் வழக்கு ஆய்வுக் கூட்டம்',
  'Operations Huddle': 'செயல்பாட்டுக் குழு கூட்டம்',
  'Quality Audit Panel': 'தர தணிக்கைக் குழு',
  'Therapy Platform Consult': 'சிகிச்சைத் தள ஆலோசனை',
  'Infrastructure Check-in': 'கட்டமைப்பு சோதனைக் கூட்டம்',
  'Speech therapy & articulation follow-up': 'பேச்சு சிகிச்சை மற்றும் உச்சரிப்பு பின்தொடர்தல்',
  'Fluency & sentence building drill': 'சரளமான பேச்சு மற்றும் வாக்கியப் பயிற்சி',
  'Caregiver & patient progress briefing': 'பராமரிப்பாளர் மற்றும் நோயாளி முன்னேற்ற அறிக்கை',
  'Care update & therapy goal sign-off': 'பராமரிப்பு செய்திகள் மற்றும் சிகிச்சை இலக்கு உறுதிப்படுத்தல்',
  'Medication & daily routine review': 'மருந்து மற்றும் தினசரி வழக்கமான ஆய்வு',
  'Targeted articulation check-in': 'உச்சரிப்பு சோதனை அமர்வு',
  'Clinical treatment outcome review': 'சிகிச்சை முடிவு மதிப்பாய்வு',
  'Coverage & quality planning': 'சேவை அளவு மற்றும் தரத் திட்டமிடல்',
  'Monthly escalation audit': 'மாதாந்திர செயல்பாட்டு தணிக்கை',
  'System performance & live metrics check': 'அமைப்பு செயல்திறன் மற்றும் அளவீடுகள் சோதனை',
  'Maintenance & WebRTC signaling window': 'பராமரிப்பு மற்றும் WebRTC நெட்வொர்க் சோதனை',
  'Starting Soon': 'விரைவில் தொடங்கும்',
  'Scheduled': 'திட்டமிடப்பட்டது',
  'Confirmed': 'உறுதிப்படுத்தப்பட்டது',
  'Completed': 'நிறைவடைந்தது',
  'Pending': 'நிலுவையில் உள்ளது',
  'Cancelled': 'ரத்து செய்யப்பட்டது',
  'Breathing exercise': 'மூச்சுப் பயிற்சி',
  'Morning routine': 'காலை வழக்கம்',
  'Medication log': 'மருந்து பதிவு',
  'Language practice': 'மொழிப் பயிற்சி',
  '20-minute drill': '20 நிமிட பயிற்சி',
  'Focus areas for today': 'இன்றைய முக்கிய கவனம் செலுத்தும் பகுதிகள்',
  'Scheduled video sessions': 'திட்டமிடப்பட்ட வீடியோ அழைப்புகள்',
  'Recent progress': 'சமீபத்திய முன்னேற்றம்',
  'Care plan refreshed': 'பராமரிப்பு திட்டம் புதுப்பிக்கப்பட்டது',
  'New exercises assigned post session': 'அமர்வுக்குப் பிறகு புதிய பயிற்சிகள் ஒதுக்கப்பட்டன',
  'Recovery milestones': 'மீட்பு மைல்கற்கள்',
  'Progress improved by 12% this week': 'இந்த வாரம் முன்னேற்றம் 12% மேம்பட்டுள்ளது',
  'Doctor note shared': 'மருத்துவர் குறிப்பு பகிரப்பட்டது',
  'Recommendations uploaded to patient portal': 'பரிந்துரைகள் நோயாளி தளத்தில் பதிவேற்றப்பட்டன',
  'Daily care summary': 'தினசரி பராமரிப்பு சுருக்கம்',
  'Medication and hydration tracking refreshed': 'மருந்து மற்றும் நீர்ச்சத்து கண்காணிப்பு புதுப்பிக்கப்பட்டது',
  'Family support update': 'குடும்ப ஆதரவு செய்தி',
  'Short-term recovery milestones shared': 'குறுகிய கால மீட்பு மைல்கற்கள் பகிரப்பட்டன',
  'Check-in completed': 'ஆய்வு முடிந்தது',
  'Home support plan reviewed with family': 'வீட்டு ஆதரவு திட்டம் குடும்பத்துடன் மதிப்பாய்வு செய்யப்பட்டது',
  'Session notes released': 'அமர்வு குறிப்புகள் வெளியிடப்பட்டன',
  'Updated treatment objectives sent to team': 'புதுப்பிக்கப்பட்ட சிகிச்சை நோக்கங்கள் குழுவுக்கு அனுப்பப்பட்டன',
  'Target milestone hit': 'இலக்கு மைல்கல் எட்டப்பட்டது',
  'Therapy completion rate improved this week': 'சிகிச்சை நிறைவு விகிதம் இந்த வாரம் மேம்பட்டது',
  'Follow-up scheduled': 'பின்தொடர்தல் திட்டமிடப்பட்டது',
  'Next patient review reviewed with clinical team': 'அடுத்த நோயாளி மதிப்பாய்வு மருத்துவ குழுவுடன் ஆய்வு செய்யப்பட்டது',
  'Operations review': 'செயல்பாட்டு மதிப்பாய்வு',
  'Team responsiveness above target threshold': 'குழுவின் பதிலளிப்பு இலக்கு நிலைக்கு மேல் உள்ளது',
  'Quality report': 'தர அறிக்கை',
  'Patient satisfaction trend remains strong': 'நோயாளி திருப்திப் போக்கு வலுவாக உள்ளது',
  'Coverage snapshot': 'சேவை அளவு மேலோட்டம்',
  'Support coverage and staffing balanced': 'ஆதரவு சேவைகளும் பணியாளர்களும் சீராக உள்ளனர்',
  'Platform health check': 'தள ஆரோக்கிய சோதனை',
  'All critical services remain stable': 'அனைத்து முக்கிய சேவைகளும் சீராக உள்ளன',
  'Usage insights': 'பயன்பாட்டு நுண்ணறிவு',
  'User activity increased across care teams': 'பராமரிப்பு குழுக்களில் பயனர் செயல்பாடு அதிகரித்துள்ளது',
  'Deployment notice': 'அமைப்பு புதுப்பிப்பு செய்தி',
  'Scheduled maintenance completed without issue': 'திட்டமிட்ட பராமரிப்பு பிரச்சனை ஏதுமின்றி நிறைவடைந்தது',
  'Support circle': 'ஆதரவு வட்டம்',
  '12 caregivers active today': 'இன்று 12 பராமரிப்பாளர்கள் செயலில் உள்ளனர்',
  'Peer insights': 'சக கருத்துகள்',
  'Share coping strategies': 'எளிதாக்கும் உத்திகளைப் பகிரவும்',
  'Care partners': 'பராமரிப்பு பங்காளிகள்',
  '8 caregivers linked to patient plans': '8 பராமரிப்பாளர்கள் நோயாளிகளுடன் இணைக்கப்பட்டுள்ளனர்',
  'Resource room': 'வள அறை',
  'New recovery guides shared this week': 'இந்த வாரம் புதிய மீட்பு வழிகாட்டிகள் பகிரப்பட்டன',
  'Clinical exchange': 'மருத்துவ பரிமாற்றம்',
  'Speech': 'பேச்சு',
  'Breathing': 'மூச்சு பயிற்சி',
  'Fluency': 'பேச்சு ஓட்டம்',
  'Cognitive': 'அறிவாற்றல்',
  'Clinical Note': 'மருத்துவக் குறிப்பு',
  'Milestone': 'மைல்கல்',
  'Therapist Feedback': 'சிகிச்சையாளர் கருத்துகள்',
  'Family Observation': 'குடும்ப அவதானிப்பு',
  'Patient': 'நோயாளி',
  'Caregiver': 'பராமரிப்பாளர்',
  'Therapist': 'சிகிச்சையாளர்',
  'Supervisor': 'மேற்பார்வையாளர்',
  'Admin': 'நிர்வாகி',
}

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem('voxtech_language') || 'en'
    }
    return 'en'
  })

  const setLanguage = (newLang) => {
    setLang(newLang)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('voxtech_language', newLang)
    }
  }

  const t = (key, fallback = '') => {
    if (!key) return fallback
    const dict = translations[lang] || translations.en
    if (dict[key]) return dict[key]
    if (translations.en[key]) return translations.en[key]
    if (lang === 'ta') {
      if (dynamicPhraseMapTa[key]) return dynamicPhraseMapTa[key]
      if (fallback && dynamicPhraseMapTa[fallback]) return dynamicPhraseMapTa[fallback]
    }
    return fallback || key
  }

  return (
    <LanguageContext.Provider value={{ lang, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(LanguageContext)
  if (!context) {
    const fallbackLang = (typeof window !== 'undefined' && window.localStorage.getItem('voxtech_language')) || 'en'
    return {
      lang: fallbackLang,
      setLanguage: () => {},
      t: (key, fallback = '') => {
        const dict = translations[fallbackLang] || translations.en
        if (dict[key]) return dict[key]
        if (translations.en[key]) return translations.en[key]
        if (fallbackLang === 'ta') {
          if (dynamicPhraseMapTa[key]) return dynamicPhraseMapTa[key]
          if (fallback && dynamicPhraseMapTa[fallback]) return dynamicPhraseMapTa[fallback]
        }
        return fallback || key
      },
    }
  }
  return context
}
