import { findCallByRoomCode } from "../models/callModel.js";
import { listTranscriptsForCall, saveTranscript } from "../models/transcriptModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getTranscripts = asyncHandler(async (req, res) => {
  const call = await findCallByRoomCode(req.params.roomCode);
  if (!call) return res.status(404).json({ error: "Call not found" });
  const transcripts = await listTranscriptsForCall(call.id);
  res.json({ transcripts });
});

// Manual/offline path (Option 2 flow — e.g. uploading a recorded voice note),
// as opposed to the live media bridge which calls saveTranscript() itself.
export const createTranscript = asyncHandler(async (req, res) => {
  const call = await findCallByRoomCode(req.params.roomCode);
  if (!call) return res.status(404).json({ error: "Call not found" });

  const { sourceLanguage, targetLanguage, originalText, translatedText } = req.body;
  if (!originalText) return res.status(400).json({ error: "originalText is required" });

  const transcript = await saveTranscript({
    callId: call.id,
    speakerId: req.user.id,
    sourceLanguage,
    targetLanguage,
    originalText,
    translatedText,
  });
  res.status(201).json({ transcript });
});
