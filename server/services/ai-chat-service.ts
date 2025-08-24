import { storage } from "../storage";
import type { AIChatMessage, AIChatConversation } from "@shared/schema";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

export class AIChatService {
  private static readonly CEREBRAS_API_URL = 'https://api.cerebras.ai/v1/chat/completions';
  
  private static async getActiveAPIKey(type: 'reply' | 'summary'): Promise<string | null> {
    try {
      const settings = await storage.getSystemSettings();
      if (!settings.ai_chat?.api_keys) return null;
      
      const keys = type === 'reply' ? settings.ai_chat.api_keys.reply_keys : settings.ai_chat.api_keys.summary_keys;
      
      // Filter active keys
      const activeKeys = keys.filter((k: any) => k.status === 'active');
      if (activeKeys.length === 0) return null;
      
      // Random key selection for better distribution
      const randomIndex = Math.floor(Math.random() * activeKeys.length);
      const selectedKey = activeKeys[randomIndex];
      
      console.log(`[${type.toUpperCase()}] Using API key: ${selectedKey.name} (${selectedKey.key.substring(0, 8)}...)`);
      return selectedKey?.key || null;
    } catch (error) {
      console.error('Error getting active API key:', error);
      return null;
    }
  }
  
  private static async rotateAPIKey(type: 'reply' | 'summary'): Promise<void> {
    try {
      const settings = await storage.getSystemSettings();
      if (!settings.ai_chat?.api_keys) return;
      
      const keys = type === 'reply' ? settings.ai_chat.api_keys.reply_keys : settings.ai_chat.api_keys.summary_keys;
      const activeKeys = keys.filter(k => k.status === 'active');
      
      if (activeKeys.length <= 1) {
        console.log(`[${type.toUpperCase()}] No rotation needed - only ${activeKeys.length} active key(s)`);
        return;
      }
      
      console.log(`[${type.toUpperCase()}] Rotating through ${activeKeys.length} active keys randomly`);
      
      // Random rotation ensures even distribution across all keys
      // The next call to getActiveAPIKey will randomly select from available keys
      // This approach ensures better load balancing than sequential rotation
    } catch (error) {
      console.error('Error rotating API key:', error);
    }
  }
  
  private static async updateKeyUsage(keyValue: string, type: 'reply' | 'summary'): Promise<void> {
    try {
      const settings = await storage.getSystemSettings();
      if (!settings.ai_chat?.api_keys) return;
      
      const keys = type === 'reply' ? settings.ai_chat.api_keys.reply_keys : settings.ai_chat.api_keys.summary_keys;
      const keyIndex = keys.findIndex((k: any) => k.key === keyValue);
      
      if (keyIndex !== -1) {
        const keyPath = type === 'reply' ? 'reply_keys' : 'summary_keys';
        const updatePath = {
          ai_chat: {
            api_keys: {
              [keyPath]: keys.map((key: any, index: number) => 
                index === keyIndex 
                  ? { ...key, usage_count: key.usage_count + 1, last_used: new Date().toISOString() }
                  : key
              )
            }
          }
        };
        await storage.updateSystemSettings(updatePath);
      }
    } catch (error) {
      console.error('Error updating key usage:', error);
    }
  }
  
