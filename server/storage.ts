import * as fs from "fs";
import * as path from "path";
import { randomUUID } from "crypto";

// File-based storage paths
const DATA_DIR = path.join(process.cwd(), "database");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const PENDING_USERS_FILE = path.join(DATA_DIR, "pending-users.json");
const PLANS_FILE = path.join(DATA_DIR, "plans.json");
const INVESTMENTS_FILE = path.join(DATA_DIR, "investments.json");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");
const DEPOSITS_FILE = path.join(DATA_DIR, "deposits.json");
const WITHDRAWALS_FILE = path.join(DATA_DIR, "withdrawals.json");
const MESSAGES_FILE = path.join(DATA_DIR, "messages.json");
const SUPPORT_TICKETS_FILE = path.join(DATA_DIR, "support-tickets.json");
const AI_CHAT_CONVERSATIONS_FILE = path.join(DATA_DIR, "ai-chat-conversations.json");
const INBOX_MESSAGES_FILE = path.join(DATA_DIR, "inbox-messages.json");
const LOGS_FILE = path.join(DATA_DIR, "logs.json");
const LOGIN_LOGS_FILE = path.join(DATA_DIR, "login-logs.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize data files with default content
function initializeDataFiles() {
  // Initialize users file
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
  }

  // Initialize pending users file
  if (!fs.existsSync(PENDING_USERS_FILE)) {
    fs.writeFileSync(PENDING_USERS_FILE, JSON.stringify([], null, 2));
  }

  // Initialize investment plans with AI Trading Plans
  if (!fs.existsSync(PLANS_FILE)) {
    const defaultPlans = [
      {
        id: "1",
        name: "Starter AI Bot",
        description: "Perfect for beginners looking to start automated crypto trading with AI assistance.",
        profit_percentage: 12.5,
        duration_days: 30,
        min_deposit: 50,
        max_deposit: 1000,
        features: [
          "Basic AI Trading Algorithms",
          "24/7 Market Monitoring", 
          "Risk Management Tools",
          "Daily Performance Reports",
          "Email Notifications"
        ],
        active: true,
        created_at: new Date().toISOString()
      },
      {
        id: "2", 
        name: "Advanced AI Pro",
        description: "Advanced AI trading strategies with higher returns and sophisticated market analysis.",
        profit_percentage: 18.7,
        duration_days: 60,
        min_deposit: 500,
        max_deposit: 10000,
        features: [
          "Advanced Neural Networks",
          "Multi-Exchange Arbitrage", 
          "Sentiment Analysis Integration",
          "Custom Trading Strategies",
          "Priority Support",
          "Real-time Portfolio Analytics"
        ],
        active: true,
        created_at: new Date().toISOString()
      },
      {
        id: "3",
        name: "Elite AI Master", 
        description: "Our most sophisticated AI trading system for serious investors seeking maximum returns.",
        profit_percentage: 24.3,
        duration_days: 90,
        min_deposit: 2000,
        max_deposit: 50000,
        features: [
          "Deep Learning Algorithms",
          "Cross-Market Analysis",
          "Institutional-Grade Security", 
          "Dedicated Account Manager",
          "API Access for Custom Integration",
          "Advanced Risk Hedging",
          "Quarterly Strategy Reviews"
        ],
        active: true,
        created_at: new Date().toISOString()
      }
    ];
    fs.writeFileSync(PLANS_FILE, JSON.stringify(defaultPlans, null, 2));
  }

  // Initialize other files
  if (!fs.existsSync(INVESTMENTS_FILE)) {
    fs.writeFileSync(INVESTMENTS_FILE, JSON.stringify([], null, 2));
  }

  if (!fs.existsSync(LOGIN_LOGS_FILE)) {
    fs.writeFileSync(LOGIN_LOGS_FILE, JSON.stringify([], null, 2));
  }
  
  if (!fs.existsSync(DEPOSITS_FILE)) {
    fs.writeFileSync(DEPOSITS_FILE, JSON.stringify([], null, 2));
  }
  
  if (!fs.existsSync(WITHDRAWALS_FILE)) {
    fs.writeFileSync(WITHDRAWALS_FILE, JSON.stringify([], null, 2));
  }
  
  if (!fs.existsSync(MESSAGES_FILE)) {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify([], null, 2));
  }
  
  if (!fs.existsSync(SUPPORT_TICKETS_FILE)) {
    fs.writeFileSync(SUPPORT_TICKETS_FILE, JSON.stringify([], null, 2));
  }
  
  if (!fs.existsSync(INBOX_MESSAGES_FILE)) {
    fs.writeFileSync(INBOX_MESSAGES_FILE, JSON.stringify([], null, 2));
  }
  
  if (!fs.existsSync(LOGS_FILE)) {
    fs.writeFileSync(LOGS_FILE, JSON.stringify([], null, 2));
  }

  // Initialize settings file
  if (!fs.existsSync(SETTINGS_FILE)) {
    const defaultSettings = {
      wallets: {
        btc: {
          address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
          qrCode: "",
          active: true
        },
        eth: {
          address: "0x742d35Cc6677C4C8B3e29Ddb7E2Bd3b8B8b4D8b6",
          qrCode: "",
          active: true
        },
        usdt: {
          address: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
          qrCode: "",
          active: true
        }
      },
      withdrawal_limits: {
        min_withdrawal: 10,
        max_daily_withdrawal: 10000,
        processing_time_hours: 24
      },
      system: {
        maintenance_mode: false,
        global_profit_multiplier: 1.0,
        referral_bonus_percentage: 5,
        arbitrage_refresh_rate: 30
      },
      ai_chat: {
        enabled: true,
        personality: "Professional crypto trading assistant"
      },
      recaptcha: {
        enabled: false,
        site_key: "",
        secret_key: ""
      },
      depositSettings: {
        BTC: {
          minDeposit: "0.001",
          confirmations: 3
        },
        ETH: {
          minDeposit: "0.01", 
          confirmations: 12
        },
        USDT: {
          minDeposit: "10",
          confirmations: 6
        }
      },
      welcome_message: {
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
      },
      email_welcome: {
        subject: "🚀 Welcome to TradePilot - Your AI Investment Dashboard is Ready!",
        title: "Welcome to Your Success Story",
        subtitle: "Your AI-powered investment journey starts now",
        benefits: [
          {
            "title": "AI-Powered Returns",
            "description": "Advanced algorithms execute profitable trades automatically, maximizing your investment potential"
          },
          {
            "title": "Daily Profit Generation",
            "description": "Watch your balance grow with consistent returns generated by our sophisticated trading systems"
          },
          {
            "title": "Real-Time Intelligence",
            "description": "Access live market analytics and performance tracking to monitor your investment growth"
          },
          {
            "title": "Secure & Transparent",
            "description": "Bank-grade security ensures your investments are protected with complete transparency"
          },
          {
            "title": "Instant Withdrawals",
            "description": "Access your profits anytime with flexible withdrawal options and instant processing"
          }
        ],
        steps: [
          "Access your personalized investment dashboard",
          "Explore our high-performance investment plans",
          "Make your first investment and activate AI trading",
          "Monitor your daily profits and withdraw anytime"
        ],
        cta_text: "🎯 Access Your Investment Dashboard",
        footer_message: "Welcome to the future of intelligent investing. Your success is our mission."
      },
      callmebot: {
        enabled: false,
        admin_whatsapp_number: "",
        api_key: "",
        notifications: {
          new_registration: true,
          user_login: false,
          support_ticket: true,
          withdrawal_request: true,
          system_activity: true
        }
      }
    };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2));
  }
}

