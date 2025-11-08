const axios = require('axios');

/**
 * Vision Agent Service
 * Uses GPT-4V to analyze screenshots and plan computer actions
 */
class VisionAgent {
  constructor(apiKey, model = 'gpt-4o') {
    this.apiKey = apiKey;
    this.model = model;
    this.conversationHistory = [];
  }

  /**
   * Analyze screen and plan actions for a given task
   * @param {string} base64Image - Base64 encoded screenshot
   * @param {string} task - Task to accomplish
   * @param {Object} context - Additional context
   * @returns {Promise<Object>} Planned actions and reasoning
   */
  async analyzeAndPlan(base64Image, task, context = {}) {
    try {
      const systemPrompt = this.buildSystemPrompt();
      const userPrompt = this.buildUserPrompt(task, context);

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: userPrompt
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/png;base64,${base64Image}`,
                    detail: 'high'
                  }
                }
              ]
            }
          ],
          max_tokens: 1000,
          temperature: 0.2
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0].message.content;
      
      // Parse the response to extract actions
      const parsedResponse = this.parseResponse(content);
      
      return {
        success: true,
        reasoning: parsedResponse.reasoning,
        actions: parsedResponse.actions,
        confidence: parsedResponse.confidence,
        rawResponse: content
      };
    } catch (error) {
      console.error('Vision analysis failed:', error.response?.data || error.message);
      throw new Error(`Vision analysis failed: ${error.message}`);
    }
  }

  /**
   * Build system prompt for vision agent
   */
  buildSystemPrompt() {
    return `You are a computer vision AI agent that helps users control their computer.

Your role:
1. Analyze screenshots to understand the current screen state
2. Plan a sequence of mouse and keyboard actions to accomplish user tasks
3. Provide clear, safe, and efficient action plans

Action Types Available:
- click: Click at coordinates {"type": "click", "x": 100, "y": 200, "description": "Click login button"}
- double_click: Double click at coordinates {"type": "double_click", "x": 100, "y": 200}
- right_click: Right click at coordinates {"type": "right_click", "x": 100, "y": 200}
- type: Type text {"type": "type", "text": "Hello World", "description": "Type message"}
- key_press: Press key combination {"type": "key_press", "key": "Enter", "modifiers": ["ctrl"], "description": "Save file"}
- move_mouse: Move mouse {"type": "move_mouse", "x": 100, "y": 200}
- scroll: Scroll screen {"type": "scroll", "direction": "down", "amount": 3}
- drag: Drag from one point to another {"type": "drag", "fromX": 100, "fromY": 100, "toX": 200, "toY": 200}

Response Format (JSON):
{
  "reasoning": "Explain what you see and your plan",
  "confidence": 0.9,
  "actions": [
    {"type": "click", "x": 100, "y": 200, "description": "Click the submit button"}
  ]
}

Safety Rules:
- Never suggest actions that modify system settings without explicit user request
- Avoid actions on sensitive areas (password fields, payment info) unless clearly intended
- If uncertain about element location, estimate conservatively
- Limit action sequences to 5 steps maximum per request
- Always provide clear descriptions of each action

Be precise with coordinates and provide accurate action plans.`;
  }

  /**
   * Build user prompt for specific task
   */
  buildUserPrompt(task, context) {
    let prompt = `Task: ${task}\n\n`;
    
    if (context.screenDimensions) {
      prompt += `Screen Size: ${context.screenDimensions.width}x${context.screenDimensions.height}\n`;
    }
    
    if (context.previousActions && context.previousActions.length > 0) {
      prompt += `Previous Actions: ${JSON.stringify(context.previousActions)}\n`;
    }
    
    if (context.additionalInfo) {
      prompt += `Additional Info: ${context.additionalInfo}\n`;
    }
    
    prompt += `\nAnalyze the screenshot and provide a JSON response with the actions needed to accomplish this task.`;
    
    return prompt;
  }

  /**
   * Parse vision model response
   */
  parseResponse(content) {
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || 
                       content.match(/```\n?([\s\S]*?)\n?```/);
      
      if (jsonMatch) {
        content = jsonMatch[1];
      }
      
      const parsed = JSON.parse(content);
      
      return {
        reasoning: parsed.reasoning || 'No reasoning provided',
        actions: parsed.actions || [],
        confidence: parsed.confidence || 0.5
      };
    } catch (error) {
      console.error('Failed to parse vision response:', error);
      
      // Fallback: try to extract basic information
      return {
        reasoning: content,
        actions: [],
        confidence: 0.3
      };
    }
  }

  /**
   * Validate action plan for safety
   */
  validateActions(actions) {
    const validated = [];
    const warnings = [];
    
    for (const action of actions) {
      // Check if action has required fields
      if (!action.type) {
        warnings.push('Action missing type field');
        continue;
      }
      
      // Validate coordinates are within reasonable bounds
      if (['click', 'double_click', 'right_click', 'move_mouse'].includes(action.type)) {
        if (!action.x || !action.y || action.x < 0 || action.y < 0) {
          warnings.push(`Invalid coordinates for ${action.type}`);
          continue;
        }
      }
      
      // Validate text input
      if (action.type === 'type' && !action.text) {
        warnings.push('Type action missing text');
        continue;
      }
      
      validated.push(action);
    }
    
    return { validated, warnings };
  }

  /**
   * Describe screen content (for user feedback)
   */
  async describeScreen(base64Image) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: this.model,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Describe what you see on this screen in 2-3 sentences. Focus on the main application, visible UI elements, and any notable content.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/png;base64,${base64Image}`,
                    detail: 'low'
                  }
                }
              ]
            }
          ],
          max_tokens: 150
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Screen description failed:', error);
      return 'Unable to describe screen';
    }
  }

  /**
   * Find element on screen by description
   */
  async findElement(base64Image, elementDescription) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: this.model,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Find the location of: "${elementDescription}"\n\nProvide the approximate center coordinates as JSON: {"x": 100, "y": 200, "confidence": 0.9, "found": true}`
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/png;base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          max_tokens: 100
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('Element finding failed:', error);
      return { found: false, confidence: 0 };
    }
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = [];
  }
}

module.exports = VisionAgent;

