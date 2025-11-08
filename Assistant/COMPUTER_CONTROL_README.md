# Computer Control Integration Guide

This document explains the computer control capabilities added to the ChatGPT Realtime API Assistant.

## 🎯 Overview

The assistant now has the ability to control your computer through voice commands, using:
- **Voice Recognition**: ChatGPT Realtime API with Whisper transcription
- **Vision AI**: GPT-4V for screen understanding
- **Computer Control**: Mouse and keyboard automation via @nut-tree/nut-js
- **Safety System**: Comprehensive validation and confirmation system

## ✨ Features

### Voice-Activated Computer Control
Control your computer naturally with voice commands:
- "Open Chrome and search for AI news"
- "Click on the submit button"
- "Type my presentation notes"
- "Scroll down the page"
- "Take a screenshot"
- "Close the current window"

### Multi-Step Task Execution
The assistant can:
- Analyze screenshots to understand screen content
- Plan sequences of actions
- Execute coordinated mouse and keyboard operations
- Provide real-time feedback on progress

### Safety Features
- ✅ Action validation and filtering
- ✅ User confirmation for sensitive actions
- ✅ Rate limiting (20 actions/minute by default)
- ✅ Blocked dangerous commands and patterns
- ✅ Application whitelist/blacklist
- ✅ Comprehensive action logging

## 🏗️ Architecture

```
┌─────────────────┐
│  Client (React) │
│  - Voice input  │
│  - Confirmation │
│  - Action log   │
└────────┬────────┘
         │ WebSocket
┌────────▼────────┐
│  Server (Node)  │
│  - Orchestrator │
└────────┬────────┘
         │
    ┌────┴────┬────────┬─────────┐
    │         │        │         │
┌───▼──┐ ┌───▼──┐ ┌───▼───┐ ┌──▼───┐
│Vision│ │Safety│ │Command│ │Action│
│Agent │ │Manager│ │Parser│ │Exec │
└──────┘ └──────┘ └───────┘ └──────┘
```

### Core Components

#### 1. Computer Control Service (`services/computerControl.js`)
Handles low-level computer interactions:
- Screen capture
- Mouse control (click, drag, scroll)
- Keyboard input (type, key press)
- Action history and logging

#### 2. Vision Agent (`services/visionAgent.js`)
Uses GPT-4V to:
- Analyze screenshots
- Understand UI elements
- Plan action sequences
- Locate elements by description

#### 3. Safety Manager (`services/safetyManager.js`)
Enforces security:
- Validates actions before execution
- Blocks dangerous patterns
- Manages user confirmations
- Logs security events

#### 4. Command Parser (`services/commandParser.js`)
Processes voice commands:
- Detects computer control intent
- Extracts action parameters
- Routes to appropriate handler

#### 5. Orchestrator (`services/computerControlOrchestrator.js`)
Coordinates all components:
- Routes commands
- Manages execution flow
- Handles confirmations
- Sends status updates

## 🚀 Setup & Installation

### Prerequisites
- Node.js 16+
- macOS, Windows, or Linux
- OpenAI API key with GPT-4V access

### Installation

1. **Install dependencies** (already done):
```bash
cd Assistant/server
npm install
```

The following packages are already installed:
- `@nut-tree-fork/nut-js` - Mouse/keyboard control
- `screenshot-desktop` - Screen capture
- `sharp` - Image processing
- `axios` - API requests
- `ws` - WebSocket communication

2. **Configure environment**:
Create `server/.env` file (see ENV_SETUP.md):
```bash
KEY=your_openai_api_key_here
COMPUTER_CONTROL_ENABLED=true
SAFETY_MODE=true
```

3. **Start the server**:
```bash
cd server
npm run dev
```

4. **Start the client**:
```bash
cd client
npm run dev
```

5. **Access the app**:
Open http://localhost:3000 in your browser

## 🎮 Usage

### Basic Workflow

1. **Connect to Assistant**
   - Click "Connect to Assistant" button
   - Wait for connection confirmation

2. **Enable Computer Control**
   - Click the "Computer Control OFF" button in top-left
   - It will turn purple when enabled

3. **Give Voice Commands**
   - Click "Start Recording"
   - Speak your command clearly
   - Click "Stop Recording"
   - The assistant will process and execute

4. **Monitor Actions**
   - Click "Show Log" to see action history
   - Watch status updates in real-time
   - Approve/deny confirmations as needed

### Example Commands

#### Simple Actions
```
"Type hello world"
"Scroll down"
"Press enter"
"Take a screenshot"
```

#### Application Control
```
"Open Chrome"
"Close Safari"
"Switch to VS Code"
```

#### Complex Tasks
```
"Open Chrome and search for weather forecast"
"Click on the login button and type my email"
"Scroll down and click the blue submit button"
```

## ⚙️ Configuration

Edit `server/config/computerControlConfig.js` to customize:

### Vision Settings
```javascript
vision: {
  model: 'gpt-4o',        // Vision model
  detailLevel: 'high',    // Image analysis detail
  maxTokens: 1000,
  temperature: 0.2
}
```

### Safety Settings
```javascript
safety: {
  enabled: true,
  requireConfirmation: true,
  allowedApplications: ['chrome', 'vscode', ...],
  blockedApplications: ['terminal', 'system preferences', ...]
}
```

### Rate Limiting
```javascript
rateLimit: {
  maxActionsPerMinute: 20,
  maxActionsPerHour: 500,
  cooldownPeriod: 60000
}
```

## 🔒 Security

### Safety Measures

1. **Action Validation**
   - Every action is validated before execution
   - Dangerous patterns are blocked
   - Coordinates are bounds-checked

