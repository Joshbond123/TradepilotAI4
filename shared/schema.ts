import { z } from "zod";

// Core Types for file-based storage
export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  balance: number;
  referralCode: string;
  referredBy?: string;
  referralEarnings?: number;
  referralCount?: number;
  isAdmin: boolean;
  isActive: boolean;
  isVerified: boolean;
  resetCode?: string;
  resetCodeExpires?: string;
  country?: string;
  timezone?: string;
  createdAt: string;
}

export interface PendingUser {
  id: string;
  username: string;
  email: string;
  password: string;
  referralCode?: string;
  verificationCode: string;
  verificationCodeExpires: string;
  createdAt: string;
}

export interface InvestmentPlan {
  id: string;
  name: string;
  description: string;
  profit_percentage: number;
  duration_days: number;
  min_deposit: number;
  max_deposit: number;
  features: string[];
  active: boolean;
  created_at: string;
}

export interface UserInvestment {
  id: string;
  userId: string;
  planId: string;
  amount: number;
  daily_return: number;
  total_earned: number;
  days_remaining: number;
  is_active: boolean;
  created_at: string;
  plan_name: string;
}

export interface Deposit {
  id: string;
  userId: string;
  cryptocurrency: string;
  amount: number;
  usd_value: number;
  wallet_address: string;
  tx_hash?: string;
  confirmations: number;
  required_confirmations: number;
  status: "pending" | "confirmed" | "failed";
  isAdminDeposit?: boolean;
  admin_notes?: string;
  created_at: string;
}

export interface Withdrawal {
  id: string;
  userId: string;
  cryptocurrency: string;
  amount: number;
  usd_value: number;
  wallet_address: string;
  network_fee: number;
  status: "pending" | "approved" | "rejected" | "completed";
  admin_notes?: string;
  created_at: string;
  processed_at?: string;
}

export interface Message {
  id: string;
  userId?: string; // null for system-wide messages
  title: string;
  content: string;
  type: "info" | "success" | "warning" | "error";
  is_read: boolean;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: "open" | "replied" | "closed";
  admin_reply?: string;
  priority: "low" | "medium" | "high";
  created_at: string;
  updated_at: string;
}

export interface ReferralEarning {
  id: string;
  userId: string;
  referred_user_id: string;
  amount: number;
  type: "deposit" | "investment";
  created_at: string;
}

// AI Chat related types  
export interface AIChatMessage {
  id: string;
  userId: string;
  message: string;
  isAI: boolean;
  created_at: string;
}

export interface AIChatConversation {
  userId: string;
  messages: AIChatMessage[];
  last_activity: string;
}

// Chat and Support related types (legacy - will be removed)
export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  isAI: boolean;
  created_at: string;
}

export interface ChatUser {
  id: string;
  username: string;
  isOnline: boolean;
  isTyping: boolean;
  lastActivity: string;
}

export interface InboxMessage {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: "welcome" | "support_reply" | "system" | "notification";
  is_read: boolean;
  ticket_id?: string;
  created_at: string;
}

export interface ArbitrageOpportunity {
  id: string;
  coin_symbol: string;
  coin_name: string;
  buy_exchange: string;
  sell_exchange: string;
  buy_price: number;
  sell_price: number;
  profit_percentage: number;
  volume_24h: number;
  last_updated: string;
}

// System Settings interface
export interface SystemSettings {
  wallets: {
    btc: {
      address: string;
      qr_code?: string;
      qrCode?: string;
      active: boolean;
    };
    eth: {
      address: string;
      qr_code?: string;
      qrCode?: string;
      active: boolean;
    };
    usdt: {
      address: string;
      qr_code?: string;
      qrCode?: string;
      active: boolean;
    };
  };
  withdrawal_limits: {
    min_withdrawal: number;
    max_daily_withdrawal: number;
    processing_time_hours: number;
  };
  system: {
    maintenance_mode: boolean;
    global_profit_multiplier: number;
    referral_bonus_percentage: number;
    arbitrage_refresh_rate: number;
  };
  ai_chat: {
    enabled: boolean;
    personality: string;
    api_keys: {
      reply_keys: {
        id: string;
        name: string;
        key: string;
        status: 'active' | 'inactive' | 'failed';
        usage_count: number;
        last_used: string | null;
        created_at: string;
      }[];
      summary_keys: {
        id: string;
        name: string;
        key: string;
        status: 'active' | 'inactive' | 'failed';
        usage_count: number;
        last_used: string | null;
        created_at: string;
      }[];
      current_reply_index: number;
      current_summary_index: number;
    };
  };
  recaptcha: {
    enabled: boolean;
    site_key: string;
    secret_key: string;
  };
  depositSettings: {
    BTC: {
      minDeposit: string;
      confirmations: number;
    };
    ETH: {
      minDeposit: string;
      confirmations: number;
    };
    USDT: {
      minDeposit: string;
      confirmations: number;
    };
  };
}

// Validation Schemas
export const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(20),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  referralCode: z.string().optional(),
  country: z.string().optional(),
  recaptchaToken: z.string().optional(),
});

