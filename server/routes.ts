import express, { type Express } from "express";
import { createServer, type Server } from "http";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { AuthService } from "./services/auth-service";
import { CryptoService } from "./services/crypto-service";
import { InvestmentService } from "./services/investment-service";
import { ChatService } from "./services/chat-service";
import { LocationService } from "./services/location-service";
import { AIChatService } from "./services/ai-chat-service";
import { CallMeBotService } from "./services/callmebot-service";
import { authenticateToken, requireAdmin, type AuthenticatedRequest } from "./middleware/auth";
import { 
  registerSchema, 
  loginSchema, 
  withdrawalSchema, 
  supportTicketSchema, 
  messageSchema, 
  planSchema,
  depositSchema,
  investmentSchema,
  adminAccessSchema,
  userUpdateSchema,
  systemSettingsUpdateSchema,
  verifyAccountSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendVerificationSchema,
  withdrawalApprovalSchema,
  balanceAdjustmentSchema,
  profileUpdateSchema,
  passwordChangeSchema,
  chatMessageSchema,
  inboxMessageSchema,
  aiChatMessageSchema,
  aiPersonalityUpdateSchema,
  apiKeyCreateSchema,
  apiKeyUpdateSchema,
  apiKeyDeleteSchema
} from "@shared/schema";
import { ZodError } from "zod";
import geoip from "geoip-lite";

const JWT_SECRET = process.env.JWT_SECRET || "tradepilot-secret-key";

// Configure multer for QR code uploads
const uploadDir = path.join(process.cwd(), "uploads", "qr-codes");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for logo uploads
const logoUploadDir = path.join(process.cwd(), "uploads", "logos");
if (!fs.existsSync(logoUploadDir)) {
  fs.mkdirSync(logoUploadDir, { recursive: true });
}