// Interface for storage operations
export interface IStorage {
  getUser(id: string): Promise<any>;
  getUserByUsername(username: string): Promise<any>;
  getUserByEmail(email: string): Promise<any>;
  createUser(userData: any): Promise<any>;
  updateUser(id: string, updates: any): Promise<any>;
  deleteUser(id: string): Promise<boolean>;
  getAllUsers(): Promise<any[]>;
  
  getInvestmentPlans(): Promise<any[]>;
  getInvestmentPlan(id: string): Promise<any>;
  createInvestmentPlan(plan: any): Promise<any>;
  updateInvestmentPlan(id: string, updates: any): Promise<any>;
  deleteInvestmentPlan(id: string): Promise<boolean>;
  updateInvestmentPlans(plans: any[]): Promise<void>;
  
  getUserInvestments(userId: string): Promise<any[]>;
  getAllInvestments(): Promise<any[]>;
  createUserInvestment(investment: any, userId: string): Promise<any>;
  updateUserInvestment(id: string, updates: any): Promise<any>;
  
  getSystemSettings(): Promise<any>;
  updateSystemSettings(settings: any): Promise<void>;
  
  getDeposits(userId?: string): Promise<any[]>;
  getUserDeposits(userId: string): Promise<any[]>;
  getAllDeposits(): Promise<any[]>;
  createDeposit(deposit: any, userId: string): Promise<any>;
  updateDeposit(id: string, updates: any): Promise<any>;
  
