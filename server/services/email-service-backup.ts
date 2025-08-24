import nodemailer from 'nodemailer';

export class EmailService {
  private static transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'TradePilota@gmail.com',
      pass: process.env.GMAIL_APP_PASSWORD || 'xcjx hyyo pmdu wzed'
    }
  });

  static generateVerificationCode(): string {
    return Math.floor(10000 + Math.random() * 90000).toString();
  }

  static async sendVerificationEmail(email: string, code: string, username: string) {
    const mailOptions = {
      from: '"TradePilot" <TradePilota@gmail.com>',
      to: email,
      subject: '🚀 Verify Your TradePilot Account - Welcome to AI Trading!',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your TradePilot Account</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 20px;
              line-height: 1.6;
            }
            
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: #ffffff;
              border-radius: 20px;
              overflow: hidden;
              box-shadow: 0 25px 50px rgba(0,0,0,0.15);
              animation: fadeIn 0.8s ease-out;
            }
            
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(30px); }
              to { opacity: 1; transform: translateY(0); }
            }
            
            .header {
              background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 50%, #581c87 100%);
              padding: 40px 30px;
              text-align: center;
              position: relative;
              overflow: hidden;
            }
            
            .header::before {
              content: '';
              position: absolute;
              top: -50%;
              left: -50%;
              width: 200%;
              height: 200%;
              background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
              animation: pulse 4s ease-in-out infinite;
            }
            
            @keyframes pulse {
              0%, 100% { transform: scale(1) rotate(0deg); }
              50% { transform: scale(1.1) rotate(180deg); }
            }
            
            .logo {
              position: relative;
              z-index: 1;
            }
            
            .logo h1 {
              color: #ffffff;
              font-size: 36px;
              font-weight: 700;
              margin-bottom: 8px;
              text-shadow: 0 2px 10px rgba(0,0,0,0.3);
            }
            
            .logo p {
              color: rgba(255,255,255,0.9);
              font-size: 16px;
              font-weight: 400;
            }
            
            .content {
              padding: 40px 30px;
            }
            
            .welcome-title {
              font-size: 28px;
              font-weight: 700;
              color: #1f2937;
              margin-bottom: 20px;
              text-align: center;
            }
            
            .welcome-text {
              font-size: 18px;
              color: #6b7280;
              text-align: center;
              margin-bottom: 40px;
            }
            
            .otp-section {
              background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
              border: 2px solid #e5e7eb;
              border-radius: 15px;
              padding: 30px;
              text-align: center;
              margin: 40px 0;
              position: relative;
            }
            
            .otp-label {
              font-size: 16px;
              color: #374151;
              margin-bottom: 15px;
              font-weight: 600;
            }
            
            .otp-code {
              background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
              color: white;
              font-size: 36px;
              font-weight: 700;
              padding: 20px 40px;
              border-radius: 12px;
              letter-spacing: 8px;
              font-family: 'Monaco', 'Consolas', monospace;
              display: inline-block;
              margin-bottom: 15px;
              box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
              animation: glow 2s ease-in-out infinite alternate;
            }
            
            @keyframes glow {
              from { box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3); }
              to { box-shadow: 0 10px 35px rgba(59, 130, 246, 0.6); }
            }
            
            .copy-button {
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-size: 14px;
              font-weight: 600;
              margin-left: 15px;
              display: inline-block;
              cursor: pointer;
              transition: all 0.3s ease;
            }
            
            .copy-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 5px 15px rgba(16, 185, 129, 0.4);
            }
            
            .expire-text {
              font-size: 14px;
              color: #ef4444;
              margin-top: 10px;
              font-weight: 500;
            }
            
            .features {
              background: #f9fafb;
              border-radius: 12px;
              padding: 30px;
              margin: 30px 0;
            }
            
            .features h3 {
              color: #1f2937;
              font-size: 20px;
              font-weight: 600;
              margin-bottom: 20px;
              text-align: center;
            }
            
            .features ul {
              list-style: none;
            }
            
            .features li {
              padding: 8px 0;
              color: #4b5563;
              position: relative;
              padding-left: 25px;
            }
            
            .features li::before {
              content: '✓';
              position: absolute;
              left: 0;
              color: #10b981;
              font-weight: bold;
              font-size: 18px;
            }
            
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
              color: white;
              text-decoration: none;
              padding: 18px 40px;
              border-radius: 12px;
              font-weight: 600;
              font-size: 16px;
              text-align: center;
              margin: 30px auto;
              display: block;
              width: fit-content;
              transition: all 0.3s ease;
              box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3);
            }
            
            .partners {
              background: #1f2937;
              padding: 40px 30px;
              text-align: center;
            }
            
            .partners h3 {
              color: white;
              font-size: 18px;
              margin-bottom: 25px;
              font-weight: 600;
            }
            
            .partner-logos {
              display: flex;
              justify-content: center;
              align-items: center;
              flex-wrap: wrap;
              gap: 30px;
            }
            
            .partner-logo {
              width: 80px;
              height: 40px;
              background: white;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 600;
              color: #1f2937;
              font-size: 12px;
              transition: all 0.3s ease;
              opacity: 0.8;
            }
            
            .footer {
              background: #111827;
              color: #9ca3af;
              text-align: center;
              padding: 30px;
              font-size: 14px;
            }
            
            .footer p {
              margin-bottom: 10px;
            }
            
            .footer .company {
              color: white;
              font-weight: 600;
            }
            
            @media (max-width: 600px) {
              body { padding: 10px; }
              .container { border-radius: 15px; }
              .header { padding: 30px 20px; }
              .content { padding: 30px 20px; }
              .otp-code { font-size: 28px; padding: 15px 25px; letter-spacing: 4px; }
              .partner-logos { gap: 20px; }
              .partner-logo { width: 60px; height: 35px; font-size: 10px; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">
                <h1>TradePilot</h1>
                <p>AI-Powered Crypto Arbitrage Trading</p>
              </div>
            </div>
            
            <div class="content">
              <h2 class="welcome-title">Welcome to TradePilot, ${username}!</h2>
              <p class="welcome-text">
                Congratulations on taking the first step toward automated crypto trading success! 
                We're thrilled to have you join our community of smart traders who are already earning 
                consistent profits through AI-powered arbitrage opportunities.
              </p>
              
              <p style="font-size: 16px; color: #4b5563; text-align: center; margin-bottom: 30px;">
                To activate your account and start accessing real-time trading opportunities, 
                we need to verify your email address. This security step ensures your account 
                remains protected and you receive important trading notifications.
              </p>
              
              <div class="otp-section">
                <div class="otp-label">Your Email Verification Code</div>
                <div class="otp-code" id="otpCode">${code}</div>
                <button class="copy-button" onclick="copyCode()" id="copyBtn">Tap and hold to copy code</button>
                <div class="expire-text">⏰ This code expires in 15 minutes for your security</div>
                <p style="font-size: 14px; color: #6b7280; margin-top: 15px; line-height: 1.5;">
                  Simply copy this code and paste it into the verification page that opened after registration. 
                  Once verified, you'll immediately gain access to your personalized trading dashboard.
                </p>
              </div>
              
              <div style="text-align: center; padding: 25px; background: #fef7ed; border-radius: 12px; margin: 30px 0;">
                <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.6;">
                  🛡️ <strong>Security Notice:</strong> If you didn't create a TradePilot account, please disregard this email. 
                  Your email address will not be used for any further communications. We take your privacy and security seriously.
                </p>
              </div>
            </div>
            
            <div class="partners">
              <h3>🤝 Trusted Exchange Partners</h3>
              <div class="partner-logos">
                <div class="partner-logo">Binance</div>
                <div class="partner-logo">Coinbase</div>
                <div class="partner-logo">Kraken</div>
                <div class="partner-logo">Huobi</div>
                <div class="partner-logo">OKX</div>
              </div>
            </div>
            
            <div class="footer">
              <p>Questions? Our support team is available 24/7 to help you get started.</p>
              <p class="company">© 2025 TradePilot. All rights reserved.</p>
              <p>🔒 Bank-Level Security • 📊 Real-Time Analytics • 🌍 Trusted by 50,000+ traders worldwide</p>
              <p style="font-size: 12px; margin-top: 15px; opacity: 0.8;">
                This email was sent to verify your TradePilot account registration. 
                Our systems use advanced encryption to protect your data.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Verification email sent to ${email} with code: ${code}`);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  static async sendPasswordResetEmail(email: string, code: string, username: string) {
    const mailOptions = {
      from: '"TradePilot" <TradePilota@gmail.com>',
      to: email,
      subject: '🔐 Reset Your TradePilot Password - Security Alert',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your TradePilot Password</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
              padding: 20px;
              line-height: 1.6;
            }
            
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: #ffffff;
              border-radius: 20px;
              overflow: hidden;
              box-shadow: 0 25px 50px rgba(0,0,0,0.15);
              animation: fadeIn 0.8s ease-out;
            }
            
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(30px); }
              to { opacity: 1; transform: translateY(0); }
            }
            
            .header {
              background: linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%);
              padding: 40px 30px;
              text-align: center;
              position: relative;
              overflow: hidden;
            }
            
            .header::before {
              content: '';
              position: absolute;
              top: -50%;
              left: -50%;
              width: 200%;
              height: 200%;
              background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
              animation: pulse 4s ease-in-out infinite;
            }
            
            @keyframes pulse {
              0%, 100% { transform: scale(1) rotate(0deg); }
              50% { transform: scale(1.1) rotate(180deg); }
            }
            
            .logo {
              position: relative;
              z-index: 1;
            }
            
            .logo h1 {
              color: #ffffff;
              font-size: 36px;
              font-weight: 700;
              margin-bottom: 8px;
              text-shadow: 0 2px 10px rgba(0,0,0,0.3);
            }
            
            .logo p {
              color: rgba(255,255,255,0.9);
              font-size: 16px;
              font-weight: 400;
            }
            
            .content {
              padding: 40px 30px;
            }
            
            .reset-title {
              font-size: 28px;
              font-weight: 700;
              color: #dc2626;
              margin-bottom: 20px;
              text-align: center;
            }
            
            .reset-text {
              font-size: 18px;
              color: #6b7280;
              text-align: center;
              margin-bottom: 40px;
            }
            
            .otp-section {
              background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
              border: 2px solid #fecaca;
              border-radius: 15px;
              padding: 30px;
              text-align: center;
              margin: 40px 0;
              position: relative;
            }
            
            .otp-label {
              font-size: 16px;
              color: #991b1b;
              margin-bottom: 15px;
              font-weight: 600;
            }
            
            .otp-code {
              background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
              color: white;
              font-size: 36px;
              font-weight: 700;
              padding: 20px 40px;
              border-radius: 12px;
              letter-spacing: 8px;
              font-family: 'Monaco', 'Consolas', monospace;
              display: inline-block;
              margin-bottom: 15px;
              box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);
              animation: glow 2s ease-in-out infinite alternate;
            }
            
            @keyframes glow {
              from { box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3); }
              to { box-shadow: 0 10px 35px rgba(239, 68, 68, 0.6); }
            }
            
            .copy-button {
              background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-size: 14px;
              font-weight: 600;
              margin-left: 15px;
              display: inline-block;
              cursor: pointer;
              transition: all 0.3s ease;
            }
            
            .copy-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 5px 15px rgba(245, 158, 11, 0.4);
            }
            
            .expire-text {
              font-size: 14px;
              color: #dc2626;
              margin-top: 10px;
              font-weight: 500;
            }
            
            .security-notice {
              background: #f3f4f6;
              border-radius: 12px;
              padding: 30px;
              margin: 30px 0;
            }
            
            .security-notice h3 {
              color: #1f2937;
              font-size: 20px;
              font-weight: 600;
              margin-bottom: 15px;
              text-align: center;
            }
            
            .security-notice p {
              color: #4b5563;
              font-size: 16px;
              text-align: center;
              line-height: 1.6;
            }
            
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
              color: white;
              text-decoration: none;
              padding: 18px 40px;
              border-radius: 12px;
              font-weight: 600;
              font-size: 16px;
              text-align: center;
              margin: 30px auto;
              display: block;
              width: fit-content;
              transition: all 0.3s ease;
              box-shadow: 0 10px 25px rgba(220, 38, 38, 0.3);
            }
            
            .partners {
              background: #1f2937;
              padding: 40px 30px;
              text-align: center;
            }
            
            .partners h3 {
              color: white;
              font-size: 18px;
              margin-bottom: 25px;
              font-weight: 600;
            }
            
            .partner-logos {
              display: flex;
              justify-content: center;
              align-items: center;
              flex-wrap: wrap;
              gap: 30px;
            }
            
            .partner-logo {
              width: 80px;
              height: 40px;
              background: white;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 600;
              color: #1f2937;
              font-size: 12px;
              opacity: 0.8;
            }
            
            .footer {
              background: #111827;
              color: #9ca3af;
              text-align: center;
              padding: 30px;
              font-size: 14px;
            }
            
            .footer p {
              margin-bottom: 10px;
            }
            
            .footer .company {
              color: white;
              font-weight: 600;
            }
            
            @media (max-width: 600px) {
              body { padding: 10px; }
              .container { border-radius: 15px; }
              .header { padding: 30px 20px; }
              .content { padding: 30px 20px; }
              .otp-code { font-size: 28px; padding: 15px 25px; letter-spacing: 4px; }
              .partner-logos { gap: 20px; }
              .partner-logo { width: 60px; height: 35px; font-size: 10px; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">
                <h1>TradePilot</h1>
                <p>Password Reset Security</p>
              </div>
            </div>
            
            <div class="content">
              <h2 class="reset-title">Password Reset Request</h2>
              <p class="reset-text">
                Hello ${username}, we received a request to reset your TradePilot account password. 
                No worries - this happens to the best of us! We're here to help you regain secure 
                access to your trading account quickly and safely.
              </p>
              
              <p style="font-size: 16px; color: #4b5563; text-align: center; margin-bottom: 30px;">
                To proceed with creating a new password, please use the verification code below. 
                This ensures only you can access and modify your account security settings.
              </p>
              
              <div class="otp-section">
                <div class="otp-label">Your Password Reset Code</div>
                <div class="otp-code" id="otpCodeReset">${code}</div>
                <button class="copy-button" onclick="copyResetCode()" id="copyBtnReset">Tap and hold to copy code</button>
                <div class="expire-text">⏰ This code expires in 15 minutes for your security</div>
                <p style="font-size: 14px; color: #6b7280; margin-top: 15px; line-height: 1.5;">
                  Copy this code and return to the password reset page where you initiated this request. 
                  Enter the code along with your new secure password to complete the reset process.
                </p>
              </div>
              
              <div style="background: #f0f9ff; border-left: 4px solid #dc2626; padding: 20px; margin: 30px 0; border-radius: 8px;">
                <p style="color: #b91c1c; font-size: 16px; margin: 0; font-weight: 500;">
                  💡 <strong>Password Security Tip:</strong> Choose a strong password with at least 8 characters, 
                  including uppercase, lowercase, numbers, and special characters for maximum security.
                </p>
              </div>
              
              <a href="#" class="cta-button">🔒 Reset My Password</a>
              
              <div class="security-notice">
                <h3>🛡️ Important Security Notice</h3>
                <p>
                  If you didn't request this password reset, please ignore this email - your account remains secure. 
                  However, if you're concerned about unauthorized access attempts, we recommend logging into your 
                  account and changing your password as a precautionary measure.
                </p>
              </div>
              
              <div style="text-align: center; padding: 25px; background: #fef7ed; border-radius: 12px; margin: 30px 0;">
                <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.6;">
                  🔐 <strong>Account Protection:</strong> After resetting your password, consider enabling two-factor 
                  authentication in your account settings for an extra layer of security on your trading account.
                </p>
              </div>
            </div>
            
            <div class="partners">
              <h3>🤝 Trusted Exchange Partners</h3>
              <div class="partner-logos">
                <div class="partner-logo">Binance</div>
                <div class="partner-logo">Coinbase</div>
                <div class="partner-logo">Kraken</div>
                <div class="partner-logo">Huobi</div>
                <div class="partner-logo">OKX</div>
              </div>
            </div>
            
            <div class="footer">
              <p>Need help? Our security team is available 24/7 to assist with account recovery.</p>
              <p class="company">© 2025 TradePilot. All rights reserved.</p>
              <p>🔒 Bank-Level Security • 🛡️ Advanced Encryption • 🌍 Trusted by 50,000+ traders worldwide</p>
              <p style="font-size: 12px; margin-top: 15px; opacity: 0.8;">
                This password reset was requested for your TradePilot account security. 
                We use industry-standard encryption to protect all account communications.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Password reset email sent to ${email} with code: ${code}`);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }
}