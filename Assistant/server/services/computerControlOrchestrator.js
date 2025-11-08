const ComputerControlService = require('./computerControl');
const VisionAgent = require('./visionAgent');
const SafetyManager = require('./safetyManager');
const CommandParser = require('./commandParser');

/**
 * Computer Control Orchestrator
 * Coordinates between voice commands, vision analysis, safety checks, and action execution
 */
class ComputerControlOrchestrator {
  constructor(config, apiKey) {
    this.config = config;
    this.apiKey = apiKey;
    
    // Initialize services
    this.computerControl = new ComputerControlService({
      enabled: config.enabled,
      safetyMode: config.safety.enabled,
      maxActionsPerMinute: config.rateLimit.maxActionsPerMinute
    });
    
    this.visionAgent = new VisionAgent(apiKey, config.vision.model);
    
    this.safetyManager = new SafetyManager({
      safetyMode: config.safety.enabled,
      requireConfirmation: config.safety.requireConfirmation,
      allowedApplications: config.safety.allowedApplications,
      blockedApplications: config.safety.blockedApplications
    });
    
    this.commandParser = new CommandParser();
    
    // State
    this.computerModeEnabled = false;
    this.currentTask = null;
    this.taskHistory = [];
  }

  /**
   * Process a voice command
   * @param {string} command - Voice command text
   * @param {Function} sendToClient - Function to send messages to client
   * @returns {Promise<Object>} Processing result
   */
  async processCommand(command, sendToClient) {
    try {
      // Check if it's a question (not an action)
      if (this.commandParser.isQuestion(command)) {
        return {
          handled: false,
          reason: 'Command is a question, not an action'
        };
      }

      // Analyze command to determine if it needs computer control
      const analysis = this.commandParser.analyzeCommand(command);
      
      if (!analysis.requiresComputerControl) {
        return {
          handled: false,
          reason: 'Command does not require computer control'
        };
      }

      // Check confidence threshold
      if (analysis.confidence < this.config.commandParsing.confidenceThreshold) {
        return {
          handled: false,
          reason: 'Confidence too low',
          confidence: analysis.confidence
        };
      }

      // Special case: screenshot
      if (analysis.action === 'screenshot') {
        return await this.takeScreenshot(sendToClient);
      }

      // Special case: simple actions that don't need vision
      if (!this.commandParser.needsVision(analysis)) {
        const simpleActions = this.commandParser.createSimpleAction(analysis);
        if (simpleActions.length > 0) {
          return await this.executeActions(simpleActions, sendToClient);
        }
      }

      // Complex actions require vision analysis
      return await this.executeVisionGuidedTask(analysis, sendToClient);
      
    } catch (error) {
      console.error('Command processing error:', error);
      return {
        handled: false,
        error: error.message
      };
    }
  }

