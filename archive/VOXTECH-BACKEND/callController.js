import {
  createCall,
  findCallByRoomCode,
  endCall,
  listParticipants,
} from "../models/callModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const startCall = asyncHandler(async (req, res) => {
  const call = await createCall({ createdBy: req.user.id });
  res.status(201).json({ call });
});

export const getCall = asyncHandler(async (req, res) => {
  const call = await findCallByRoomCode(req.params.roomCode);
  if (!call) return res.status(404).json({ error: "Call not found" });
  const participants = await listParticipants(call.id);
  res.json({ call, participants });
});

export const finishCall = asyncHandler(async (req, res) => {
  const call = await findCallByRoomCode(req.params.roomCode);
  if (!call) return res.status(404).json({ error: "Call not found" });
  const updated = await endCall(call.id);
  res.json({ call: updated });
});
