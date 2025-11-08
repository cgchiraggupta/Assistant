# Environment Variables Setup

Create a `.env` file in the `server` directory with the following variables:

```bash
# OpenAI API Key for Realtime API and GPT-4V
KEY=your_openai_api_key_here

# Computer Control Settings
COMPUTER_CONTROL_ENABLED=true
SAFETY_MODE=true
REQUIRE_CONFIRMATION=true

# Server Configuration
PORT=4000

# Vision Model Configuration
VISION_MODEL=gpt-4o
VISION_DETAIL_LEVEL=high

# Rate Limiting
MAX_ACTIONS_PER_MINUTE=20
MAX_ACTIONS_PER_HOUR=500

# Logging
ENABLE_ACTION_LOGGING=true
ENABLE_SECURITY_LOGGING=true
```

## Required Variables

- **KEY**: Your OpenAI API key (required). Get one from https://platform.openai.com/api-keys

## Optional Variables

All other variables have defaults set in the code, but you can override them:

- **COMPUTER_CONTROL_ENABLED**: Enable/disable computer control features (default: true)
- **SAFETY_MODE**: Enable safety checks and validations (default: true)
- **REQUIRE_CONFIRMATION**: Require user confirmation for actions (default: true)
- **PORT**: Server port (default: 4000)
- **VISION_MODEL**: OpenAI vision model to use (default: gpt-4o)
- **MAX_ACTIONS_PER_MINUTE**: Rate limit for actions (default: 20)

## Setup Instructions

1. Copy this template to a new `.env` file in the `server` directory
2. Replace `your_openai_api_key_here` with your actual OpenAI API key
3. Adjust other settings as needed
4. Restart the server

