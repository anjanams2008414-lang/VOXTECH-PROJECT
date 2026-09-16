/**
 * OPTIONAL / ADVANCED MODULE
 * ---------------------------------------------------------------------------
 * For plain calling, you don't need this file: two browsers connect directly
 * via WebRTC (signaling.js relays SDP/ICE) and DTLS-SRTP encryption is handled
 * entirely between the browsers.
 *
 * This module exists for the *live translation* use case: to run Whisper/Sarvam
 * on someone's speech in real time, that audio has to reach your server. That
 * means the server itself becomes a WebRTC peer for each participant, terminating
 * its own DTLS-SRTP session with each browser using `werift` (a pure-JS WebRTC
 * implementation — no native compiled bindings, unlike `wrtc`).
 *
 * Flow per participant:
 *   Browser  <--DTLS-SRTP-->  Node (werift RTCPeerConnection)
 *                                  |
 *                                  v  (decoded Opus -> PCM)
 *                          buffer ~2-4s of audio (silence/VAD-gated)
 *                                  |
 *                                  v
 *                         Whisper: speech -> source-language text
 *                                  |
 *                                  v
 *                    Sarvam: translate text -> target language
 *                                  |
 *                                  v
 *                       Sarvam: text -> speech (target language)
 *                                  |
 *                                  v
 *                 encode back to Opus, push into the OTHER participant's
 *                 outgoing RTCPeerConnection audio track
 *
 * This file wires up that pipeline's skeleton. Production-grade version would add:
 *   - Voice Activity Detection (VAD) to chunk on pauses instead of a fixed timer
 *   - Jitter buffering / resampling (Opus is 48kHz, Whisper wants 16kHz mono)
 *   - Streaming partial transcripts for lower perceived latency
 *   - Backpressure handling if AI calls are slower than real time
 */

import { RTCPeerConnection } from "werift";
import { transcribeAudio } from "../services/whisperService.js";
import { translateAndSynthesize } from "../services/sarvamService.js";
import { saveTranscript } from "../models/transcriptModel.js";
import { logger } from "../utils/logger.js";

const CHUNK_INTERVAL_MS = 3000; // flush and process audio every 3s of speech

/** @type {Map<string, BridgeSession>} keyed by `${callId}:${userId}` */
const sessions = new Map();

export class BridgeSession {
  constructor({ callId, userId, sourceLanguage, targetLanguage, iceServers }) {
    this.callId = callId;
    this.userId = userId;
    this.sourceLanguage = sourceLanguage;
    this.targetLanguage = targetLanguage;
    this.pcAudioChunks = [];
    this.peerConnection = new RTCPeerConnection({ iceServers });
    this.outboundTrack = null; // set once the other participant's session exists
    this._wireEvents();
  }

  _wireEvents() {
    this.peerConnection.onTrack.subscribe((event) => {
      const track = event.track;
      if (track.kind !== "audio") return;

      track.onReceiveRtp.subscribe((rtp) => {
        // Raw RTP payload (Opus-encoded). In a full implementation, decode Opus -> PCM here
        // (e.g. with an Opus decoder binding) and push PCM frames into pcAudioChunks.
        this.pcAudioChunks.push(rtp.payload);
      });
    });

    this._flushTimer = setInterval(() => this._flushAndProcess().catch((e) => logger.error(e)), CHUNK_INTERVAL_MS);
  }

  async _flushAndProcess() {
    if (this.pcAudioChunks.length === 0) return;
    const audioBuffer = Buffer.concat(this.pcAudioChunks);
    this.pcAudioChunks = [];

    try {
      // 1. Speech -> text (source language)
      const { text, language } = await transcribeAudio(audioBuffer, {
        filename: "chunk.opus",
        language: this.sourceLanguage,
      });
      if (!text) return;

      // 2. Translate + synthesize speech in the listener's language
      const { translatedText, audio } = await translateAndSynthesize({
        text,
        sourceLanguage: language || this.sourceLanguage,
        targetLanguage: this.targetLanguage,
      });

      // 3. Persist encrypted transcript
      await saveTranscript({
        callId: this.callId,
        speakerId: this.userId,
        sourceLanguage: language || this.sourceLanguage,
        targetLanguage: this.targetLanguage,
        originalText: text,
        translatedText,
      });

      // 4. Push synthesized audio into the other participant's outbound track
      if (audio && this.outboundTrack) {
        this.outboundTrack.writeRtp(audio); // simplified — real code re-encodes to Opus/RTP first
      }
    } catch (err) {
      logger.error(`[mediaBridge] pipeline error for user=${this.userId}`, err.message);
    }
  }

  async handleOffer(sdp) {
    await this.peerConnection.setRemoteDescription({ type: "offer", sdp });
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    return this.peerConnection.localDescription;
  }

  addIceCandidate(candidate) {
    return this.peerConnection.addIceCandidate(candidate);
  }

  close() {
    clearInterval(this._flushTimer);
    this.peerConnection.close();
  }
}

export function getOrCreateSession(key, opts) {
  if (!sessions.has(key)) sessions.set(key, new BridgeSession(opts));
  return sessions.get(key);
}

export function endSession(key) {
  sessions.get(key)?.close();
  sessions.delete(key);
}
