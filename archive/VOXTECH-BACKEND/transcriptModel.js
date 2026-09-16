import { query } from "../config/db.js";
import { encrypt, decrypt } from "../utils/crypto.js";

export async function saveTranscript({
  callId,
  speakerId,
  sourceLanguage,
  targetLanguage,
  originalText,
  translatedText,
}) {
  const original = encrypt(originalText);
  const translated = translatedText ? encrypt(translatedText) : null;

  const { rows } = await query(
    `INSERT INTO transcripts (
       call_id, speaker_id, source_language, target_language,
       original_text_ciphertext, original_text_iv, original_text_tag,
       translated_text_ciphertext, translated_text_iv, translated_text_tag
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING id, call_id, speaker_id, source_language, target_language, created_at`,
    [
      callId,
      speakerId,
      sourceLanguage,
      targetLanguage,
      original.ciphertext,
      original.iv,
      original.tag,
      translated?.ciphertext ?? null,
      translated?.iv ?? null,
      translated?.tag ?? null,
    ]
  );
  return rows[0];
}

export async function listTranscriptsForCall(callId) {
  const { rows } = await query(
    `SELECT * FROM transcripts WHERE call_id = $1 ORDER BY created_at ASC`,
    [callId]
  );

  return rows.map((row) => ({
    id: row.id,
    callId: row.call_id,
    speakerId: row.speaker_id,
    sourceLanguage: row.source_language,
    targetLanguage: row.target_language,
    originalText: decrypt({
      ciphertext: row.original_text_ciphertext,
      iv: row.original_text_iv,
      tag: row.original_text_tag,
    }),
    translatedText: row.translated_text_ciphertext
      ? decrypt({
          ciphertext: row.translated_text_ciphertext,
          iv: row.translated_text_iv,
          tag: row.translated_text_tag,
        })
      : null,
    createdAt: row.created_at,
  }));
}
