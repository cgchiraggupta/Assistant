# Fix: "Connect to Assistant" Button Not Working

## The Problem
When you click "Connect to Assistant", nothing happens because:
1. The WebSocket server isn't running
2. The server needs a valid OpenAI API key

## Quick Fix (2 Steps)

### Step 1: Add Your OpenAI API Key

```bash
cd /Users/apple/Assistant/server
echo "KEY=sk-your-actual-openai-api-key-here" > .env
```

**⚠️ Important:** Replace `sk-your-actual-openai-api-key-here` with your real API key from:
https://platform.openai.com/api-keys

### Step 2: Restart the Desktop App

1. Close the Assistant app window
2. Stop any running processes:
   ```bash
   pkill -f "tauri dev"
   ```
3. Restart the app:
   ```bash
   cd /Users/apple/Assistant/client
   source ~/.cargo/env
   npm run tauri:dev
   ```

## Verify Server is Running

After restarting, check if the server started:

```bash
lsof -i :4000
```

You should see a `node` process listening on port 4000.

## Manual Server Start (Alternative)

If the auto-start doesn't work, you can manually start the server:

**Terminal 1 (Server):**
```bash
cd /Users/apple/Assistant/server
node index.js
```

You should see:
```
WebSocket server is listening on ws://localhost:4000/Assistant
```

**Terminal 2 (Desktop App):**
```bash
cd /Users/apple/Assistant/client
source ~/.cargo/env
npm run tauri:dev
```

## Check for Errors

If it still doesn't work, check the Tauri terminal output for:
- `✅ WebSocket server started successfully` - Good!
- `❌ Failed to start WebSocket server` - Check the error message
- `⚠️ Server directory not found` - Path issue
- `⚠️ Server index.js not found` - File missing

## Test Connection

Once both are running:
1. Click "Connect to Assistant" button
2. You should see connection status change
3. Check browser console (if available) or terminal for WebSocket messages

## Still Not Working?

1. **Check .env file:**
   ```bash
   cd /Users/apple/Assistant/server
   cat .env
   ```
   Should show: `KEY=sk-...` (not just a comment)

2. **Test server manually:**
   ```bash
   cd /Users/apple/Assistant/server
   node index.js
   ```
   If it crashes, check the error message

3. **Verify ports:**
   ```bash
   lsof -i :4000  # Should show server
   lsof -i :3000  # Should show Next.js
   ```

4. **Check Node.js:**
   ```bash
   node --version  # Should be v16+
   ```