export const verifyAccountSchema = z.object({
  email: z.string().email("Invalid email address"),
  verificationCode: z.string().length(5, "Verification code must be 5 digits"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  resetCode: z.string().length(5, "Reset code must be 5 digits"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export const resendVerificationSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  recaptchaToken: z.string().optional(),
});

export const depositSchema = z.object({
  cryptocurrency: z.enum(["BTC", "ETH", "USDT"]),
  amount: z.number().min(0.0001, "Amount must be greater than 0"),
  tx_hash: z.string().optional(),
});

export const withdrawalSchema = z.object({
  cryptocurrency: z.string(),
  amount: z.string().optional(),
  usdValue: z.string(),
  walletAddress: z.string().min(10, "Invalid wallet address"),
  networkFee: z.string().optional(),
}).transform((data) => ({
  cryptocurrency: data.cryptocurrency,
  amount: parseFloat(data.usdValue),
  wallet_address: data.walletAddress,
  network_fee: parseFloat(data.networkFee || "0"),
}));

// Admin withdrawal approval schema
export const withdrawalApprovalSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  admin_notes: z.string().optional(),
});

// Admin balance adjustment schema
export const balanceAdjustmentSchema = z.object({
  userId: z.string(),
  amount: z.number(),
  type: z.enum(["add", "subtract"]),
  notes: z.string().optional(),
});

// Profile update schemas
export const profileUpdateSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(20),
  email: z.string().email("Invalid email address"),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export const investmentSchema = z.object({
  planId: z.string().min(1, "Plan selection is required"),
  amount: z.number().min(50, "Minimum investment is $50"),
});

export const messageSchema = z.object({
  userId: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  type: z.enum(["info", "success", "warning", "error"]).optional(),
});

export const supportTicketSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  priority: z.enum(["low", "medium", "high"]).optional().default("medium"),
});

export const planSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  description: z.string().min(1, "Description is required"),
  profit_percentage: z.number().min(0.1).max(50),
  duration_days: z.number().min(1).max(365),
  min_deposit: z.number().min(1),
  max_deposit: z.number().min(1),
  features: z.array(z.string()),
});

// Insert Types
export type RegisterData = z.infer<typeof registerSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type DepositData = z.infer<typeof depositSchema>;
export type WithdrawalData = z.infer<typeof withdrawalSchema>;
export type InvestmentData = z.infer<typeof investmentSchema>;
export type MessageData = z.infer<typeof messageSchema>;
export type SupportTicketData = z.infer<typeof supportTicketSchema>;
export type PlanData = z.infer<typeof planSchema>;

// Admin access schema
export const adminAccessSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

// Admin user management schemas
export const userUpdateSchema = z.object({
  balance: z.number().optional(),
  isActive: z.boolean().optional(),
  isAdmin: z.boolean().optional(),
});

export const systemSettingsUpdateSchema = z.object({
  system: z.object({
    maintenance_mode: z.boolean().optional(),
    global_profit_multiplier: z.number().optional(),
    referral_bonus_percentage: z.number().min(0).max(100).optional(),
    arbitrage_refresh_rate: z.number().optional(),
  }).optional(),
  ai_chat: z.object({
    enabled: z.boolean().optional(),
    personality: z.string().optional(),
  }).optional(),
  withdrawal_limits: z.object({
    min_withdrawal: z.number().min(1).optional(),
    max_daily_withdrawal: z.number().optional(),
    processing_time_hours: z.number().optional(),
  }).optional(),
});

// AI Chat schemas
export const aiChatMessageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").max(500, "Message too long"),
});

export const aiPersonalityUpdateSchema = z.object({
  personality: z.string().min(10, "Personality description must be at least 10 characters"),
});

// API Key Management schemas
export const apiKeyCreateSchema = z.object({
  name: z.string().min(1, "API key name is required").max(50, "Name too long"),
  key: z.string().min(10, "Invalid API key format"),
  type: z.enum(["reply", "summary"]),
});

export const apiKeyUpdateSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "API key name is required").max(50, "Name too long").optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export const apiKeyDeleteSchema = z.object({
  id: z.string(),
  type: z.enum(["reply", "summary"]),
});

// Chat and Inbox schemas
export const chatMessageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").max(500, "Message too long"),
});

export const inboxMessageSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  type: z.enum(["welcome", "support_reply", "system", "notification"]),
  ticket_id: z.string().optional(),
});

// AI Chat types
export type AIChatMessageData = z.infer<typeof aiChatMessageSchema>;
export type AIPersonalityUpdateData = z.infer<typeof aiPersonalityUpdateSchema>;

// API Key Management types
export type APIKeyCreateData = z.infer<typeof apiKeyCreateSchema>;
export type APIKeyUpdateData = z.infer<typeof apiKeyUpdateSchema>;
export type APIKeyDeleteData = z.infer<typeof apiKeyDeleteSchema>;

// Chat and Inbox types
export type ChatMessageData = z.infer<typeof chatMessageSchema>;
export type InboxMessageData = z.infer<typeof inboxMessageSchema>;

export type AdminAccessData = z.infer<typeof adminAccessSchema>;
export type UserUpdateData = z.infer<typeof userUpdateSchema>;
export type SystemSettingsUpdateData = z.infer<typeof systemSettingsUpdateSchema>;
export type VerifyAccountData = z.infer<typeof verifyAccountSchema>;
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
export type ResendVerificationData = z.infer<typeof resendVerificationSchema>;
export type WithdrawalApprovalData = z.infer<typeof withdrawalApprovalSchema>;
export type BalanceAdjustmentData = z.infer<typeof balanceAdjustmentSchema>;