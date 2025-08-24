import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import axios from "axios";
import { storage } from "../storage";
import { EmailService } from "./email-service";
import { LocationService } from "./location-service";
import { ChatService } from "./chat-service";
import { type RegisterData, type LoginData, type VerifyAccountData, type ForgotPasswordData, type ResetPasswordData } from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "tradepilot-secret-key";

export class AuthService {
  static async verifyRecaptcha(token: string): Promise<boolean> {
    try {
      const settings = await storage.getSystemSettings();
      const recaptchaSettings = settings?.recaptcha;
      
      if (!recaptchaSettings?.enabled || !recaptchaSettings?.secret_key) {
        return true; // Skip verification if not enabled or configured
      }

      const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
        params: {
          secret: recaptchaSettings.secret_key,
          response: token,
        },
      });

      return response.data.success === true;
    } catch (error) {
      console.error('reCAPTCHA verification error:', error);
      return false;
    }
  }

  static async register(userData: RegisterData & { confirmPassword?: string; recaptchaToken?: string }) {
    // Check if reCAPTCHA is enabled and validate accordingly
    const settings = await storage.getSystemSettings();
    const recaptchaSettings = settings?.recaptcha;
    
    if (recaptchaSettings?.enabled && recaptchaSettings?.secret_key) {
      if (!userData.recaptchaToken) {
        throw new Error("reCAPTCHA verification is required");
      }
      if (!(await this.verifyRecaptcha(userData.recaptchaToken))) {
        throw new Error("reCAPTCHA verification failed");
      }
    }

    // Validate passwords match if confirmPassword provided
    if (userData.confirmPassword && userData.password !== userData.confirmPassword) {
      throw new Error("Passwords do not match");
    }

    // Check if user already exists
    const existingUser = await storage.getUserByEmail(userData.email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const existingUsername = await storage.getUserByUsername(userData.username);
    if (existingUsername) {
      throw new Error("Username already taken");
    }

    // Check if pending user exists
    const existingPendingUser = await storage.getPendingUserByEmail(userData.email);

    // Validate referral code if provided
    if (userData.referralCode) {
      const referrer = await storage.getUserByReferralCode(userData.referralCode);
      if (!referrer) {
        throw new Error("Invalid referral code");
      }
    }

    // Hash password and create pending user (will replace existing if any)
    const hashedPassword = await this.hashPassword(userData.password);
    const pendingUserData = { ...userData, password: hashedPassword };
    const pendingUser = await storage.createPendingUser(pendingUserData);

    // Generate and send verification code
    const verificationCode = EmailService.generateVerificationCode();
    await storage.updatePendingUserCode(pendingUser.email, verificationCode);
    await EmailService.sendVerificationEmail(pendingUser.email, verificationCode, pendingUser.username);

    return {
      user: {
        id: pendingUser.id,
        username: pendingUser.username,
        email: pendingUser.email,
        balance: 0,
        referralCode: null,
        isAdmin: false,
        isVerified: false,
      },
      message: "Registration successful! Please check your email for a verification code.",
    };
  }

  static async login(loginData: LoginData & { recaptchaToken?: string }) {
    // Check if reCAPTCHA is enabled and validate accordingly
    const settings = await storage.getSystemSettings();
    const recaptchaSettings = settings?.recaptcha;
    
    if (recaptchaSettings?.enabled && recaptchaSettings?.secret_key) {
      if (!loginData.recaptchaToken) {
        throw new Error("reCAPTCHA verification is required");
      }
      if (!(await this.verifyRecaptcha(loginData.recaptchaToken))) {
        throw new Error("reCAPTCHA verification failed");
      }
    }

    const user = await storage.getUserByEmail(loginData.email);
    if (!user || !user.isActive) {
      throw new Error("Invalid credentials or account not activated");
    }

    if (!user.isVerified) {
      throw new Error("Please verify your email address before logging in");
    }

    const isValidPassword = await bcrypt.compare(loginData.password, user.password);
    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "3d" });

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        balance: user.balance,
        referralCode: user.referralCode,
        isAdmin: user.isAdmin,
        isVerified: user.isVerified,
      },
      token,
    };
  }

  static async getCurrentUser(userId: string) {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      balance: user.balance,
      referralCode: user.referralCode,
      isAdmin: user.isAdmin,
      isActive: user.isActive,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };
  }

  static async verifyAccount(verifyData: VerifyAccountData, requestOrigin?: string) {
    const user = await storage.verifyPendingUser(verifyData.email, verifyData.verificationCode);
    if (!user) {
      throw new Error("Invalid or expired verification code");
    }

    // Add welcome message to user's inbox
    await ChatService.addWelcomeMessage(user.id);

    // Send welcome email with request origin for proper dashboard redirect
    await EmailService.sendWelcomeEmail(user.email, user.username, undefined, requestOrigin);

    return { message: "Account verified successfully! You can now log in." };
  }

  static async resendVerificationCode(email: string) {
    const pendingUser = await storage.getPendingUserByEmail(email);
    if (!pendingUser) {
      throw new Error("No pending registration found for this email address");
    }

    // Generate and send new verification code
    const verificationCode = EmailService.generateVerificationCode();
    await storage.updatePendingUserCode(email, verificationCode);
    await EmailService.sendVerificationEmail(email, verificationCode, pendingUser.username);

    return { message: "Verification code sent! Please check your email." };
  }

  static async forgotPassword(forgotData: ForgotPasswordData) {
    const user = await storage.getUserByEmail(forgotData.email);
    if (!user) {
      throw new Error("No account found with this email address");
    }

    const resetCode = EmailService.generateVerificationCode();
    await storage.setResetCode(forgotData.email, resetCode);
    await EmailService.sendPasswordResetEmail(forgotData.email, resetCode, user.username);

    return { message: "Password reset code sent to your email" };
  }

  static async resetPassword(resetData: ResetPasswordData) {
    const success = await storage.resetPassword(resetData.email, resetData.resetCode, resetData.newPassword);
    if (!success) {
      throw new Error("Invalid or expired reset code");
    }

    return { message: "Password reset successfully! You can now log in with your new password." };
  }

  static async verifyPassword(hashedPassword: string, plainPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }
}