  private static async summarizeConversation(messages: AIChatMessage[]): Promise<string> {
    try {
      const apiKey = await this.getActiveAPIKey('summary');
      if (!apiKey) return '';
      
      // Get recent messages for context (last 10)
      const recentMessages = messages.slice(-10);
      const conversationText = recentMessages
        .map(msg => `${msg.isAI ? 'AI' : 'User'}: ${msg.message}`)
        .join('\n');
      
      const response = await axios.post(
        this.CEREBRAS_API_URL,
        {
          model: 'llama3.1-8b',
          messages: [
            {
              role: 'system',
              content: 'Summarize this conversation in 2-3 sentences, focusing on the main topics and user interests.'
            },
            {
              role: 'user',
              content: conversationText
            }
          ],
          max_tokens: 150,
          temperature: 0.3
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );
      
      await this.updateKeyUsage(apiKey, 'summary');
      return response.data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error summarizing conversation:', error);
      await this.rotateAPIKey('summary');
      return '';
    }
  }
  
  private static async generateAIResponse(userMessage: string, userName: string, conversationSummary: string): Promise<string> {
    try {
      const apiKey = await this.getActiveAPIKey('reply');
      if (!apiKey) {
        // Use a simple fallback that doesn't override admin personality
        return `Hello ${userName}! I'm having some technical difficulties. Please try again in a moment.`;
      }
      
      const settings = await storage.getSystemSettings();
      const personality = settings.ai_chat?.personality || 'You are a helpful TradePilot AI assistant specializing in cryptocurrency trading and arbitrage opportunities.';
      
      const systemPrompt = `${personality}

User's name: ${userName}
${conversationSummary ? `Previous conversation context: ${conversationSummary}` : ''}

IMPORTANT FORMATTING RULES:
- Use clear, structured responses with proper formatting
- Use bullet points (•) for lists and key information
- Use line breaks to separate different sections
- Use numbered lists (1., 2., 3.) for step-by-step instructions
- Keep paragraphs concise and well-spaced
- Use professional, friendly tone like ChatGPT
- Start with a brief greeting or acknowledgment when appropriate
- End with a helpful closing or question when relevant`;

      const response = await axios.post(
        this.CEREBRAS_API_URL,
        {
          model: 'llama3.1-8b',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: userMessage
            }
          ],
          max_tokens: 400,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );
      
      await this.updateKeyUsage(apiKey, 'reply');
      const aiResponse = response.data.choices[0]?.message?.content;
      if (!aiResponse || aiResponse.trim() === '') {
        return `Hello ${userName}! I'm having trouble generating a response right now. Please try again in a moment.`;
      }
      return aiResponse.trim();
    } catch (error) {
      console.error('Error generating AI response:', error);
      // Rotate to next key on failure
      await this.rotateAPIKey('reply');
      
      // Provide more specific error message based on error type
      if ((error as any).code === 'ENOTFOUND' || (error as any).code === 'ETIMEDOUT') {
        return `Hello ${userName}! I'm having trouble connecting right now. Please try again in a few moments.`;
      }
      
      if ((error as any).response?.status === 401) {
        return `Hello ${userName}! There's an issue with API access. Please contact support.`;
      }
      
      if ((error as any).response?.status === 429) {
        return `Hello ${userName}! I'm getting a lot of requests right now. Please wait a moment and try again.`;
      }
      
      return `Hello ${userName}! I'm having some technical difficulties. Please try again in a moment.`;
    }
  }
  
  private static async generatePersonalizedGreeting(userName: string): Promise<string> {
    try {
      // Get settings for AI personality
      const settings = await storage.getSystemSettings();
      const personality = settings.ai_chat?.personality || 'You are a helpful TradePilot AI assistant specializing in cryptocurrency trading and arbitrage opportunities.';
      
      // Always generate greeting using AI personality - no template needed
      const apiKey = await this.getActiveAPIKey('reply');
      if (!apiKey) {
        // Simple fallback that doesn't override admin personality  
        return `Hello ${userName}! How can I help you today?`;
      }

      const systemPrompt = `${personality}

Generate a welcoming first message for a user named ${userName} who just opened the chat.

IMPORTANT FORMATTING RULES:
- Use clear, structured responses with proper formatting
- Use bullet points (•) for lists and key information
- Use line breaks to separate different sections
- Keep paragraphs concise and well-spaced
- Use professional, friendly tone like ChatGPT`;

      const response = await axios.post(
        this.CEREBRAS_API_URL,
        {
          model: 'llama3.1-8b',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: 'Generate the greeting message now.'
            }
          ],
          max_tokens: 150,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      await this.updateKeyUsage(apiKey, 'reply');
      const aiGreeting = response.data.choices[0]?.message?.content?.trim();
      
      return aiGreeting || `Hello ${userName}! How can I help you today?`;
      
    } catch (error) {
      console.error('Error generating personalized greeting:', error);
      return `Hello ${userName}! How can I help you today?`;
    }
  }