2. **User Confirmation**
   - Sensitive actions require approval
   - 30-second timeout for confirmations
   - Clear action descriptions shown

3. **Application Filtering**
   - System apps are blocked by default
   - Customizable whitelist/blacklist
   - Terminal commands are restricted

4. **Rate Limiting**
   - Maximum 20 actions per minute
   - Prevents runaway automation
   - Configurable limits

5. **Logging**
   - All actions are logged
   - Security events tracked
   - History limited to 100 actions

### Blocked Patterns

The system blocks commands containing:
- `rm -rf`, `format`, `delete system`
- `sudo`, `admin` (in terminal contexts)
- `password`, `credit card`, `bank`

### Blocked Applications
- System Preferences / Settings
- Terminal / Command Prompt / PowerShell
- Keychain / Password Manager
- Activity Monitor / Task Manager

## 🐛 Troubleshooting

### Common Issues

**Computer control not working**
- Check that computer control is enabled (purple button)
- Verify OpenAI API key has GPT-4V access
- Check console for error messages

**Actions not executing**
- Ensure safety mode allows the action
- Check if confirmation is pending
- Verify rate limits not exceeded

**Screen capture fails**
- Grant screen recording permissions (macOS)
- Check @nut-tree/nut-js installation
- Try restarting the server

**Vision analysis errors**
- Verify API key is valid
- Check internet connection
- Ensure GPT-4V model access

### Platform-Specific Setup

**macOS**
- Grant screen recording permission: System Preferences → Security & Privacy → Screen Recording
- Grant accessibility permission: System Preferences → Security & Privacy → Accessibility

**Windows**
- Run as administrator if permission errors occur
- Ensure Windows Defender allows automation

**Linux**
- Install X11 dependencies if needed
- May require additional permissions for input simulation

## 📊 API Reference

### WebSocket Messages

#### From Client to Server

**Toggle Computer Mode**
```json
{
  "type": "computer_control_toggle",
  "enabled": true
}
```

**Send Confirmation**
```json
{
  "type": "computer_control_confirmation",
  "confirmationId": "confirm_123_abc",
  "approved": true
}
```

**Get Action History**
```json
{
  "type": "computer_control_get_history"
}
```

#### From Server to Client

**Status Update**
```json
{
  "type": "computer_control_status",
  "status": "analyzing|completed|failed",
  "message": "Status description"
}
```

**Action Notification**
```json
{
  "type": "computer_control_action",
  "actionIndex": 1,
  "totalActions": 3,
  "action": {
    "type": "click",
    "description": "Click the submit button"
  }
}
```

**Confirmation Request**
```json
{
  "type": "confirmation_request",
  "confirmationId": "confirm_123_abc",
  "action": {
    "type": "key_press",
    "description": "Press Ctrl+S"
  },
  "timeout": 30000
}
```

## 🎨 UI Components

### Computer Control Toggle
- Located: Top-left corner
- Purple when active, gray when inactive
- Shows current mode status

### Status Indicator
- Located: Below toggle button
- Shows current operation
- Auto-hides when idle

### Action Log Panel
- Toggle with "Show Log" button
- Displays recent actions
- Color-coded by status
- Scrollable history

### Confirmation Dialog
- Modal overlay
- Clear action description
- Allow/Deny buttons
- 30-second auto-timeout

## 🔧 Development

### Adding New Action Types

1. Add to `ComputerControlService`:
```javascript
async executeNewAction(action) {
  // Implementation
  return { success: true };
}
```

2. Add to action switch in `executeAction()`

3. Update safety rules in `SafetyManager`

4. Add parsing in `CommandParser`

### Custom Vision Prompts

Edit `VisionAgent.buildSystemPrompt()` to customize how the AI interprets screens.

### Extending Command Parser

Add new keywords and patterns in `CommandParser` constructor and `parseCommand()` method.

## 📝 Best Practices

1. **Start Simple**: Begin with basic commands before complex multi-step tasks
2. **Enable Safety Mode**: Always keep safety mode on in production
3. **Review Confirmations**: Read confirmation dialogs carefully
4. **Monitor Actions**: Keep action log visible during complex operations
5. **Set Conservative Limits**: Use lower rate limits for safety
6. **Test Thoroughly**: Test commands in safe environments first

## 🚨 Limitations

- **Screen Resolution**: Works best on standard resolutions
- **UI Changes**: May need adjustment if UI layouts change
- **Context**: Limited to what's visible on screen
- **Speed**: Vision analysis adds 1-2 second latency
- **Accuracy**: Element location accuracy ~90-95%
- **Concurrency**: One task at a time

## 🔮 Future Enhancements

Potential additions:
- [ ] Multi-monitor support
- [ ] Browser automation (Puppeteer integration)
- [ ] Workflow recording and replay
- [ ] OCR-based text recognition
- [ ] Application-specific plugins
- [ ] Learning from user patterns
- [ ] Macro system
- [ ] Cross-platform optimization

## 📚 Resources

- [OpenAI Realtime API Docs](https://platform.openai.com/docs/guides/realtime)
- [GPT-4V Documentation](https://platform.openai.com/docs/guides/vision)
- [@nut-tree-fork/nut-js Docs](https://nutjs.dev/)
- [Self-Operating Computer](https://github.com/OthersideAI/self-operating-computer)

## 📄 License

Same as the parent Assistant project.

## 🤝 Contributing

Contributions welcome! Please test thoroughly and document changes.

## ⚠️ Disclaimer

Use responsibly. The developers are not liable for any damages or misuse of this computer control functionality. Always review actions before approval and maintain safety measures.

