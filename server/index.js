import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import http from 'http'
import crypto from 'crypto'
import multer from 'multer'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pg from 'pg'
import { Server } from 'socket.io'

const { Pool } = pg
const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

const PORT = Number(process.env.PORT || 5001)
const appName = process.env.APP_NAME || 'VOXTECH'
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000').split(',').map((origin) => origin.trim())
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production'
const AES_KEY = crypto.createHash('sha256').update(process.env.AES_KEY || 'voxtech-dev-default-key-32-bytes-long').digest()
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS || 12)
const databaseUrl = process.env.DATABASE_URL

const pool = databaseUrl ? new Pool({ connectionString: databaseUrl }) : null
const memoryUsers = new Map()
const memoryGoals = new Map()
const memoryUpdates = new Map()
const memoryCommunityPosts = new Map()
const memoryGameScores = []
const memoryProfiles = new Map()
const memoryReminders = new Map()
const memoryCarePlan = new Map()

function initMemoryData() {
  if (memoryGoals.size === 0) {
    const defaultGoals = [
      { id: 'goal-1', title: 'Rhythmic Breathing Routine', detail: 'Complete 3 morning sessions of 4-count breathing', category: 'Breathing', done: true, status: 'Completed' },
      { id: 'goal-2', title: 'Target Sound Onset', detail: 'Practice 20 repetitions of "SPEECH" sound drills', category: 'Speech', done: false, status: 'Pending' },
      { id: 'goal-3', title: 'Sentence Fluency Stretch', detail: 'Record 5 fluent sentences in practice room', category: 'Fluency', done: false, status: 'Pending' },
    ]
    defaultGoals.forEach(g => memoryGoals.set(g.id, g))
  }

  if (memoryUpdates.size === 0) {
    const defaultUpdates = [
      { id: 'up-1', title: 'Morning Articulation Progress', content: 'Patient demonstrated steady pitch and clear sound onset during word drills.', author: 'Dr. Priya Sharma', category: 'Clinical Note', createdAt: new Date(Date.now() - 3600000 * 2).toISOString() },
      { id: 'up-2', title: 'Breathing Goal Achieved', content: 'Completed 5 consecutive minutes of slow rhythmic breathing.', author: 'Patient Log', category: 'Milestone', createdAt: new Date(Date.now() - 3600000 * 24).toISOString() },
    ]
    defaultUpdates.forEach(u => memoryUpdates.set(u.id, u))
  }

  if (memoryCommunityPosts.size === 0) {
    const defaultPosts = [
      { id: 'post-1', title: 'Daily Fluency Tips that Helped Me', content: 'Taking a short 2-second pause before speaking difficult words has reduced my hesitation by half!', author: 'Rahul M.', likes: 14, category: 'Tips & Tricks', createdAt: new Date(Date.now() - 3600000 * 5).toISOString() },
      { id: 'post-2', title: 'Caregiver Support Check-in', content: 'How do you keep daily practice encouraging without overwhelming your family member?', author: 'Meera (Caregiver)', likes: 9, category: 'Caregiver Circle', createdAt: new Date(Date.now() - 3600000 * 12).toISOString() },
    ]
    defaultPosts.forEach(p => memoryCommunityPosts.set(p.id, p))
  }

  if (memoryReminders.size === 0) {
    const defaultReminders = [
      { id: 'rem-1', title: 'Diaphragmatic Breathing Drill', time: '09:00 AM', category: 'Breathing', active: true },
      { id: 'rem-2', title: 'Vowel Prolongation Practice', time: '02:30 PM', category: 'Speech', active: true },
      { id: 'rem-3', title: 'Daily Progress & Audio Log', time: '08:00 PM', category: 'Reflection', active: true },
    ]
    defaultReminders.forEach(r => memoryReminders.set(r.id, r))
  }

  if (memoryCarePlan.size === 0) {
    const defaultCarePlan = [
      { id: 'cp-1', day: 1, title: 'Breathing & Continuous Phonation', detail: '10 mins of gentle onset vowels (A, E, I, O, U) with diaphragmatic support', duration: 10, status: 'Completed' },
      { id: 'cp-2', day: 2, title: 'Pacing & Short Sentence Drills', detail: 'Read 10 target sentences using 2-second tactical pauses', duration: 15, status: 'Completed' },
      { id: 'cp-3', day: 3, title: 'Word Sprint Pitch Control', detail: 'Play 2 rounds of Pitch Matcher mini-game targeting steady pitch', duration: 12, status: 'In Progress' },
      { id: 'cp-4', day: 4, title: 'Conversational Prolonged Speech', detail: 'Record 3 minutes of monologue describing your daily routine', duration: 15, status: 'Upcoming' },
      { id: 'cp-5', day: 5, title: 'Doctor Consultation Preparation', detail: 'Review milestone progress notes for Dr. Ananya Sen', duration: 10, status: 'Upcoming' },
    ]
    defaultCarePlan.forEach(cp => memoryCarePlan.set(cp.id, cp))
  }
}
initMemoryData()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
})

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.includes('localhost')) {
      callback(null, true)
      return
    }
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
}))

