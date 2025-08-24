import { storage } from "../storage";
import type { ChatMessage, ChatUser, InboxMessage } from "@shared/schema";
import axios from "axios";

const CEREBRAS_API_KEY = "csk-fj5hkkykwtnnttrxj35nvrx5498drpnpjvwhr2yet36k6mte";
const CEREBRAS_API_URL = "https://api.cerebras.ai/v1/chat/completions";

// Realistic US/Canada/UK names for fake users
const FAKE_USERNAMES = [
  "TradeMaster_Mike", "CryptoSarah92", "InvestorJohn", "Emma_Gains", "Alex_Profits",
  "BullRun_Dave", "Luna_Trader", "ChartWiz_Tom", "GoldRush_Kate", "DiamondHands_Ben",
  "CoinHunter_Amy", "BlockchainBob", "DeFi_Queen", "BitBull_Chris", "EthElite_Lisa",
  "HodlKing_Ryan", "MoonShot_Jess", "CryptoNinja_Sam", "TokenTiger_Max", "AltCoin_Anna",
  "StakeWise_Dan", "YieldFarm_Zoe", "SwapStar_Tim", "NFT_Hunter_Mia", "Web3Wizard_Joe"
];

// Chat message templates for AI generation
const CHAT_TEMPLATES = [
  "Just made ${amount} profit on my latest investment! 🚀💰",
  "Anyone else seeing these amazing returns? My portfolio is up {percentage}% this week!",
  "The arbitrage opportunities today are insane! Already made ${amount} 🔥",
  "Thanks to everyone in this group, just hit my ${milestone} milestone! 🎉",
  "Morning everyone! Ready for another profitable day? ☀️💪",
  "Who else is loving these consistent daily returns? Best platform ever! ⭐",
  "Just withdrew ${amount} - instant processing as always! 💎",
  "New to the platform but already seeing ${amount} daily returns. Amazing! 🚀",
  "The automated trading is working perfectly. Set it and forget it! 💯",
  "Anyone have tips for maximizing arbitrage profits? Currently at ${amount}/day"
];

const MOTIVATIONAL_MESSAGES = [
  "Stay strong everyone! The market always rewards patience 💪",
  "Remember: we're not just trading, we're building wealth! 🏗️💰",
  "Every dip is a buying opportunity. Stay focused! 📈",
  "The key to success: consistent investment + time = wealth 🗝️",
  "Great job everyone on those gains today! Keep it up! 🔥",
  "Financial freedom is closer than you think. Keep going! 🎯",
  "Success in crypto: 90% patience, 10% timing ⏰",
  "We're all gonna make it! Believe in the process 🌟",
  "Today's profits are tomorrow's investments. Compound that growth! 📊",
  "Pro tip: Never invest more than you can afford to lose. Stay smart! 🧠"
];

export class ChatService {
  private static onlineUsers: ChatUser[] = [];
  private static typingUsers: Set<string> = new Set();

  // Generate realistic online user count (272-321)
  static getOnlineCount(): number {
    return Math.floor(Math.random() * (321 - 272 + 1)) + 272;
  }

  // Check if chat is active (7 AM to 1 AM)
  static isChatActive(): boolean {
    const now = new Date();
    const hour = now.getHours();
    return hour >= 7 || hour < 1; // 7 AM to 1 AM (next day)
  }

  // Get chat status message
  static getChatStatus(): string {
    if (this.isChatActive()) {
      return `💬 ${this.getOnlineCount()} users online`;
    } else {
      return "💤 Chatroom is closed for the night. See you at 7:00 AM!";
    }
  }