  getWithdrawals(userId?: string): Promise<any[]>;
  getUserWithdrawals(userId: string): Promise<any[]>;
  getAllWithdrawals(): Promise<any[]>;
  createWithdrawal(withdrawal: any, userId: string): Promise<any>;
  updateWithdrawal(id: string, updates: any): Promise<any>;
  approveWithdrawal(id: string, adminNotes?: string): Promise<any>;
  
  getMessages(userId?: string): Promise<any[]>;
  getUserMessages(userId: string): Promise<any[]>;
  getAllMessages(): Promise<any[]>;
  createMessage(message: any): Promise<any>;
  markMessageAsRead(id: string): Promise<void>;
  markAllMessagesAsRead(userId: string): Promise<void>;
  deleteMessage(id: string): Promise<boolean>;
  
  getSupportTickets(userId?: string): Promise<any[]>;
  getUserSupportTickets(userId: string): Promise<any[]>;
  getAllSupportTickets(): Promise<any[]>;
  createSupportTicket(ticket: any, userId: string): Promise<any>;
  updateSupportTicket(id: string, updates: any): Promise<any>;
  deleteSupportTicket(id: string): Promise<boolean>;
  
  // Inbox messages
  getInboxMessages(userId: string): Promise<any[]>;
  addInboxMessage(message: any): Promise<any>;
  markInboxMessageAsRead(id: string, userId: string): Promise<boolean>;
  markAllInboxMessagesAsRead(userId: string): Promise<void>;
  deleteInboxMessage(id: string, userId: string): Promise<boolean>;
  
  // Pending user methods
  getPendingUserByEmail(email: string): Promise<any>;
  createPendingUser(userData: any): Promise<any>;
  updatePendingUserCode(email: string, verificationCode: string): Promise<any>;
  verifyPendingUser(email: string, verificationCode: string): Promise<any>;
  getUserByReferralCode(referralCode: string): Promise<any>;
  createLoginLog(log: any): Promise<any>;
  
  // Referral methods
  getReferralEarnings(userId: string): Promise<any[]>;
  getReferredUsers(userId: string): Promise<any[]>;
  
  // Admin utilities
  adjustUserBalance(userId: string, amount: number, type: string): Promise<any>;
  updateUserBalance(userId: string, newBalance: number): Promise<any>;
  
  // Audit logs
  logAction(action: any): Promise<void>;
  getAuditLogs(): Promise<any[]>;
}

export class FileStorage implements IStorage {
  constructor() {
    initializeDataFiles();
  }

