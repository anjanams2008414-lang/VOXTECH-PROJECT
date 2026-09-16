# 🎙️ VOXTECH — Voice AI Assistant for Speech & Language Therapy

Voxtech is a web application designed for speech therapy, voice practice, AI-assisted articulation coaching, care planning, and progress analytics.

---

## 🏗️ Project Architecture

Voxtech is structured as a unified full-stack application for local development:

```
voxtech/
├── server/               # Express.js Backend (REST API, WebSockets, Audio Processing)
│   └── index.js
├── src/                  # React + Vite Frontend UI & Components
│   ├── App.jsx           # Main React Application & Router
│   ├── main.jsx          # Entry point
│   └── App.css / index.css
├── public/               # Static Assets
├── scripts/              # Setup and utility scripts
├── archive/              # Legacy/Standalone modules archive
├── .env.example          # Environment variables template
├── package.json          # Dependency manifest & scripts
└── vite.config.js        # Vite configuration & API proxy (Port 5175 -> 5001)
```

---

## ⚡ Quick Start (First Time Setup)

Running Voxtech locally for the first time requires **zero initial configuration** — the backend runs out-of-the-box using built-in in-memory state.

### 1️⃣ Prerequisites
Ensure you have installed:
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

Check your versions:
```bash
node -v
npm -v
```

---

### 2️⃣ Installation & Setup

1. **Clone the repository** (or navigate to the workspace folder):
   ```bash
   cd voxtech
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```
   *(This automatically executes `npm run setup`, which initializes your `.env` configuration file).*

3. **Start the application**:
   ```bash
   npm run dev
   ```

4. **Access the app**:
   - 🌐 **Frontend UI**: [http://localhost:5175](http://localhost:5175)
   - ⚙️ **Backend API**: [http://localhost:5001](http://localhost:5001)

---

## 🛠️ NPM Command Reference

| Command | Description |
| :--- | :--- |
| `npm run dev` | **Recommended**. Starts both backend and frontend concurrently in dev mode. |
| `npm run dev:client` | Starts only the Vite React frontend server (Port `5175`). |
| `npm run dev:server` | Starts only the Express backend server (Port `5001`). |
| `npm run setup` | Ensures `.env` is initialized from `.env.example`. |
| `npm run build` | Compiles the React frontend for production distribution into `/dist`. |
| `npm run preview` | Previews the production build locally. |
| `npm run lint` | Runs `oxlint` for rapid JS/JSX code quality analysis. |

---

## ⚙️ Environment Configuration (`.env`)

Voxtech works out-of-the-box without editing `.env`. If you want to configure database persistence or custom AI API keys, edit the generated `.env` file:

```env
# Server Configuration
PORT=5001
APP_NAME=VOXTECH
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:5175
JWT_SECRET=voxtech-jwt-secret-dev-key

# Database (Optional)
# Leave blank to use built-in In-Memory mode.
# DATABASE_URL=postgresql://postgres:password@localhost:5432/voxtech

# Sarvam AI Voice Assistant
SARVAM_API_KEY=your_sarvam_api_key_here
SARVAM_BASE_URL=https://api.sarvam.ai
SARVAM_SPEAKER=meera

# OpenAI Whisper (Optional STT Provider)
WHISPER_API_KEY=your_openai_api_key_here
```

---

## 💾 Database Modes

1. **In-Memory Mode (Default)**:
   - No setup required.
   - Ideal for quick local testing and UI development.
   - Pre-populated with default goals, updates, care plans, and community posts.

2. **PostgreSQL Mode**:
   - Provide a valid `DATABASE_URL` in `.env`.
   - The app will automatically connect to your PostgreSQL instance.

---

## 🎤 Audio & Browser Permissions

Voxtech uses your web browser's microphone for voice therapy drills and AI transcription.
- When prompted by your browser on first load, click **Allow** for microphone access.
- For WebRTC calls or audio drills, use modern browsers (Chrome, Edge, Safari, Firefox).

---

## ❓ Troubleshooting

- **Port 5001 or 5175 already in use**:
  Change `PORT` in `.env` or set custom port flags in `vite.config.js`.
- **API calls failing with 404**:
  Ensure both backend and frontend are running (`npm run dev`). Vite proxies `/api` requests directly to `http://localhost:5001`.
