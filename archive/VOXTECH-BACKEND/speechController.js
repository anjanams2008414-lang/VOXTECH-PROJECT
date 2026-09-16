import { transcribeAudio } from "../services/whisperService.js";
import { sarvamSpeechToText, translateText, textToSpeech } from "../services/sarvamService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// POST /api/speech/transcribe  (multipart file field: "audio")
// Body/query: provider=whisper|sarvam, language=en
export const transcribe = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "audio file is required" });

  const provider = req.query.provider === "sarvam" ? "sarvam" : "whisper";
  const result =
    provider === "sarvam"
      ? await sarvamSpeechToText(req.file.buffer, { filename: req.file.originalname })
      : await transcribeAudio(req.file.buffer, {
          filename: req.file.originalname,
          language: req.query.language,
        });

  res.json({ provider, ...result });
});

// POST /api/speech/translate  { text, sourceLanguage, targetLanguage }
export const translate = asyncHandler(async (req, res) => {
  const { text, sourceLanguage, targetLanguage } = req.body;
  if (!text || !targetLanguage) {
    return res.status(400).json({ error: "text and targetLanguage are required" });
  }
  const translatedText = await translateText(text, { sourceLanguage, targetLanguage });
  res.json({ translatedText });
});

// POST /api/speech/tts  { text, targetLanguage, speaker }  -> audio/wav bytes
export const speak = asyncHandler(async (req, res) => {
  const { text, targetLanguage, speaker } = req.body;
  if (!text || !targetLanguage) {
    return res.status(400).json({ error: "text and targetLanguage are required" });
  }
  const audio = await textToSpeech(text, { targetLanguage, speaker });
  if (!audio) return res.status(502).json({ error: "TTS provider returned no audio" });

  res.set("Content-Type", "audio/wav");
  res.send(audio);
});