const storage_multer = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${req.body.cryptocurrency}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage_multer,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Logo upload configuration
const logoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, logoUploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `logo-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const logoUpload = multer({ 
  storage: logoStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve static files from uploads directory
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
  
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = registerSchema.parse(req.body);
      const result = await AuthService.register(userData);
      
      // Log registration activity - extract real client IP
      const userIP = LocationService.extractRealClientIP(req);
      const country = await LocationService.detectUserCountry(userIP);

      await storage.createLoginLog({
        username: userData.username,
        action: 'register',
        country: country,
        ipAddress: userIP,
        userAgent: req.headers['user-agent'] || 'Unknown'
      });

      // Send CallMeBot notification for new registration
      await CallMeBotService.sendNewRegistrationNotification(userData.username, country);
      
      res.json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(400).json({ message: error instanceof Error ? error.message : "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const loginData = loginSchema.parse(req.body);
      const result = await AuthService.login(loginData);
      
      // Detect user country and timezone after successful login
      const userIP = LocationService.extractRealClientIP(req);
      const country = await LocationService.detectUserCountry(userIP);
      
      // Map countries to common timezones based on country names
      let timezone = 'America/New_York';
      if (country !== 'Unknown') {
        // Map countries to common timezones based on country names
        const countryTimezones: { [key: string]: string } = {
          'United States': 'America/New_York',
          'Canada': 'America/Toronto', 
          'United Kingdom': 'Europe/London',
          'Germany': 'Europe/Berlin',
          'France': 'Europe/Paris',
          'Japan': 'Asia/Tokyo',
          'Australia': 'Australia/Sydney',
          'India': 'Asia/Kolkata',
          'Nigeria': 'Africa/Lagos',
          'Kenya': 'Africa/Nairobi',
          'South Africa': 'Africa/Johannesburg',
          'Brazil': 'America/Sao_Paulo',
          'Mexico': 'America/Mexico_City'
        };
        timezone = countryTimezones[country] || 'America/New_York';
      }
      
      // Update user with country and timezone info
      await storage.updateUser(result.user.id, { country, timezone });
      // Add country and timezone to the response
      (result.user as any).country = country;
      (result.user as any).timezone = timezone;

      // Log login activity
      await storage.createLoginLog({
        userId: result.user.id,
        username: result.user.username,
        action: 'login',
        country: country,
        timezone: timezone,
        ipAddress: userIP,
        userAgent: req.headers['user-agent'] || 'Unknown'
      });

      // Send CallMeBot notification for user login
      await CallMeBotService.sendUserLoginNotification(result.user.username, country);
      
      res.json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(401).json({ message: error instanceof Error ? error.message : "Login failed" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Log website visit activity
      const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
      let userIP = '';
      if (typeof clientIP === 'string') {
        userIP = clientIP.split(',')[0].trim();
      } else if (Array.isArray(clientIP)) {
        userIP = clientIP[0];
      }

      await storage.createLoginLog({
        userId: user.id,
        username: user.username,
        action: 'visit',
        country: (user as any).country || 'Unknown',
        timezone: (user as any).timezone,
        ipAddress: userIP,
        userAgent: req.headers['user-agent'] || 'Unknown'
      });
      
      // Remove password from response
      const { password, ...userResponse } = user;
      res.json(userResponse);
    } catch (error) {
      res.status(404).json({ message: "User not found" });
    }
  });

  // Country detection endpoint
  app.get("/api/detect-country", async (req, res) => {
    try {
      const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
      let userIP = '';
      
      if (typeof clientIP === 'string') {
        userIP = clientIP.split(',')[0].trim();
      } else if (Array.isArray(clientIP)) {
        userIP = clientIP[0];
      }
      
      // Handle localhost development
      if (userIP === '::1' || userIP === '127.0.0.1' || userIP.includes('localhost')) {
        return res.json({ country: 'US', city: 'Development' });
      }
      
      const geo = geoip.lookup(userIP);
      const country = geo?.country || 'Unknown';
      const city = geo?.city || 'Unknown';
      
      res.json({ country, city, ip: userIP });
    } catch (error) {
      console.error('Country detection error:', error);
      res.json({ country: 'Unknown', city: 'Unknown' });
    }
  });

  // Profile update route
  app.patch("/api/auth/profile", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const profileData = profileUpdateSchema.parse(req.body);
      
      // Check if username is already taken by another user
      const existingUsername = await storage.getUserByUsername(profileData.username);
      if (existingUsername && existingUsername.id !== req.user!.id) {
        return res.status(400).json({ message: "Username already taken" });
      }

      // Check if email is already taken by another user
      const existingEmail = await storage.getUserByEmail(profileData.email);
      if (existingEmail && existingEmail.id !== req.user!.id) {
        return res.status(400).json({ message: "Email already taken" });
      }

      const updatedUser = await storage.updateUser(req.user!.id, {
        username: profileData.username,
        email: profileData.email,
      });

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Remove password from response
      const { password, ...userResponse } = updatedUser;
      res.json(userResponse);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Password change route
  app.patch("/api/auth/password", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const passwordData = passwordChangeSchema.parse(req.body);
      
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify current password
      const isValidPassword = await AuthService.verifyPassword(user.password, passwordData.currentPassword);
      if (!isValidPassword) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      // Hash new password and update
      const hashedPassword = await AuthService.hashPassword(passwordData.newPassword);
      await storage.updateUser(req.user!.id, { password: hashedPassword });

      res.json({ message: "Password changed successfully" });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  // Email verification routes
  app.post("/api/auth/verify", async (req, res) => {
    try {
      const verifyData = verifyAccountSchema.parse(req.body);
      // Get the origin from the request to ensure email redirects to correct domain
      const requestOrigin = `${req.protocol}://${req.get('host')}`;
      const result = await AuthService.verifyAccount(verifyData, requestOrigin);
      res.json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(400).json({ message: error instanceof Error ? error.message : "Verification failed" });
    }
  });

  app.post("/api/auth/resend-verification", async (req, res) => {
    try {
      const { email } = resendVerificationSchema.parse(req.body);
      const result = await AuthService.resendVerificationCode(email);
      res.json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to resend verification code" });
    }
  });

  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const forgotData = forgotPasswordSchema.parse(req.body);
      const result = await AuthService.forgotPassword(forgotData);
      res.json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to send reset code" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const resetData = resetPasswordSchema.parse(req.body);
      const result = await AuthService.resetPassword(resetData);
      res.json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(400).json({ message: error instanceof Error ? error.message : "Password reset failed" });
    }
  });

  // Admin access route (hidden)
  app.post("/api/admin/access", async (req, res) => {
    try {
      const { password } = adminAccessSchema.parse(req.body);
      const adminPassword = process.env.ADMIN_PASSWORD || "joshbond";
      
      if (password === adminPassword) {
        // Create a special admin token
        const adminToken = jwt.sign(
          { userId: 'admin', isAdmin: true }, 
          JWT_SECRET, 
          { expiresIn: '7d' }
        );
        
        res.json({ 
          success: true, 
          message: "Admin access granted",
          token: adminToken,
          user: {
            id: 'admin',
            username: 'Administrator',
            email: 'admin@tradepilot.com',
            isAdmin: true
          }
        });
      } else {
        // Log failed attempt
        console.log(`Failed admin access attempt at ${new Date().toISOString()}`);
        res.status(403).json({ success: false, message: "Access Denied" });
      }
    } catch (error) {
      res.status(400).json({ success: false, message: "Invalid request" });
    }
  });

  // Public reCAPTCHA settings route
  app.get("/api/auth/recaptcha-settings", async (req, res) => {
    try {
      const settings = await storage.getSystemSettings();
      const recaptchaSettings = settings?.recaptcha;
      
      res.json({
        enabled: recaptchaSettings?.enabled || false,
        siteKey: recaptchaSettings?.site_key || "",
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reCAPTCHA settings" });
    }
  });

  // Crypto routes
  app.get("/api/crypto/prices", async (req, res) => {
    try {
      const prices = await CryptoService.getCryptoPrices();
      res.json(prices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch crypto prices" });
    }
  });

  app.get("/api/crypto/arbitrage", async (req, res) => {
    try {
      const opportunities = await CryptoService.getArbitrageOpportunities();
      res.json(opportunities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch arbitrage opportunities" });
    }
  });

  // Investment plan routes
  app.get("/api/plans", async (req, res) => {
    try {
      const plans = await storage.getInvestmentPlans();
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch investment plans" });
    }
  });

  // Admin plan management
  app.put("/api/admin/plans/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const planData = req.body;
      
      const plans = await storage.getInvestmentPlans();
      const planIndex = plans.findIndex(p => p.id === id);
      
      if (planIndex === -1) {
        return res.status(404).json({ message: "Plan not found" });
      }
      
      plans[planIndex] = { ...plans[planIndex], ...planData };
      await storage.updateInvestmentPlans(plans);
      
      res.json({ success: true, plan: plans[planIndex] });
    } catch (error) {
      res.status(500).json({ message: "Failed to update plan" });
    }
  });

  // Wallet management routes
  app.get("/api/system/wallets", async (req, res) => {
    try {
      const settings = await storage.getSystemSettings();
      
      // Initialize wallets object if it doesn't exist
      if (!settings.wallets) {
        settings.wallets = {};
      }
      
      // Initialize individual wallet objects if they don't exist
      if (!settings.wallets.btc) {
        settings.wallets.btc = { address: "", qr_code: "" };
      }
      if (!settings.wallets.eth) {
        settings.wallets.eth = { address: "", qr_code: "" };
      }
      if (!settings.wallets.usdt) {
        settings.wallets.usdt = { address: "", qr_code: "" };
      }
      
      res.json({
        BTC: {
          address: settings.wallets.btc.address || "",
          qrCode: settings.wallets.btc.qrCode || settings.wallets.btc.qr_code || ""
        },
        ETH: {
          address: settings.wallets.eth.address || "",
          qrCode: settings.wallets.eth.qrCode || settings.wallets.eth.qr_code || ""
        },
        USDT: {
          address: settings.wallets.usdt.address || "",
          qrCode: settings.wallets.usdt.qrCode || settings.wallets.usdt.qr_code || ""
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wallets" });
    }
  });

  app.put("/api/admin/wallets", async (req, res) => {
    try {
      const { cryptocurrency, address, qrCode } = req.body;
      
      const settings = await storage.getSystemSettings();
      const crypto = cryptocurrency.toLowerCase() as 'btc' | 'eth' | 'usdt';
      
      if (settings.wallets?.[crypto]) {
        const currentWallet = settings.wallets[crypto];
        const walletUpdate = {
          wallets: {
            [crypto]: {
              ...currentWallet,
              address,
              ...(qrCode && { qrCode, qr_code: qrCode }) // Support both field names
            }
          }
        };
        await storage.updateSystemSettings(walletUpdate);
      }
      
      res.json({ 
        success: true, 
        message: `${cryptocurrency} wallet updated successfully`,
        wallet: { cryptocurrency, address, qrCode }
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to update wallet" });
    }
  });

  app.post("/api/investments", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const investmentData = investmentSchema.parse(req.body);
      
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const plan = await storage.getInvestmentPlan(investmentData.planId);
      if (!plan || !plan.active) {
        return res.status(404).json({ message: "Investment plan not found or inactive" });
      }

      if (investmentData.amount < plan.min_deposit) {
        return res.status(400).json({ message: `Minimum investment is $${plan.min_deposit}` });
      }

      if (investmentData.amount > plan.max_deposit) {
        return res.status(400).json({ message: `Maximum investment is $${plan.max_deposit}` });
      }

      if (user.balance < investmentData.amount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      // Deduct investment amount from user's balance
      const newBalance = user.balance - investmentData.amount;
      await storage.updateUser(req.user!.id, { balance: newBalance });

      // Calculate daily return: investment_amount * daily_profit_percentage / 100
      const dailyReturn = (investmentData.amount * plan.profit_percentage / 100);

      // Create complete investment record with all required fields
      const fullInvestmentData = {
        id: randomUUID(),
        planId: investmentData.planId,
        amount: investmentData.amount,
        daily_return: dailyReturn,
        total_earned: 0,
        days_remaining: plan.duration_days,
        is_active: true,
        created_at: new Date().toISOString(),
        plan_name: plan.name,
        plan_profit_percentage: plan.profit_percentage,
      };

      const investment = await storage.createUserInvestment(fullInvestmentData, req.user!.id);
      res.json(investment);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create investment" });
    }
  });

  // User investment routes
  app.get("/api/investments", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const investments = await storage.getUserInvestments(req.user!.id);
      
      // Enrich investment data with plan details if missing
      const enrichedInvestments = await Promise.all(
        investments.map(async (investment: any) => {
          if (!investment.plan_profit_percentage && investment.planId) {
            const plan = await storage.getInvestmentPlan(investment.planId);
            if (plan) {
              investment.plan_profit_percentage = plan.profit_percentage;
            }
          }
          return investment;
        })
      );
      
      res.json(enrichedInvestments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch investments" });
    }
  });

  // Manual daily returns processing (for testing and demo purposes)
  app.post("/api/investments/process-returns", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      console.log("Manual daily returns processing triggered by admin");
      await InvestmentService.processDailyReturns(); // Use the main function instead
      const result = await InvestmentService.processDailyReturnsNow();
      res.json({
        message: `Successfully processed ${result.processed} investments`,
        processed: result.processed,
        totalCredited: result.totalCredited
      });
    } catch (error) {
      console.error("Error in manual returns processing:", error);
      res.status(500).json({ message: "Failed to process daily returns" });
    }
  });

  // Test timezone-based profit distribution
  app.post("/api/investments/test-timezone-profits", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      console.log("Manual timezone-based profit processing triggered by admin");
      await InvestmentService.processReturnsForLocalTime();
      res.json({
        message: "Successfully tested timezone-based profit distribution - check console logs"
      });
    } catch (error) {
      console.error("Error in timezone-based returns processing:", error);
      res.status(500).json({ message: "Failed to process timezone-based returns" });
    }
  });

  // Deposit routes
  app.get("/api/deposits", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const deposits = await storage.getUserDeposits(req.user!.id);
      res.json(deposits);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch deposits" });
    }
  });

  app.post("/api/deposits", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const depositData = depositSchema.parse(req.body);
      const deposit = await storage.createDeposit(depositData, req.user!.id);
      res.json(deposit);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create deposit" });
    }
  });

  app.get("/api/system/wallets", async (req, res) => {
    try {
      const settings = await storage.getSystemSettings();
      
      // Initialize wallets object if it doesn't exist
      if (!settings.wallets) {
        settings.wallets = {};
      }
      
      // Initialize individual wallet objects if they don't exist
      if (!settings.wallets.btc) {
        settings.wallets.btc = { address: "", qr_code: "" };
      }
      if (!settings.wallets.eth) {
        settings.wallets.eth = { address: "", qr_code: "" };
      }
      if (!settings.wallets.usdt) {
        settings.wallets.usdt = { address: "", qr_code: "" };
      }
      
      res.json({
        BTC: {
          address: settings.wallets.btc.address || "",
          qrCode: settings.wallets.btc.qrCode || settings.wallets.btc.qr_code || ""
        },
        ETH: {
          address: settings.wallets.eth.address || "",
          qrCode: settings.wallets.eth.qrCode || settings.wallets.eth.qr_code || ""
        },
        USDT: {
          address: settings.wallets.usdt.address || "",
          qrCode: settings.wallets.usdt.qrCode || settings.wallets.usdt.qr_code || ""
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wallet addresses" });
    }
  });

  // Withdrawal routes
  app.get("/api/withdrawals", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const withdrawals = await storage.getUserWithdrawals(req.user!.id);
      res.json(withdrawals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch withdrawals" });
    }
  });

  // Get all withdrawals (admin only)
  app.get("/api/admin/withdrawals", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const withdrawals = await storage.getAllWithdrawals();
      
      // Add user information to each withdrawal
      const withdrawalsWithUsers = await Promise.all(
        withdrawals.map(async (withdrawal) => {
          const user = await storage.getUser(withdrawal.userId);
          return {
            ...withdrawal,
            user: user ? {
              id: user.id,
              username: user.username,
              email: user.email,
              country: user.country
            } : null
          };
        })
      );
      
      res.json(withdrawalsWithUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch withdrawals" });
    }
  });

  app.post("/api/withdrawals", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const withdrawalData = withdrawalSchema.parse(req.body);
      
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const settings = await storage.getSystemSettings();
      const minWithdrawal = settings.depositSettings?.min_withdrawal || settings.withdrawal_limits?.min_withdrawal || 10;

      if (withdrawalData.amount < minWithdrawal) {
        return res.status(400).json({ message: `Minimum withdrawal is $${minWithdrawal}` });
      }

      if (user.balance < withdrawalData.amount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      // Note: Balance is NOT deducted here - only after admin approval
      const withdrawal = await storage.createWithdrawal(withdrawalData, req.user!.id);
      
      // Send CallMeBot notification for withdrawal request
      try {
        const notificationSent = await CallMeBotService.sendWithdrawalRequestNotification(
          user.username, 
          withdrawalData.amount, 
          withdrawalData.cryptocurrency, 
          withdrawalData.wallet_address
        );
        if (notificationSent) {
          console.log(`CallMeBot notification sent successfully: withdrawal_request for ${user.username}`);
        } else {
          console.log(`CallMeBot notification failed or disabled: withdrawal_request for ${user.username}`);
        }
      } catch (error) {
        console.error('Error sending withdrawal notification:', error);
      }
      
      res.json(withdrawal);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create withdrawal request" });
    }
  });

  // Message routes
  app.get("/api/messages", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const messages = await storage.getUserMessages(req.user!.id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.patch("/api/messages/:id/read", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      await storage.markMessageAsRead(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  app.patch("/api/messages/mark-all-read", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      await storage.markAllMessagesAsRead(req.user!.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark all messages as read" });
    }
  });

  // Support ticket routes
  app.get("/api/support-tickets", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const tickets = await storage.getUserSupportTickets(req.user!.id);
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch support tickets" });
    }
  });

  app.post("/api/support-tickets", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const ticketData = supportTicketSchema.parse(req.body);
      const ticket = await storage.createSupportTicket(ticketData, req.user!.id);
      
      // Get user info for notification
      const user = await storage.getUser(req.user!.id);
      if (user) {
        // Send CallMeBot notification for new support ticket
        await CallMeBotService.sendSupportTicketNotification(
          user.username, 
          ticketData.subject, 
          ticketData.priority || 'Medium'
        );
      }
      
      res.json(ticket);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create support ticket" });
    }
  });

  // Referral routes
  app.get("/api/referrals", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const [earnings, referredUsers] = await Promise.all([
        storage.getReferralEarnings(req.user!.id),
        storage.getReferredUsers(req.user!.id),
      ]);

      const totalEarnings = earnings.reduce((sum, earning) => sum + earning.amount, 0);

      const user = await storage.getUser(req.user!.id);

      res.json({
        referralCode: user?.referralCode,
        earnings,
        referredUsers: referredUsers.map(user => ({
          id: user.id,
          username: user.username,
          createdAt: user.createdAt,
        })),
        totalEarnings,
        totalReferrals: referredUsers.length,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch referral data" });
    }
  });

  // ADMIN ROUTES
  
  // Admin withdrawal management
  app.get("/api/admin/withdrawals", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const withdrawals = await storage.getAllWithdrawals();
      res.json(withdrawals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch withdrawals" });
    }
  });

  app.patch("/api/admin/withdrawals/:id", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const approvalData = withdrawalApprovalSchema.parse(req.body);
      
      const withdrawal = await storage.approveWithdrawal(id, approvalData.admin_notes);
      res.json(withdrawal);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to process withdrawal" });
    }
  });

  // Admin balance adjustment
  app.post("/api/admin/balance-adjust", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const adjustmentData = balanceAdjustmentSchema.parse(req.body);
      const result = await storage.adjustUserBalance(adjustmentData.userId, adjustmentData.amount, adjustmentData.type);
      res.json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to adjust balance" });
    }
  });
  
  // Admin Dashboard Stats
  app.get("/api/admin/stats", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const [allUsers, allDeposits, allWithdrawals, allInvestments] = await Promise.all([
        storage.getAllUsers(),
        storage.getAllDeposits(),
        storage.getAllWithdrawals(),
        storage.getAllInvestments(),
      ]);
      
      const totalUsers = allUsers.length;
      const totalDeposits = allDeposits.length;
      const totalWithdrawals = allWithdrawals.length;
      const activeInvestments = allInvestments.filter((inv: any) => inv.is_active).length;

      res.json({
        totalUsers,
        totalDeposits,
        totalWithdrawals,
        activeInvestments,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  // Admin withdrawal management routes
  app.post("/api/admin/withdrawals/:id/approve", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { status, admin_notes } = req.body;
      
      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be 'approved' or 'rejected'" });
      }
      
      let withdrawal;
      if (status === 'approved') {
        withdrawal = await storage.approveWithdrawal(id, admin_notes);
      } else {
        withdrawal = await storage.updateWithdrawal(id, { status, admin_notes });
      }
      
      if (!withdrawal) {
        return res.status(404).json({ message: "Withdrawal not found" });
      }
      
      res.json({ success: true, withdrawal });
    } catch (error) {
      res.status(500).json({ message: "Failed to process withdrawal approval" });
    }
  });

  // Admin balance adjustment routes
  app.post("/api/admin/users/:id/balance", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { amount, type, notes } = req.body;
      
      if (!["add", "subtract"].includes(type)) {
        return res.status(400).json({ message: "Invalid type. Must be 'add' or 'subtract'" });
      }
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Amount must be a positive number" });
      }
      
      const user = await storage.adjustUserBalance(id, amount, type === 'add' ? 'credit' : 'debit');
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // If adding balance, create a deposit record
      if (type === 'add') {
        const deposit = {
          id: `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          amount: amount,
          status: 'approved',
          type: 'admin_credit',
          notes: notes || 'Admin balance adjustment',
          created_at: new Date().toISOString(),
          approved_at: new Date().toISOString(),
          admin_id: req.user.userId
        };
        await storage.createDeposit(deposit, id);
        
        // Check if user was referred and handle referral bonus
        if (user.referredBy) {
          const referrer = await storage.getUserByReferralCode(user.referredBy);
          if (referrer) {
            const referralBonus = amount * 0.10; // 10% bonus
            await storage.adjustUserBalance(referrer.id, referralBonus, 'credit');
            
            // Create deposit record for referral bonus
            const bonusDeposit = {
              id: `referral_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              amount: referralBonus,
              status: 'approved',
              type: 'referral_bonus',
              notes: `10% referral bonus from ${user.username}'s deposit of $${amount}`,
              created_at: new Date().toISOString(),
              approved_at: new Date().toISOString(),
              admin_id: req.user.userId
            };
            await storage.createDeposit(bonusDeposit, referrer.id);
          }
        }
      }
      
      res.json({ success: true, user });
    } catch (error) {
      res.status(500).json({ message: "Failed to adjust user balance" });
    }
  });

  // Admin Login Logs
  app.get("/api/admin/login-logs", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const logs = await storage.getLoginLogs();
      // Return only the 10 most recent activities with full country names
      const recentLogs = logs.slice(-10).reverse().map((log: any) => ({
        ...log,
        country: LocationService.getCountryName(log.country || 'Unknown')
      }));
      res.json(recentLogs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch login logs" });
    }
  });

  app.get("/api/admin/login-logs/:userId", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const logs = await storage.getLoginLogsByUserId(req.params.userId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user login logs" });
    }
  });

  // Admin User Management
  app.get("/api/admin/users", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        balance: user.balance,
        isActive: user.isActive,
        isAdmin: user.isAdmin,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        createdAt: user.createdAt,
      })));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Get user investments for admin
  app.get("/api/admin/investments", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { userId } = req.query;
      if (userId) {
        const investments = await storage.getUserInvestments(userId as string);
        res.json(investments);
      } else {
        const allInvestments = await storage.getAllInvestments();
        res.json(allInvestments);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch investments" });
    }
  });

  // Get referral data for specific user (admin)
  app.get("/api/admin/referrals", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { userId } = req.query;
      if (userId) {
        const referredUsers = await storage.getReferredUsers(userId as string);
        const earnings = await storage.getReferralEarnings(userId as string);
        const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
        
        res.json({
          totalReferrals: referredUsers.length,
          totalEarnings,
          referredUsers: referredUsers.map(user => ({
            id: user.id,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt,
            balance: user.balance,
          })),
          earnings
        });
      } else {
        const allUsers = await storage.getAllUsers();
        const referralData = allUsers.filter(user => user.referredBy).map(user => ({
          id: user.id,
          username: user.username,
          email: user.email,
          referredBy: user.referredBy,
          createdAt: user.createdAt,
          balance: user.balance,
        }));
        res.json(referralData);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch referral data" });
    }
  });

  // Logo management routes
  app.get("/api/admin/logo-settings", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const settings = await storage.getSystemSettings();
      const logoSettings = settings.logo || {};
      res.json(logoSettings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch logo settings" });
    }
  });

  app.post("/api/admin/upload-logo", authenticateToken, requireAdmin, logoUpload.single('logo'), async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No logo file provided" });
      }

      const logoUrl = `/uploads/logos/${req.file.filename}`;
      const logoName = req.file.originalname;

      // Update system settings with new logo using partial update
      const logoUpdate = {
        logo: {
          logoUrl,
          logoName,
          uploadedAt: new Date().toISOString()
        }
      };

      await storage.updateSystemSettings(logoUpdate);

      res.json({
        message: "Logo uploaded successfully",
        logoUrl,
        logoName,
        uploadedAt: logoUpdate.logo.uploadedAt
      });
    } catch (error) {
      console.error("Logo upload error:", error);
      res.status(500).json({ message: "Failed to upload logo" });
    }
  });

  app.delete("/api/admin/delete-logo", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const settings = await storage.getSystemSettings();
      
      if (settings.logo?.logoUrl) {
        // Delete the physical file
        const logoPath = path.join(process.cwd(), settings.logo.logoUrl);
        try {
          if (fs.existsSync(logoPath)) {
            fs.unlinkSync(logoPath);
          }
        } catch (fileError) {
          console.warn("Could not delete logo file:", fileError);
        }

        // Remove logo from settings using partial update
        await storage.updateSystemSettings({ logo: null });
      }

      res.json({ message: "Logo deleted successfully" });
    } catch (error) {
      console.error("Logo delete error:", error);
      res.status(500).json({ message: "Failed to delete logo" });
    }
  });

  // Public logo endpoint
  app.get("/api/logo", async (req, res) => {
    try {
      const settings = await storage.getSystemSettings();
      const logoSettings = settings.logo || {};
      res.json(logoSettings);
    } catch (error) {
      res.json({}); // Return empty if no logo settings
    }
  });

  // Balance adjustment endpoint
  app.patch("/api/admin/users/:id/balance", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { amount, type } = req.body;
      const userId = req.params.id;
      
      const currentUser = await storage.getUser(userId);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const currentBalance = parseFloat(currentUser.balance.toString());
      let newBalance;
      
      if (type === "credit") {
        newBalance = currentBalance + parseFloat(amount);
      } else if (type === "debit") {
        newBalance = Math.max(0, currentBalance - parseFloat(amount)); // Don't allow negative balances
      } else {
        return res.status(400).json({ message: "Invalid adjustment type" });
      }
      
      const updatedUser = await storage.updateUserBalance(userId, newBalance);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to adjust balance" });
    }
  });

  app.patch("/api/admin/users/:id", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { balance, isActive } = req.body;
      const updates: any = {};
      
      if (balance !== undefined) updates.balance = parseFloat(balance);
      if (isActive !== undefined) updates.isActive = isActive;
      
      const updatedUser = await storage.updateUser(req.params.id, updates);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/admin/users/:id", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const success = await storage.deleteUser(req.params.id);
      
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Admin Plan Management
  app.get("/api/admin/plans", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      // Get all plans including inactive ones for admin
      const { promises: fs } = await import("fs");
      const path = await import("path");
      const filePath = path.join(process.cwd(), "database", "plans.json");
      const data = await fs.readFile(filePath, "utf-8");
      const plans = JSON.parse(data);
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch plans" });
    }
  });

  app.post("/api/admin/plans", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const planData = planSchema.parse(req.body);
      const plan = await storage.createInvestmentPlan(planData);
      res.json(plan);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create plan" });
    }
  });

  app.patch("/api/admin/plans/:id", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const updates = req.body;
      const plan = await storage.updateInvestmentPlan(req.params.id, updates);
      
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }

      res.json(plan);
    } catch (error) {
      res.status(500).json({ message: "Failed to update plan" });
    }
  });

  app.delete("/api/admin/plans/:id", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const success = await storage.deleteInvestmentPlan(req.params.id);
      
      if (!success) {
        return res.status(404).json({ message: "Plan not found" });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete plan" });
    }
  });

  // Get deposit settings
  app.get("/api/admin/deposit-settings", async (req, res) => {
    try {
      const { promises: fs } = await import("fs");
      const path = await import("path");
      const filePath = path.join(process.cwd(), "database", "settings.json");
      const data = await fs.readFile(filePath, "utf-8");
      const settings = JSON.parse(data);
      res.json(settings.depositSettings || {});
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch deposit settings" });
    }
  });

  // Update deposit settings  
  app.patch("/api/admin/deposit-settings", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { promises: fs } = await import("fs");
      const path = await import("path");
      const filePath = path.join(process.cwd(), "database", "settings.json");
      const data = await fs.readFile(filePath, "utf-8");
      const settings = JSON.parse(data);
      
      settings.depositSettings = {
        ...settings.depositSettings,
        ...req.body
      };
      
      await fs.writeFile(filePath, JSON.stringify(settings, null, 2));
      res.json(settings.depositSettings);
    } catch (error) {
      res.status(500).json({ message: "Failed to update deposit settings" });
    }
  });

  // Admin Deposit Management
  app.get("/api/admin/deposits", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const deposits = await storage.getAllDeposits();
      res.json(deposits);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch deposits" });
    }
  });

  app.patch("/api/admin/deposits/:id", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { status, confirmations } = req.body;
      const updates: any = {};
      
      if (status) updates.status = status;
      if (confirmations !== undefined) updates.confirmations = confirmations;
      
      const deposit = await storage.updateDeposit(req.params.id, updates);
      
      if (!deposit) {
        return res.status(404).json({ message: "Deposit not found" });
      }

      res.json(deposit);
    } catch (error) {
      res.status(500).json({ message: "Failed to update deposit" });
    }
  });

  // Admin Withdrawal Management
  app.get("/api/admin/withdrawals", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const withdrawals = await storage.getAllWithdrawals();
      res.json(withdrawals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch withdrawals" });
    }
  });

  app.patch("/api/admin/withdrawals/:id", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { status, admin_notes } = req.body;
      const updates: any = {};
      
      if (status) updates.status = status;
      if (admin_notes !== undefined) updates.admin_notes = admin_notes;
      
      const withdrawal = await storage.updateWithdrawal(req.params.id, updates);
      
      if (!withdrawal) {
        return res.status(404).json({ message: "Withdrawal not found" });
      }

      // If rejected, credit back to user
      if (status === 'rejected') {
        const user = await storage.getUser(withdrawal.userId);
        if (user) {
          await storage.updateUser(user.id, { 
            balance: user.balance + withdrawal.usd_value + withdrawal.network_fee 
          });
        }
      }

      res.json(withdrawal);
    } catch (error) {
      res.status(500).json({ message: "Failed to update withdrawal" });
    }
  });

  // Admin Message Management
  app.get("/api/admin/messages", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const messages = await storage.getAllMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/admin/messages", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const messageData = messageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      res.json(message);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  app.delete("/api/admin/messages/:id", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const success = await storage.deleteMessage(req.params.id);
      
      if (!success) {
        return res.status(404).json({ message: "Message not found" });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete message" });
    }
  });

  // Admin Support Ticket Management
  app.get("/api/admin/support-tickets", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const tickets = await storage.getAllSupportTickets();
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch support tickets" });
    }
  });

  app.patch("/api/admin/support-tickets/:id", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { admin_reply, status, priority } = req.body;
      const updates: any = {};
      
      if (admin_reply !== undefined) updates.admin_reply = admin_reply;
      if (status) updates.status = status;
      if (priority) updates.priority = priority;
      updates.updated_at = new Date().toISOString();
      
      const ticket = await storage.updateSupportTicket(req.params.id, updates);
      
      if (!ticket) {
        return res.status(404).json({ message: "Support ticket not found" });
      }

      // If admin replied, send notification to user's inbox
      if (admin_reply && admin_reply.trim()) {
        await storage.addInboxMessage({
          id: randomUUID(),
          userId: ticket.userId,
          title: `Support Reply: ${ticket.subject}`,
          content: `Your support ticket has been replied to by our admin team:\n\n${admin_reply}`,
          type: "support_reply" as const,
          ticket_id: ticket.id,
          is_read: false,
          created_at: new Date().toISOString()
        });
      }

      res.json(ticket);
    } catch (error) {
      res.status(500).json({ message: "Failed to update support ticket" });
    }
  });

  // Delete support ticket (admin only)
  app.delete("/api/admin/support-tickets/:id", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const success = await storage.deleteSupportTicket(req.params.id);
      
      if (!success) {
        return res.status(404).json({ message: "Support ticket not found" });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete support ticket" });
    }
  });

  // Admin System Settings
  app.get("/api/admin/settings", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const settings = await storage.getSystemSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch system settings" });
    }
  });

  app.patch("/api/admin/settings", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const updates = req.body;
      const oldSettings = await storage.getSystemSettings();
      const mergedSettings = await storage.updateSystemSettings(updates);
      
      // Log settings change
      await storage.logAction({
        action: "settings_updated",
        userId: req.user!.id,
        details: `System settings updated by ${req.user!.username}`,
        oldValue: oldSettings,
        newValue: updates,
        timestamp: new Date().toISOString()
      });
      
      res.json(mergedSettings);
    } catch (error) {
      console.error("Settings update error:", error);
      res.status(500).json({ message: "Failed to update system settings" });
    }
  });

  // Get audit logs
  app.get("/api/admin/logs", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const logs = await storage.getAuditLogs();
      res.json(logs.slice(-50)); // Return last 50 logs
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  // Admin Analytics
  app.get("/api/admin/analytics/deposits", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const deposits = await storage.getAllDeposits();
      
      const analytics = {
        total: deposits.length,
        confirmed: deposits.filter(d => d.status === "confirmed").length,
        pending: deposits.filter(d => d.status === "pending").length,
        failed: deposits.filter(d => d.status === "failed").length,
        totalValue: deposits
          .filter(d => d.status === "confirmed")
          .reduce((sum, d) => sum + d.usd_value, 0),
      };

      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch deposit analytics" });
    }
  });

  app.get("/api/admin/analytics/withdrawals", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const withdrawals = await storage.getAllWithdrawals();
      
      const analytics = {
        total: withdrawals.length,
        pending: withdrawals.filter(w => w.status === "pending").length,
        approved: withdrawals.filter(w => w.status === "approved").length,
        completed: withdrawals.filter(w => w.status === "completed").length,
        rejected: withdrawals.filter(w => w.status === "rejected").length,
        totalValue: withdrawals
          .filter(w => w.status === "completed")
          .reduce((sum, w) => sum + w.usd_value, 0),
      };

      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch withdrawal analytics" });
    }
  });

  app.get("/api/admin/analytics/investments", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const investments = await storage.getAllInvestments();
      
      const analytics = {
        total: investments.length,
        active: investments.filter(i => i.is_active).length,
        totalValue: investments.reduce((sum, i) => sum + i.amount, 0),
        totalEarned: investments.reduce((sum, i) => sum + i.total_earned, 0),
      };

      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch investment analytics" });
    }
  });

  // Admin Referrals
  app.get("/api/admin/referrals", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const users = await storage.getAllUsers();
      const referrals = users.filter(user => user.referredBy).map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        referredBy: user.referredBy,
        createdAt: user.createdAt,
        balance: user.balance,
      }));
      res.json(referrals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch referrals" });
    }
  });

  // Admin Security Logs
  app.get("/api/admin/security-logs", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const logs = [
        {
          id: "1",
          event: "Login",
          user: "admin@tradepilot.com",
          ip: "192.168.1.1",
          timestamp: new Date().toISOString(),
          severity: "info",
        },
        {
          id: "2", 
          event: "Failed Admin Access",
          user: "unknown",
          ip: "192.168.1.100",
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          severity: "warning",
        },
      ];
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch security logs" });
    }
  });

  // Admin Analytics Combined
  app.get("/api/admin/analytics", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const [users, deposits, withdrawals, investments] = await Promise.all([
        storage.getAllUsers(),
        storage.getAllDeposits(),
        storage.getAllWithdrawals(),
        storage.getAllInvestments(),
      ]);

      const analytics = {
        users: {
          total: users.length,
          active: users.filter(u => u.isActive).length,
          admins: users.filter(u => u.isAdmin).length,
        },
        deposits: {
          total: deposits.length,
          confirmed: deposits.filter(d => d.status === "confirmed").length,
          totalValue: deposits.filter(d => d.status === "confirmed").reduce((sum, d) => sum + d.usd_value, 0),
        },
        withdrawals: {
          total: withdrawals.length,
          pending: withdrawals.filter(w => w.status === "pending").length,
          totalValue: withdrawals.filter(w => w.status === "completed").reduce((sum, w) => sum + w.usd_value, 0),
        },
        investments: {
          total: investments.length,
          active: investments.filter(i => i.is_active).length,
          totalValue: investments.reduce((sum, i) => sum + i.amount, 0),
        },
      };

      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Chat and Communication routes
  // Get chat messages
  app.get("/api/chat/messages", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!ChatService.isChatActive()) {
        return res.json({ 
          messages: [], 
          status: ChatService.getChatStatus(),
          isActive: false 
        });
      }
      
      const messages = await ChatService.getChatMessages(50);
      res.json({
        messages,
        status: ChatService.getChatStatus(),
        isActive: true,
        typingStatus: ChatService.getTypingStatus()
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  // Send chat message
  app.post("/api/chat/messages", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!ChatService.isChatActive()) {
        return res.status(400).json({ message: "Chat is currently closed" });
      }

      const { message } = chatMessageSchema.parse(req.body);
      const user = await storage.getUser(req.user!.id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const chatMessage = await ChatService.addMessage(user.id, user.username, message);
      res.json(chatMessage);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Get chat status and online count
  app.get("/api/chat/status", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      res.json({
        status: ChatService.getChatStatus(),
        isActive: ChatService.isChatActive(),
        onlineCount: ChatService.getOnlineCount(),
        typingStatus: ChatService.getTypingStatus()
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get chat status" });
    }
  });

  // Inbox routes
  // Get user's inbox messages
  app.get("/api/inbox/messages", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const messages = await storage.getInboxMessages(req.user!.id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inbox messages" });
    }
  });

  // Mark inbox message as read
  app.patch("/api/inbox/messages/:id/read", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const success = await storage.markInboxMessageAsRead(req.params.id, req.user!.id);
      if (!success) {
        return res.status(404).json({ message: "Message not found or access denied" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  // Mark all inbox messages as read
  app.patch("/api/inbox/messages/mark-all-read", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      await storage.markAllInboxMessagesAsRead(req.user!.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark all messages as read" });
    }
  });

  // Delete inbox message
  app.delete("/api/inbox/messages/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const success = await storage.deleteInboxMessage(req.params.id, req.user!.id);
      if (!success) {
        return res.status(404).json({ message: "Message not found or access denied" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete message" });
    }
  });

  // Get unread message count
  app.get("/api/inbox/unread-count", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const messages = await storage.getInboxMessages(req.user!.id);
      const count = messages.filter(msg => !msg.is_read).length;
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Failed to get unread count" });
    }
  });

  // Support ticket creation (for contact support feature)
  app.post("/api/support/tickets", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const ticketData = supportTicketSchema.parse(req.body);
      const ticket = await storage.createSupportTicket(ticketData, req.user!.id);
      
      // Get user info for notification
      const user = await storage.getUser(req.user!.id);
      if (user) {
        // Send CallMeBot notification for new support ticket
        await CallMeBotService.sendSupportTicketNotification(
          user.username, 
          ticketData.subject, 
          ticketData.priority || 'Medium'
        );
      }
      
      // Add notification to user's inbox
      await ChatService.addSupportReply(
        req.user!.id,
        ticket.id,
        ticket.subject,
        `Thank you for contacting our support team! We've received your message about "${ticket.subject}" and our team will review it shortly. 

We typically respond within 24 hours during business days. You'll receive the reply right here in your inbox.

Best regards,
TradePilot Support Team 🚀`
      );
      
      res.json(ticket);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create support ticket" });
    }
  });

  // AI Chat Routes
  app.get("/api/ai-chat/messages", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const messages = await AIChatService.getConversation(req.user!.id);
      res.json({ messages });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch AI chat messages" });
    }
  });

  app.post("/api/ai-chat/send", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { message } = aiChatMessageSchema.parse(req.body);
      const messages = await AIChatService.sendMessage(req.user!.id, message);
      res.json({ messages });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to send AI chat message" });
    }
  });

  app.post("/api/ai-chat/initial-greeting", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const messages = await AIChatService.sendInitialGreeting(req.user!.id);
      res.json({ messages });
    } catch (error) {
      res.status(500).json({ message: "Failed to send initial greeting" });
    }
  });

  app.post("/api/ai-chat/clear", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      await AIChatService.clearConversation(req.user!.id);
      res.json({ success: true, message: "Chat conversation cleared" });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear chat conversation" });
    }
  });

  // Admin AI Chat Management
  app.get("/api/admin/ai-chat/conversations", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const conversations = await AIChatService.getAllConversations();
      res.json({ conversations });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch AI chat conversations" });
    }
  });

  app.put("/api/admin/ai-chat/personality", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { personality } = aiPersonalityUpdateSchema.parse(req.body);
      await AIChatService.updatePersonality(personality);
      res.json({ success: true });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update AI personality" });
    }
  });

  // API Key Management Routes (admin only)
  app.get("/api/admin/ai-chat/api-keys", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const keys = await AIChatService.getAPIKeys();
      res.json(keys);
    } catch (error) {
      console.error('Error getting API keys:', error);
      res.status(500).json({ message: "Failed to get API keys" });
    }
  });

  app.post("/api/admin/ai-chat/api-keys", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const keyData = apiKeyCreateSchema.parse(req.body);
      await AIChatService.addAPIKey(keyData.name, keyData.key, keyData.type);
      res.json({ message: "API key added successfully" });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error('Error adding API key:', error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to add API key" });
    }
  });

  app.put("/api/admin/ai-chat/api-keys/:id", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const keyUpdate = apiKeyUpdateSchema.parse({ ...req.body, id: req.params.id });
      const { type } = req.query;
      
      if (!type || (type !== 'reply' && type !== 'summary')) {
        return res.status(400).json({ message: "Invalid or missing key type parameter" });
      }
      
      await AIChatService.updateAPIKey(keyUpdate.id, type as 'reply' | 'summary', {
        name: keyUpdate.name,
        status: keyUpdate.status
      });
      
      res.json({ message: "API key updated successfully" });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error('Error updating API key:', error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to update API key" });
    }
  });

  app.delete("/api/admin/ai-chat/api-keys/:id", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { type } = req.query;
      
      if (!type || (type !== 'reply' && type !== 'summary')) {
        return res.status(400).json({ message: "Invalid or missing key type parameter" });
      }
      
      await AIChatService.deleteAPIKey(req.params.id, type as 'reply' | 'summary');
      res.json({ message: "API key deleted successfully" });
    } catch (error) {
      console.error('Error deleting API key:', error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to delete API key" });
    }
  });

  // QR Code Upload Routes
  app.post("/api/admin/upload-qr-code", authenticateToken, requireAdmin, upload.single('qrCode'), async (req: AuthenticatedRequest, res) => {
    try {
      const { cryptocurrency } = req.body;
      
      if (!req.file) {
        return res.status(400).json({ message: "No QR code file uploaded" });
      }

      if (!cryptocurrency) {
        return res.status(400).json({ message: "Cryptocurrency parameter is required" });
      }

      // Get current settings to check existing wallet structure
      const settings = await storage.getSystemSettings();
      const crypto = cryptocurrency.toLowerCase() as 'btc' | 'eth' | 'usdt';
      
      // Construct the QR code URL path
      const qrCodePath = `/uploads/qr-codes/${req.file.filename}`;
      
      // Prepare wallet update with partial settings
      const currentWallet = settings.wallets?.[crypto] || { address: "", qr_code: "", qrCode: "" };
      const walletUpdate = {
        wallets: {
          [crypto]: {
            ...currentWallet,
            qr_code: qrCodePath,
            qrCode: qrCodePath // Support both field names for compatibility
          }
        }
      };
      
      await storage.updateSystemSettings(walletUpdate);
      
      res.json({ 
        success: true, 
        message: `QR code uploaded successfully for ${cryptocurrency}`,
        qrCodePath 
      });
    } catch (error) {
      console.error('QR code upload error:', error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to upload QR code" });
    }
  });

  app.post("/api/admin/remove-qr-code", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { cryptocurrency } = req.body;
      
      if (!cryptocurrency) {
        return res.status(400).json({ message: "Cryptocurrency parameter is required" });
      }

      // Get current settings
      const settings = await storage.getSystemSettings();
      const crypto = cryptocurrency.toLowerCase() as 'btc' | 'eth' | 'usdt';
      
      // Initialize wallets object if it doesn't exist
      if (!settings.wallets) {
        settings.wallets = {};
      }
      
      // Remove QR code from wallet settings
      if (settings.wallets?.[crypto]) {
        // Try to delete the actual file
        if (settings.wallets[crypto].qr_code) {
          try {
            const { promises: fs } = await import("fs");
            const path = await import("path");
            const filePath = path.join(process.cwd(), settings.wallets[crypto].qr_code);
            await fs.unlink(filePath);
          } catch (fileError) {
            console.warn('Could not delete QR code file:', fileError);
          }
        }
        
        // Use partial update to preserve other settings
        const walletUpdate = {
          wallets: {
            [crypto]: {
              ...settings.wallets[crypto],
              qr_code: "",
              qrCode: "" // Support both field names
            }
          }
        };
        
        await storage.updateSystemSettings(walletUpdate);
      }
      
      res.json({ 
        success: true, 
        message: `QR code removed successfully for ${cryptocurrency}` 
      });
    } catch (error) {
      console.error('QR code removal error:', error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to remove QR code" });
    }
  });

  app.post("/api/admin/update-wallet-address", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { cryptocurrency, address } = req.body;
      
      if (!cryptocurrency || address === undefined) {
        return res.status(400).json({ message: "Cryptocurrency and address parameters are required" });
      }

      // Get current settings
      const settings = await storage.getSystemSettings();
      const crypto = cryptocurrency.toLowerCase() as 'btc' | 'eth' | 'usdt';
      
      // Initialize wallets object if it doesn't exist
      if (!settings.wallets) {
        settings.wallets = {};
      }
      
      // Update wallet address using partial update
      const currentWallet = settings.wallets?.[crypto] || { address: "", qr_code: "", qrCode: "" };
      const walletUpdate = {
        wallets: {
          [crypto]: {
            ...currentWallet,
            address
          }
        }
      };
      
      await storage.updateSystemSettings(walletUpdate);
      
      res.json({ 
        success: true, 
        message: `Wallet address updated successfully for ${cryptocurrency}`,
        address
      });
    } catch (error) {
      console.error('Wallet address update error:', error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to update wallet address" });
    }
  });

  // CallMeBot notification settings routes
  app.get("/api/admin/callmebot-settings", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const settings = await CallMeBotService.getSettings();
      res.json(settings);
    } catch (error) {
      console.error('CallMeBot settings fetch error:', error);
      res.status(500).json({ message: "Failed to fetch CallMeBot settings" });
    }
  });

  app.patch("/api/admin/callmebot-settings", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const settings = req.body;
      await CallMeBotService.updateSettings(settings);
      res.json({ success: true, message: "CallMeBot settings updated successfully" });
    } catch (error) {
      console.error('CallMeBot settings update error:', error);
      res.status(500).json({ message: "Failed to update CallMeBot settings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}