  private readFile<T>(filePath: string): T[] {
    try {
      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data) as T[];
    } catch (error) {
      console.error(`Error reading ${filePath}:`, error);
      return [];
    }
  }

  private writeFile<T>(filePath: string, data: T[]): void {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`Error writing ${filePath}:`, error);
      throw error;
    }
  }

  async getUser(id: string): Promise<any> {
    const users = this.readFile(USERS_FILE);
    return users.find((user: any) => user.id === id);
  }

  async getUserByUsername(username: string): Promise<any> {
    const users = this.readFile(USERS_FILE);
    return users.find((user: any) => user.username === username);
  }

  async getUserByEmail(email: string): Promise<any> {
    const users = this.readFile(USERS_FILE);
    return users.find((user: any) => user.email === email);
  }

  async createUser(userData: any): Promise<any> {
    const users = this.readFile(USERS_FILE);
    users.push(userData);
    this.writeFile(USERS_FILE, users);
    return userData;
  }

  async updateUser(id: string, updates: any): Promise<any> {
    const users = this.readFile(USERS_FILE);
    const userIndex = users.findIndex((user: any) => user.id === id);
    if (userIndex === -1) return undefined;
    
    const user = users[userIndex] as any;
    users[userIndex] = { ...user, ...updates };
    this.writeFile(USERS_FILE, users);
    return users[userIndex];
  }

  async deleteUser(id: string): Promise<boolean> {
    const users = this.readFile(USERS_FILE);
    const user = users.find((u: any) => u.id === id);
    
    if (!user) {
      return false; // User not found
    }
    
    try {
      // 1. Remove user from main users file
      const filteredUsers = users.filter((user: any) => user.id !== id);
      this.writeFile(USERS_FILE, filteredUsers);
      
      // 2. Remove all user investments
      const investments = this.readFile(INVESTMENTS_FILE);
      const filteredInvestments = investments.filter((inv: any) => inv.user_id !== id);
      this.writeFile(INVESTMENTS_FILE, filteredInvestments);
      
      // 3. Remove all user deposits
      const deposits = this.readFile(DEPOSITS_FILE);
      const filteredDeposits = deposits.filter((dep: any) => dep.userId !== id);
      this.writeFile(DEPOSITS_FILE, filteredDeposits);
      
      // 4. Remove all user withdrawals
      const withdrawals = this.readFile(WITHDRAWALS_FILE);
      const filteredWithdrawals = withdrawals.filter((wit: any) => wit.userId !== id);
      this.writeFile(WITHDRAWALS_FILE, filteredWithdrawals);
      
      // 5. Remove all user messages
      const messages = this.readFile(MESSAGES_FILE);
      const filteredMessages = messages.filter((msg: any) => msg.userId !== id);
      this.writeFile(MESSAGES_FILE, filteredMessages);
      
      // 6. Remove all user support tickets
      const tickets = this.readFile(SUPPORT_TICKETS_FILE);
      const filteredTickets = tickets.filter((ticket: any) => ticket.userId !== id);
      this.writeFile(SUPPORT_TICKETS_FILE, filteredTickets);
      
      // 7. Remove all user inbox messages
      const inboxMessages = this.readFile(INBOX_MESSAGES_FILE);
      const filteredInboxMessages = inboxMessages.filter((msg: any) => msg.userId !== id);
      this.writeFile(INBOX_MESSAGES_FILE, filteredInboxMessages);
      
      // 8. Remove user from pending users (if exists)
      const pendingUsers = this.readFile(PENDING_USERS_FILE);
      const filteredPendingUsers = pendingUsers.filter((pending: any) => 
        pending.email !== (user as any).email && pending.username !== (user as any).username
      );
      this.writeFile(PENDING_USERS_FILE, filteredPendingUsers);
      
      // 9. Remove user login logs
      const loginLogs = this.readFile(LOGIN_LOGS_FILE);
      const filteredLoginLogs = loginLogs.filter((log: any) => log.userId !== id);
      this.writeFile(LOGIN_LOGS_FILE, filteredLoginLogs);
      
      console.log(`User ${(user as any).username} (${(user as any).email}) and all associated data permanently deleted`);
      return true;
      
    } catch (error) {
      console.error('Error during comprehensive user deletion:', error);
      return false;
    }
  }

  async getAllUsers(): Promise<any[]> {
    return this.readFile(USERS_FILE);
  }

  async getInvestmentPlans(): Promise<any[]> {
    return this.readFile(PLANS_FILE);
  }

  async getInvestmentPlan(id: string): Promise<any> {
    const plans = this.readFile(PLANS_FILE);
    return plans.find((plan: any) => plan.id === id);
  }

  async createInvestmentPlan(plan: any): Promise<any> {
    const plans = this.readFile(PLANS_FILE);
    plans.push(plan);
    this.writeFile(PLANS_FILE, plans);
    return plan;
  }

  async updateInvestmentPlan(id: string, updates: any): Promise<any> {
    const plans = this.readFile(PLANS_FILE);
    const planIndex = plans.findIndex((plan: any) => plan.id === id);
    if (planIndex === -1) return undefined;
    
    const plan = plans[planIndex] as any;
    plans[planIndex] = { ...plan, ...updates };
    this.writeFile(PLANS_FILE, plans);
    return plans[planIndex];
  }

  async deleteInvestmentPlan(id: string): Promise<boolean> {
    const plans = this.readFile(PLANS_FILE);
    const filteredPlans = plans.filter((plan: any) => plan.id !== id);
    
    if (filteredPlans.length < plans.length) {
      this.writeFile(PLANS_FILE, filteredPlans);
      return true;
    }
    return false;
  }

  async updateInvestmentPlans(plans: any[]): Promise<void> {
    this.writeFile(PLANS_FILE, plans);
  }

  async getUserInvestments(userId: string): Promise<any[]> {
    const investments = this.readFile(INVESTMENTS_FILE);
    return investments.filter((investment: any) => investment.userId === userId);
  }

  async getAllInvestments(): Promise<any[]> {
    return this.readFile(INVESTMENTS_FILE);
  }

  async createUserInvestment(investment: any, userId: string): Promise<any> {
    const investments = this.readFile(INVESTMENTS_FILE);
    const fullInvestment = { ...investment, userId };
    investments.push(fullInvestment);
    this.writeFile(INVESTMENTS_FILE, investments);
    return fullInvestment;
  }

  async updateUserInvestment(id: string, updates: any): Promise<any> {
    const investments = this.readFile(INVESTMENTS_FILE);
    const investmentIndex = investments.findIndex((investment: any) => investment.id === id);
    if (investmentIndex === -1) return undefined;
    
    const currentInvestment = investments[investmentIndex] as any;
    investments[investmentIndex] = { ...currentInvestment, ...updates };
    this.writeFile(INVESTMENTS_FILE, investments);
    return investments[investmentIndex];
  }

  async getSystemSettings(): Promise<any> {
    try {
      const data = fs.readFileSync(SETTINGS_FILE, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      console.error("Error reading settings:", error);
      return {};
    }
  }

  async updateSystemSettings(updates: any): Promise<any> {
    try {
      // Get existing settings
      const existingSettings = await this.getSystemSettings();
      
      // Deep merge the updates with existing settings
      const mergedSettings = this.deepMerge(existingSettings, updates);
      
      // Write the merged settings back to the file with atomic operation
      const tempFile = SETTINGS_FILE + '.tmp';
      fs.writeFileSync(tempFile, JSON.stringify(mergedSettings, null, 2));
      fs.renameSync(tempFile, SETTINGS_FILE);
      
      console.log('Settings successfully updated and persisted');
      return mergedSettings;
    } catch (error) {
      console.error("Error updating settings:", error);
      throw error;
    }
  }

  // Helper function to deep merge objects
  private deepMerge(target: any, source: any): any {
    if (source === null || source === undefined) return target;
    if (target === null || target === undefined) return source;
    
    const result = { ...target };
    
    Object.keys(source).forEach(key => {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    });
    
    return result;
  }

  async getDeposits(userId?: string): Promise<any[]> {
    const deposits = this.readFile(DEPOSITS_FILE);
    return userId ? deposits.filter((deposit: any) => deposit.userId === userId) : deposits;
  }

  async getUserDeposits(userId: string): Promise<any[]> {
    const deposits = this.readFile(DEPOSITS_FILE);
    return deposits.filter((deposit: any) => deposit.userId === userId);
  }

  async getAllDeposits(): Promise<any[]> {
    return this.readFile(DEPOSITS_FILE);
  }

  async createDeposit(deposit: any, userId: string): Promise<any> {
    const deposits = this.readFile(DEPOSITS_FILE);
    const fullDeposit = { ...deposit, userId };
    deposits.push(fullDeposit);
    this.writeFile(DEPOSITS_FILE, deposits);
    return fullDeposit;
  }

  async updateDeposit(id: string, updates: any): Promise<any> {
    const deposits = this.readFile(DEPOSITS_FILE);
    const depositIndex = deposits.findIndex((deposit: any) => deposit.id === id);
    if (depositIndex === -1) return undefined;
    
    const deposit = deposits[depositIndex] as any;
    deposits[depositIndex] = { ...deposit, ...updates };
    this.writeFile(DEPOSITS_FILE, deposits);
    return deposits[depositIndex];
  }

  async getWithdrawals(userId?: string): Promise<any[]> {
    const withdrawals = this.readFile(WITHDRAWALS_FILE);
    return userId ? withdrawals.filter((withdrawal: any) => withdrawal.userId === userId) : withdrawals;
  }

  async getUserWithdrawals(userId: string): Promise<any[]> {
    const withdrawals = this.readFile(WITHDRAWALS_FILE);
    return withdrawals.filter((withdrawal: any) => withdrawal.userId === userId);
  }

  async getAllWithdrawals(): Promise<any[]> {
    return this.readFile(WITHDRAWALS_FILE);
  }

  async createWithdrawal(withdrawal: any, userId: string): Promise<any> {
    const withdrawals = this.readFile(WITHDRAWALS_FILE);
    const fullWithdrawal = { 
      ...withdrawal, 
      userId,
      id: withdrawal.id || `withdrawal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: withdrawal.status || 'pending',
      created_at: withdrawal.created_at || new Date().toISOString(),
      usd_value: withdrawal.usd_value || withdrawal.amount // Ensure usd_value is set for consistency
    };
    withdrawals.push(fullWithdrawal);
    this.writeFile(WITHDRAWALS_FILE, withdrawals);
    return fullWithdrawal;
  }

  async updateWithdrawal(id: string, updates: any): Promise<any> {
    const withdrawals = this.readFile(WITHDRAWALS_FILE);
    const withdrawalIndex = withdrawals.findIndex((withdrawal: any) => withdrawal.id === id);
    if (withdrawalIndex === -1) return undefined;
    
    const currentWithdrawal = withdrawals[withdrawalIndex] as any;
    withdrawals[withdrawalIndex] = { ...currentWithdrawal, ...updates };
    this.writeFile(WITHDRAWALS_FILE, withdrawals);
    return withdrawals[withdrawalIndex];
  }

  async approveWithdrawal(id: string, adminNotes?: string): Promise<any> {
    const withdrawals = this.readFile(WITHDRAWALS_FILE);
    const withdrawalIndex = withdrawals.findIndex((withdrawal: any) => withdrawal.id === id);
    if (withdrawalIndex === -1) return undefined;
    
    const updates = {
      status: 'approved',
      admin_notes: adminNotes || '',
      approved_at: new Date().toISOString()
    };
    
    const currentWithdrawal2 = withdrawals[withdrawalIndex] as any;
    withdrawals[withdrawalIndex] = { ...currentWithdrawal2, ...updates };
    this.writeFile(WITHDRAWALS_FILE, withdrawals);
    return withdrawals[withdrawalIndex];
  }

  async getMessages(userId?: string): Promise<any[]> {
    const messages = this.readFile(MESSAGES_FILE);
    return userId ? messages.filter((message: any) => message.userId === userId || !message.userId) : messages;
  }

  async getUserMessages(userId: string): Promise<any[]> {
    const messages = this.readFile(MESSAGES_FILE);
    return messages.filter((message: any) => message.userId === userId || !message.userId);
  }

  async getAllMessages(): Promise<any[]> {
    return this.readFile(MESSAGES_FILE);
  }

  async createMessage(message: any): Promise<any> {
    const messages = this.readFile(MESSAGES_FILE);
    messages.push(message);
    this.writeFile(MESSAGES_FILE, messages);
    return message;
  }

  async markMessageAsRead(id: string): Promise<void> {
    const messages = this.readFile(MESSAGES_FILE);
    const messageIndex = messages.findIndex((message: any) => message.id === id);
    if (messageIndex !== -1) {
      const messageToUpdate = messages[messageIndex] as any;
      messageToUpdate.is_read = true;
      messages[messageIndex] = messageToUpdate;
      this.writeFile(MESSAGES_FILE, messages);
    }
  }

  async markAllMessagesAsRead(userId: string): Promise<void> {
    const messages = this.readFile(MESSAGES_FILE);
    let updated = false;
    messages.forEach((message: any) => {
      if (message && message.userId === userId && !message.is_read) {
        message.is_read = true;
        updated = true;
      }
    });
    if (updated) {
      this.writeFile(MESSAGES_FILE, messages);
    }
  }

  async deleteMessage(id: string): Promise<boolean> {
    const messages = this.readFile(MESSAGES_FILE);
    const initialLength = messages.length;
    const filteredMessages = messages.filter((message: any) => message.id !== id);
    
    if (filteredMessages.length < initialLength) {
      this.writeFile(MESSAGES_FILE, filteredMessages);
      return true;
    }
    return false;
  }

  async getSupportTickets(userId?: string): Promise<any[]> {
    const tickets = this.readFile(SUPPORT_TICKETS_FILE);
    return userId ? tickets.filter((ticket: any) => ticket.userId === userId) : tickets;
  }

  async getUserSupportTickets(userId: string): Promise<any[]> {
    const tickets = this.readFile(SUPPORT_TICKETS_FILE);
    return tickets.filter((ticket: any) => ticket.userId === userId);
  }

  async getAllSupportTickets(): Promise<any[]> {
    return this.readFile(SUPPORT_TICKETS_FILE);
  }

  async createSupportTicket(ticket: any, userId: string): Promise<any> {
    const tickets = this.readFile(SUPPORT_TICKETS_FILE);
    const fullTicket = { 
      ...ticket, 
      id: randomUUID(),
      userId,
      status: "open",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    tickets.push(fullTicket);
    this.writeFile(SUPPORT_TICKETS_FILE, tickets);
    return fullTicket;
  }

  async updateSupportTicket(id: string, updates: any): Promise<any> {
    const tickets = this.readFile(SUPPORT_TICKETS_FILE);
    const ticketIndex = tickets.findIndex((ticket: any) => ticket.id === id);
    if (ticketIndex === -1) return undefined;
    
    const ticket = tickets[ticketIndex] as any;
    tickets[ticketIndex] = { ...ticket, ...updates };
    this.writeFile(SUPPORT_TICKETS_FILE, tickets);
    return tickets[ticketIndex];
  }

  async deleteSupportTicket(id: string): Promise<boolean> {
    const tickets = this.readFile(SUPPORT_TICKETS_FILE);
    const initialLength = tickets.length;
    const filteredTickets = tickets.filter((ticket: any) => ticket.id !== id);
    
    if (filteredTickets.length < initialLength) {
      this.writeFile(SUPPORT_TICKETS_FILE, filteredTickets);
      return true;
    }
    return false;
  }

  // AI Chat Conversation methods
  async getAIChatConversations(): Promise<any[]> {
    return this.readFile(AI_CHAT_CONVERSATIONS_FILE);
  }

  async saveAIChatConversations(conversations: any[]): Promise<void> {
    this.writeFile(AI_CHAT_CONVERSATIONS_FILE, conversations);
  }

  // Inbox message methods
  async getInboxMessages(userId: string): Promise<any[]> {
    const messages = this.readFile(INBOX_MESSAGES_FILE);
    return messages.filter((message: any) => message.userId === userId);
  }

  async addInboxMessage(message: any): Promise<any> {
    const messages = this.readFile(INBOX_MESSAGES_FILE);
    messages.push(message);
    this.writeFile(INBOX_MESSAGES_FILE, messages);
    return message;
  }

  async markInboxMessageAsRead(id: string, userId: string): Promise<boolean> {
    const messages = this.readFile(INBOX_MESSAGES_FILE);
    const messageIndex = messages.findIndex((message: any) => message.id === id && message.userId === userId);
    if (messageIndex !== -1) {
      const message = messages[messageIndex] as any;
      message.is_read = true;
      messages[messageIndex] = message;
      this.writeFile(INBOX_MESSAGES_FILE, messages);
      return true;
    }
    return false;
  }

  async markAllInboxMessagesAsRead(userId: string): Promise<void> {
    const messages = this.readFile(INBOX_MESSAGES_FILE);
    let updated = false;
    messages.forEach((message: any, index: number) => {
      if (message && message.userId === userId && !message.is_read) {
        message.is_read = true;
        messages[index] = message;
        updated = true;
      }
    });
    if (updated) {
      this.writeFile(INBOX_MESSAGES_FILE, messages);
    }
  }

  async deleteInboxMessage(id: string, userId: string): Promise<boolean> {
    const messages = this.readFile(INBOX_MESSAGES_FILE);
    const initialLength = messages.length;
    const filteredMessages = messages.filter((message: any) => !(message.id === id && message.userId === userId));
    
    if (filteredMessages.length < initialLength) {
      this.writeFile(INBOX_MESSAGES_FILE, filteredMessages);
      return true;
    }
    return false;
  }

  // Pending user methods
  async getPendingUserByEmail(email: string): Promise<any> {
    const pendingUsers = this.readFile(PENDING_USERS_FILE);
    return pendingUsers.find((user: any) => user.email === email);
  }

  async createPendingUser(userData: any): Promise<any> {
    const pendingUsers = this.readFile(PENDING_USERS_FILE);
    
    // Create pending user with ID (password should already be hashed by auth service)
    const pendingUser = {
      id: randomUUID(),
      username: userData.username,
      email: userData.email,
      password: userData.password, // Already hashed by auth service
      referralCode: userData.referralCode || null,
      createdAt: new Date().toISOString()
    };
    
    // Remove any existing pending user with same email
    const filteredUsers = pendingUsers.filter((user: any) => user.email !== userData.email);
    filteredUsers.push(pendingUser);
    this.writeFile(PENDING_USERS_FILE, filteredUsers);
    return pendingUser;
  }

  async updatePendingUserCode(email: string, verificationCode: string): Promise<any> {
    const pendingUsers = this.readFile(PENDING_USERS_FILE);
    const userIndex = pendingUsers.findIndex((user: any) => user.email === email);
    if (userIndex === -1) return null;
    
    const userToUpdate = pendingUsers[userIndex] as any;
    userToUpdate.verificationCode = verificationCode;
    userToUpdate.verificationCodeExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours
    pendingUsers[userIndex] = userToUpdate;
    this.writeFile(PENDING_USERS_FILE, pendingUsers);
    return pendingUsers[userIndex];
  }

  async verifyPendingUser(email: string, verificationCode: string): Promise<any> {
    const pendingUsers = this.readFile(PENDING_USERS_FILE);
    const userIndex = pendingUsers.findIndex((user: any) => 
      user.email === email && user.verificationCode === verificationCode
    );
    
    if (userIndex === -1) return null;
    
    const pendingUser = pendingUsers[userIndex] as any;
    
    // Check if verification code is expired
    if (new Date() > new Date(pendingUser.verificationCodeExpires)) {
      return null;
    }
    
    // Move user to verified users
    const users = this.readFile(USERS_FILE);
    const verifiedUser = {
      id: pendingUser.id,
      username: pendingUser.username,
      email: pendingUser.email,
      password: pendingUser.password,
      balance: 0,
      referralCode: this.generateReferralCode(),
      referredBy: pendingUser.referralCode || null,
      isAdmin: false,
      isActive: true,
      isVerified: true,
      createdAt: pendingUser.createdAt
    };
    
    users.push(verifiedUser);
    this.writeFile(USERS_FILE, users);
    
    // Remove from pending users
    const updatedPendingUsers = pendingUsers.filter((user: any) => user.email !== email);
    this.writeFile(PENDING_USERS_FILE, updatedPendingUsers);
    
    return verifiedUser;
  }

  async getUserByReferralCode(referralCode: string): Promise<any> {
    const users = this.readFile(USERS_FILE);
    return users.find((user: any) => user.referralCode === referralCode);
  }

  // Removed duplicate createLoginLog function - using the one below with proper typing

  private generateReferralCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Referral methods
  async getReferralEarnings(userId: string): Promise<any[]> {
    // For now, return empty array as we'll implement earnings tracking later
    return [];
  }

  async getReferredUsers(userId: string): Promise<any[]> {
    const users = this.readFile(USERS_FILE);
    const user = users.find((u: any) => u.id === userId) as any;
    if (!user || !user.referralCode) return [];
    
    return users.filter((u: any) => u && u.referredBy === user.referralCode);
  }

  // Admin utility methods
  async adjustUserBalance(userId: string, amount: number, type: string): Promise<any> {
    const users = this.readFile(USERS_FILE);
    const userIndex = users.findIndex((user: any) => user.id === userId);
    if (userIndex === -1) return undefined;
    
    const user = users[userIndex] as any;
    const currentBalance = user.balance || 0;
    let newBalance: number;
    
    if (type === 'credit') {
      newBalance = currentBalance + amount;
    } else {
      newBalance = Math.max(0, currentBalance - amount);
    }
    
    user.balance = newBalance;
    users[userIndex] = user;
    this.writeFile(USERS_FILE, users);
    return users[userIndex];
  }

  async updateUserBalance(userId: string, newBalance: number): Promise<any> {
    const users = this.readFile(USERS_FILE);
    const userIndex = users.findIndex((user: any) => user.id === userId);
    if (userIndex === -1) return undefined;
    
    const user = users[userIndex] as any;
    user.balance = newBalance;
    users[userIndex] = user;
    this.writeFile(USERS_FILE, users);
    return users[userIndex];
  }

  // Audit log methods
  async logAction(action: any): Promise<void> {
    const logs = this.readFile(LOGS_FILE);
    logs.push(action);
    this.writeFile(LOGS_FILE, logs);
  }

  async getAuditLogs(): Promise<any[]> {
    return this.readFile(LOGS_FILE);
  }

  // Login logs methods
  async createLoginLog(logData: {
    userId?: string;
    username?: string;
    action: 'login' | 'register' | 'visit';
    country?: string;
    timezone?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<any> {
    const logs = this.readFile(LOGIN_LOGS_FILE);
    const newLog = {
      id: randomUUID(),
      ...logData,
      timestamp: new Date().toISOString()
    };
    logs.push(newLog);
    this.writeFile(LOGIN_LOGS_FILE, logs);
    return newLog;
  }

  async getLoginLogs(): Promise<any[]> {
    const logs = this.readFile(LOGIN_LOGS_FILE);
    return logs.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async getLoginLogsByUserId(userId: string): Promise<any[]> {
    const logs = this.readFile(LOGIN_LOGS_FILE);
    return logs.filter((log: any) => log.userId === userId)
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}

export const storage = new FileStorage();