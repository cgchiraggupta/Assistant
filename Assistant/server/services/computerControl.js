const screenshot = require('screenshot-desktop');
const sharp = require('sharp');
const { keyboard, Key, mouse, Button, screen } = require('@nut-tree-fork/nut-js');

/**
 * Computer Control Service
 * Handles screen capture, mouse/keyboard control with safety features
 */
class ComputerControlService {
  constructor(config = {}) {
    this.enabled = config.enabled !== false;
    this.safetyMode = config.safetyMode !== false;
    this.maxActionsPerMinute = config.maxActionsPerMinute || 20;
    this.actionHistory = [];
    this.actionCount = 0;
    this.lastResetTime = Date.now();
    
    // Configure nut.js for smoother operation
    mouse.config.autoDelayMs = 100;
    mouse.config.mouseSpeed = 1000;
  }

  /**
   * Capture the current screen and return as base64
   * @returns {Promise<Object>} Screenshot data with metadata
   */
  async captureScreen() {
    try {
      const imgBuffer = await screenshot();
      
      // Get screen dimensions
      const screenSize = await screen.size();
      
      // Resize for vision API (max 2000px width for efficiency)
      const resizedBuffer = await sharp(imgBuffer)
        .resize(2000, null, { fit: 'inside', withoutEnlargement: true })
        .png()
        .toBuffer();
      
      const base64Image = resizedBuffer.toString('base64');
      
      return {
        image: base64Image,
        format: 'png',
        dimensions: {
          width: screenSize.width,
          height: screenSize.height
        },
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Screen capture failed:', error);
      throw new Error(`Failed to capture screen: ${error.message}`);
    }
  }

  /**
   * Execute a computer action with safety checks
   * @param {Object} action - Action to execute
   * @returns {Promise<Object>} Execution result
   */
  async executeAction(action) {
    if (!this.enabled) {
      return { status: 'disabled', message: 'Computer control is disabled' };
    }

    // Rate limiting check
    if (!this.checkRateLimit()) {
      return { 
        status: 'rate_limited', 
        message: 'Too many actions. Please wait.' 
      };
    }

    try {
      let result;
      
      switch (action.type) {
        case 'click':
          result = await this.executeClick(action);
          break;
        case 'double_click':
          result = await this.executeDoubleClick(action);
          break;
        case 'right_click':
          result = await this.executeRightClick(action);
          break;
        case 'type':
          result = await this.executeType(action);
          break;
        case 'key_press':
          result = await this.executeKeyPress(action);
          break;
        case 'move_mouse':
          result = await this.executeMouseMove(action);
          break;
        case 'scroll':
          result = await this.executeScroll(action);
          break;
        case 'drag':
          result = await this.executeDrag(action);
          break;
        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }

      // Log action to history
      this.logAction(action, result);
      
      return { 
        status: 'success', 
        action: action.type,
        result,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Action execution failed:', error);
      return { 
        status: 'error', 
        action: action.type,
        error: error.message 
      };
    }
  }

  /**
   * Execute click action
   */
  async executeClick(action) {
    const { x, y } = action;
    await mouse.setPosition({ x, y });
    await mouse.click(Button.LEFT);
    return { x, y, button: 'left' };
  }

  /**
   * Execute double click action
   */
  async executeDoubleClick(action) {
    const { x, y } = action;
    await mouse.setPosition({ x, y });
    await mouse.doubleClick(Button.LEFT);
    return { x, y, clicks: 2 };
  }

  /**
   * Execute right click action
   */
  async executeRightClick(action) {
    const { x, y } = action;
    await mouse.setPosition({ x, y });
    await mouse.click(Button.RIGHT);
    return { x, y, button: 'right' };
  }

  /**
   * Execute type action
   */
  async executeType(action) {
    const { text } = action;
    await keyboard.type(text);
    return { text, length: text.length };
  }

  /**
   * Execute key press action
   */
  async executeKeyPress(action) {
    const { key, modifiers = [] } = action;
    
    // Hold modifiers
    for (const mod of modifiers) {
      await keyboard.pressKey(this.mapKey(mod));
    }
    
    // Press main key
    await keyboard.type(key);
    
    // Release modifiers
    for (const mod of modifiers.reverse()) {
      await keyboard.releaseKey(this.mapKey(mod));
    }
    
    return { key, modifiers };
  }

  /**
   * Execute mouse move action
   */
  async executeMouseMove(action) {
    const { x, y } = action;
    await mouse.setPosition({ x, y });
    return { x, y };
  }

  /**
   * Execute scroll action
   */
  async executeScroll(action) {
    const { direction, amount = 3 } = action;
    
    if (direction === 'up') {
      await mouse.scrollUp(amount);
    } else if (direction === 'down') {
      await mouse.scrollDown(amount);
    } else if (direction === 'left') {
      await mouse.scrollLeft(amount);
    } else if (direction === 'right') {
      await mouse.scrollRight(amount);
    }
    
    return { direction, amount };
  }

  /**
   * Execute drag action
   */
  async executeDrag(action) {
    const { fromX, fromY, toX, toY } = action;
    
    await mouse.setPosition({ x: fromX, y: fromY });
    await mouse.pressButton(Button.LEFT);
    await mouse.setPosition({ x: toX, y: toY });
    await mouse.releaseButton(Button.LEFT);
    
    return { from: { x: fromX, y: fromY }, to: { x: toX, y: toY } };
  }

  /**
   * Map key string to nut-js Key enum
   */
  mapKey(keyString) {
    const keyMap = {
      'ctrl': Key.LeftControl,
      'control': Key.LeftControl,
      'cmd': Key.LeftCmd,
      'command': Key.LeftCmd,
      'alt': Key.LeftAlt,
      'option': Key.LeftAlt,
      'shift': Key.LeftShift,
      'enter': Key.Enter,
      'return': Key.Enter,
      'tab': Key.Tab,
      'escape': Key.Escape,
      'esc': Key.Escape,
      'space': Key.Space,
      'backspace': Key.Backspace,
      'delete': Key.Delete,
      'up': Key.Up,
      'down': Key.Down,
      'left': Key.Left,
      'right': Key.Right,
    };
    
    return keyMap[keyString.toLowerCase()] || keyString;
  }

  /**
   * Check rate limiting
   */
  checkRateLimit() {
    const now = Date.now();
    const elapsed = now - this.lastResetTime;
    
    // Reset counter every minute
    if (elapsed > 60000) {
      this.actionCount = 0;
      this.lastResetTime = now;
    }
    
    if (this.actionCount >= this.maxActionsPerMinute) {
      return false;
    }
    
    this.actionCount++;
    return true;
  }

  /**
   * Log action to history
   */
  logAction(action, result) {
    this.actionHistory.push({
      action,
      result,
      timestamp: Date.now()
    });
    
    // Keep only last 100 actions
    if (this.actionHistory.length > 100) {
      this.actionHistory.shift();
    }
  }

  /**
   * Get action history
   */
  getActionHistory(limit = 10) {
    return this.actionHistory.slice(-limit);
  }

  /**
   * Clear action history
   */
  clearHistory() {
    this.actionHistory = [];
  }

  /**
   * Get current screen dimensions
   */
  async getScreenDimensions() {
    const size = await screen.size();
    return {
      width: size.width,
      height: size.height
    };
  }

  /**
   * Get current mouse position
   */
  async getMousePosition() {
    const position = await mouse.getPosition();
    return {
      x: position.x,
      y: position.y
    };
  }
}

module.exports = ComputerControlService;

