/**
 * Command Parser Service
 * Detects computer control intent from voice commands and extracts task details
 */
class CommandParser {
  constructor() {
    // Keywords that indicate computer control
    this.controlKeywords = [
      // Application control
      'open', 'launch', 'start', 'close', 'quit', 'minimize', 'maximize',
      // Mouse actions
      'click', 'double click', 'right click', 'select', 'drag',
      // Keyboard actions
      'type', 'write', 'enter', 'press', 'delete', 'backspace',
      // Navigation
      'scroll', 'navigate', 'go to', 'switch to', 'move to',
      // Screen
      'screenshot', 'capture', 'screen',
      // Search/browse
      'search', 'find', 'look for', 'browse',
      // File operations
      'save', 'copy', 'paste', 'cut'
    ];

    // Application names and their executables
    this.applications = {
      'chrome': ['chrome', 'google chrome'],
      'firefox': ['firefox', 'mozilla firefox'],
      'safari': ['safari'],
      'edge': ['edge', 'microsoft edge'],
      'vscode': ['vscode', 'visual studio code', 'vs code', 'code'],
      'terminal': ['terminal', 'command prompt', 'cmd', 'powershell'],
      'finder': ['finder', 'file explorer', 'explorer'],
      'notes': ['notes', 'notepad'],
      'mail': ['mail', 'email'],
      'calendar': ['calendar'],
      'slack': ['slack'],
      'discord': ['discord'],
      'spotify': ['spotify'],
      'zoom': ['zoom']
    };
  }

  /**
   * Analyze command to determine if it requires computer control
   * @param {string} command - Voice command text
   * @returns {Object} Analysis result
   */
  analyzeCommand(command) {
    const lowerCommand = command.toLowerCase();
    
    // Check for control keywords
    const hasControlKeyword = this.controlKeywords.some(keyword => 
      lowerCommand.includes(keyword)
    );

    if (!hasControlKeyword) {
      return {
        requiresComputerControl: false,
        confidence: 0
      };
    }

    // Parse the command to extract details
    const parsed = this.parseCommand(lowerCommand);
    
    return {
      requiresComputerControl: true,
      confidence: parsed.confidence,
      action: parsed.action,
      target: parsed.target,
      parameters: parsed.parameters,
      rawCommand: command
    };
  }

  /**
   * Parse command to extract action, target, and parameters
   */
  parseCommand(command) {
    const result = {
      action: null,
      target: null,
      parameters: {},
      confidence: 0.7
    };

    // Detect action type
    if (command.includes('open') || command.includes('launch') || command.includes('start')) {
      result.action = 'open';
      result.target = this.extractApplication(command);
    } else if (command.includes('close') || command.includes('quit')) {
      result.action = 'close';
      result.target = this.extractApplication(command);
    } else if (command.includes('click')) {
      result.action = command.includes('double') ? 'double_click' : 
                     command.includes('right') ? 'right_click' : 'click';
      result.target = this.extractClickTarget(command);
    } else if (command.includes('type') || command.includes('write')) {
      result.action = 'type';
      result.parameters.text = this.extractTextToType(command);
    } else if (command.includes('scroll')) {
      result.action = 'scroll';
      result.parameters.direction = command.includes('up') ? 'up' : 
                                   command.includes('down') ? 'down' : 'down';
    } else if (command.includes('search') || command.includes('find')) {
      result.action = 'search';
      result.parameters.query = this.extractSearchQuery(command);
    } else if (command.includes('screenshot') || command.includes('capture')) {
      result.action = 'screenshot';
      result.confidence = 0.9;
    } else if (command.includes('press')) {
      result.action = 'key_press';
      result.parameters.key = this.extractKey(command);
    } else {
      result.action = 'generic';
      result.confidence = 0.5;
    }

    return result;
  }

  /**
   * Extract application name from command
   */
  extractApplication(command) {
    for (const [app, aliases] of Object.entries(this.applications)) {
      for (const alias of aliases) {
        if (command.includes(alias)) {
          return app;
        }
      }
    }
    return null;
  }

