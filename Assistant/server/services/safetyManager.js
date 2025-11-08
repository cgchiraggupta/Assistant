/**
 * Safety Manager Service
 * Validates actions, manages permissions, and enforces safety rules
 */
class SafetyManager {
  constructor(config = {}) {
    this.safetyMode = config.safetyMode !== false;
    this.requireConfirmation = config.requireConfirmation !== false;
    this.allowedApplications = config.allowedApplications || [];
    this.blockedApplications = config.blockedApplications || [
      'system preferences',
      'system settings',
      'keychain',
      'activity monitor',
      'terminal',
      'command prompt',
      'powershell'
    ];
    
    // Dangerous action patterns
    this.blockedPatterns = [
      /rm\s+-rf/i,
      /format/i,
      /delete.*system/i,
      /sudo/i,
      /admin/i,
      /password/i,
      /credit.*card/i,
      /bank/i
    ];
    
    this.pendingConfirmations = new Map();
    this.confirmationTimeout = 30000; // 30 seconds
  }

  /**
   * Validate if an action is safe to execute
   * @param {Object} action - Action to validate
   * @param {Object} context - Context information
   * @returns {Object} Validation result
   */
  validateAction(action, context = {}) {
    const result = {
      safe: true,
      requiresConfirmation: false,
      warnings: [],
      blocked: false,
      reason: null
    };

    // Check if action type is allowed
    const allowedTypes = [
      'click', 'double_click', 'right_click',
      'type', 'key_press', 'move_mouse', 'scroll', 'drag'
    ];
    
    if (!allowedTypes.includes(action.type)) {
      result.safe = false;
      result.blocked = true;
      result.reason = `Action type '${action.type}' is not allowed`;
      return result;
    }

    // Check for dangerous text input
    if (action.type === 'type') {
      for (const pattern of this.blockedPatterns) {
        if (pattern.test(action.text)) {
          result.safe = false;
          result.blocked = true;
          result.reason = 'Text contains potentially dangerous command';
          return result;
        }
      }
    }

    // Check for dangerous key combinations
    if (action.type === 'key_press') {
      const dangerousKeys = [
        { key: 'Delete', modifiers: ['alt', 'ctrl'] },
        { key: 'F4', modifiers: ['alt'] }
      ];
      
      for (const dangerous of dangerousKeys) {
        if (action.key === dangerous.key && 
            this.hasModifiers(action.modifiers, dangerous.modifiers)) {
          result.requiresConfirmation = true;
          result.warnings.push('This key combination may close applications');
        }
      }
    }

    // Actions that always require confirmation in safety mode
    if (this.safetyMode) {
      const sensitiveActions = ['key_press', 'drag'];
      if (sensitiveActions.includes(action.type)) {
        result.requiresConfirmation = true;
      }
    }

    // Check coordinates are reasonable
    if (['click', 'double_click', 'right_click', 'move_mouse'].includes(action.type)) {
      if (action.x < 0 || action.y < 0 || action.x > 10000 || action.y > 10000) {
        result.safe = false;
        result.blocked = true;
        result.reason = 'Coordinates out of reasonable bounds';
        return result;
      }
    }

    // Check for rapid-fire actions (potential for damage)
    if (context.recentActionCount > 10 && context.timeWindow < 5000) {
      result.requiresConfirmation = true;
      result.warnings.push('High action frequency detected');
    }

    return result;
  }

  /**
   * Check if modifiers match dangerous combination
   */
  hasModifiers(actualModifiers = [], requiredModifiers = []) {
    if (!actualModifiers) return false;
    return requiredModifiers.every(mod => 
      actualModifiers.some(actual => 
        actual.toLowerCase() === mod.toLowerCase()
      )
    );
  }

