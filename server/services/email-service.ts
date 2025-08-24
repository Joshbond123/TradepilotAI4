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
      subject: 'Verify Your TradePilot Account',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your TradePilot Account</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              background-color: #f8fafc;
              padding: 20px;
              line-height: 1.6;
            }
            
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 24px rgba(0,0,0,0.1);
            }
            
            .header {
              background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
              padding: 32px 24px;
              text-align: center;
            }
            
            .logo h1 {
              color: #ffffff;
              font-size: 28px;
              font-weight: 700;
              margin-bottom: 4px;
            }
            
            .logo p {
              color: rgba(255,255,255,0.9);
              font-size: 14px;
              font-weight: 400;
            }
            
            .content {
              padding: 32px 24px;
            }
            
            .greeting {
              font-size: 18px;
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 16px;
            }
            
            .message {
              font-size: 16px;
              color: #6b7280;
              margin-bottom: 32px;
            }
            
            .code-section {
              background: #f8fafc;
              border: 2px solid #e5e7eb;
              border-radius: 12px;
              padding: 24px;
              text-align: center;
              margin: 32px 0;
            }
            
            .code-label {
              font-size: 16px;
              color: #374151;
              margin-bottom: 16px;
              font-weight: 600;
            }
            
            .verification-code {
              background: #1e3a8a;
              color: white;
              font-size: 32px;
              font-weight: 700;
              padding: 16px 32px;
              border-radius: 8px;
              letter-spacing: 4px;
              font-family: 'Monaco', 'Consolas', monospace;
              display: inline-block;
              margin: 8px 0;
            }
            
            .footer {
              background: #f8fafc;
              color: #6b7280;
              text-align: center;
              padding: 24px;
              font-size: 12px;
              border-top: 1px solid #e5e7eb;
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
              <div class="greeting">Hello ${username},</div>
              <p class="message">
                Here is your verification code to complete your registration.
              </p>
              
              <div class="code-section">
                <div class="code-label">Verification Code</div>
                <div class="verification-code">${code}</div>
              </div>
            </div>
            
            <div class="footer">
              <p>If you did not request this, please ignore this email.</p>
              <p>© 2025 TradePilot. All rights reserved.</p>
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
      subject: 'Reset Your TradePilot Password',
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
              
              <div style="text-align: center; padding: 25px; background: #fef7ed; border-radius: 12px; margin: 30px 0;">
                <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.6;">
                  🛡️ <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email - your account remains secure. 
                  However, if you're concerned about unauthorized access attempts, we recommend logging into your 
                  account and changing your password as a precautionary measure.
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
          
          <script>
            function copyResetCode() {
              const code = document.getElementById('otpCodeReset').textContent.trim();
              if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(code).then(() => {
                  const button = document.getElementById('copyBtnReset');
                  button.innerHTML = '✅ Copied!';
                  setTimeout(() => {
                    button.innerHTML = 'Tap and hold to copy code';
                  }, 2000);
                }).catch(() => {
                  fallbackCopyTextToClipboard(code);
                });
              } else {
                fallbackCopyTextToClipboard(code);
              }
            }
            
            function fallbackCopyTextToClipboard(text) {
              const textArea = document.createElement("textarea");
              textArea.value = text;
              textArea.style.position = "fixed";
              textArea.style.left = "-999999px";
              textArea.style.top = "-999999px";
              document.body.appendChild(textArea);
              textArea.focus();
              textArea.select();
              try {
                document.execCommand('copy');
                const button = document.getElementById('copyBtnReset');
                button.innerHTML = '✅ Copied!';
                setTimeout(() => {
                  button.innerHTML = 'Tap and hold to copy code';
                }, 2000);
              } catch (err) {
                const button = document.getElementById('copyBtnReset');
                button.innerHTML = '📝 Select & Copy';
                setTimeout(() => {
                  button.innerHTML = 'Tap and hold to copy code';
                }, 2000);
              }
              document.body.removeChild(textArea);
            }
          </script>
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


  static async sendWelcomeEmail(email: string, username: string, dashboardUrl?: string, requestOrigin?: string) {
    // Get dynamic email welcome settings
    const { FileStorage } = await import('../storage');
    const storage = new FileStorage();
    const settings = await storage.getSystemSettings();
    const emailSettings = settings?.email_welcome || {
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
        }
      ],
      steps: [
        "Access your personalized investment dashboard",
        "Explore our high-performance investment plans"
      ],
      cta_text: "🎯 Access Your Investment Dashboard",
      footer_message: "Welcome to the future of intelligent investing. Your success is our mission."
    };

    // Auto-detect domain from request origin or environment
    const detectedDomain = dashboardUrl || 
      requestOrigin ||
      (process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : null) ||
      process.env.REPLIT_APP_DOMAIN ||
      (process.env.REPLIT_APP_DOMAIN ? `https://${process.env.REPLIT_APP_DOMAIN}` : null) ||
      // Fallback to detected environment
      'https://localhost:5000';
    
    const dashboardLink = `${detectedDomain}/dashboard`;
    const mailOptions = {
      from: '"TradePilot" <TradePilota@gmail.com>',
      to: email,
      subject: emailSettings.subject,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to TradePilot</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              background-color: #f8fafc;
              padding: 20px;
              line-height: 1.6;
            }
            
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 24px rgba(0,0,0,0.1);
            }
            
            .header {
              background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
              padding: 40px 24px;
              text-align: center;
            }
            
            .logo h1 {
              color: #ffffff;
              font-size: 32px;
              font-weight: 700;
              margin-bottom: 8px;
            }
            
            .logo p {
              color: rgba(255,255,255,0.9);
              font-size: 16px;
              font-weight: 400;
            }
            
            .welcome-badge {
              background: rgba(255,255,255,0.15);
              color: #ffffff;
              padding: 8px 16px;
              border-radius: 20px;
              font-size: 14px;
              font-weight: 600;
              margin-top: 16px;
              display: inline-block;
            }
            
            .content {
              padding: 40px 32px;
            }
            
            .greeting {
              font-size: 24px;
              font-weight: 700;
              color: #1f2937;
              margin-bottom: 16px;
              text-align: center;
            }
            
            .subheading {
              font-size: 18px;
              color: #6b7280;
              margin-bottom: 32px;
              text-align: center;
            }
            
            .benefits {
              background: #f8fafc;
              border-radius: 12px;
              padding: 24px;
              margin: 32px 0;
            }
            
            .benefits h3 {
              color: #1f2937;
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 16px;
            }
            
            .benefit-item {
              display: flex;
              align-items: flex-start;
              margin-bottom: 12px;
            }
            
            .benefit-icon {
              width: 20px;
              height: 20px;
              background: #10b981;
              border-radius: 50%;
              margin-right: 12px;
              margin-top: 2px;
              flex-shrink: 0;
              position: relative;
            }
            
            .benefit-icon::after {
              content: '✓';
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              color: white;
              font-size: 12px;
              font-weight: bold;
            }
            
            .benefit-text {
              color: #4b5563;
              font-size: 16px;
              line-height: 1.5;
            }
            
            .steps {
              background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
              border-radius: 12px;
              padding: 24px;
              margin: 32px 0;
            }
            
            .steps h3 {
              color: #1e3a8a;
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 16px;
            }
            
            .step-item {
              display: flex;
              align-items: flex-start;
              margin-bottom: 16px;
            }
            
            .step-number {
              width: 24px;
              height: 24px;
              background: #3b82f6;
              color: white;
              border-radius: 50%;
              font-size: 14px;
              font-weight: 600;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 12px;
              flex-shrink: 0;
            }
            
            .step-text {
              color: #1e3a8a;
              font-size: 16px;
              font-weight: 500;
              line-height: 1.5;
            }
            
            .cta-section {
              text-align: center;
              margin: 32px 0;
            }
            
            .cta-button {
              background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
              color: #ffffff;
              text-decoration: none;
              padding: 16px 32px;
              border-radius: 8px;
              font-size: 16px;
              font-weight: 600;
              display: inline-block;
              box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
              transition: all 0.3s ease;
            }
            
            .cta-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
            }
            
            .footer {
              background: #f9fafb;
              padding: 32px 24px;
              text-align: center;
              border-top: 1px solid #e5e7eb;
            }
            
            .footer-text {
              color: #6b7280;
              font-size: 14px;
              margin-bottom: 16px;
            }
            
            .social-links {
              margin: 16px 0;
            }
            
            .security-badge {
              background: #10b981;
              color: white;
              padding: 8px 16px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
              display: inline-block;
              margin-top: 16px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">
                <h1>TradePilot</h1>
                <p>Your Gateway to Crypto Success</p>
                <div class="welcome-badge">🎉 Account Verified Successfully!</div>
              </div>
            </div>
            
            <div class="content">
              <div class="greeting">${emailSettings.title}, ${username}!</div>
              <div class="subheading">${emailSettings.subtitle}</div>
              
              <div class="benefits">
                <h3>💎 Your TradePilot Advantages:</h3>
                <div class="benefit-item">
                  <div class="benefit-icon"></div>
                  <div class="benefit-text"><strong>AI-Powered Trading:</strong> Advanced algorithms execute profitable arbitrage trades automatically</div>
                </div>
                <div class="benefit-item">
                  <div class="benefit-icon"></div>
                  <div class="benefit-text"><strong>Daily Profit Generation:</strong> Watch your balance grow with consistent returns every day</div>
                </div>
                <div class="benefit-item">
                  <div class="benefit-icon"></div>
                  <div class="benefit-text"><strong>Real-Time Analytics:</strong> Monitor market opportunities and your performance 24/7</div>
                </div>
                <div class="benefit-item">
                  <div class="benefit-icon"></div>
                  <div class="benefit-text"><strong>Secure Environment:</strong> Bank-grade security ensures your investments are protected</div>
                </div>
                <div class="benefit-item">
                  <div class="benefit-icon"></div>
                  <div class="benefit-text"><strong>Flexible Withdrawals:</strong> Access your profits anytime with instant processing</div>
                </div>
              </div>
              
              <div class="steps">
                <h3>🎯 Your Next Steps to Success:</h3>
                <div class="step-item">
                  <div class="step-number">1</div>
                  <div class="step-text">Log in to your dashboard and explore our investment plans</div>
                </div>
                <div class="step-item">
                  <div class="step-number">2</div>
                  <div class="step-text">Choose a plan that fits your investment goals</div>
                </div>
                <div class="step-item">
                  <div class="step-number">3</div>
                  <div class="step-text">Make your first deposit and watch your profits grow</div>
                </div>
                <div class="step-item">
                  <div class="step-number">4</div>
                  <div class="step-text">Track your daily earnings and withdraw anytime</div>
                </div>
              </div>
              
              <div class="cta-section">
                <a href="${dashboardUrl || process.env.REPLIT_APP_DOMAIN || 'https://tradepilot-ewpb.onrender.com'}/dashboard" class="cta-button">
                  🚀 Access Your Dashboard
                </a>
                <p style="margin-top: 16px; color: #6b7280; font-size: 14px;">
                  Start your profitable investment journey today with TradePilot's advanced trading system
                </p>
              </div>
            </div>
            
            <div class="footer">
              <p class="footer-text">
                Thank you for choosing TradePilot. We're committed to your financial success.
              </p>
              <div class="security-badge">🔒 Secure & Regulated Platform</div>
              <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
                This email was sent to ${email}. TradePilot - Your Trusted Investment Partner.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Welcome email sent to ${email}`);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      throw new Error('Failed to send welcome email');
    }
  }
}