  // Generate AI response using Cerebras API
  static async generateAIResponse(userMessage: string, username: string): Promise<string> {
    try {
      const prompt = `You are simulating multiple users in a crypto trading community chatroom. They use TradePilot AI arbitrage platform.

TradePilot scans multiple major exchanges in real time (Binance, Coinbase, Kraken, etc).
- It identifies crypto arbitrage opportunities (price differences across exchanges)
- It uses AI algorithms to analyze risks, fees, and timing
- It executes trades automatically and gives users profit

Write short, natural, human-like messages as different community members.
Mix different tones: profits 💰, jokes 😅, encouragement 🚀, and small talk.
Keep it casual and realistic under 80 characters. Make it look like real people chatting together.

Previous message from ${username}: "${userMessage}"

Respond as ONE other trader, not as an AI assistant. Be authentic and conversational:`;

      const response = await axios.post(CEREBRAS_API_URL, {
        model: "llama3.1-8b",
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: userMessage }
        ],
        max_tokens: 100,
        temperature: 0.9
      }, {
        headers: {
          'Authorization': `Bearer ${CEREBRAS_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      return response.data.choices[0]?.message?.content?.trim() || this.getFallbackResponse();
    } catch (error) {
      console.error('Cerebras API error:', error);
      return this.getFallbackResponse();
    }
  }

  // Fallback responses when API fails
  static getFallbackResponse(): string {
    const fallbacks = [
      "Just made $200 today! 💰",
      "TradePilot is crushing it 🚀",
      "Anyone else seeing BTC arb opportunities? 📈",
      "Made 15% this week thanks to the AI 🔥",
      "Love this platform! 💎",
      "Who's ready for more profits? 😅",
      "ETH price diff between exchanges is wild today",
      "Bot found me a sweet USDT trade 💰",
      "This AI never sleeps! 🤖",
      "Best investment I ever made 🚀"
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  // Generate fake chat messages for background activity
  static generateFakeMessages(count: number = 3): ChatMessage[] {
    const messages: ChatMessage[] = [];
    const now = new Date();

    for (let i = 0; i < count; i++) {
      const username = FAKE_USERNAMES[Math.floor(Math.random() * FAKE_USERNAMES.length)];
      const template = Math.random() > 0.7 ? 
        MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)] :
        CHAT_TEMPLATES[Math.floor(Math.random() * CHAT_TEMPLATES.length)];

      // Replace placeholders with realistic values
      let message = template
        .replace(/\${amount}/g, `$${Math.floor(Math.random() * 500 + 50)}`)
        .replace(/\{percentage\}/g, `${Math.floor(Math.random() * 15 + 5)}`)
        .replace(/\${milestone}/g, `$${Math.floor(Math.random() * 10 + 1)}k`);

      messages.push({
        id: `fake_${Date.now()}_${i}`,
        userId: `fake_${username}`,
        username,
        message,
        isAI: true,
        created_at: new Date(now.getTime() - Math.random() * 1800000).toISOString() // Random time within last 30 min
      });
    }

    return messages;
  }

  // Add user message to chat
  static async addMessage(userId: string, username: string, message: string): Promise<ChatMessage> {
    const chatMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      username,
      message,
      isAI: false,
      created_at: new Date().toISOString()
    };

    await storage.addChatMessage(chatMessage);

    // Generate AI response after a realistic delay (1-5 seconds)
    const responseDelay = Math.random() * 4000 + 1000; // 1-5 seconds
    setTimeout(async () => {
      if (this.isChatActive()) {
        const aiResponse = await this.generateAIResponse(message, username);
        const aiUsername = FAKE_USERNAMES[Math.floor(Math.random() * FAKE_USERNAMES.length)];
        
        const aiMessage: ChatMessage = {
          id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: `ai_${aiUsername}`,
          username: aiUsername,
          message: aiResponse,
          isAI: true,
          created_at: new Date().toISOString()
        };

        await storage.addChatMessage(aiMessage);
      }
    }, responseDelay);

    return chatMessage;
  }

  // Get recent chat messages with fake messages mixed in
  static async getChatMessages(limit: number = 50): Promise<ChatMessage[]> {
    const realMessages = await storage.getChatMessages(limit);
    
    if (!this.isChatActive()) {
      return realMessages;
    }

    // Add some fake messages to make chat feel alive
    const fakeMessages = this.generateFakeMessages(Math.floor(Math.random() * 3 + 1));
    
    // Combine and sort by timestamp
    const allMessages = [...realMessages, ...fakeMessages]
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .slice(-limit);

    return allMessages;
  }

  // Simulate typing indicators
  static setTyping(userId: string, isTyping: boolean): void {
    if (isTyping) {
      this.typingUsers.add(userId);
    } else {
      this.typingUsers.delete(userId);
    }
  }

  static getTypingStatus(): string {
    const count = Math.floor(Math.random() * 5 + 1); // 1-5 users
    if (Math.random() > 0.7) { // 30% chance of showing typing
      return `${count} user${count > 1 ? 's' : ''} typing...`;
    }
    return '';
  }

  // Clean up old messages (called periodically)
  static async cleanupOldMessages(): Promise<void> {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - 2); // Keep messages for 2 hours
    await storage.cleanupChatMessages(cutoff.toISOString());
  }

  // Add welcome message to user's inbox
  static async addWelcomeMessage(userId: string): Promise<void> {
    // Get welcome message from system settings
    const settings = await storage.getSystemSettings();
    const welcomeSettings = settings?.welcome_message || {
      title: "🎉 Welcome to Your Investment Success Journey!",
      content: `Congratulations on taking the first step toward financial freedom! We're thrilled to welcome you to TradePilot, where advanced technology meets profitable investing.

**Your Journey Begins Now:**
• Advanced AI technology analyzing thousands of market opportunities daily
• Consistent profit generation through automated arbitrage strategies
• Real-time portfolio tracking and performance analytics
• Bank-level security protecting your investments 24/7
• Instant access to your earnings with flexible withdrawal options
• Professional support team dedicated to your success

**Start Earning Today:**
1. Explore our proven investment plans designed for maximum returns
2. Choose your preferred investment amount and duration
3. Watch your portfolio grow with our automated profit generation
4. Withdraw your earnings anytime with complete flexibility

You've made a smart decision joining thousands of successful investors who trust TradePilot for their financial growth. Your investment dashboard is ready, and our AI systems are already identifying profitable opportunities for you.

**Ready to transform your financial future?**
Your personalized dashboard awaits with exclusive investment opportunities.

To your success,
The TradePilot Team 🚀`
    };

    const welcomeMessage: InboxMessage = {
      id: `welcome_${userId}_${Date.now()}`,
      userId,
      title: welcomeSettings.title,
      content: welcomeSettings.content,
      type: "welcome",
      is_read: false,
      created_at: new Date().toISOString()
    };

    await storage.addInboxMessage(welcomeMessage);
  }

  // Add support reply to inbox
  static async addSupportReply(userId: string, ticketId: string, subject: string, reply: string): Promise<void> {
    const replyMessage: InboxMessage = {
      id: `reply_${ticketId}_${Date.now()}`,
      userId,
      title: `Re: ${subject}`,
      content: reply,
      type: "support_reply",
      is_read: false,
      ticket_id: ticketId,
      created_at: new Date().toISOString()
    };

    await storage.addInboxMessage(replyMessage);
  }

  // Get user's inbox messages
  static async getInboxMessages(userId: string): Promise<InboxMessage[]> {
    return await storage.getInboxMessages(userId);
  }

  // Mark inbox message as read
  static async markMessageAsRead(messageId: string): Promise<void> {
    await storage.markInboxMessageAsRead(messageId);
  }

  // Get unread message count for notification dot
  static async getUnreadCount(userId: string): Promise<number> {
    const messages = await storage.getInboxMessages(userId);
    return messages.filter(msg => !msg.is_read).length;
  }
}

// Start periodic cleanup and fake message generation
setInterval(() => {
  ChatService.cleanupOldMessages();
}, 30 * 60 * 1000); // Every 30 minutes

// Generate background chatter every 30 minutes during active hours
setInterval(async () => {
  if (ChatService.isChatActive()) {
    const fakeMessages = ChatService.generateFakeMessages(2);
    for (const msg of fakeMessages) {
      await storage.addChatMessage(msg);
    }
  }
}, 30 * 60 * 1000); // Every 30 minutes