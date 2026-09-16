import dotenv from "dotenv";
dotenv.config();

function required(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`[env] Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

export const env = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",

  databaseUrl: required("DATABASE_URL"),
  pgSsl: process.env.PGSSL === "true",

  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",

  aesKeyHex: required("AES_ENCRYPTION_KEY"),

  twilioSid: process.env.TWILIO_ACCOUNT_SID,
  twilioToken: process.env.TWILIO_AUTH_TOKEN,

  whisperApiKey: process.env.WHISPER_API_KEY,
  whisperApiUrl: process.env.WHISPER_API_URL || "https://api.openai.com/v1/audio/transcriptions",
  whisperModel: process.env.WHISPER_MODEL || "whisper-1",

  sarvamApiKey: 'sk_xk93gugn_YfEHulNi96lUibFNBJL5t6lL',
  sarvamApiUrl: process.env.SARVAM_API_URL || "https://api.sarvam.ai",

  resendApiKey: process.env.RESEND_API_KEY,
  emailFrom: process.env.EMAIL_FROM || "noreply@voxtech.app",
};

// Fail fast if the AES key isn't a valid 32-byte hex string.
if (Buffer.from(env.aesKeyHex, "hex").length !== 32) {
  console.error(
    "[env] AES_ENCRYPTION_KEY must be 64 hex characters (32 bytes). " +
      "Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
  );
  process.exit(1);
}
