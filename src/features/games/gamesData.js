/**
 * VOXTECH Therapy Quest — Game Dataset
 * 10 Voice-Interactive Games (5 Child Mode, 5 Adult Mode)
 * Full bilingual support (English & Tamil)
 */

export const CHILD_GAMES = [
  {
    id: 'picture-talk',
    nameKey: 'pictureTalkTitle',
    descKey: 'pictureTalkDesc',
    targetsKey: 'pictureTalkTargets',
    icon: '🖼️',
    gradient: 'from-amber-400 via-orange-500 to-rose-500',
    accentColor: '#f97316',
    category: 'Expressive Language',
    xpReward: 60,
    starsAvailable: 3,
    activities: [
      {
        id: 'pt-1',
        title: { en: 'Majestic Lion', ta: 'கம்பீரமான சிங்கம்' },
        prompt: {
          en: 'Look at this picture! Say what animal you see aloud!',
          ta: 'இந்தப் படத்தைப் பாருங்கள்! நீங்கள் காணும் விலங்கை சத்தமாகச் சொல்லுங்கள்!',
        },
        targetWords: {
          en: ['Lion', 'Big lion', 'Wild lion', 'Roar'],
          ta: ['சிங்கம்', 'பெரிய சிங்கம்', 'காட்டு சிங்கம்', 'singam', 'singham', 'lion'],
        },
        exemplar: {
          en: 'This is a brave lion!',
          ta: 'இது ஒரு கம்பீரமான சிங்கம்!',
        },
        hint: {
          en: 'It has a big golden mane and roars in the jungle!',
          ta: 'இது பிடரி மயிர் கொண்ட காட்டரசன்!',
        },
        imageSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" rx="24" fill="#fef3c7"/>
          <circle cx="100" cy="100" r="56" fill="#f59e0b"/>
          <circle cx="100" cy="100" r="42" fill="#fbbf24"/>
          <!-- Mane spikes -->
          <path d="M100 30 L108 44 L120 34 L122 49 L136 43 L132 58 L147 56 L139 70 L153 74 L141 86 L154 94 L139 102 L150 114 L134 118 L142 132 L127 131 L131 146 L116 142 L116 157 L103 149 L98 163 L89 150 L79 161 L75 146 L63 153 L63 138 L49 141 L54 126 L41 123 L51 110 L39 102 L52 92 L42 80 L56 74 L49 61 L64 60 L62 45 L76 50 L80 35 L91 46 Z" fill="#d97706"/>
          <!-- Face -->
          <circle cx="100" cy="104" r="34" fill="#fef3c7"/>
          <ellipse cx="90" cy="98" rx="4" ry="6" fill="#78350f"/>
          <ellipse cx="110" cy="98" rx="4" ry="6" fill="#78350f"/>
          <circle cx="91" cy="96" r="1.5" fill="#fff"/>
          <circle cx="111" cy="96" r="1.5" fill="#fff"/>
          <polygon points="100,106 94,114 106,114" fill="#b45309"/>
          <path d="M100 114 C96 122 88 120 86 116 M100 114 C104 122 112 120 114 116" stroke="#78350f" stroke-width="2.5" stroke-linecap="round"/>
          <circle cx="82" cy="106" r="3" fill="#fca5a5"/>
          <circle cx="118" cy="106" r="3" fill="#fca5a5"/>
        </svg>`,
      },
      {
        id: 'pt-2',
        title: { en: 'Red Bicycle', ta: 'சிவப்பு மிதிவண்டி' },
        prompt: {
          en: 'What is this vehicle? Say the word aloud into your microphone!',
          ta: 'இது என்ன வாகனம்? உங்கள் மைக்ரோஃபோனில் சத்தமாகக் கூறுங்கள்!',
        },
        targetWords: {
          en: ['Bicycle', 'Bike', 'Cycle', 'Red bicycle'],
          ta: ['மிதிவண்டி', 'சைக்கிள்', 'சிவப்பு மிதிவண்டி', 'cycle', 'bicycle', 'mithivandi'],
        },
        exemplar: {
          en: 'It is a shiny red bicycle!',
          ta: 'இது ஒரு அழகான சிவப்பு மிதிவண்டி!',
        },
        hint: {
          en: 'You pedal with your feet and ring the bell: Ding ding!',
          ta: 'கால்களால் மிதித்து ஓட்டும் இருசக்கர வாகனம்!',
        },
        imageSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" rx="24" fill="#fee2e2"/>
          <circle cx="60" cy="130" r="28" stroke="#334155" stroke-width="5" fill="none"/>
          <circle cx="140" cy="130" r="28" stroke="#334155" stroke-width="5" fill="none"/>
          <circle cx="60" cy="130" r="4" fill="#ef4444"/>
          <circle cx="140" cy="130" r="4" fill="#ef4444"/>
          <!-- Spokes -->
          <line x1="60" y1="102" x2="60" y2="158" stroke="#94a3b8" stroke-width="2"/>
          <line x1="32" y1="130" x2="88" y2="130" stroke="#94a3b8" stroke-width="2"/>
          <line x1="140" y1="102" x2="140" y2="158" stroke="#94a3b8" stroke-width="2"/>
          <line x1="112" y1="130" x2="168" y2="130" stroke="#94a3b8" stroke-width="2"/>
          <!-- Frame -->
          <path d="M60 130 L95 130 L130 90 L85 90 Z" stroke="#ef4444" stroke-width="5" stroke-linejoin="round" fill="none"/>
          <line x1="60" y1="130" x2="85" y2="90" stroke="#ef4444" stroke-width="5"/>
          <line x1="95" y1="130" x2="90" y2="75" stroke="#ef4444" stroke-width="5"/>
          <line x1="140" y1="130" x2="125" y2="68" stroke="#334155" stroke-width="5"/>
          <!-- Seat and Handle -->
          <path d="M80 75 L102 75" stroke="#1e293b" stroke-width="6" stroke-linecap="round"/>
          <path d="M115 65 L132 68 L142 68" stroke="#1e293b" stroke-width="4" stroke-linecap="round" fill="none"/>
        </svg>`,
      },
      {
        id: 'pt-3',
        title: { en: 'Sweet Apple', ta: 'இனிய ஆப்பிள்' },
        prompt: {
          en: 'What tasty fruit is this? Speak the name clearly!',
          ta: 'இது என்ன சுவையான பழம்? இதன் பெயரைத் தெளிவாகக் கூறுங்கள்!',
        },
        targetWords: {
          en: ['Apple', 'Red apple', 'Sweet apple', 'Fruit'],
          ta: ['ஆப்பிள்', 'ஆப்பிள் பழம்', 'சிவப்பு ஆப்பிள்', 'apple', 'pazham', 'fruit'],
        },
        exemplar: {
          en: 'A crisp red apple!',
          ta: 'ஒரு சுவையான சிவப்பு ஆப்பிள்!',
        },
        hint: {
          en: 'It is round, crunchy, red, and keeps the doctor away!',
          ta: 'தினமும் ஒன்று உண்டால் மருத்துவரிடம் செல்ல வேண்டாம் என்பார்கள்!',
        },
        imageSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" rx="24" fill="#ecfdf5"/>
          <path d="M100 70 C70 40 40 75 45 115 C50 150 78 165 100 160 C122 165 150 150 155 115 C160 75 130 40 100 70 Z" fill="#dc2626"/>
          <path d="M96 68 C80 48 55 75 60 110 C65 140 85 155 98 152 C95 130 92 90 96 68 Z" fill="#ef4444" opacity="0.6"/>
          <!-- Stem and leaf -->
          <path d="M100 68 C100 50 106 35 112 30" stroke="#78350f" stroke-width="5" stroke-linecap="round" fill="none"/>
          <path d="M106 45 C120 38 135 45 132 58 C118 62 108 55 106 45 Z" fill="#22c55e"/>
          <!-- Shine highlight -->
          <ellipse cx="75" cy="95" rx="8" ry="16" fill="#fff" opacity="0.3" transform="rotate(-25 75 95)"/>
        </svg>`,
      },
    ],
  },
  {
    id: 'sound-safari',
    nameKey: 'soundSafariTitle',
    descKey: 'soundSafariDesc',
    targetsKey: 'soundSafariTargets',
    icon: '🦁',
    gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
    accentColor: '#10b981',
    category: 'Articulation & Phonology',
    xpReward: 70,
    starsAvailable: 3,
    soundPositions: ['Initial', 'Medial', 'Final'],
    activities: [
      {
        id: 'ss-1',
        sound: 's',
        soundTa: 'ச',
        position: 'Initial',
        title: { en: 'Target /s/ Sound — Sun & Snake', ta: 'இலக்கு /ச/ ஒலி — சூரியன்' },
        prompt: {
          en: 'Safari explorer! Make the snake sound: "Sssss"! Then say the word "Sun"!',
          ta: 'சஃபாரி ஆய்வாளர்! பாம்பு போல "ஸ்ஸ்ஸ்" என்று சொல்லி, பின்னர் "சூரியன்" என்று சொல்லுங்கள்!',
        },
        targetWords: {
          en: ['Sun', 'Snake', 'Safari', 'Star'],
          ta: ['சூரியன்', 'பாம்பு', 'சஃபாரி', 'suriyan', 'paambu', 'safari', 'sun', 'snake'],
        },
        exemplar: {
          en: 'Sssss... Sun! The bright sun is smiling.',
          ta: 'ஸ்ஸ்ஸ்... சூரியன்! பிரகாசமான சூரியன்.',
        },
        progression: [
          { level: 'Sound', levelTa: 'ஒலி', target: 'Sssss', targetTa: 'ஸ்ஸ்ஸ்', promptEn: 'Make the sound: Sssss', promptTa: 'ஒலி எழுப்புங்கள்: ஸ்ஸ்ஸ்' },
          { level: 'Word', levelTa: 'சொல்', target: 'Sun', targetTa: 'சூரியன்', promptEn: 'Say the word: Sun', promptTa: 'சொல்லைக் கூறுங்கள்: சூரியன்' },
          { level: 'Phrase', levelTa: 'சொற்றொடர்', target: 'Warm Sun', targetTa: 'வெதுவெதுப்பான சூரியன்', promptEn: 'Say the phrase: Warm Sun', promptTa: 'சொற்றொடர்: வெதுவெதுப்பான சூரியன்' },
          { level: 'Sentence', levelTa: 'வாக்கியம்', target: 'The warm sun shines', targetTa: 'சூரியன் பிரகாசிக்கிறது', promptEn: 'Say the sentence: The warm sun shines', promptTa: 'வாக்கியம்: சூரியன் பிரகாசிக்கிறது' },
        ],
      },
      {
        id: 'ss-2',
        sound: 'r',
        soundTa: 'ர',
        position: 'Initial & Medial',
        title: { en: 'Target /r/ Sound — Rainbow Rabbit', ta: 'இலக்கு /ர/ ஒலி — முயல்' },
        prompt: {
          en: 'Rev your speech engine like a sports car: "Rrrrr"! Now say "Rabbit"!',
          ta: 'காரின் இயந்திரம் போல "ர்ர்ர்ர்" என்று குரல் கொடுத்து, "முயல்" என்று சொல்லுங்கள்!',
        },
        targetWords: {
          en: ['Rabbit', 'Rainbow', 'River', 'Roar'],
          ta: ['முயல்', 'வானவில்', 'ஆறு', 'muyal', 'vaanavil', 'aaru', 'rabbit', 'rainbow'],
        },
        exemplar: {
          en: 'Rrrr... Rabbit hops over the red river!',
          ta: 'ர்ர்ர்... முயல் துள்ளி ஓடுகிறது!',
        },
        progression: [
          { level: 'Sound', levelTa: 'ஒலி', target: 'Rrrrr', targetTa: 'ர்ர்ர்', promptEn: 'Make the sound: Rrrrr', promptTa: 'ஒலி: ர்ர்ர்' },
          { level: 'Word', levelTa: 'சொல்', target: 'Rabbit', targetTa: 'முயல்', promptEn: 'Say the word: Rabbit', promptTa: 'சொல்: முயல்' },
          { level: 'Phrase', levelTa: 'சொற்றொடர்', target: 'Red Rabbit', targetTa: 'அழகான முயல்', promptEn: 'Say: Red Rabbit', promptTa: 'சொற்றொடர்: அழகான முயல்' },
          { level: 'Sentence', levelTa: 'வாக்கியம்', target: 'The rabbit hops fast', targetTa: 'முயல் வேகமாகத் துள்ளுகிறது', promptEn: 'Say: The rabbit hops fast', promptTa: 'வாக்கியம்: முயல் வேகமாகத் துள்ளுகிறது' },
        ],
      },
      {
        id: 'ss-3',
        sound: 'l',
        soundTa: 'ல',
        position: 'Initial & Final',
        title: { en: 'Target /l/ Sound — Little Lion', ta: 'இலக்கு /ல/ ஒலி — சிங்கம்' },
        prompt: {
          en: 'Touch your tongue tip up behind your front teeth: "Lllll"! Say "Lion"!',
          ta: 'நாக்கின் நுனியை மேல் பற்களுக்குப் பின்னால் தொட்டு "ல்ல்ல்" என ஒலித்து, "சிங்கம்" என்று கூறுங்கள்!',
        },
        targetWords: {
          en: ['Lion', 'Lemon', 'Ball', 'Bell'],
          ta: ['சிங்கம்', 'எலுமிச்சை', 'பந்து', 'singam', 'elumichai', 'bandhu', 'lion'],
        },
        exemplar: {
          en: 'Llll... Little lion plays with a bell!',
          ta: 'ல்ல்ல்... சின்னஞ்சிறு சிங்கம்!',
        },
        progression: [
          { level: 'Sound', levelTa: 'ஒலி', target: 'Lllll', targetTa: 'ல்ல்ல்', promptEn: 'Make the sound: Lllll', promptTa: 'ஒலி: ல்ல்ல்' },
          { level: 'Word', levelTa: 'சொல்', target: 'Lion', targetTa: 'சிங்கம்', promptEn: 'Say the word: Lion', promptTa: 'சொல்: சிங்கம்' },
          { level: 'Phrase', levelTa: 'சொற்றொடர்', target: 'Little Lion', targetTa: 'குட்டி சிங்கம்', promptEn: 'Say: Little Lion', promptTa: 'சொற்றொடர்: குட்டி சிங்கம்' },
          { level: 'Sentence', levelTa: 'வாக்கியம்', target: 'The little lion roars', targetTa: 'குட்டி சிங்கம் கர்ஜிக்கிறது', promptEn: 'Say: The little lion roars', promptTa: 'வாக்கியம்: குட்டி சிங்கம் கர்ஜிக்கிறது' },
        ],
      },
    ],
  },
  {
    id: 'build-sentence',
    nameKey: 'buildSentenceTitle',
    descKey: 'buildSentenceDesc',
    targetsKey: 'buildSentenceTargets',
    icon: '🧩',
    gradient: 'from-violet-500 via-purple-600 to-pink-500',
    accentColor: '#8b5cf6',
    category: 'Sentence Construction & Speech',
    xpReward: 75,
    starsAvailable: 3,
    activities: [
      {
        id: 'bs-1',
        title: { en: 'The Dog in the Park', ta: 'பூங்காவில் நாய்' },
        prompt: {
          en: 'Assemble the sentence tiles below, and then SPEAK the full sentence aloud!',
          ta: 'கீழே உள்ள சொற்களை வரிசைப்படுத்தி, முழு வாக்கியத்தையும் சத்தமாகப் பேசுங்கள்!',
        },
        tiles: {
          en: ['The dog', 'is running', 'in the park'],
          ta: ['நாய்', 'பூங்காவில்', 'ஓடுகிறது'],
        },
        correctSentence: {
          en: 'The dog is running in the park',
          ta: 'நாய் பூங்காவில் ஓடுகிறது',
        },
        audioCue: {
          en: 'Listen to the full sentence: The dog is running in the park.',
          ta: 'முழு வாக்கியத்தைக் கேளுங்கள்: நாய் பூங்காவில் ஓடுகிறது.',
        },
      },
      {
        id: 'bs-2',
        title: { en: 'Reading the Story Book', ta: 'கதைப் புத்தகம் படித்தல்' },
        prompt: {
          en: 'Put the sentence together, press the microphone, and read it like a storytelling star!',
          ta: 'வாக்கியத்தை ஒன்று சேர்த்து, மைக்ரோஃபோனை அழுத்தி அழகாக வாசியுங்கள்!',
        },
        tiles: {
          en: ['I am reading', 'a colorful', 'story book'],
          ta: ['நான் ஒரு', 'வண்ணமயமான', 'கதைப் புத்தகம் படிக்கிறேன்'],
        },
        correctSentence: {
          en: 'I am reading a colorful story book',
          ta: 'நான் ஒரு வண்ணமயமான கதைப் புத்தகம் படிக்கிறேன்',
        },
        audioCue: {
          en: 'Listen: I am reading a colorful story book.',
          ta: 'கேளுங்கள்: நான் ஒரு வண்ணமயமான கதைப் புத்தகம் படிக்கிறேன்.',
        },
      },
      {
        id: 'bs-3',
        title: { en: 'Bird Singing on Tree', ta: 'மரத்தில் பாடும் பறவை' },
        prompt: {
          en: 'Connect the words and speak the happy sentence aloud!',
          ta: 'சொற்களை இணைத்து இந்த வாக்கியத்தைச் சத்தமாகக் கூறுங்கள்!',
        },
        tiles: {
          en: ['The yellow bird', 'sings happily', 'on the tree'],
          ta: ['மஞ்சள் பறவை', 'மரத்தில்', 'மகிழ்ச்சியாகப் பாடுகிறது'],
        },
        correctSentence: {
          en: 'The yellow bird sings happily on the tree',
          ta: 'மஞ்சள் பறவை மரத்தில் மகிழ்ச்சியாகப் பாடுகிறது',
        },
        audioCue: {
          en: 'Listen: The yellow bird sings happily on the tree.',
          ta: 'கேளுங்கள்: மஞ்சள் பறவை மரத்தில் மகிழ்ச்சியாகப் பாடுகிறது.',
        },
      },
    ],
  },
  {
    id: 'sequence-quest',
    nameKey: 'sequenceQuestTitle',
    descKey: 'sequenceQuestDesc',
    targetsKey: 'sequenceQuestTargets',
    icon: '⏳',
    gradient: 'from-sky-400 via-blue-500 to-indigo-600',
    accentColor: '#0ea5e9',
    category: 'Memory & Cognitive-Communication',
    xpReward: 80,
    starsAvailable: 3,
    activities: [
      {
        id: 'sq-1',
        title: { en: 'Planting a Beautiful Flower', ta: 'அழகிய மலர் நடுதல்' },
        prompt: {
          en: 'Watch the 4 steps of planting a flower. Then answer what happened verbally!',
          ta: 'மலர் வளரும் 4 படிகளைப் பாருங்கள். பிறகு என்ன நடந்தது என்று வாய்மொழியாகக் கூறுங்கள்!',
        },
        steps: [
          { order: 1, text: { en: '1. Plant the tiny seed in soft soil', ta: '1. சிறிய விதையை மண்ணில் நடுதல்' }, icon: '🌱' },
          { order: 2, text: { en: '2. Water the plant every morning', ta: '2. தினமும் காலையில் தண்ணீர் ஊற்றுதல்' }, icon: '💧' },
          { order: 3, text: { en: '3. A small green sprout appears', ta: '3. சிறிய பச்சை முளை வளர்தல்' }, icon: '🌿' },
          { order: 4, text: { en: '4. A bright colorful flower blooms', ta: '4. பிரகாசமான மலர் பூத்துக் குலுங்குதல்' }, icon: '🌸' },
        ],
        questions: [
          {
            qEn: 'What did we do first?',
            qTa: 'முதலில் நாம் என்ன செய்தோம்?',
            expectedWordsEn: ['Plant', 'Seed', 'Soil'],
            expectedWordsTa: ['விதை', 'மண்', 'நடுதல்', 'vidhai', 'man', 'seed', 'soil'],
            modelEn: 'First, we planted the tiny seed in the soil!',
            modelTa: 'முதலில், நாம் விதையை மண்ணில் நட்டோம்!',
          },
          {
            qEn: 'What did we give the plant next?',
            qTa: 'அடுத்து நாம் செடிக்கு என்ன கொடுத்தோம்?',
            expectedWordsEn: ['Water', 'Pour water'],
            expectedWordsTa: ['தண்ணீர்', 'நீர்', 'தண்ணி', 'thanneer', 'thanni', 'water'],
            modelEn: 'Next, we watered the plant every day!',
            modelTa: 'அடுத்து, நாம் தினமும் தண்ணீர் ஊற்றினோம்!',
          },
          {
            qEn: 'What happened at the very end?',
            qTa: 'இறுதியில் என்ன நடந்தது?',
            expectedWordsEn: ['Flower', 'Bloom', 'Beautiful'],
            expectedWordsTa: ['மலர்', 'பூ', 'பூத்தது', 'malar', 'poo', 'flower', 'bloom'],
            modelEn: 'At the end, a beautiful flower bloomed!',
            modelTa: 'இறுதியில், ஒரு அழகான மலர் பூத்தது!',
          },
        ],
      },
      {
        id: 'sq-2',
        title: { en: 'Making Delicious Fruit Salad', ta: 'சுவையான பழ சாலட் செய்தல்' },
        prompt: {
          en: 'Look at the recipe steps, then tell your AI coach what happens in order!',
          ta: 'தயாரிக்கும் முறையைக் கவனித்து, உங்கள் AI பயிற்சியாளரிடம் வரிசையாகக் கூறுங்கள்!',
        },
        steps: [
          { order: 1, text: { en: '1. Wash fresh apples and bananas', ta: '1. புதிய பழங்களைக் கழுவுதல்' }, icon: '🍎' },
          { order: 2, text: { en: '2. Peel and slice fruit into bite pieces', ta: '2. பழங்களை நறுக்குதல்' }, icon: '🍌' },
          { order: 3, text: { en: '3. Put fruit pieces into a big bowl', ta: '3. கிண்ணத்தில் பழங்களை இடுதல்' }, icon: '🥣' },
          { order: 4, text: { en: '4. Mix with sweet honey and eat!', ta: '4. தேன் கலந்து சுவைத்தல்!' }, icon: '🥄' },
        ],
        questions: [
          {
            qEn: 'What is step one before cutting the fruit?',
            qTa: 'பழங்களை நறுக்கும் முன் முதல் படி என்ன?',
            expectedWordsEn: ['Wash', 'Clean'],
            expectedWordsTa: ['கழுவுதல்', 'சுத்தம்', 'kazhuvuthal', 'sutham', 'wash', 'clean'],
            modelEn: 'First we wash the fresh fruits clean!',
            modelTa: 'முதலில் நாம் பழங்களை நன்றாகக் கழுவினோம்!',
          },
          {
            qEn: 'Where do we mix all the sliced fruits?',
            qTa: 'நறுக்கிய பழங்களை எங்கு ஒன்றாகக் கலக்கிறோம்?',
            expectedWordsEn: ['Bowl', 'Big bowl'],
            expectedWordsTa: ['கிண்ணம்', 'பாத்திரம்', 'kinnam', 'paathiram', 'bowl'],
            modelEn: 'We put them in a big bowl!',
            modelTa: 'நாம் ஒரு பெரிய கிண்ணத்தில் போட்டோம்!',
          },
        ],
      },
    ],
  },
  {
    id: 'communication-adventure',
    nameKey: 'communicationAdventureTitle',
    descKey: 'communicationAdventureDesc',
    targetsKey: 'communicationAdventureTargets',
    icon: '🗣️',
    gradient: 'from-amber-500 via-rose-500 to-purple-600',
    accentColor: '#ec4899',
    category: 'Functional & Social Communication (AAC Supported)',
    xpReward: 85,
    starsAvailable: 3,
    aacSupported: true,
    aacSymbols: [
      { id: 'i', labelEn: 'I / Me', labelTa: 'எனக்கு', icon: '🙋' },
      { id: 'want', labelEn: 'Want', labelTa: 'வேண்டும்', icon: '🤲' },
      { id: 'water', labelEn: 'Water', labelTa: 'தண்ணீர்', icon: '💧' },
      { id: 'help', labelEn: 'Help', labelTa: 'உதவி', icon: '🆘' },
      { id: 'please', labelEn: 'Please', labelTa: 'தயவுசெய்து', icon: '🙏' },
      { id: 'more', labelEn: 'More', labelTa: 'மேலும்', icon: '➕' },
      { id: 'yes', labelEn: 'Yes', labelTa: 'ஆமாம்', icon: '✅' },
      { id: 'no', labelEn: 'No', labelTa: 'இல்லை', icon: '❌' },
      { id: 'play', labelEn: 'Play', labelTa: 'விளையாடு', icon: '⚽' },
      { id: 'eat', labelEn: 'Eat / Food', labelTa: 'சாப்பிடு', icon: '🍎' },
      { id: 'stop', labelEn: 'Stop', labelTa: 'நிறுத்து', icon: '🛑' },
      { id: 'happy', labelEn: 'Happy', labelTa: 'மகிழ்ச்சி', icon: '😊' },
    ],
    activities: [
      {
        id: 'ca-1',
        title: { en: 'Asking for Water when Thirsty', ta: 'தாகமாக இருக்கும்போது தண்ணீர் கேட்டல்' },
        scenarioEn: 'You are playing outside on a sunny afternoon and feel very thirsty. Speak or use AAC to ask for water!',
        scenarioTa: 'வெயிலில் விளையாடிய பிறகு உங்களுக்கு தாகமாக இருக்கிறது. தண்ணீர் கேட்டுப் பேசுங்கள் அல்லது AAC பலகையைப் பயன்படுத்துங்கள்!',
        aiPromptEn: 'Hello friend! You look thirsty. How can I help you right now?',
        aiPromptTa: 'வணக்கம் நண்பா! உங்களுக்கு தாகமாகத் தெரிகிறது. நான் எப்படி உதவ முடியும்?',
        targetWordsEn: ['Water', 'I want water', 'Please give water', 'Thirsty'],
        targetWordsTa: ['தண்ணீர்', 'எனக்கு தண்ணீர் வேண்டும்', 'தண்ணீர் கொடுங்கள்', 'தண்ணி', 'thanneer', 'thanni', 'water'],
        modelResponseEn: 'May I please have a glass of water?',
        modelResponseTa: 'தயவுசெய்து எனக்கு ஒரு டம்ளர் தண்ணீர் கிடைக்குமா?',
        aiFollowUpEn: 'Here is fresh cool water! How do you feel now?',
        aiFollowUpTa: 'இதோ குளிர்ந்த தண்ணீர்! இப்போது எப்படி உணர்கிறீர்கள்?',
      },
      {
        id: 'ca-2',
        title: { en: 'Greeting a Friend in the Morning', ta: 'காலையில் நண்பரை வாழ்த்துதல்' },
        scenarioEn: 'You arrived at class and see your friend sitting at the table. Give them a friendly morning greeting!',
        scenarioTa: 'நீங்கள் வகுப்பறைக்கு வந்து உங்கள் நண்பரைக் காண்கிறீர்கள். மகிழ்ச்சியுடன் காலை வணக்கம் கூறுங்கள்!',
        aiPromptEn: 'Good morning! It is so nice to see you today!',
        aiPromptTa: 'காலை வணக்கம்! இன்று உங்களைப் பார்ப்பதில் மிக்க மகிழ்ச்சி!',
        targetWordsEn: ['Good morning', 'Hello', 'Hi friend', 'How are you'],
        targetWordsTa: ['காலை வணக்கம்', 'வணக்கம்', 'நலமா', 'vanakkam', 'kaalai vanakkam', 'nalamaa', 'good morning', 'hello'],
        modelResponseEn: 'Good morning! I am happy to see you too!',
        modelResponseTa: 'காலை வணக்கம்! உங்களைப் பார்த்ததில் எனக்கும் மகிழ்ச்சி!',
        aiFollowUpEn: 'Would you like to build blocks together today?',
        aiFollowUpTa: 'இன்று நாம் ஒன்றாக விளையாடலாமா?',
      },
      {
        id: 'ca-3',
        title: { en: 'Asking for Help with a Puzzle', ta: 'புதிருக்கு உதவி கேட்டல்' },
        scenarioEn: 'You are working on a tricky jigsaw puzzle and need a hand finding the corner piece. Ask for help politely!',
        scenarioTa: 'நீங்கள் ஒரு கடினமான புதிரைச் செய்யும்போது ஒரு துண்டு மாட்டவில்லை. கனிவாக உதவி கேளுங்கள்!',
        aiPromptEn: 'That puzzle looks fun! Do you need a hand with it?',
        aiPromptTa: 'அந்த புதிர் சுவாரஸ்யமாக உள்ளது! உங்களுக்கு ஏதாவது உதவி தேவையா?',
        targetWordsEn: ['Help', 'Help please', 'Can you help me', 'Need help'],
        targetWordsTa: ['உதவி', 'உதவுங்கள்', 'எனக்கு உதவி வேண்டும்', 'uthavi', 'help'],
        modelResponseEn: 'Yes please, can you help me find this corner piece?',
        modelResponseTa: 'ஆம் தயவுசெய்து, எனக்கு இதில் கொஞ்சம் உதவ முடியுமா?',
        aiFollowUpEn: 'Of course! Look right over here, this blue piece matches perfectly!',
        aiFollowUpTa: 'நிச்சயமாக! இதோ இந்தப் பச்சைத் துண்டு சரியாகப் பொருந்தும்!',
      },
    ],
  },
]

export const ADULT_GAMES = [
  {
    id: 'clear-speech',
    nameKey: 'clearSpeechTitle',
    descKey: 'clearSpeechDesc',
    targetsKey: 'clearSpeechTargets',
    icon: '🎯',
    gradient: 'from-slate-800 via-sky-900 to-indigo-950',
    accentColor: '#38bdf8',
    category: 'Articulation & Speech Clarity',
    xpReward: 70,
    activities: [
      {
        id: 'cs-1',
        title: { en: 'Precision Consonant Onsets & Pacing', ta: 'தெளிவான மெய்யொலி & வேகக் கட்டுப்பாடு' },
        instructions: {
          en: 'Listen to the clinician model. Repeat the sentence maintaining steady airflow and clear consonant closures.',
          ta: 'மருத்துவ மாதிரியைக் கேளுங்கள். சீரான மூச்சுக் காற்றுடன் வாக்கியத்தைத் தெளிவாக மீண்டும் கூறுங்கள்.',
        },
        targetPhrase: {
          en: 'Specific articulation requires consistent breath pacing and relaxed vocal folds.',
          ta: 'சீரான மூச்சுக் கட்டுப்பாடு மற்றும் அமைதியான குரல் நாண்கள் தெளிவான உச்சரிப்பைத் தரும்.',
        },
        exemplarText: {
          en: 'Specific articulation requires consistent breath pacing and relaxed vocal folds.',
          ta: 'சீரான மூச்சுக் கட்டுப்பாடு மற்றும் அமைதியான குரல் நாண்கள் தெளிவான உச்சரிப்பைத் தரும்.',
        },
        targetWords: {
          en: ['Specific', 'Articulation', 'Consistent', 'Breath', 'Pacing'],
          ta: ['சீரான', 'மூச்சு', 'கட்டுப்பாடு', 'தெளிவான', 'உச்சரிப்பு', 'seeraana', 'moochu', 'thelivana', 'utcharippu'],
        },
        targetPhonemes: '/sp/, /t/, /k/',
        clinicalNotes: 'Focus on crisp onset without glottal shock. Maintain natural cadence at 115-125 WPM.',
        clinicalNotesTa: 'குரல்வளை அதிர்ச்சியின்றி தெளிவான தொடக்கத்தில் கவனம் செலுத்துங்கள். 115-125 WPM வேகத்தை பராமரிக்கவும்.',
      },
      {
        id: 'cs-2',
        title: { en: 'Multisyllabic Professional Terminology', ta: 'பல எழுத்துத் தொழில்முறைச் சொற்கள்' },
        instructions: {
          en: 'Pronounce each syllable distinctly with equal weight before blending into conversational flow.',
          ta: 'ஒவ்வொரு அசையையும் தெளிவாக உச்சரித்து, பின்னர் சரளமாக வாக்கியத்தில் பேசுங்கள்.',
        },
        targetPhrase: {
          en: 'Comprehensive technological methodology enables measurable organizational progress.',
          ta: 'முறையான தொழில்நுட்பத் திட்டமிடல் நிறுவனத்தின் அளவிடக்கூடிய வளர்ச்சிக்கு உதவுகிறது.',
        },
        exemplarText: {
          en: 'Comprehensive technological methodology enables measurable organizational progress.',
          ta: 'முறையான தொழில்நுட்பத் திட்டமிடல் நிறுவனத்தின் அளவிடக்கூடிய வளர்ச்சிக்கு உதவுகிறது.',
        },
        targetWords: {
          en: ['Comprehensive', 'Technological', 'Methodology', 'Measurable', 'Organizational'],
          ta: ['முறையான', 'தொழில்நுட்ப', 'திட்டமிடல்', 'அளவிடக்கூடிய', 'வளர்ச்சி', 'muraiyaana', 'thozhilnutpa', 'valarchi'],
        },
        targetPhonemes: 'Multisyllabic cadence',
        clinicalNotes: 'Prevents syllable telescoping or slurring during complex technical speech.',
        clinicalNotesTa: 'கடினமான தொழில்நுட்பப் பேச்சின் போது சொற்கள் தெளிவற்றதாக மாறுவதைத் தடுக்கிறது.',
      },
      {
        id: 'cs-3',
        title: { en: 'Functional Meeting Introduction', ta: 'செயல்பாட்டுக் கூட்ட அறிமுகம்' },
        instructions: {
          en: 'Deliver this professional opening statement with firm, supported vocal projection.',
          ta: 'இந்த தொழில்முறை தொடக்க அறிக்கையை உறுதியான, இயற்கையான குரல் வீச்சுடன் கூறுங்கள்.',
        },
        targetPhrase: {
          en: 'Good morning everyone. Thank you for joining today’s project milestone briefing.',
          ta: 'அனைவருக்கும் காலை வணக்கம். இன்றைய திட்ட மைல்கல் கூட்டத்தில் இணைந்ததற்கு நன்றி.',
        },
        exemplarText: {
          en: 'Good morning everyone. Thank you for joining today’s project milestone briefing.',
          ta: 'அனைவருக்கும் காலை வணக்கம். இன்றைய திட்ட மைல்கல் கூட்டத்தில் இணைந்ததற்கு நன்றி.',
        },
        targetWords: {
          en: ['Morning', 'Everyone', 'Joining', 'Project', 'Milestone', 'Briefing'],
          ta: ['காலை வணக்கம்', 'இணைந்ததற்கு', 'நன்றி', 'திட்ட', 'மைல்கல்', 'kaalai vanakkam', 'nandri', 'thitta'],
        },
        targetPhonemes: 'Intonation & Projection',
        clinicalNotes: 'Emphasize thoracic breath support and downward vocal inflection on sentence ends.',
        clinicalNotesTa: 'மார்பு மூச்சு ஆதரவு மற்றும் வாக்கிய முடிவுகளில் சீரான குரல் இறக்கத்தில் கவனம் செலுத்துங்கள்.',
      },
    ],
  },
  {
    id: 'professional-language',
    nameKey: 'professionalLanguageTitle',
    descKey: 'professionalLanguageDesc',
    targetsKey: 'professionalLanguageTargets',
    icon: '💼',
    gradient: 'from-slate-900 via-emerald-950 to-teal-900',
    accentColor: '#10b981',
    category: 'Workplace & Executive Communication',
    xpReward: 75,
    activities: [
      {
        id: 'pl-1',
        title: { en: 'Diplomatic Clarification Request', ta: 'பக்குவமாக விளக்கம் கேட்டல்' },
        scenarioEn: 'During a strategy meeting, a project deadline has moved forward unexpectedly. Verbally ask your director for clarification regarding resource allocation.',
        scenarioTa: 'ஒரு கூட்டத்தில் திட்டக் காலக்கெடு திடீரென மாற்றப்பட்டுள்ளது. வளங்கள் ஒதுக்கீடு குறித்து மேலாளரிடம் பக்குவமாக விளக்கம் கேளுங்கள்.',
        aiPromptEn: 'We need to accelerate the delivery date by two weeks. Does anyone have any initial thoughts on this adjustment?',
        aiPromptTa: 'நாங்கள் வெளியீட்டுத் தேதியை இரண்டு வாரங்களுக்கு முன்னதாக மாற்ற வேண்டும். இதில் யாருக்காவது கருத்து உள்ளதா?',
        targetWordsEn: ['Clarify', 'Resources', 'Timeline', 'Scope', 'Quality'],
        targetWordsTa: ['விளக்கம்', 'வளங்கள்', 'காலக்கெடு', 'தரம்', 'vilakkam', 'valangal', 'kaalakkedu', 'tharam', 'clarify', 'resources'],
        exemplarEn: 'Could you please clarify how resources will be allocated so we can meet this accelerated timeline without compromising quality?',
        exemplarTa: 'தரத்தை பாதிக்காமல் இந்த முந்தைய காலக்கெடுவை எட்ட தேவையான வளங்கள் எவ்வாறு ஒதுக்கப்படும் என்பதை தயவுசெய்து விளக்க முடியுமா?',
        followUpEn: 'That is a reasonable question. We will temporarily assign two senior engineers to assist your team.',
        followUpTa: 'அது நியாயமான கேள்வி. உங்கள் குழுவுக்கு உதவ இரண்டு மூத்த பொறியாளர்களை தற்காலிகமாக நியமிக்கிறோம்.',
      },
      {
        id: 'pl-2',
        title: { en: 'Presenting a Project Update', ta: 'திட்ட முன்னேற்ற அறிக்கை அளித்தல்' },
        scenarioEn: 'Summarize the completion of Phase 1 to your executive board. Mention deliverables completed and the next milestone on schedule.',
        scenarioTa: 'முதல் கட்ட பணிகளை நிறைவு செய்ததை நிர்வாகக் குழுவிடம் விளக்குங்கள். இலக்குகள் மற்றும் அடுத்த கட்டத்தைத் தெரிவியுங்கள்.',
        aiPromptEn: 'Please give us a concise summary of where Phase 1 currently stands.',
        aiPromptTa: 'முதல் கட்ட பணிகள் தற்போது எந்த நிலையில் உள்ளன என்பதை சுருக்கமாகக் கூறுங்கள்.',
        targetWordsEn: ['Phase', 'Completed', 'Milestone', 'Schedule', 'Objectives'],
        targetWordsTa: ['முதல் கட்டம்', 'நிறைவடைந்தது', 'மைல்கல்', 'திட்டமிட்டபடி', 'muthal kattam', 'niraivadainthathu', 'phase', 'milestone'],
        exemplarEn: 'I am pleased to report that Phase 1 has concluded successfully, with all core deliverables verified and Phase 2 commencing on schedule.',
        exemplarTa: 'முதல் கட்டப் பணிகள் வெற்றிகரமாக நிறைவடைந்துள்ளன என்பதை மகிழ்ச்சியுடன் தெரிவித்துக் கொள்கிறேன், அடுத்த கட்டம் திட்டமிட்டபடி தொடங்குகிறது.',
        followUpEn: 'Excellent progress. Thank you for keeping the timeline tightly managed.',
        followUpTa: 'அருமையான முன்னேற்றம். பணிகளை சீராக வழிநடத்தியதற்கு நன்றி.',
      },
    ],
  },
  {
    id: 'conversation-scenarios',
    nameKey: 'conversationScenariosTitle',
    descKey: 'conversationScenariosDesc',
    targetsKey: 'conversationScenariosTargets',
    icon: '👥',
    gradient: 'from-slate-900 via-blue-950 to-slate-800',
    accentColor: '#38bdf8',
    category: 'Interactive Dynamic Voice Dialogues',
    xpReward: 85,
    scenarios: [
      {
        id: 'cs-sc-1',
        title: { en: 'Specialist Medical Appointment Call', ta: 'மருத்துவ சிறப்பு சந்திப்பு தொலைபேசி அழைப்பு' },
        overviewEn: 'Practice scheduling a speech clinic follow-up appointment over the telephone with realistic turn-taking.',
        overviewTa: 'தொலைபேசி வழியே மருத்துவ சந்திப்பை திட்டமிடுவதற்கான நடைமுறை குரல் உரையாடல் பயிற்சி.',
        turns: [
          {
            speaker: 'ai',
            textEn: 'Thank you for calling City Speech & Health Clinic. My name is Alex. How can I assist you today?',
            textTa: 'சிட்டி ஸ்பீச் கிளினிக்கிற்கு அழைத்ததற்கு நன்றி. என் பெயர் அலெக்ஸ். இன்று நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?',
          },
          {
            speaker: 'user',
            promptEn: 'State that you would like to book a follow-up consultation with your speech pathologist next week.',
            promptTa: 'அடுத்த வாரம் உங்கள் பேச்சு மருத்துவருடன் ஒரு பின்தொடர் சந்திப்பை பதிவு செய்ய விரும்புவதாகக் கூறுங்கள்.',
            expectedKeywordsEn: ['Appointment', 'Follow up', 'Doctor', 'Next week', 'Speech'],
            expectedKeywordsTa: ['சந்திப்பு', 'மருத்துவர்', 'அடுத்த வாரம்', 'பரிசோதனை', 'santhippu', 'maruthuvar', 'appointment', 'doctor'],
            exemplarEn: 'Hello Alex, I would like to schedule a follow-up appointment with my speech therapist for sometime next week.',
            exemplarTa: 'வணக்கம், அடுத்த வாரம் என் பேச்சு சிகிச்சை மருத்துவருடன் ஒரு சந்திப்பை பதிவு செய்ய விரும்புகிறேன்.',
          },
          {
            speaker: 'ai',
            textEn: 'Certainly! I have openings on Tuesday morning at 10:00 AM or Thursday afternoon at 2:30 PM. Which works better for your schedule?',
            textTa: 'நிச்சயமாக! செவ்வாய் காலை 10:00 மணி அல்லது வியாழன் மதியம் 2:30 மணிக்கு நேரம் உள்ளது. உங்களுக்கு எது வசதியாக இருக்கும்?',
          },
          {
            speaker: 'user',
            promptEn: 'Choose Thursday afternoon and ask to confirm the room code or booking notice by email.',
            promptTa: 'வியாழக்கிழமை மதியம் வசதியாக இருக்கும் என்று கூறி, உறுதிப்படுத்தலை மின்னஞ்சலில் அனுப்புமாறு கேளுங்கள்.',
            expectedKeywordsEn: ['Thursday', 'Afternoon', 'Confirm', 'Email'],
            expectedKeywordsTa: ['வியாழன்', 'மதியம்', 'மின்னஞ்சல்', 'உறுதி', 'viyazhan', 'mathiyam', 'minnanjal', 'confirm', 'email'],
            exemplarEn: 'Thursday afternoon at 2:30 PM works best for me. Could you please send the confirmation to my email?',
            exemplarTa: 'வியாழன் மதியம் 2:30 மணி எனக்கு வசதியாக இருக்கும். உறுதிப்படுத்தல் விவரங்களை என் மின்னஞ்சலுக்கு அனுப்புங்கள்.',
          },
          {
            speaker: 'ai',
            textEn: 'You are all set for Thursday at 2:30 PM. Confirmation and calendar invite have been sent. Have a wonderful day!',
            textTa: 'உங்கள் சந்திப்பு வியாழன் மதியம் 2:30 மணிக்கு பதிவு செய்யப்பட்டது. மின்னஞ்சல் அனுப்பப்பட்டு விட்டது. நல்நாளாக அமையட்டும்!',
          },
        ],
      },
      {
        id: 'cs-sc-2',
        title: { en: 'Job Interview: Describing Past Experience', ta: 'வேலை நேர்காணல்: அனுபவத்தை விவரித்தல்' },
        overviewEn: 'Practice answering common behavioral interview inquiries with confidence and concise articulation.',
        overviewTa: 'நேர்காணல் கேள்விகளுக்கு தன்னம்பிக்கையுடனும் தெளிவான உச்சரிப்புடனும் பதிலளிக்கும் பயிற்சி.',
        turns: [
          {
            speaker: 'ai',
            textEn: 'Welcome to our team discussion. Could you start by sharing how you approach handling unexpected project roadblocks?',
            textTa: 'எங்கள் குழுவின் நேர்காணலுக்கு வரவேற்கிறோம். எதிர்பாராத பணித் தடைகளை நீங்கள் எவ்வாறு அணுகுகிறீர்கள் என்று கூற முடியுமா?',
          },
          {
            speaker: 'user',
            promptEn: 'Explain that you remain calm, analyze the root cause, communicate with team members, and formulate a step-by-step solution.',
            promptTa: 'அமைதியாக இருந்து, காரணத்தை ஆராய்ந்து, குழுவிடம் பேசி, படிப்படியான தீர்வை உருவாக்குவேன் என்று கூறுங்கள்.',
            expectedKeywordsEn: ['Analyze', 'Team', 'Communicate', 'Solution', 'Calm'],
            expectedKeywordsTa: ['ஆராய்ந்து', 'குழு', 'தொடர்பு', 'தீர்வு', 'அமைதி', 'aaraainthu', 'kuzhu', 'theervu', 'analyze', 'solution'],
            exemplarEn: 'I maintain a calm perspective, identify the root cause systematically, and collaborate with my team to outline clear corrective actions.',
            exemplarTa: 'நான் அமைதியாக நிலைமையை ஆராய்ந்து, குழுவினருடன் இணைந்து தெளிவான திருத்த நடவடிக்கைகளை செயல்படுத்துவேன்.',
          },
          {
            speaker: 'ai',
            textEn: 'That systematic mindset is exactly what our environment values. How do you keep stakeholders informed throughout that process?',
            textTa: 'அந்த முறையான சிந்தனை எங்கள் நிறுவனத்திற்கு மிகவும் தேவை. அப்போது திட்ட பங்குதாரர்களுக்கு எவ்வாறு தகவல்களைத் தெரிவிக்கிறீர்கள்?',
          },
          {
            speaker: 'user',
            promptEn: 'State that you provide proactive, transparent progress updates with clear timelines.',
            promptTa: 'தெளிவான காலக்கெடுவுடன் கூடிய வெளிப்படையான முன்னேற்ற அறிக்கைகளைத் தொடர்ந்து வழங்குவேன் என்று கூறுங்கள்.',
            expectedKeywordsEn: ['Transparent', 'Updates', 'Proactive', 'Timelines'],
            expectedKeywordsTa: ['வெளிப்படையான', 'அறிக்கை', 'முன்னேற்றம்', 'காலக்கெடு', 'velippadaiyaana', 'arikkai', 'updates', 'timeline'],
            exemplarEn: 'I send concise, transparent status updates highlighting current progress, estimated milestones, and any needed adjustments.',
            exemplarTa: 'தற்போதைய முன்னேற்றம் மற்றும் காலக்கெடுவை உள்ளடக்கிய சுருக்கமான, வெளிப்படையான அறிக்கைகளை உடனுக்குடன் வழங்குவேன்.',
          },
        ],
      },
    ],
  },
  {
    id: 'cognitive-challenge',
    nameKey: 'cognitiveChallengeTitle',
    descKey: 'cognitiveChallengeDesc',
    targetsKey: 'cognitiveChallengeTargets',
    icon: '🧠',
    gradient: 'from-slate-900 via-purple-950 to-slate-900',
    accentColor: '#c084fc',
    category: 'Auditory Memory & Cognitive-Linguistic',
    xpReward: 80,
    challenges: [
      {
        id: 'cog-1',
        title: { en: 'Auditory Voicemail Recall', ta: 'செவிவழி குரலஞ்சல் நினைவு கூர்தல்' },
        instructionEn: 'Listen attentively to the recorded clinical voicemail. Once it concludes, answer the two comprehension questions verbally.',
        instructionTa: 'பதிவு செய்யப்பட்ட மருத்துவ குரலஞ்சலைக் கவனமாகக் கேளுங்கள். பின்னர் கேட்கப்படும் இரண்டு கேள்விகளுக்கு வாய்மொழியாகப் பதிலளியுங்கள்.',
        audioMessageEn: 'Hello, this is Nurse Anita from Voxtech Health. Your audiologist consultation has been confirmed for Wednesday morning at 10:30 AM in Room 4B. Please remember to bring your previous hearing test records and arrive 10 minutes early. Thank you.',
        audioMessageTa: 'வணக்கம், வாக்ஸ்டெக் ஹெல்த் கிளினிக்கிலிருந்து செவிலியர் அனிதா பேசுகிறேன். உங்கள் மருத்துவ ஆலோசனை புதன்கிழமை காலை 10:30 மணிக்கு அறை எண் 4B-ல் உறுதி செய்யப்பட்டுள்ளது. உங்கள் முந்தைய பரிசோதனை அறிக்கைகளை எடுத்துக்கொண்டு 10 நிமிடங்களுக்கு முன்பே வரவும். நன்றி.',
        questions: [
          {
            qEn: 'What day and time is the confirmed appointment?',
            qTa: 'உறுதி செய்யப்பட்ட சந்திப்பு எந்த நாள் மற்றும் நேரத்தில் உள்ளது?',
            expectedKeywordsEn: ['Wednesday', '10:30', 'Morning'],
            expectedKeywordsTa: ['புதன்கிழமை', '10:30', 'காலை', 'puthankizhamai', 'wednesday', 'morning'],
            exemplarEn: 'The appointment is on Wednesday morning at 10:30 AM.',
            exemplarTa: 'சந்திப்பு புதன்கிழமை காலை 10:30 மணிக்கு உள்ளது.',
          },
          {
            qEn: 'What document should you bring along with you?',
            qTa: 'உங்களுடன் என்ன ஆவணத்தை எடுத்து வர வேண்டும்?',
            expectedKeywordsEn: ['Hearing test', 'Records', 'Previous records', 'Test report'],
            expectedKeywordsTa: ['அறிக்கை', 'பரிசோதனை', 'முந்தைய அறிக்கை', 'arikkai', 'records', 'report'],
            exemplarEn: 'I need to bring my previous hearing test records.',
            exemplarTa: 'முந்தைய மருத்துவ பரிசோதனை அறிக்கைகளை எடுத்து வர வேண்டும்.',
          },
        ],
      },
      {
        id: 'cog-2',
        title: { en: 'Executive Procedural Problem-Solving', ta: 'நடைமுறை சிக்கல் தீர்த்தல்' },
        instructionEn: 'Read or listen to the unexpected workplace situation. Verbally formulate a structured 3-step solution into your microphone.',
        instructionTa: 'அலுவலகச் சிக்கலைக் கேட்டு, உங்கள் மைக்ரோஃபோனில் 3 படிகளில் தெளிவான வாய்மொழித் தீர்வை விவரியுங்கள்.',
        situationEn: 'You are 15 minutes away from delivering a critical slide presentation to a client, and the conference room projector will not connect to your laptop.',
        situationTa: 'முக்கிய வாடிக்கையாளர் விளக்கக்காட்சிக்கு இன்னும் 15 நிமிடங்களே உள்ள நிலையில், ப்ரொஜெக்டர் உங்கள் கணினியுடன் இணையவில்லை.',
        promptEn: 'Verbally state the 3 immediate steps you would take to resolve this dilemma before the client arrives.',
        promptTa: 'வாடிக்கையாளர் வருவதற்கு முன் இந்த சிக்கலைத் தீர்க்க நீங்கள் எடுக்கும் 3 உடனடி நடவடிக்கைகளைக் கூறுங்கள்.',
        expectedKeywordsEn: ['Restart', 'Backup', 'IT support', 'Print', 'Cable', 'Colleague'],
        expectedKeywordsTa: ['மாற்று வழி', 'உதவி', 'மின்னஞ்சல்', 'கேபிள்', 'மடிக்கணினி', 'restart', 'backup', 'cable'],
        exemplarEn: 'First, check cable connections and restart the video output. Second, notify IT support immediately. Third, email the presentation slides to a colleague or load them on a cloud link as a failsafe.',
        exemplarTa: 'முதலில் இணைப்புகளைச் சரிபார்ப்பேன். இரண்டாவதாக ஐடி உதவிக்குத் தகவல் தெரிவிப்பேன். மூன்றாவதாக சக ஊழியருக்கு மின்னஞ்சல் அனுப்பி மாற்று ஏற்பாடு செய்வேன்.',
      },
    ],
  },
  {
    id: 'voice-fluency',
    nameKey: 'voiceFluencyStudioTitle',
    descKey: 'voiceFluencyStudioDesc',
    targetsKey: 'voiceFluencyStudioTargets',
    icon: '🌊',
    gradient: 'from-slate-900 via-teal-950 to-slate-950',
    accentColor: '#2dd4bf',
    category: 'Vocal Pacing, Easy Onset & Fluency',
    xpReward: 90,
    clinicalWarning: 'Never push through vocal strain. Keep pitch and volume in a relaxed, comfortable conversational range.',
    exercises: [
      {
        id: 'vf-1',
        title: { en: 'Diaphragmatic Breath & Easy Vocal Onset', ta: 'மூச்சுப் பயிற்சி & மென்மையான ஒலிப்பு' },
        techniqueEn: 'Easy Vocal Onset: Inhale slowly into your abdomen for 4 seconds. As you exhale, begin with an unvoiced gentle /h/ breath, sliding smoothly into a relaxed vowel sound without abrupt vocal cord collision.',
        techniqueTa: 'மென்மையான ஒலிப்புத் தொடக்கம்: 4 வினாடிகள் ஆழமாக மூச்சை உள்ளிழுத்து, பின்னர் மெதுவாக "ஹ்" ஒலியுடன் தொடங்கி "ஆ..." என்று மென்மையாக வெளிவிடுங்கள்.',
        drillSequence: [
          { cueEn: 'Inhale deeply (4 counts)... Exhale with gentle /h/ into "Haaaaa"', cueTa: 'மூச்சை உள்ளிழுத்து... மென்மையாக "ஹா..." என்று வெளிவிடுங்கள்' },
          { cueEn: 'Inhale smoothly... Exhale with gentle /h/ into "Hooooo"', cueTa: 'மூச்சை உள்ளிழுத்து... "ஹோ..." என்று வெளிவிடுங்கள்' },
          { cueEn: 'Inhale calmly... Exhale with gentle /h/ into "Heeeee"', cueTa: 'மூச்சை உள்ளிழுத்து... "ஹீ..." என்று வெளிவிடுங்கள்' },
        ],
        targetSafeVolumeMin: 20,
        targetSafeVolumeMax: 70,
      },
      {
        id: 'vf-2',
        title: { en: 'Continuous Voicing & Prolonged Phonation', ta: 'தொடர்ச்சியான குரல் ஒலிப்பு' },
        techniqueEn: 'Continuous voicing maintains steady vocal fold vibration through phrase transitions, reducing speech blocks and prolongations.',
        techniqueTa: 'தொடர்ச்சியான ஒலிப்பு சொற்களுக்கு இடையே ஏற்படும் பேச்சுத் தடையைக் குறைத்து சீரான ஓட்டத்தை வழங்குகிறது.',
        drillSequence: [
          { cueEn: 'Hum softly: "Mmmmmmm-one... Mmmmmmm-two... Mmmmmmm-three"', cueTa: 'மென்மையாக முனகுங்கள்: "ம்ம்ம்ம்-ஒன்று... ம்ம்ம்ம்-இரண்டு..."' },
          { cueEn: 'Prolong smooth consonants: "Ssssmooth sailing on a calm summer sea"', cueTa: 'நீட்டித்துப் பேசுங்கள்: "அமைதியான கடலில் படகு பயணம்..."' },
          { cueEn: 'Connect syllables without pause: "Every-day-brings-steady-growth"', cueTa: 'தடையில்லாமல் பேசுங்கள்: "ஒவ்வொரு-நாளும்-முன்னேற்றம்-தரும்"' },
        ],
        targetSafeVolumeMin: 25,
        targetSafeVolumeMax: 75,
      },
      {
        id: 'vf-3',
        title: { en: 'Controlled Cadence Metronome (Pacing)', ta: 'சீரான வேகக் கட்டுப்பாடு (Pacing Drill)' },
        techniqueEn: 'Pacing controls speed at approximately 110-120 words per minute. Pause at each comma symbol for 1.5 counts.',
        techniqueTa: 'நிமிடத்திற்கு 110-120 சொற்கள் என்ற சீரான வேகத்தில் பேசுங்கள். ஒவ்வொரு காற்புள்ளியிலும் 1.5 நொடிகள் இடைநிறுத்தம் செய்யுங்கள்.',
        drillSequence: [
          {
            cueEn: 'Read aloud: "When I speak with calm intention, [pause] my thoughts emerge clearly, [pause] and my voice remains steady."',
            cueTa: 'படியுங்கள்: "நான் அமைதியான கவனத்துடன் பேசும்போது, [இடைநிறுத்தம்] என் எண்ணங்கள் தெளிவாக வெளிப்படுகின்றன, [இடைநிறுத்தம்] குரல் சீராக உள்ளது."',
          },
        ],
        targetSafeVolumeMin: 20,
        targetSafeVolumeMax: 80,
      },
    ],
  },
]
