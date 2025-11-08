// Computer Control Configuration
module.exports = {
  // Enable/disable computer control feature
  enabled: true,

  // Vision model to use for screen analysis
  model: "gpt-4o", // Supports vision capabilities

  // Safety settings
  safety: {
    // Require user confirmation for actions
    requireConfirmation: true,
    
    // Safety mode (stricter validation)
    safetyMode: true,
    
    // Maximum actions per minute (rate limiting)
    maxActionsPerMinute: 20,
    
    // Allowed applications (empty array = allow all)
    allowedApplications: [
      "chrome",
      "firefox",
      "safari",
      "vscode",
      "code",
      "terminal",
      "iterm",
      "finder",
      "notes",
      "textedit"
    ],
    
    // Blocked applications (takes precedence over allowed)
    blockedApplications: [
      "system preferences",
      "system settings",
      "keychain",
      "disk utility",
      "terminal" // Can be enabled on user request
    ],
    
    // Blocked action patterns (regex)
    blockedActionPatterns: [
      /delete.*system/i,
      /format.*drive/i,
      /disable.*security/i,
      /grant.*root/i,
      /sudo/i,
      /rm\s+-rf/i
    ]
  },

  // Screen capture settings
  screenCapture: {
    // Screenshot quality
    quality: "high", // Options: "low", "medium", "high"
    
    // Max screenshot dimension (for API efficiency)
    maxDimension: 2048,
    
    // Capture delay (ms) to allow UI updates
    captureDelay: 100
  },

  // Vision analysis settings
  vision: {
    // Vision mode
    mode: "gpt-4-with-ocr", // Options: "vanilla", "ocr", "som" (Set of Marks)
    
    // Include OCR text extraction
    enableOCR: true,
    
    // Detail level for vision API
    detailLevel: "high", // Options: "low", "high"
    
    // Max tokens for vision response
    maxTokens: 1000
  },

  // Action execution settings
  execution: {
    // Delay between actions (ms)
    actionDelay: 500,
    
    // Mouse movement speed (ms)
    mouseMoveDuration: 300,
    
    // Enable action logging
    logActions: true,
    
    // Action timeout (ms)
    actionTimeout: 5000
  },

  // Voice feedback settings
  voiceFeedback: {
    // Enable voice narration of actions
    enabled: true,
    
    // Verbosity level
    verbosity: "medium", // Options: "minimal", "medium", "detailed"
    
    // Announce before action execution
    announceBeforeAction: true
  },

  // Computer control keywords for intent detection
  computerControlKeywords: [
    "open",
    "click",
    "type",
    "search",
    "browse",
    "navigate",
    "close",
    "minimize",
    "maximize",
    "screenshot",
    "select",
    "drag",
    "scroll",
    "find",
    "press",
    "launch",
    "run",
    "execute"
  ]
};

