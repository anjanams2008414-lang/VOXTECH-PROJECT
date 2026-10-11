import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

export const securityHeaders = helmet()

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please try again later.' },
})

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
})

export function buildCorsOptions() {
  const configuredOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
  const developmentOrigins = ['http://localhost:5173', 'http://localhost:5175', 'http://localhost:3000']
  const origins = process.env.NODE_ENV === 'production' ? configuredOrigins : [...new Set([...configuredOrigins, ...developmentOrigins])]

  return {
    origin(origin, callback) {
      if (!origin || origins.includes(origin)) return callback(null, true)
      return callback(new Error(`Origin ${origin} not allowed by CORS`))
    },
    credentials: true,
  }
}

export function requireOwnership(paramName = 'patientId') {
  return (req, res, next) => {
    const user = req.user
    if (!user) return res.status(401).json({ error: 'Not authenticated' })

    const requestedId = req.params[paramName]
    const isSelf = String(user.sub || user.id) === String(requestedId)
    const isAssignedTherapist = user.role?.toLowerCase() === 'therapist' && String(user.patientId) === String(requestedId)

    if (!isSelf && !isAssignedTherapist) {
      return res.status(403).json({ error: 'Not authorized to access this record' })
    }

    return next()
  }
}

export function auditLog(action) {
  return (req, res, next) => {
    console.log('[audit]', JSON.stringify({
      timestamp: new Date().toISOString(),
      action,
      actorId: req.user?.sub || req.user?.id || 'anonymous',
      targetId: req.params.patientId || req.params.id || null,
      ip: req.ip,
    }))
    next()
  }
}
