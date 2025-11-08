/**
 * Computer Control Configuration
 * Settings for computer automation, vision, and safety features
 */

module.exports = {
  // Enable/disable computer control features
  enabled: true,

  // Vision model configuration
  vision: {
    model: 'gpt-4o', // Options: 'gpt-4o', 'gpt-4-turbo', 'gpt-4'
    detailLevel: 'high', // 'high' or 'low' for image analysis
    maxTokens: 1000,
    temperature: 0.2
  },

  // Safety settings
  safety: {
    enabled: true,
    requireConfirmation: true, // Require user confirmation for actions
    confirmationTimeout: 30000, // 30 seconds
    
    // Applications that are allowed to be controlled
    allowedApplications: [
      'chrome', 'firefox', 'safari', 'edge',
      'vscode', 'code', 'sublime',
      'finder', 'explorer',
      'notes', 'notepad',
      'spotify', 'music',
      'slack', 'discord', 'teams',
      'zoom', 'skype'
    ],
    
    // Applications that should never be controlled
    blockedApplications: [
      'system preferences',
      'system settings',
      'settings',
      'keychain',
      'activity monitor',
      'task manager',
      'terminal',
      'command prompt',
      'powershell',
      'registry editor'
    ]
  },

  // Rate limiting
  rateLimit: {
    maxActionsPerMinute: 20,
    maxActionsPerHour: 500,
    cooldownPeriod: 60000 // 1 minute cooldown if limit exceeded
  },

  // Action execution settings
  execution: {
    mouseSpeed: 1000, // pixels per second
    autoDelayMs: 100, // delay between actions
    actionTimeout: 5000, // timeout for each action
    maxRetries: 2
  },

  // Screenshot settings
  screenshot: {
    maxWidth: 2000, // resize to this width for vision API
    quality: 90,
    format: 'png'
  },

  // Logging
  logging: {
    enabled: true,
    logActions: true,
    logSecurityEvents: true,
    maxHistorySize: 100
  },

  // Features
  features: {
    enableOCR: false, // Use Tesseract for text recognition
    enableMultiStep: true, // Allow multi-step action sequences
    enableLearning: false, // Learn from user patterns (future feature)
    enableMacros: false, // Record and replay macros (future feature)
    maxStepsPerTask: 10 // Maximum steps in a single task
  },

  // Command parsing
  commandParsing: {
    confidenceThreshold: 0.6, // Minimum confidence to execute
    enableFuzzyMatching: true,
    enableContextAwareness: true
  },

  // Feedback
  feedback: {
    speakActions: true, // Narrate actions via voice
    showVisualFeedback: true, // Show on-screen indicators
    enableProgressUpdates: true
  }
};

