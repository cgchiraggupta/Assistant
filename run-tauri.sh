#!/bin/bash
# Quick script to run Tauri dev mode

cd /Users/apple/Assistant/client
source ~/.cargo/env

echo "🚀 Starting Tauri Desktop App..."
echo "📍 Location: $(pwd)"
echo ""
echo "⏱️  First build takes 5-10 minutes"
echo "💡 The desktop window will open automatically when ready"
echo ""

npm run tauri:dev




