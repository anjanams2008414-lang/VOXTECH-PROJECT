import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'

function getKey() {
  const keyHex = process.env.AES_KEY || (process.env.NODE_ENV === 'production' ? '' : crypto.createHash('sha256').update('voxtech-local-development-key').digest('hex'))
  if (!keyHex) {
    throw new Error('AES_KEY is not set. Generate a 32-byte hex key for production.')
  }

  if (!/^[a-f0-9]{64}$/i.test(keyHex)) {
    throw new Error('AES_KEY must be exactly 64 hexadecimal characters.')
  }

  return Buffer.from(keyHex, 'hex')
}

export function encryptPHI(plainText) {
  if (typeof plainText !== 'string') throw new TypeError('encryptPHI expects a string')

  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv)
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`
}

export function decryptPHI(cipherPayload) {
  if (typeof cipherPayload !== 'string' || cipherPayload.split(':').length !== 3) {
    throw new TypeError('decryptPHI expects iv:authTag:ciphertext')
  }

  const [ivHex, tagHex, encryptedHex] = cipherPayload.split(':')
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), Buffer.from(ivHex, 'hex'))
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'))
  return Buffer.concat([decipher.update(Buffer.from(encryptedHex, 'hex')), decipher.final()]).toString('utf8')
}

export function encryptFields(obj, fields) {
  const out = { ...obj }
  for (const field of fields) {
    if (out[field] != null) out[field] = encryptPHI(String(out[field]))
  }
  return out
}

export function decryptFields(obj, fields) {
  const out = { ...obj }
  for (const field of fields) {
    if (out[field] != null) out[field] = decryptPHI(out[field])
  }
  return out
}