app.use(express.json({ limit: '20mb' }))
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.json({
    app: appName,
    status: 'ok',
    message: 'VOXTECH backend is running.',
    health: '/api/health',
  })
})

async function initDatabase() {
  if (!pool) {
    console.warn('DATABASE_URL is not configured. Running without PostgreSQL for now.')
    return
  }

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(80) UNIQUE NOT NULL,
        email VARCHAR(180),
        password_hash TEXT NOT NULL,
        role VARCHAR(40) NOT NULL DEFAULT 'Patient',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS therapy_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        session_name VARCHAR(120) NOT NULL,
        score INTEGER NOT NULL DEFAULT 0,
        insight TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `)

    console.log('PostgreSQL database ready.')
  } catch (error) {
    console.error('PostgreSQL initialization failed:', error.message)
  }
}

function createToken(user) {
  return jwt.sign({ sub: user.id, username: user.username, role: user.role, email: user.email || '' }, JWT_SECRET, { expiresIn: '7d' })
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET)
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    return res.status(401).json({ message: 'Authentication required.' })
  }

  try {
    req.user = verifyToken(token)
    return next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' })
  }
}

function encryptValue(value) {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-gcm', AES_KEY, iv)
  const encrypted = Buffer.concat([cipher.update(String(value), 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()

  return {
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
    value: encrypted.toString('hex'),
  }
}

function decryptValue(payload) {
  const iv = Buffer.from(payload.iv, 'hex')
  const tag = Buffer.from(payload.tag, 'hex')
  const encrypted = Buffer.from(payload.value, 'hex')
  const decipher = crypto.createDecipheriv('aes-256-gcm', AES_KEY, iv)
  decipher.setAuthTag(tag)

  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8')
}

async function findUserByUsername(username) {
  if (!pool) return memoryUsers.get(username.trim().toLowerCase()) || null

  const result = await pool.query(
    'SELECT * FROM users WHERE username = $1 LIMIT 1',
    [username.trim()],
  )

  return result.rows[0] || null
}

async function findUserById(id) {
  if (!pool) {
    return Array.from(memoryUsers.values()).find((user) => user.id === id) || null
  }

  const result = await pool.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id])
  return result.rows[0] || null
}

async function createUser({ username, email, password, role }) {
  if (!pool) {
    const user = {
      id: crypto.randomUUID(),
      username,
      email,
      role,
      password_hash: await bcrypt.hash(password, BCRYPT_ROUNDS),
    }

    memoryUsers.set(username.trim().toLowerCase(), user)
    return user
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)
  const result = await pool.query(
    `INSERT INTO users (username, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, username, email, role;`,
    [username, email, passwordHash, role],
  )

  return result.rows[0]
}

async function transcribeWithWhisper(audioBuffer, mimetype, filename) {
  if (!process.env.WHISPER_API_KEY) {
    throw new Error('WHISPER_API_KEY is not configured.')
  }

  const form = new FormData()
  const blob = new Blob([audioBuffer], { type: mimetype || 'audio/wav' })
  form.append('file', blob, filename || 'recording.wav')
  form.append('model', process.env.WHISPER_MODEL || 'whisper-1')

  const response = await fetch(process.env.WHISPER_API_URL || 'https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.WHISPER_API_KEY}`,
    },
    body: form,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Whisper transcription failed: ${errorText}`)
  }

  const data = await response.json()
  return data.text || ''
}

async function transcribeWithSarvam(audioBuffer, mimetype, filename = 'audio.wav') {
  const sarvamKey = process.env.SARVAM_API_KEY || 'sk_xk93gugn_YfEHulNi96lUibFNBJL5t6lL'
  if (!sarvamKey) {
    throw new Error('SARVAM_API_KEY is not configured.')
  }

  const formData = new FormData()
  const blob = new Blob([audioBuffer], { type: mimetype || 'audio/wav' })
  formData.append('file', blob, filename || 'audio.wav')
  formData.append('model', 'saaras:v3')

  const response = await fetch(`${process.env.SARVAM_BASE_URL || 'https://api.sarvam.ai'}/speech-to-text`, {
    method: 'POST',
    headers: {
      'api-subscription-key': sarvamKey,
    },
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Sarvam transcription failed: ${errorText}`)
  }

  const data = await response.json()
  return data?.transcript || data?.text || data?.output || ''
}