  /**
   * Request confirmation for an action
   * @param {Object} action - Action requiring confirmation
   * @param {Function} sendToClient - Function to send confirmation request to client
   * @returns {Promise<boolean>} User's decision
   */
  async requestConfirmation(action, sendToClient) {
    if (!this.requireConfirmation) {
      return true;
    }

    const confirmationId = this.generateConfirmationId();
    
    return new Promise((resolve) => {
      // Set up timeout
      const timeout = setTimeout(() => {
        this.pendingConfirmations.delete(confirmationId);
        resolve(false);
      }, this.confirmationTimeout);

      // Store confirmation handler
      this.pendingConfirmations.set(confirmationId, {
        action,
        resolve: (approved) => {
          clearTimeout(timeout);
          this.pendingConfirmations.delete(confirmationId);
          resolve(approved);
        },
        timestamp: Date.now()
      });

      // Send confirmation request to client
      sendToClient({
        type: 'confirmation_request',
        confirmationId,
        action: {
          type: action.type,
          description: action.description || this.generateActionDescription(action)
        },
        timeout: this.confirmationTimeout
      });
    });
  }

  /**
   * Handle confirmation response from client
   * @param {string} confirmationId - ID of the confirmation
   * @param {boolean} approved - User's decision
   */
  handleConfirmationResponse(confirmationId, approved) {
    const pending = this.pendingConfirmations.get(confirmationId);
    if (pending) {
      pending.resolve(approved);
    }
  }

  /**
   * Generate a readable description for an action
   */
  generateActionDescription(action) {
    switch (action.type) {
      case 'click':
        return `Click at position (${action.x}, ${action.y})`;
      case 'double_click':
        return `Double-click at position (${action.x}, ${action.y})`;
      case 'right_click':
        return `Right-click at position (${action.x}, ${action.y})`;
      case 'type':
        return `Type: "${action.text.substring(0, 50)}${action.text.length > 50 ? '...' : ''}"`;
      case 'key_press':
        const mods = action.modifiers ? action.modifiers.join('+') + '+' : '';
        return `Press ${mods}${action.key}`;
      case 'scroll':
        return `Scroll ${action.direction}`;
      case 'drag':
        return `Drag from (${action.fromX}, ${action.fromY}) to (${action.toX}, ${action.toY})`;
      default:
        return `Execute ${action.type}`;
    }
  }

  /**
   * Generate unique confirmation ID
   */
  generateConfirmationId() {
    return `confirm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate a complete action plan
   * @param {Array} actions - List of actions
   * @returns {Object} Validation result
   */
  validateActionPlan(actions) {
    if (!Array.isArray(actions)) {
      return {
        valid: false,
        reason: 'Actions must be an array'
      };
    }

    if (actions.length === 0) {
      return {
        valid: false,
        reason: 'Action plan is empty'
      };
    }

    if (actions.length > 10) {
      return {
        valid: false,
        reason: 'Action plan too long (max 10 actions)'
      };
    }

    const results = actions.map(action => this.validateAction(action));
    const blocked = results.filter(r => r.blocked);
    
    if (blocked.length > 0) {
      return {
        valid: false,
        reason: `${blocked.length} action(s) blocked: ${blocked[0].reason}`
      };
    }

    const needsConfirmation = results.some(r => r.requiresConfirmation);
    
    return {
      valid: true,
      needsConfirmation,
      warnings: results.flatMap(r => r.warnings)
    };
  }

  /**
   * Check if a text input is safe
   */
  isSafeText(text) {
    for (const pattern of this.blockedPatterns) {
      if (pattern.test(text)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Log security event
   */
  logSecurityEvent(event) {
    console.log(`[SECURITY] ${new Date().toISOString()}:`, event);
  }

  /**
   * Clear expired confirmations
   */
  clearExpiredConfirmations() {
    const now = Date.now();
    for (const [id, pending] of this.pendingConfirmations.entries()) {
      if (now - pending.timestamp > this.confirmationTimeout) {
        pending.resolve(false);
        this.pendingConfirmations.delete(id);
      }
    }
  }
}

module.exports = SafetyManager;

