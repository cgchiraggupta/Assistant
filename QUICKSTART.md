# Quick Start Guide

This guide will get you up and running with the Assistant desktop app in just a few minutes.

## Prerequisites Check

Before starting, make sure you have:

```bash
# Check Node.js (should be v16+)
node --version

# Check Rust (if not installed, see below)
rustc --version
```

### Install Rust (if needed)

```bash
# macOS/Linux
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Verify installation
rustc --version
```

## 5-Minute Setup

### 1. Install Dependencies (First Time Only)

```bash
# From the project root (Assistant/)
cd client
npm install

cd ../server
npm install
```

### 2. Add Your OpenAI API Key

```bash
# In the server directory
cd server
echo "KEY=sk-your-actual-api-key-here" > .env
```

**⚠️ Important:** Replace `sk-your-actual-api-key-here` with your real OpenAI API key from [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

### 3. Run the Desktop App

```bash
cd ../client
npm run tauri:dev
```

**First run?** The initial build takes 5-10 minutes as Rust compiles. Subsequent runs are much faster (30-60 seconds).

## What to Expect

1. **Terminal output:** You'll see Next.js and Rust compilation logs
2. **Desktop window:** The app window will open automatically
3. **Server status:** The WebSocket server starts in the background

## Troubleshooting

### "command not found: cargo" or "command not found: rustc"

Run this in your terminal:
```bash
source ~/.cargo/env
```

Then try again.

### "Failed to start WebSocket server"

Make sure:
1. Node.js is installed: `node --version`
2. Server dependencies are installed: `cd server && npm install`
3. The .env file exists with your API key

### "WebSocket connection failed"

Check that your OpenAI API key is:
1. Set in `server/.env`
2. Valid and has access to the Realtime API
3. Not expired

### Build takes too long

This is normal on the first run. Rust compiles many dependencies. Grab a coffee! ☕

Subsequent builds will be much faster (< 1 minute).

## Build for Production

Once everything works, create a production build:

```bash
cd client
npm run tauri:build
```

Find your installer in:
- **macOS**: `client/src-tauri/target/release/bundle/dmg/`
- **Windows**: `client/src-tauri/target/release/bundle/msi/`
- **Linux**: `client/src-tauri/target/release/bundle/deb/` or `appimage/`

## Need More Help?

See the full [README.md](README.md) for detailed documentation.

## Common Commands

```bash
# Development mode
cd client
npm run tauri:dev

# Production build
cd client
npm run tauri:build

# Run as web app (alternative)
# Terminal 1:
cd server && npm run dev

# Terminal 2:
cd client && npm run dev
# Then open http://localhost:3000
```

---

**Ready?** Run `cd client && npm run tauri:dev` to start! 🚀