  /**
   * Extract click target description
   */
  extractClickTarget(command) {
    // Extract text after "click" or "on"
    const patterns = [
      /click (?:on )?(?:the )?(.+?)(?:\s|$)/i,
      /click (.+)/i
    ];

    for (const pattern of patterns) {
      const match = command.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return null;
  }

  /**
   * Extract text to type from command
   */
  extractTextToType(command) {
    // Extract text after "type" or "write"
    const patterns = [
      /type\s+"([^"]+)"/i,
      /type\s+'([^']+)'/i,
      /type\s+(.+)/i,
      /write\s+"([^"]+)"/i,
      /write\s+'([^']+)'/i,
      /write\s+(.+)/i
    ];

    for (const pattern of patterns) {
      const match = command.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return '';
  }

  /**
   * Extract search query from command
   */
  extractSearchQuery(command) {
    const patterns = [
      /(?:search|find|look) for\s+(.+)/i,
      /(?:search|find)\s+"([^"]+)"/i,
      /(?:search|find)\s+'([^']+)'/i,
      /(?:search|find)\s+(.+)/i
    ];

    for (const pattern of patterns) {
      const match = command.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return '';
  }

  /**
   * Extract key from key press command
   */
  extractKey(command) {
    const keyPatterns = [
      /press\s+(.+)/i
    ];

    for (const pattern of keyPatterns) {
      const match = command.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return 'Enter';
  }

  /**
   * Convert parsed command to task description for vision agent
   */
  toTaskDescription(parsedCommand) {
    const { action, target, parameters } = parsedCommand;

    switch (action) {
      case 'open':
        return `Open ${target || 'the application'}`;
      case 'close':
        return `Close ${target || 'the current application'}`;
      case 'click':
      case 'double_click':
      case 'right_click':
        return `${action.replace('_', ' ')} on ${target || 'the element'}`;
      case 'type':
        return `Type the text: "${parameters.text}"`;
      case 'scroll':
        return `Scroll ${parameters.direction}`;
      case 'search':
        return `Search for "${parameters.query}"`;
      case 'screenshot':
        return 'Take a screenshot';
      case 'key_press':
        return `Press ${parameters.key}`;
      default:
        return parsedCommand.rawCommand || 'Perform the requested action';
    }
  }

  /**
   * Determine if command requires vision analysis
   */
  needsVision(parsedCommand) {
    const visionActions = [
      'click', 'double_click', 'right_click', 
      'search', 'open', 'close', 'generic'
    ];
    
    return visionActions.includes(parsedCommand.action);
  }

  /**
   * Create simple action from command (without vision)
   */
  createSimpleAction(parsedCommand) {
    const { action, parameters } = parsedCommand;

    switch (action) {
      case 'type':
        return [{
          type: 'type',
          text: parameters.text,
          description: `Type: ${parameters.text}`
        }];
      
      case 'scroll':
        return [{
          type: 'scroll',
          direction: parameters.direction,
          amount: 3,
          description: `Scroll ${parameters.direction}`
        }];
      
      case 'key_press':
        return [{
          type: 'key_press',
          key: parameters.key,
          description: `Press ${parameters.key}`
        }];
      
      default:
        return [];
    }
  }

  /**
   * Check if command is a simple question (not an action)
   */
  isQuestion(command) {
    const questionWords = ['what', 'why', 'how', 'when', 'where', 'who', 'can you', 'could you'];
    const lowerCommand = command.toLowerCase();
    
    // If starts with question word but doesn't contain action keywords, it's likely a question
    const startsWithQuestion = questionWords.some(word => lowerCommand.startsWith(word));
    const hasActionKeyword = this.controlKeywords.some(keyword => lowerCommand.includes(keyword));
    
    return startsWithQuestion && !hasActionKeyword;
  }
}

module.exports = CommandParser;

