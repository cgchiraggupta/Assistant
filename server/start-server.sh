#!/bin/bash
# Permanent fix: Server startup script with port conflict detection

PORT=${PORT:-4000}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Starting WebSocket Server..."

# Check if port is already in use
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Port $PORT is already in use!"
    echo "   Killing existing process..."
    lsof -ti :$PORT | xargs kill -9 2>/dev/null
    sleep 1
fi

# Check if .env file exists and has API key
if [ ! -f "$SCRIPT_DIR/.env" ]; then
    echo "❌ Error: .env file not found!"
    echo "   Create it with: echo 'KEY=your-api-key' > $SCRIPT_DIR/.env"
    exit 1
fi

if ! grep -q "KEY=sk-" "$SCRIPT_DIR/.env" 2>/dev/null; then
    echo "⚠️  Warning: .env file exists but may not have a valid API key"
    echo "   Make sure it contains: KEY=sk-your-actual-api-key"
fi

# Start the server
cd "$SCRIPT_DIR"
node index.js