async function getSpeechTranscript(audioBuffer, mimetype, filename, provider) {
  if (provider === 'sarvam') {
    return transcribeWithSarvam(audioBuffer, mimetype, filename)
  }

  if (process.env.WHISPER_API_KEY) {
    return transcribeWithWhisper(audioBuffer, mimetype, filename)
  }

  const sarvamKey = process.env.SARVAM_API_KEY || 'sk_xk93gugn_YfEHulNi96lUibFNBJL5t6lL'
  if (sarvamKey) {
    return transcribeWithSarvam(audioBuffer, mimetype, filename)
  }

  return 'Transcription is not configured yet. Add WHISPER_API_KEY or SARVAM_API_KEY in your environment.'
}

async function synthesizeWithSarvam(text, targetLanguage = 'en-IN') {
  const sarvamKey = process.env.SARVAM_API_KEY || 'sk_xk93gugn_YfEHulNi96lUibFNBJL5t6lL'
  if (!sarvamKey) {
    throw new Error('SARVAM_API_KEY is not configured.')
  }

  const response = await fetch(
		`${process.env.SARVAM_BASE_URL || "https://api.sarvam.ai"}/text-to-speech`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"api-subscription-key": sarvamKey,
			},
			body: JSON.stringify({
				inputs: [text],
				target_language_code: targetLanguage,
				speaker: process.env.SARVAM_SPEAKER || "ritu",
				model: "bulbul:v3",
			}),
		},
	)

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Sarvam speech synthesis failed: ${errorText}`)
  }

  const data = await response.json()
  return data?.audios?.[0] ? Buffer.from(data.audios[0], 'base64') : null
}

function getLiveUserContext(role = 'Patient') {
  const profile = memoryProfiles.get('default') || {
    name: 'Rahul Sharma',
    language: 'Hindi / English',
    targetSpeed: '120 WPM',
    dailyGoalMins: 20,
  }
  const goals = Array.from(memoryGoals.values())
  const updates = Array.from(memoryUpdates.values())
  const reminders = Array.from(memoryReminders.values())
  const carePlan = Array.from(memoryCarePlan.values())
  const appointments = [
    { doctor: 'Dr. Ananya Sen', specialty: 'Stuttering & Fluency Specialist', time: 'Today at 4:30 PM', roomCode: 'ROOM-8821' },
    { doctor: 'Dr. Rajesh Kumar', specialty: 'Articulation & Pitch Coach', time: 'Tomorrow at 11:00 AM', roomCode: 'ROOM-4910' },
  ]
  const gameScores = memoryGameScores.slice(0, 5)

  return {
    profile,
    goals,
    updates,
    reminders,
    carePlan,
    appointments,
    gameScores,
    role,
  }
}

async function buildAssistantReply(message, role, conversationHistory = []) {
  const sarvamKey = process.env.SARVAM_API_KEY || 'sk_xk93gugn_YfEHulNi96lUibFNBJL5t6lL'
  if (!sarvamKey) {
    throw new Error('SARVAM_API_KEY is not configured.')
  }

  const liveContext = getLiveUserContext(role)
  const goalsSummary = liveContext.goals.map(g => `- [${g.status}] ${g.title}: ${g.detail} (Category: ${g.category})`).join('\n') || 'None recorded.'
  const updatesSummary = liveContext.updates.map(u => `- [${u.category}] ${u.title}: "${u.content}" (By ${u.author})`).join('\n') || 'None recorded.'
  const remindersSummary = liveContext.reminders.map(r => `- [${r.active ? 'ACTIVE' : 'MUTED'}] ${r.time} - ${r.title} (${r.category})`).join('\n') || 'None active.'
  const carePlanSummary = liveContext.carePlan.map(c => `- Day ${c.day}: ${c.title} (${c.duration} mins) - Status: ${c.status}`).join('\n') || 'None generated.'
  const appointmentsSummary = liveContext.appointments.map(a => `- ${a.doctor} (${a.specialty}) scheduled for ${a.time}`).join('\n')

  const systemPrompt = `You are VOXTECH AI — the ultimate Speech & Language Therapy Assistant, Care Planner, Smart Reminder Manager, and Daily Guidance Engine.