  static async getConversation(userId: string): Promise<AIChatMessage[]> {
    try {
      const conversations = await storage.getAIChatConversations();
      let userConversation = conversations.find((conv: any) => conv.userId === userId);
      
      if (!userConversation) {
        // Create empty conversation - greeting will be triggered separately
        userConversation = {
          userId,
          messages: [],
          last_activity: new Date().toISOString(),
        };
        
        conversations.push(userConversation);
        await storage.saveAIChatConversations(conversations);
      }
      
      return userConversation.messages;
    } catch (error) {
      console.error('Error getting AI chat conversation:', error);
      return [];
    }
  }

  static async sendInitialGreeting(userId: string): Promise<AIChatMessage[]> {
    try {
      const conversations = await storage.getAIChatConversations();
      let userConversation = conversations.find((conv: any) => conv.userId === userId);
      
      if (!userConversation) {
        // Create new conversation first
        await this.getConversation(userId);
        return this.sendInitialGreeting(userId);
      }

      // Only send greeting if conversation is empty
      if (userConversation.messages.length > 0) {
        return userConversation.messages;
      }
      
      const user = await storage.getUser(userId);
      const userName = user?.username || 'Friend';
      
      const greetingMessage = await this.generatePersonalizedGreeting(userName);
      
      const greeting: AIChatMessage = {
        id: uuidv4(),
        userId,
        message: greetingMessage,
        isAI: true,
        created_at: new Date().toISOString(),
      };
      
      userConversation.messages.push(greeting);
      userConversation.last_activity = new Date().toISOString();
      await storage.saveAIChatConversations(conversations);
      
      return userConversation.messages;
    } catch (error) {
      console.error('Error sending initial greeting:', error);
      throw new Error('Failed to send initial greeting');
    }
  }

  static async sendMessage(userId: string, message: string): Promise<AIChatMessage[]> {
    try {
      const conversations = await storage.getAIChatConversations();
      let userConversation = conversations.find((conv: any) => conv.userId === userId);
      
      if (!userConversation) {
        // Create new conversation if it doesn't exist
        await this.getConversation(userId);
        return this.sendMessage(userId, message);
      }
      
      // Add user message
      const userMessage: AIChatMessage = {
        id: uuidv4(),
        userId,
        message,
        isAI: false,
        created_at: new Date().toISOString(),
      };
      
      userConversation.messages.push(userMessage);
      userConversation.last_activity = new Date().toISOString();
      await storage.saveAIChatConversations(conversations);
      
      // Generate conversation summary for context
      const conversationSummary = await this.summarizeConversation(userConversation.messages);
      
      // Get user info for personalization
      const user = await storage.getUser(userId);
      const userName = user?.username || 'Friend';
      
      // Generate AI response using Cerebras API
      const aiResponseText = await this.generateAIResponse(message, userName, conversationSummary);
      
      // Add AI response immediately (no delay for better UX)
      const aiMessage: AIChatMessage = {
        id: uuidv4(),
        userId,
        message: aiResponseText,
        isAI: true,
        created_at: new Date().toISOString(),
      };
      
      userConversation.messages.push(aiMessage);
      userConversation.last_activity = new Date().toISOString();
      await storage.saveAIChatConversations(conversations);
      
      return userConversation.messages;
    } catch (error) {
      console.error('Error sending AI chat message:', error);
      throw new Error('Failed to send message');
    }
  }

  static async getAllConversations(): Promise<AIChatConversation[]> {
    try {
      return await storage.getAIChatConversations();
    } catch (error) {
      console.error('Error getting all conversations:', error);
      return [];
    }
  }

  static async clearConversation(userId: string): Promise<void> {
    try {
      const conversations = await storage.getAIChatConversations();
      const updatedConversations = conversations.filter(conv => conv.userId !== userId);
      await storage.saveAIChatConversations(updatedConversations);
    } catch (error) {
      console.error('Error clearing conversation:', error);
      throw new Error('Failed to clear conversation');
    }
  }

  static async updatePersonality(personality: string): Promise<void> {
    try {
      // Get current settings to preserve existing ai_chat properties
      const currentSettings = await storage.getSystemSettings();
      const updates = {
        ai_chat: {
          enabled: true,
          personality,
          api_keys: currentSettings.ai_chat?.api_keys || {
            reply_keys: [],
            summary_keys: [],
            current_reply_index: 0,
            current_summary_index: 0,
          }
        }
      };
      await storage.updateSystemSettings(updates);
    } catch (error) {
      console.error('Error updating AI personality:', error);
      throw new Error('Failed to update AI personality');
    }
  }

