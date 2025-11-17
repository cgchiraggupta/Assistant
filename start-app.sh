#!/bin/bash
# Easy launcher for Assistant Desktop App

echo "🚀 Starting Assistant Desktop App..."
echo ""

# Load Rust/Cargo
source ~/.cargo/env

# Navigate to client directory
cd /Users/apple/Assistant/client

# Clear any stuck ports
echo "🧹 Clearing ports..."
lsof -ti :3000 2>/dev/null | xargs kill -9 2>/dev/null
lsof -ti :4000 2>/dev/null | xargs kill -9 2>/dev/null

# Start the app
echo "✨ Launching app (this may take 30-60 seconds)..."
echo ""
npm run tauri:dev




