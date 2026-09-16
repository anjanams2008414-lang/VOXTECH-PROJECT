import axios from "axios";
import FormData from "form-data";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

const SARVAM_API_KEY = 'sk_xk93gugn_YfEHulNi96lUibFNBJL5t6lL';

const sarvamClient = axios.create({
  baseURL: env.sarvamApiUrl,
  timeout: 30_000,
  headers: { "api-subscription-key": SARVAM_API_KEY },
});

/**
 * Translates text between languages using Sarvam AI's translate endpoint.
 * Language codes follow Sarvam's BCP-47-ish convention, e.g. "en-IN", "hi-IN", "ta-IN".
 */
export async function translateText(text, { sourceLanguage, targetLanguage }) {
  if (!SARVAM_API_KEY) {
    throw Object.assign(new Error("SARVAM_API_KEY is not configured"), { status: 500 });
  }

  try {
    const { data } = await sarvamClient.post("/translate", {
      input: text,
      source_language_code: sourceLanguage || "auto",
      target_language_code: targetLanguage,
      mode: "formal",
    });
    return data.translated_text ?? data.output ?? "";
  } catch (err) {
    logger.error("[sarvamService] translate failed", err.response?.data || err.message);
    throw Object.assign(new Error("Translation (Sarvam) request failed"), { status: 502 });
  }
}

/**
 * Converts text to speech using Sarvam AI TTS. Returns base64-encoded audio (per Sarvam's API),
 * which callers can decode to a Buffer before streaming/playing back.
 */
export async function textToSpeech(text, { targetLanguage = "en-IN", speaker = "ritu" } = {}) {
  if (!SARVAM_API_KEY) {
    throw Object.assign(new Error("SARVAM_API_KEY is not configured"), { status: 500 });
  }

  try {
    const { data } = await sarvamClient.post("/text-to-speech", {
      inputs: [text],
      target_language_code: targetLanguage,
      speaker: speaker || "ritu",
      model: "bulbul:v3",
    });
    // Sarvam returns an array of base64 audio clips in `audios`
    const base64Audio = data.audios?.[0];
    return base64Audio ? Buffer.from(base64Audio, "base64") : null;
  } catch (err) {
    logger.error("[sarvamService] TTS failed", err.response?.data || err.message);
    throw Object.assign(new Error("Text-to-speech (Sarvam) request failed"), { status: 502 });
  }
}

/**
 * Speech-to-text via Sarvam, better tuned for Indian languages than generic Whisper.
 * Use this instead of whisperService when you know the speaker is using an Indian language.
 */
export async function sarvamSpeechToText(audioBuffer, { filename = "audio.wav" } = {}) {
  if (!SARVAM_API_KEY) {
    throw Object.assign(new Error("SARVAM_API_KEY is not configured"), { status: 500 });
  }

  const form = new FormData();
  form.append("file", audioBuffer, filename);
  form.append("model", "saaras:v3");
  form.append("mode", "transcribe");

  try {
    const { data } = await sarvamClient.post("/speech-to-text", form, {
      headers: form.getHeaders(),
      maxBodyLength: Infinity,
    });
    return { text: data.transcript ?? "", language: data.language_code ?? null };
  } catch (err) {
    logger.error("[sarvamService] STT failed", err.response?.data || err.message);
    throw Object.assign(new Error("Speech-to-text (Sarvam) request failed"), { status: 502 });
  }
}

/**
 * Full pipeline: transcribe (Whisper or Sarvam upstream) -> translate -> synthesize speech,
 * used by the live call media bridge for near real-time speech-to-speech translation.
 */
export async function translateAndSynthesize({ text, sourceLanguage, targetLanguage, speaker }) {
  const translated = await translateText(text, { sourceLanguage, targetLanguage });
  const audio = await textToSpeech(translated, { targetLanguage, speaker });
  return { translatedText: translated, audio };
}