  /**
   * Execute a vision-guided task
   */
  async executeVisionGuidedTask(parsedCommand, sendToClient) {
    try {
      // Notify user we're analyzing the screen
      sendToClient({
        type: 'computer_control_status',
        status: 'analyzing',
        message: 'Analyzing screen...'
      });

      // Capture screen
      const screenshot = await this.computerControl.captureScreen();
      
      // Get task description
      const taskDescription = this.commandParser.toTaskDescription(parsedCommand);
      
      // Analyze screen and plan actions
      const plan = await this.visionAgent.analyzeAndPlan(
        screenshot.image,
        taskDescription,
        {
          screenDimensions: screenshot.dimensions,
          previousActions: this.getRecentActions(3)
        }
      );

      if (!plan.success || plan.actions.length === 0) {
        sendToClient({
          type: 'computer_control_status',
          status: 'failed',
          message: 'Could not determine actions for this task'
        });
        
        return {
          handled: true,
          success: false,
          reason: 'No actions planned'
        };
      }

      // Validate action plan
      const validation = this.safetyManager.validateActionPlan(plan.actions);
      
      if (!validation.valid) {
        sendToClient({
          type: 'computer_control_status',
          status: 'blocked',
          message: `Action blocked: ${validation.reason}`
        });
        
        return {
          handled: true,
          success: false,
          reason: validation.reason
        };
      }

      // Send action plan to client
      sendToClient({
        type: 'computer_control_plan',
        plan: {
          reasoning: plan.reasoning,
          actions: plan.actions,
          confidence: plan.confidence
        }
      });

      // Request confirmation if needed
      if (validation.needsConfirmation) {
        const confirmed = await this.safetyManager.requestConfirmation(
          { type: 'action_plan', description: taskDescription, actions: plan.actions },
          sendToClient
        );
        
        if (!confirmed) {
          sendToClient({
            type: 'computer_control_status',
            status: 'cancelled',
            message: 'Task cancelled by user'
          });
          
          return {
            handled: true,
            success: false,
            reason: 'User cancelled'
          };
        }
      }

      // Execute actions
      return await this.executeActions(plan.actions, sendToClient);
      
    } catch (error) {
      console.error('Vision-guided task error:', error);
      sendToClient({
        type: 'computer_control_status',
        status: 'error',
        message: `Error: ${error.message}`
      });
      
      return {
        handled: true,
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Execute a list of actions
   */
  async executeActions(actions, sendToClient) {
    const results = [];
    let success = true;

    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      
      try {
        // Validate individual action
        const validation = this.safetyManager.validateAction(action);
        
        if (validation.blocked) {
          sendToClient({
            type: 'computer_control_status',
            status: 'blocked',
            message: `Action ${i + 1} blocked: ${validation.reason}`
          });
          success = false;
          break;
        }

        // Request confirmation if needed
        if (validation.requiresConfirmation) {
          const confirmed = await this.safetyManager.requestConfirmation(action, sendToClient);
          if (!confirmed) {
            sendToClient({
              type: 'computer_control_status',
              status: 'cancelled',
              message: `Action ${i + 1} cancelled`
            });
            success = false;
            break;
          }
        }

        // Notify user of action
        sendToClient({
          type: 'computer_control_action',
          actionIndex: i + 1,
          totalActions: actions.length,
          action: {
            type: action.type,
            description: action.description || this.safetyManager.generateActionDescription(action)
          }
        });

        // Execute action
        const result = await this.computerControl.executeAction(action);
        results.push(result);
        
        if (result.status !== 'success') {
          success = false;
          sendToClient({
            type: 'computer_control_status',
            status: 'error',
            message: `Action ${i + 1} failed: ${result.error || 'Unknown error'}`
          });
          break;
        }

        // Small delay between actions
        await this.sleep(this.config.execution.autoDelayMs);
        
      } catch (error) {
        console.error(`Action ${i + 1} execution error:`, error);
        sendToClient({
          type: 'computer_control_status',
          status: 'error',
          message: `Action ${i + 1} error: ${error.message}`
        });
        success = false;
        break;
      }
    }

    // Send completion status
    sendToClient({
      type: 'computer_control_status',
      status: success ? 'completed' : 'failed',
      message: success 
        ? `Successfully completed ${results.length} action(s)`
        : 'Task execution failed',
      results
    });

    return {
      handled: true,
      success,
      results
    };
  }

  /**
   * Take a screenshot
   */
  async takeScreenshot(sendToClient) {
    try {
      const screenshot = await this.computerControl.captureScreen();
      
      sendToClient({
        type: 'screenshot_captured',
        image: screenshot.image,
        dimensions: screenshot.dimensions,
        timestamp: screenshot.timestamp
      });

      return {
        handled: true,
        success: true,
        message: 'Screenshot captured'
      };
    } catch (error) {
      console.error('Screenshot error:', error);
      return {
        handled: true,
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Handle confirmation response from client
   */
  handleConfirmationResponse(confirmationId, approved) {
    this.safetyManager.handleConfirmationResponse(confirmationId, approved);
  }

  /**
   * Toggle computer mode
   */
  setComputerMode(enabled) {
    this.computerModeEnabled = enabled;
    return {
      enabled: this.computerModeEnabled,
      message: enabled ? 'Computer control enabled' : 'Computer control disabled'
    };
  }

  /**
   * Get recent actions for context
   */
  getRecentActions(limit = 3) {
    return this.computerControl.getActionHistory(limit);
  }

  /**
   * Describe current screen
   */
  async describeScreen() {
    const screenshot = await this.computerControl.captureScreen();
    const description = await this.visionAgent.describeScreen(screenshot.image);
    return description;
  }

  /**
   * Get action history
   */
  getHistory() {
    return this.computerControl.getActionHistory();
  }

  /**
   * Clear history
   */
  clearHistory() {
    this.computerControl.clearHistory();
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = ComputerControlOrchestrator;

