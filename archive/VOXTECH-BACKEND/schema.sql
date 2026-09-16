dev
 -- VoxTech database schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name               VARCHAR(120) NOT NULL,
  email              VARCHAR(255) UNIQUE NOT NULL,
  password_hash      TEXT NOT NULL,
  preferred_language VARCHAR(10) DEFAULT 'en-IN',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS calls (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_code    VARCHAR(20) UNIQUE NOT NULL,
  created_by   UUID REFERENCES users(id) ON DELETE SET NULL,
  status       VARCHAR(20) NOT NULL DEFAULT 'active', -- active | ended
  started_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at     TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS call_participants (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id    UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  language   VARCHAR(10),
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  left_at    TIMESTAMPTZ
);

-- Transcripts are stored AES-256-GCM encrypted at rest.
-- iv/tag are stored as hex alongside the ciphertext so the app can decrypt on read.
CREATE TABLE IF NOT EXISTS transcripts (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id                   UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  speaker_id                UUID REFERENCES users(id) ON DELETE SET NULL,
  source_language           VARCHAR(10),
  target_language           VARCHAR(10),
  original_text_ciphertext  TEXT NOT NULL,
  original_text_iv          VARCHAR(32) NOT NULL,
  original_text_tag         VARCHAR(32) NOT NULL,
  translated_text_ciphertext TEXT,
  translated_text_iv        VARCHAR(32),
  translated_text_tag       VARCHAR(32),
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transcripts_call_id ON transcripts(call_id);
CREATE INDEX IF NOT EXISTS idx_call_participants_call_id ON call_participants(call_id);
CREATE INDEX IF NOT EXISTS idx_calls_room_code ON calls(room_code);
