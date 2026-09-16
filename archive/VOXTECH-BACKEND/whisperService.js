import axios from "axios";
import FormData from "form-data";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

/**
 * Transcribes an audio buffer using Whisper (OpenAI's /v1/audio/transcriptions endpoint,
 * or any Whisper-compatible self-hosted server that implements the same multipart contract).
 *
 * @param {Buffer} audioBuffer  raw audio bytes (wav/mp3/webm/ogg)
 * @param {Object} opts
 * @param {string} [opts.filename]   filename hint, affects how the API infers format
 * @param {string} [opts.language]   ISO-639-1 language hint, e.g. "en", "hi" (optional)
 * @returns {Promise<{text: string, language: string|null}>}
 */
export async function transcribeAudio(audioBuffer, { filename = "audio.webm", language } = {}) {
  if (!env.whisperApiKey) {
    throw Object.assign(new Error("WHISPER_API_KEY is not configured"), { status: 500 });
  }

  const form = new FormData();
  form.append("file", audioBuffer, filename);
  form.append("model", env.whisperModel);
  if (language) form.append("language", language);
  form.append("response_format", "verbose_json");

  try {
    const { data } = await axios.post(env.whisperApiUrl, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${env.whisperApiKey}`,
      },
      maxBodyLength: Infinity,
      timeout: 30_000,
    });

    return {
      text: data.text?.trim() ?? "",
      language: data.language ?? language ?? null,
    };
  } catch (err) {
    logger.error("[whisperService] transcription failed", err.response?.data || err.message);
    throw Object.assign(new Error("Speech-to-text (Whisper) request failed"), { status: 502 });
  }
}
