import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";
import { attachSignalingServer } from "./webrtc/signalingServer.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import callRoutes from "./routes/callRoutes.js";
import transcriptRoutes from "./routes/transcriptRoutes.js";
import iceRoutes from "./routes/iceRoutes.js";
import speechRoutes from "./routes/speechRoutes.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(express.json({ limit: "2mb" }));

// Basic global rate limit; tighten per-route (e.g. /auth/login) as needed.
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get("/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/calls", callRoutes);
app.use("/api/transcripts", transcriptRoutes);
app.use("/api/ice-servers", iceRoutes);
app.use("/api/speech", speechRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const httpServer = http.createServer(app);

// WebSocket signaling shares the same HTTP server/port (upgrades on /ws/signal).
attachSignalingServer(httpServer);

httpServer.listen(env.port, () => {
  logger.info(`VoxTech backend listening on port ${env.port} (${env.nodeEnv})`);
  logger.info(`WebRTC signaling available at ws://localhost:${env.port}/ws/signal`);
});
