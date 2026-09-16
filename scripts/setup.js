import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const envPath = path.join(rootDir, '.env')
const envExamplePath = path.join(rootDir, '.env.example')

console.log('🚀 Setting up VOXTECH environment...\n')

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath)
    console.log('✅ Created `.env` from `.env.example`')
  } else {
    console.warn('⚠️  `.env.example` not found. Skipping `.env` creation.')
  }
} else {
  console.log('ℹ️  `.env` already exists. Skipping copy.')
}

console.log(`
🎉 Setup Complete!

To run VOXTECH locally:
  1. npm run dev        (Starts both Backend on port 5001 & Frontend on port 5175)
  2. Open http://localhost:5175 in your browser.

Happy coding! 🎙️
`)
