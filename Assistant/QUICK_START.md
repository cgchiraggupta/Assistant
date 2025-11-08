# 🚀 Quick Start Guide - Computer Control

Get your voice-controlled AI assistant running in 5 minutes!

## Step 1: Prerequisites ✓

Make sure you have:
- Node.js 16 or higher installed
- An OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- macOS, Windows, or Linux

## Step 2: Environment Setup 🔧

1. Navigate to the server folder:
```bash
cd Assistant/server
```

2. Create a `.env` file:
```bash
# Create the file
touch .env

# Add your API key (replace with your actual key)
echo "KEY=sk-your-openai-api-key-here" > .env
```

Or manually create `server/.env` with:
```
KEY=your_openai_api_key_here
```

## Step 3: Start the Server 🖥️

```bash
cd Assistant/server
npm run dev
```

You should see:
```
WebSocket server is listening on ws://localhost:4000/Assistant
```

## Step 4: Start the Client 🌐

In a new terminal:
```bash
cd Assistant/client
npm run dev
```

Open your browser to: http://localhost:3000

## Step 5: Use the Assistant 🎤

1. **Connect**: Click "Connect to Assistant"
2. **Enable Computer Control**: Click "Computer Control OFF" button (turns purple)
3. **Record**: Click "Start Recording"
4. **Speak**: Try saying:
   - "Take a screenshot"
   - "Type hello world"
   - "Scroll down"
   - "Open Chrome"
5. **Stop**: Click "Stop Recording"
6. **Approve**: When prompted, approve the action

## Example Commands to Try 💡

### Beginner
```
"Type testing one two three"
"Scroll down"
"Press enter"
```

### Intermediate
```
"Click on the search button"
"Open Chrome"
"Take a screenshot"
```

### Advanced
```
"Open Chrome and search for AI news"
"Click the login button and type my email"
```

## Troubleshooting 🔍

### Server won't start
- Check if port 4000 is already in use
- Verify `.env` file exists with valid API key
- Run `npm install` again

### Computer control not working
- Verify the purple "Computer Control ON" button is showing
- Check browser console (F12) for errors
- Grant screen recording permissions (macOS Settings → Privacy & Security → Screen Recording)

### Actions fail
- Some actions require confirmation - check for popup dialogs
- Check the action log (click "Show Log") for error messages
- Verify you're not hitting rate limits (20 actions/minute default)

## macOS Permissions 🔐

Grant these permissions when prompted:
1. **Screen Recording**: System Settings → Privacy & Security → Screen Recording → Enable for Terminal/Node
2. **Accessibility**: System Settings → Privacy & Security → Accessibility → Enable for Terminal/Node

## Next Steps 📖

- Read the full [Computer Control README](COMPUTER_CONTROL_README.md)
- Check [ENV_SETUP.md](server/ENV_SETUP.md) for advanced configuration
- Explore the config file: `server/config/computerControlConfig.js`

## Safety Tips ⚠️

- Always review confirmation dialogs before approving
- Start with simple commands to test
- Keep the action log visible to monitor activity
- Don't disable safety mode unless you know what you're doing

## Need Help? 🆘

1. Check the [full documentation](COMPUTER_CONTROL_README.md)
2. Review [troubleshooting section](COMPUTER_CONTROL_README.md#-troubleshooting)
3. Check server logs in the terminal
4. Check browser console (F12 → Console tab)

---

**You're all set! Start controlling your computer with your voice! 🎉**