  // API Key Management Methods
  static async addAPIKey(name: string, key: string, type: 'reply' | 'summary'): Promise<void> {
    try {
      const settings = await storage.getSystemSettings();
      if (!settings.ai_chat) {
        await this.updatePersonality('You are a helpful TradePilot AI assistant.');
        return this.addAPIKey(name, key, type); // Retry after personality setup
      }
      
      const newKey = {
        id: uuidv4(),
        name,
        key,
        status: 'active' as const,
        usage_count: 0,
        last_used: null,
        created_at: new Date().toISOString(),
      };
      
      const currentKeys = settings.ai_chat?.api_keys || {
        reply_keys: [],
        summary_keys: [],
        current_reply_index: 0,
        current_summary_index: 0,
      };
      
      const keyPath = type === 'reply' ? 'reply_keys' : 'summary_keys';
      const updatedKeys = [...(currentKeys[keyPath] || []), newKey];
      
      await storage.updateSystemSettings({
        ai_chat: {
          api_keys: {
            ...currentKeys,
            [keyPath]: updatedKeys
          }
        }
      });
    } catch (error) {
      console.error('Error adding API key:', error);
      throw new Error('Failed to add API key');
    }
  }

  static async updateAPIKey(id: string, type: 'reply' | 'summary', updates: { name?: string; status?: 'active' | 'inactive' }): Promise<void> {
    try {
      const settings = await storage.getSystemSettings();
      if (!settings.ai_chat?.api_keys) {
        throw new Error('No API keys configured');
      }
      
      const keys = type === 'reply' ? settings.ai_chat.api_keys.reply_keys : settings.ai_chat.api_keys.summary_keys;
      const keyIndex = keys.findIndex(k => k.id === id);
      
      if (keyIndex === -1) {
        throw new Error('API key not found');
      }
      
      const keyPath = type === 'reply' ? 'reply_keys' : 'summary_keys';
      const updatedKeys = keys.map((key, index) => 
        index === keyIndex ? { ...key, ...updates } : key
      );
      
      await storage.updateSystemSettings({
        ai_chat: {
          api_keys: {
            [keyPath]: updatedKeys
          }
        }
      });
    } catch (error) {
      console.error('Error updating API key:', error);
      throw new Error('Failed to update API key');
    }
  }

  static async deleteAPIKey(id: string, type: 'reply' | 'summary'): Promise<void> {
    try {
      const settings = await storage.getSystemSettings();
      if (!settings.ai_chat?.api_keys) {
        throw new Error('No API keys configured');
      }
      
      const keyPath = type === 'reply' ? 'reply_keys' : 'summary_keys';
      const currentKeys = settings.ai_chat.api_keys[keyPath] || [];
      const updatedKeys = currentKeys.filter(k => k.id !== id);
      
      await storage.updateSystemSettings({
        ai_chat: {
          api_keys: {
            [keyPath]: updatedKeys
          }
        }
      });
    } catch (error) {
      console.error('Error deleting API key:', error);
      throw new Error('Failed to delete API key');
    }
  }

  static async getAPIKeys(): Promise<{ reply_keys: any[]; summary_keys: any[] }> {
    try {
      const settings = await storage.getSystemSettings();
      if (!settings.ai_chat?.api_keys) {
        return { reply_keys: [], summary_keys: [] };
      }
      
      // Return keys without exposing the actual key values
      const reply_keys = settings.ai_chat.api_keys.reply_keys.map(k => ({
        ...k,
        key: `${k.key.substring(0, 8)}...${k.key.substring(k.key.length - 4)}`
      }));
      
      const summary_keys = settings.ai_chat.api_keys.summary_keys.map(k => ({
        ...k,
        key: `${k.key.substring(0, 8)}...${k.key.substring(k.key.length - 4)}`
      }));
      
      return { reply_keys, summary_keys };
    } catch (error) {
      console.error('Error getting API keys:', error);
      return { reply_keys: [], summary_keys: [] };
    }
  }
}