User Profile: Name: ${liveContext.profile.name}, Preferred Language: ${liveContext.profile.language}, Target Speed: ${liveContext.profile.targetSpeed}, Daily Target: ${liveContext.profile.dailyGoalMins} mins. Role: ${role || 'Patient'}.

=== LIVE USER APPLICATION CONTEXT (Strict Grounding - DO NOT HALLUCINATE metrics or progress outside this data) ===
1. ACTIVE TARGET GOALS:
${goalsSummary}

2. RECENT PRACTICE LOGS & CLINICAL NOTES:
${updatesSummary}

3. SCHEDULED DOCTOR CONSULTATIONS:
${appointmentsSummary}

4. ACTIVE SMART REMINDERS:
${remindersSummary}

5. CURRENT CARE PLAN ROADMAP:
${carePlanSummary}

=== INSTRUCTIONS ===
- Provide empathetic, precise, and grounded speech therapy advice.
- When asked about progress or current status, ALWAYS cite the real numbers/goals/logs provided in the context above. NEVER make up artificial metrics or fake exercise history.
- Offer actionable speech drills (e.g. Diaphragmatic Breathing, Continuous Phonation, Prolonged Speech, Pausing & Phrasing, Gentle Onset).
- DO NOT use markdown symbols like **, ##, #, or __. Write response in clean, formatted natural text.
- Use bullet symbols (•) for list items.
- Always refer to yourself as VOXTECH AI. Never mention Sarvam or Sarvam AI.`

  const formattedHistory = Array.isArray(conversationHistory)
    ? conversationHistory.slice(-4).map(h => ({
        role: h.sender === 'user' ? 'user' : 'assistant',
        content: h.text,
      }))
    : []

  const messages = [
    { role: 'system', content: systemPrompt },
    ...formattedHistory,
    { role: 'user', content: message },
  ]

  const response = await fetch('https://api.sarvam.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-subscription-key': sarvamKey,
    },
    body: JSON.stringify({
      model: 'sarvam-105b-conversations',
      messages,
      temperature: 0.5,
      max_tokens: 450,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`VOXTECH AI chat failed: ${errorText}`)
  }

  const data = await response.json()
  let rawContent = data?.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.'

  // Strip residual markdown syntax (*, #, **) so text is 100% clean
  const cleanContent = rawContent
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/#{1,6}\s?/g, '')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/Sarvam AI/gi, 'VOXTECH AI')
    .replace(/Sarvam/gi, 'VOXTECH')

  return cleanContent
}

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: appName,
    timestamp: new Date().toISOString(),
    database: pool ? 'postgresql' : 'memory-fallback',
  })
})

app.post('/api/auth/register', async (req, res) => {
  const { username, email, password, role } = req.body || {}

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' })
  }

  const safeUsername = String(username).trim()
  const safeEmail = email ? String(email).trim() : ''
  const safeRole = role || 'Patient'

  if (safeUsername.length < 3) {
    return res.status(400).json({ message: 'Username must be at least 3 characters.' })
  }

  try {
    const existingUser = await findUserByUsername(safeUsername)

    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists.' })
    }

    const created = await createUser({
      username: safeUsername,
      email: safeEmail,
      password,
      role: safeRole,
    })

    const token = createToken(created)

    return res.status(201).json({
      message: 'Account created successfully.',
      user: {
        id: created.id,
        username: created.username,
        email: created.email || '',
        role: created.role,
      },
      token,
    })
  } catch (error) {
    console.error('Register failed:', error)
    return res.status(500).json({ message: 'Unable to create account right now.' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  const { username, password, role } = req.body || {}

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' })
  }

  try {
    const user = await findUserByUsername(username)

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password.' })
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash)

    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid username or password.' })
    }

    if (role && user.role !== role) {
      return res.status(403).json({ message: 'Selected role does not match this account.' })
    }

    const token = createToken(user)

    return res.status(200).json({
      message: 'YOU LOGGINED SUCCESSFULLY',
      user: {
        id: user.id,
        username: user.username,
        email: user.email || '',
        role: user.role,
      },
      token,
    })
  } catch (error) {
    console.error('Login failed:', error)
    return res.status(500).json({ message: 'Unable to log in right now.' })
  }
})

app.get('/api/auth/me', requireAuth, async (req, res) => {
  const user = await findUserById(req.user.sub)

  if (!user) {
    return res.status(404).json({ message: 'User not found.' })
  }

  return res.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email || '',
      role: user.role,
    },
  })
})

app.post('/api/security/encrypt', requireAuth, (req, res) => {
  const { value } = req.body || {}

  if (value === undefined || value === null) {
    return res.status(400).json({ message: 'Value is required.' })
  }

  const encrypted = encryptValue(value)
  return res.json({ encrypted })
})

app.post('/api/security/decrypt', requireAuth, (req, res) => {
  const { payload } = req.body || {}

  if (!payload || !payload.iv || !payload.tag || !payload.value) {
    return res.status(400).json({ message: 'Encrypted payload is required.' })
  }

  try {
    return res.json({ value: decryptValue(payload) })
  } catch (error) {
    return res.status(400).json({ message: 'Invalid encrypted payload.' })
  }
})

app.post('/api/speech/transcribe', requireAuth, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Audio file is required.' })
    }

    const provider = req.query.provider
    const transcript = await getSpeechTranscript(req.file.buffer, req.file.mimetype, req.file.originalname, provider)

    return res.status(200).json({
      transcript,
      provider: provider || (process.env.WHISPER_API_KEY ? 'whisper' : 'sarvam'),
    })
  } catch (error) {
    console.error('Transcription failed:', error)
    return res.status(500).json({ message: error.message || 'Failed to transcribe audio.' })
  }
})

app.post('/api/speech/tts', requireAuth, async (req, res) => {
  const { text, targetLanguage } = req.body || {}

  if (!text || !text.trim()) {
    return res.status(400).json({ message: 'Text is required.' })
  }

  try {
    const audio = await synthesizeWithSarvam(text.trim(), targetLanguage || 'en-IN')
    if (!audio) return res.status(502).json({ message: 'Speech provider returned no audio.' })

    res.set('Content-Type', 'audio/wav')
    return res.send(audio)
  } catch (error) {
    console.error('Speech synthesis failed:', error)
    return res.status(500).json({ message: error.message || 'Failed to synthesize speech.' })
  }
})

app.post('/api/ai/chat', requireAuth, async (req, res) => {
  const { message, role, conversationHistory } = req.body || {}

  if (!message || !message.trim()) {
    return res.status(400).json({ message: 'Message is required.' })
  }

  try {
    const reply = await buildAssistantReply(message, role || req.user.role || 'Patient', conversationHistory)
    const context = getLiveUserContext(role || req.user.role || 'Patient')
    return res.status(200).json({ reply, contextSummary: { goalsCount: context.goals.length, updatesCount: context.updates.length } })
  } catch (error) {
    console.error('AI chat error:', error)
    return res.status(500).json({ message: 'Unable to generate assistant response.' })
  }
})

app.get('/api/ai/assistant/context', requireAuth, (req, res) => {
  const context = getLiveUserContext(req.user?.role || 'Patient')
  res.json({ context })
})

// Reminders CRUD
app.get('/api/reminders', requireAuth, (req, res) => {
  res.json({ reminders: Array.from(memoryReminders.values()) })
})

app.post('/api/reminders', requireAuth, (req, res) => {
  const { title, time, category } = req.body || {}
  if (!title) return res.status(400).json({ message: 'Reminder title is required.' })

  const newRem = {
    id: `rem-${Date.now()}`,
    title: title.trim(),
    time: time || '10:00 AM',
    category: category || 'Practice',
    active: true,
  }
  memoryReminders.set(newRem.id, newRem)
  res.status(201).json({ reminder: newRem })
})

app.put('/api/reminders/:id/toggle', requireAuth, (req, res) => {
  const rem = memoryReminders.get(req.params.id)
  if (!rem) return res.status(404).json({ message: 'Reminder not found.' })
  rem.active = !rem.active
  memoryReminders.set(rem.id, rem)
  res.json({ reminder: rem })
})

app.delete('/api/reminders/:id', requireAuth, (req, res) => {
  if (memoryReminders.has(req.params.id)) {
    memoryReminders.delete(req.params.id)
    return res.json({ message: 'Reminder deleted.' })
  }
  res.status(404).json({ message: 'Reminder not found.' })
})

// Care Plan Endpoints
app.get('/api/careplan', requireAuth, (req, res) => {
  res.json({ carePlan: Array.from(memoryCarePlan.values()) })
})

app.post('/api/ai/careplan/generate', requireAuth, async (req, res) => {
  try {
    const goals = Array.from(memoryGoals.values())
    const focusArea = goals.find(g => !g.done)?.category || 'Speech & Fluency'
    
    // Generate fresh 5-day care plan
    const generatedPlan = [
      { id: `cp-${Date.now()}-1`, day: 1, title: `${focusArea} Foundations`, detail: `Complete 10 mins of gentle vocal warming and rhythmic 4-count breathing`, duration: 10, status: 'Completed' },
      { id: `cp-${Date.now()}-2`, day: 2, title: `Target Sound Onset & Pacing`, detail: `Execute 20 sound repetitions focusing on zero vocal fry`, duration: 15, status: 'In Progress' },
      { id: `cp-${Date.now()}-3`, day: 3, title: `Interactive Mini-Game Drill`, detail: `Achieve 800+ points on Pitch Matcher game for pitch stability`, duration: 12, status: 'Upcoming' },
      { id: `cp-${Date.now()}-4`, day: 4, title: `Monologue Fluency Recording`, detail: `Record 3-minute oral monologue describing your favorite topic`, duration: 15, status: 'Upcoming' },
      { id: `cp-${Date.now()}-5`, day: 5, title: `Clinical Review & Doctor Notes`, detail: `Prepare weekly exercise logs for your upcoming doctor consultation`, duration: 10, status: 'Upcoming' },
    ]

    memoryCarePlan.clear()
    generatedPlan.forEach(item => memoryCarePlan.set(item.id, item))

    res.json({ carePlan: generatedPlan, message: 'New AI Care Plan generated based on active goals.' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate care plan.' })
  }
})

app.get('/api/webrtc/config', (req, res) => {
  res.json({
    iceServers: [
      { urls: process.env.STUN_URL || 'stun:stun.l.google.com:19302' },
      ...(process.env.TURN_SERVER_URL
        ? [{
            urls: process.env.TURN_SERVER_URL,
            username: process.env.TURN_USERNAME || '',
            credential: process.env.TURN_PASSWORD || '',
          }]
        : []),
    ],
    dtlsSrtp: true,
    info: 'WebRTC peer connections handle DTLS-SRTP automatically in the browser. This endpoint only exposes ICE and TURN settings for signaling.',
  })
})

app.post('/api/therapy/session', requireAuth, async (req, res) => {
  const { sessionName, score, insight } = req.body || {}

  if (!sessionName) {
    return res.status(400).json({ message: 'Session name is required.' })
  }

  if (!pool) {
    return res.status(200).json({
      message: 'Session saved locally only because PostgreSQL is not configured.',
      session: { sessionName, score: Number(score || 0), insight: insight || '' },
    })
  }

  try {
    const result = await pool.query(
      `INSERT INTO therapy_sessions (user_id, session_name, score, insight)
       VALUES ($1, $2, $3, $4)
       RETURNING *;`,
      [req.user.sub, sessionName, Number(score || 0), insight || ''],
    )

    return res.status(201).json({ message: 'Session recorded.', session: result.rows[0] })
  } catch (error) {
    console.error('Session save failed:', error)
    return res.status(500).json({ message: 'Unable to save therapy session.' })
  }
})

// --- GOALS CRUD APIs ---
app.get('/api/goals', requireAuth, (req, res) => {
  const goals = Array.from(memoryGoals.values())
  res.json({ goals })
})

app.post('/api/goals', requireAuth, (req, res) => {
  const { title, detail, category } = req.body || {}
  if (!title || !title.trim()) return res.status(400).json({ message: 'Goal title is required.' })
  const newGoal = {
    id: `goal-${Date.now()}`,
    title: title.trim(),
    detail: detail ? detail.trim() : 'Therapy goal',
    category: category || 'Speech',
    done: false,
    status: 'Pending',
    createdAt: new Date().toISOString(),
  }
  memoryGoals.set(newGoal.id, newGoal)
  res.status(201).json({ message: 'Goal created.', goal: newGoal })
})

app.put('/api/goals/:id', requireAuth, (req, res) => {
  const { id } = req.params
  const goal = memoryGoals.get(id)
  if (!goal) return res.status(404).json({ message: 'Goal not found.' })
  goal.done = req.body.done !== undefined ? req.body.done : !goal.done
  goal.status = goal.done ? 'Completed' : 'Pending'
  memoryGoals.set(id, goal)
  res.json({ message: 'Goal updated.', goal })
})

app.delete('/api/goals/:id', requireAuth, (req, res) => {
  const { id } = req.params
  if (!memoryGoals.has(id)) return res.status(404).json({ message: 'Goal not found.' })
  memoryGoals.delete(id)
  res.json({ message: 'Goal deleted.' })
})

// --- UPDATES CRUD APIs ---
app.get('/api/updates', requireAuth, (req, res) => {
  const updates = Array.from(memoryUpdates.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  res.json({ updates })
})

app.post('/api/updates', requireAuth, (req, res) => {
  const { title, content, category } = req.body || {}
  if (!title || !content) return res.status(400).json({ message: 'Title and content are required.' })
  const newUpdate = {
    id: `up-${Date.now()}`,
    title: title.trim(),
    content: content.trim(),
    author: req.user.username || 'Clinical Lead',
    category: category || 'Clinical Note',
    createdAt: new Date().toISOString(),
  }
  memoryUpdates.set(newUpdate.id, newUpdate)
  res.status(201).json({ message: 'Update logged.', update: newUpdate })
})

app.delete('/api/updates/:id', requireAuth, (req, res) => {
  const { id } = req.params
  if (!memoryUpdates.has(id)) return res.status(404).json({ message: 'Update not found.' })
  memoryUpdates.delete(id)
  res.json({ message: 'Update deleted.' })
})

// --- COMMUNITY POSTS APIs ---
app.get('/api/community/posts', requireAuth, (req, res) => {
  const posts = Array.from(memoryCommunityPosts.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  res.json({ posts })
})

app.post('/api/community/posts', requireAuth, (req, res) => {
  const { title, content, category } = req.body || {}
  if (!title || !content) return res.status(400).json({ message: 'Title and content are required.' })
  const newPost = {
    id: `post-${Date.now()}`,
    title: title.trim(),
    content: content.trim(),
    author: req.user.username || 'Community Member',
    likes: 0,
    category: category || 'General Discussion',
    createdAt: new Date().toISOString(),
  }
  memoryCommunityPosts.set(newPost.id, newPost)
  res.status(201).json({ message: 'Community post published.', post: newPost })
})

app.post('/api/community/posts/:id/like', requireAuth, (req, res) => {
  const { id } = req.params
  const post = memoryCommunityPosts.get(id)
  if (!post) return res.status(404).json({ message: 'Post not found.' })
  post.likes = (post.likes || 0) + 1
  memoryCommunityPosts.set(id, post)
  res.json({ message: 'Post liked.', post })
})

// --- GAME SCORES & ANALYTICS APIs ---
app.get('/api/games/scores', requireAuth, (req, res) => {
  res.json({ scores: memoryGameScores.slice(-20).reverse() })
})

app.post('/api/games/scores', requireAuth, (req, res) => {
  const { gameName, score } = req.body || {}
  const entry = {
    id: `score-${Date.now()}`,
    user: req.user.username || 'Player',
    gameName: gameName || 'Speech Game',
    score: Number(score || 0),
    createdAt: new Date().toISOString(),
  }
  memoryGameScores.push(entry)
  res.status(201).json({ message: 'Score saved.', entry })
})

app.get('/api/analytics/summary', requireAuth, (req, res) => {
  res.json({
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
})

// --- PROFILE APIs ---
app.get('/api/profile', requireAuth, (req, res) => {
  const prof = memoryProfiles.get(req.user.sub) || {
    id: req.user.sub,
    username: req.user.username,
    email: req.user.email || 'user@voxtech.com',
    role: req.user.role || 'Patient',
    preferredLanguage: 'en-IN',
    bio: 'Dedicated to daily speech fluency and breathing practice.',
  }
  res.json({ profile: prof })
})

app.put('/api/profile', requireAuth, (req, res) => {
  const current = memoryProfiles.get(req.user.sub) || { id: req.user.sub, username: req.user.username }
  const updated = {
    ...current,
    ...req.body,
    updatedAt: new Date().toISOString(),
  }
  memoryProfiles.set(req.user.sub, updated)
  res.json({ message: 'Profile updated.', profile: updated })
})

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id)

  socket.on('join-room', ({ roomId, userRole, userName }) => {
    if (!roomId) return
    socket.join(roomId)
    const room = io.sockets.adapter.rooms.get(roomId)
    const numClients = room ? room.size : 1

    socket.emit('joined-room', { roomId, peerCount: numClients })
    socket.to(roomId).emit('peer-joined', { socketId: socket.id, userRole, userName })
  })

  socket.on('webrtc-signal', ({ roomId, payload }) => {
    if (!roomId) return
    socket.to(roomId).emit('webrtc-signal', { from: socket.id, payload })
  })

  socket.on('leave-room', ({ roomId }) => {
    if (!roomId) return
    socket.leave(roomId)
    socket.to(roomId).emit('peer-left', { socketId: socket.id })
  })

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id)
  })
})

async function startServer() {
  await initDatabase()
  server.listen(PORT, () => {
    console.log(`${appName} backend running on http://localhost:${PORT}`)
    console.log('WebRTC signaling enabled via Socket.IO')
  })
}

startServer().catch((error) => {
  console.error('Server startup failed:', error)
  process.exit(1)
})
