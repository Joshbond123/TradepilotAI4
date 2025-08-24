import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import BrandLogo from "@/components/ui/brand-logo";

// Import the generated images
import heroImage from "@assets/generated_images/Crypto_trading_hero_image_ecf83401.png";
import aiAutomationImage from "@assets/generated_images/AI_automation_feature_image_2cb8678c.png";
import securityImage from "@assets/generated_images/Security_feature_image_e75fdd32.png";
import portfolioImage from "@assets/generated_images/Portfolio_dashboard_image_daeb41b4.png";
import tradingImage from "@assets/generated_images/24/7_trading_image_5e5bfe2d.png";

// Import partner logos
import kucoinLogo from "@assets/lg-67add290548ff-Kucoin_1755678321594.webp";
import binanceLogo from "@assets/Binance-Logo.wine_1755678321693.png";
import coinbaseLogo from "@assets/coinbase-logo-full-text_1755678321735.webp";
import okxLogo from "@assets/images (2)_1755679363454.png";
import krakenLogo from "@assets/kraken_300x300@x2_1755678321817.png";
import bybitLogo from "@assets/bybit_300x300@x2_1755678321875.png";
import gateLogo from "@assets/images_1755679363507.png";
import huobiLogo from "@assets/images (1)_1755679363565.png";

export default function Landing() {
  const [, setLocation] = useLocation();
  const [adminClicks, setAdminClicks] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleLogoClick = async () => {
    setAdminClicks(prev => prev + 1);
    if (adminClicks + 1 === 5) {
      const password = prompt("Enter admin password:");
      if (password) {
        try {
          const response = await fetch("/api/admin/access", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ password }),
          });
          
          const result = await response.json();
          
          if (result.success) {
            localStorage.setItem("admin_access", "true");
            localStorage.setItem("token", result.token);
            localStorage.setItem("user", JSON.stringify(result.user));
            setLocation("/admin");
          } else {
            alert("Access Denied");
          }
        } catch (error) {
          console.error("Admin access error:", error);
          alert("Access Denied");
        }
      }
      setAdminClicks(0);
    }
  };

  return (
    <div className="min-h-screen bg-crypto-dark relative overflow-hidden">
      {/* Animated Background */}
      <div className="hero-3d-bg min-h-screen relative">
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="floating-3d absolute top-20 left-10 w-32 h-32 rounded-full bg-gradient-to-r from-crypto-blue/20 to-transparent blur-xl"></div>
          <div className="floating-3d-alt absolute top-40 right-20 w-24 h-24 rounded-full bg-gradient-to-r from-crypto-green/20 to-transparent blur-lg"></div>
          <div className="floating-3d absolute bottom-20 left-1/4 w-40 h-40 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-2xl"></div>
        </div>

        {/* Header */}
        <header className="relative z-20 px-4 sm:px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <BrandLogo 
              onClick={handleLogoClick}
              data-testid="logo"
              className="flex-shrink-0"
            />
            
            <motion.div 
              className="hidden lg:flex items-center space-x-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -20 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <a href="#features" className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105">Features</a>
              <a href="#how-it-works" className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105">How It Works</a>
              <a href="#plans" className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105">Plans</a>
              <a href="#testimonials" className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105">Reviews</a>
            </motion.div>
            
            <motion.div 
              className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 50 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Button 
                variant="ghost" 
                className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105 px-2 sm:px-4"
                onClick={() => setLocation("/login")}
                data-testid="button-login"
              >
                Login
              </Button>
              <Button 
                className="crypto-gradient hover:opacity-90 transition-all duration-300 transform hover:scale-105 font-medium px-3 py-1.5 text-xs whitespace-nowrap"
                onClick={() => setLocation("/register")}
                data-testid="button-signup"
              >
                Start Trading
              </Button>
            </motion.div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative z-10 px-6 pt-16 pb-24">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              
              {/* Hero Content */}
              <div className="space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
                  transition={{ duration: 1, delay: 0.6 }}
                >
                  <span className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-crypto-blue/20 to-crypto-green/20 text-crypto-blue text-sm font-semibold border border-crypto-blue/30 backdrop-blur-sm shimmer">
                    🤖 Advanced AI Technology • Live Trading • 24/7 Automation
                  </span>
                </motion.div>
                
                <motion.h1 
                  className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 50 }}
                  transition={{ duration: 1.2, delay: 0.8 }}
                >
                  <span className="text-white">AI-Powered</span><br />
                  <span className="bg-gradient-to-r from-crypto-blue via-crypto-green to-blue-400 bg-clip-text text-transparent">
                    Crypto Arbitrage
                  </span><br />
                  <span className="text-white">Revolution</span>
                </motion.h1>
                
                <motion.p 
                  className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-2xl"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -30 }}
                  transition={{ duration: 1, delay: 1.2 }}
                >
                  Unlock the power of artificial intelligence to maximize your cryptocurrency profits. Our cutting-edge algorithms scan <span className="text-crypto-green font-bold">50+ exchanges</span> in real-time, identifying profitable arbitrage opportunities and executing trades automatically while you sleep.
                </motion.p>
                
                <motion.div 
                  className="flex flex-col sm:flex-row gap-6 pt-4"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
                  transition={{ duration: 1, delay: 1.6 }}
                >
                  <Button 
                    className="crypto-gradient text-base font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-all duration-300 transform hover:scale-105 shadow-xl w-full sm:w-auto"
                    onClick={() => setLocation("/register")}
                    data-testid="button-start-trading"
                  >
                    Start Earning Today →
                  </Button>
                </motion.div>

                {/* Stats */}
                <motion.div 
                  className="grid grid-cols-3 gap-8 pt-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                  transition={{ duration: 1, delay: 2 }}
                >
                  <div className="text-center">
                    <div className="text-3xl font-bold text-crypto-green">$2.5M+</div>
                    <div className="text-sm text-gray-400">Total Profits</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-crypto-blue">15,000+</div>
                    <div className="text-sm text-gray-400">Active Traders</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-400">98.7%</div>
                    <div className="text-sm text-gray-400">Success Rate</div>
                  </div>
                </motion.div>
              </div>

              {/* Hero Image */}
              <motion.div 
                className="relative"
                initial={{ opacity: 0, scale: 0.8, rotateY: 20 }}
                animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.8, rotateY: isVisible ? 0 : 20 }}
                transition={{ duration: 1.5, delay: 1 }}
              >
                <div className="floating-3d relative">
                  <img 
                    src={heroImage} 
                    alt="Advanced cryptocurrency trading platform interface"
                    className="w-full h-auto rounded-3xl shadow-2xl border border-crypto-blue/20"
                  />
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-crypto-blue/10 to-crypto-green/10"></div>
                </div>
                
                {/* Floating profit indicators */}
                <motion.div 
                  className="absolute -top-4 -right-4 bg-crypto-green/90 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg"
                  animate={{ y: [-5, 5, -5] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  +24.7% Profit
                </motion.div>
                
                <motion.div 
                  className="absolute -bottom-4 -left-4 bg-crypto-blue/90 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg"
                  animate={{ y: [5, -5, 5] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                  Live Trading
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>
      </div>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-crypto-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Why Choose <span className="bg-gradient-to-r from-crypto-blue to-crypto-green bg-clip-text text-transparent">TradePilot</span>?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience the future of cryptocurrency trading with our revolutionary AI-powered platform designed to maximize your profits while minimizing risks.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* AI Automation Feature */}
            <motion.div 
              className="bg-crypto-dark/80 backdrop-blur-sm p-8 rounded-2xl border border-crypto-blue/20 hover:border-crypto-blue/40 transition-all duration-300 group hover:scale-105"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
              data-testid="feature-ai-automation"
            >
              <div className="mb-6">
                <img 
                  src={aiAutomationImage} 
                  alt="AI automation and machine learning algorithms"
                  className="w-full h-48 object-cover rounded-xl"
                />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-crypto-blue transition-colors">
                Advanced AI Automation
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Our sophisticated machine learning algorithms continuously analyze market patterns, predict price movements, and execute profitable trades automatically. No manual intervention required – just sit back and watch your portfolio grow.
              </p>
            </motion.div>

            {/* Real-time Monitoring */}
            <motion.div 
              className="bg-crypto-dark/80 backdrop-blur-sm p-8 rounded-2xl border border-crypto-green/20 hover:border-crypto-green/40 transition-all duration-300 group hover:scale-105"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              data-testid="feature-realtime-monitoring"
            >
              <div className="mb-6">
                <img 
                  src={portfolioImage} 
                  alt="Real-time portfolio monitoring and analytics dashboard"
                  className="w-full h-48 object-cover rounded-xl"
                />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-crypto-green transition-colors">
                Real-time Monitoring
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Track your investments with our comprehensive dashboard featuring real-time profit tracking, detailed analytics, and instant notifications. Stay informed about every opportunity and transaction as it happens.
              </p>
            </motion.div>

            {/* Security */}
            <motion.div 
              className="bg-crypto-dark/80 backdrop-blur-sm p-8 rounded-2xl border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 group hover:scale-105"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              data-testid="feature-security"
            >
              <div className="mb-6">
                <img 
                  src={securityImage} 
                  alt="Advanced security and encryption protection"
                  className="w-full h-48 object-cover rounded-xl"
                />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-yellow-400 transition-colors">
                Bank-Level Security
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Your funds and personal information are protected by military-grade encryption, multi-factor authentication, and cold storage security protocols. Trade with complete peace of mind knowing your assets are safe.
              </p>
            </motion.div>

            {/* 24/7 Trading */}
            <motion.div 
              className="bg-crypto-dark/80 backdrop-blur-sm p-8 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 group hover:scale-105"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              data-testid="feature-24-7-trading"
            >
              <div className="mb-6">
                <img 
                  src={tradingImage} 
                  alt="24/7 automated trading around the clock"
                  className="w-full h-48 object-cover rounded-xl"
                />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-purple-400 transition-colors">
                24/7 Automated Trading
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Never miss a profitable opportunity again. Our AI works around the clock, scanning global markets and executing trades even while you sleep. The cryptocurrency market never stops, and neither do we.
              </p>
            </motion.div>

            {/* Multi-Exchange */}
            <motion.div 
              className="bg-crypto-dark/80 backdrop-blur-sm p-8 rounded-2xl border border-crypto-blue/20 hover:border-crypto-blue/40 transition-all duration-300 group hover:scale-105"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: true }}
              data-testid="feature-multi-exchange"
            >
              <div className="mb-6 bg-gradient-to-br from-crypto-blue/20 to-crypto-green/20 rounded-xl p-6 text-center">
                <div className="text-5xl font-bold text-crypto-blue mb-2">50+</div>
                <div className="text-crypto-green font-semibold">Exchanges</div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-crypto-blue transition-colors">
                Multi-Exchange Access
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Connect to over 50 major cryptocurrency exchanges worldwide including Binance, Coinbase, Kraken, and more. Maximize arbitrage opportunities by accessing the broadest market coverage available.
              </p>
            </motion.div>

            {/* Instant Profits */}
            <motion.div 
              className="bg-crypto-dark/80 backdrop-blur-sm p-8 rounded-2xl border border-crypto-green/20 hover:border-crypto-green/40 transition-all duration-300 group hover:scale-105"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
              data-testid="feature-instant-profits"
            >
              <div className="mb-6 bg-gradient-to-br from-crypto-blue/20 to-blue-400/20 rounded-xl p-6 text-center">
                <div className="text-5xl font-bold text-crypto-blue mb-2">24/7</div>
                <div className="text-blue-400 font-semibold">Active Trading</div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-crypto-green transition-colors">
                Advanced Market Analysis
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Our sophisticated algorithms continuously monitor global cryptocurrency markets, identifying optimal arbitrage opportunities across multiple exchanges. Advanced risk management ensures stable returns while protecting your investment capital.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-6 bg-crypto-dark">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              How <span className="bg-gradient-to-r from-crypto-blue to-crypto-green bg-clip-text text-transparent">TradePilot</span> Works
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Get started in minutes and begin earning passive income through automated cryptocurrency arbitrage trading.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12">
            
            {/* Step 1 */}
            <motion.div 
              className="text-center group"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
              data-testid="step-1"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full crypto-gradient flex items-center justify-center text-3xl font-bold text-white shadow-2xl group-hover:scale-110 transition-transform duration-300">
                1
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Create Account</h3>
              <p className="text-gray-300 leading-relaxed">
                Sign up in under 2 minutes with just your email address. No complex verification processes or lengthy onboarding procedures required.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div 
              className="text-center group"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              data-testid="step-2"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full crypto-gradient flex items-center justify-center text-3xl font-bold text-white shadow-2xl group-hover:scale-110 transition-transform duration-300">
                2
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Choose Investment</h3>
              <p className="text-gray-300 leading-relaxed">
                Select from our carefully designed investment plans ranging from $50 to $10,000+. Each plan is optimized for different risk tolerance and profit targets.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div 
              className="text-center group"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              data-testid="step-3"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full crypto-gradient flex items-center justify-center text-3xl font-bold text-white shadow-2xl group-hover:scale-110 transition-transform duration-300">
                3
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Watch Profits Grow</h3>
              <p className="text-gray-300 leading-relaxed">
                Sit back and watch as our AI automatically trades on your behalf, generating consistent profits while you focus on what matters most to you.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Partner Logos Section */}
      <section className="py-16 px-6 bg-crypto-dark relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Trusted By Major <span className="bg-gradient-to-r from-crypto-blue to-crypto-green bg-clip-text text-transparent">Exchanges</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Connected to the world's leading cryptocurrency exchanges for maximum arbitrage opportunities
            </p>
          </motion.div>
          
          {/* Animated Partner Logos */}
          <div className="relative">
            {/* Left shadow gradient */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-crypto-dark to-transparent z-10 pointer-events-none"></div>
            
            {/* Right shadow gradient */}
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-crypto-dark to-transparent z-10 pointer-events-none"></div>
            
            {/* Scrolling logos container */}
            <div className="flex overflow-hidden">
              <motion.div 
                className="flex items-center space-x-20 whitespace-nowrap"
                animate={{ 
                  x: [-1600, -3200]
                }}
                transition={{
                  duration: 30,
                  repeat: Infinity,
                  ease: "linear",
                  repeatType: "loop"
                }}
              >
                {/* First set of logos */}
                <img src={binanceLogo} alt="Binance" className="h-20 md:h-24 object-contain opacity-80 hover:opacity-100 transition-opacity duration-300" />
                <img src={coinbaseLogo} alt="Coinbase" className="h-20 md:h-24 object-contain opacity-80 hover:opacity-100 transition-opacity duration-300" />
                <img src={kucoinLogo} alt="KuCoin" className="h-20 md:h-24 object-contain opacity-80 hover:opacity-100 transition-opacity duration-300" />
                <img src={krakenLogo} alt="Kraken" className="h-20 md:h-24 object-contain opacity-80 hover:opacity-100 transition-opacity duration-300" />
                <img src={okxLogo} alt="OKX" className="h-20 md:h-24 object-contain opacity-80 hover:opacity-100 transition-opacity duration-300" />
                <img src={bybitLogo} alt="Bybit" className="h-20 md:h-24 object-contain opacity-80 hover:opacity-100 transition-opacity duration-300" />
                <img src={gateLogo} alt="Gate.io" className="h-20 md:h-24 object-contain opacity-80 hover:opacity-100 transition-opacity duration-300" />
                <img src={huobiLogo} alt="Huobi" className="h-20 md:h-24 object-contain opacity-80 hover:opacity-100 transition-opacity duration-300" />
                
                {/* Second set for seamless loop */}
                <img src={binanceLogo} alt="Binance" className="h-20 md:h-24 object-contain opacity-80 hover:opacity-100 transition-opacity duration-300" />
                <img src={coinbaseLogo} alt="Coinbase" className="h-20 md:h-24 object-contain opacity-80 hover:opacity-100 transition-opacity duration-300" />
                <img src={kucoinLogo} alt="KuCoin" className="h-20 md:h-24 object-contain opacity-80 hover:opacity-100 transition-opacity duration-300" />
                <img src={krakenLogo} alt="Kraken" className="h-20 md:h-24 object-contain opacity-80 hover:opacity-100 transition-opacity duration-300" />
                <img src={okxLogo} alt="OKX" className="h-20 md:h-24 object-contain opacity-80 hover:opacity-100 transition-opacity duration-300" />
                <img src={bybitLogo} alt="Bybit" className="h-20 md:h-24 object-contain opacity-80 hover:opacity-100 transition-opacity duration-300" />
                <img src={gateLogo} alt="Gate.io" className="h-20 md:h-24 object-contain opacity-80 hover:opacity-100 transition-opacity duration-300" />
                <img src={huobiLogo} alt="Huobi" className="h-20 md:h-24 object-contain opacity-80 hover:opacity-100 transition-opacity duration-300" />
                
                {/* Third set for extra smooth looping */}
                <img src={binanceLogo} alt="Binance" className="h-20 md:h-24 object-contain opacity-80 hover:opacity-100 transition-opacity duration-300" />
                <img src={coinbaseLogo} alt="Coinbase" className="h-20 md:h-24 object-contain opacity-80 hover:opacity-100 transition-opacity duration-300" />
                <img src={kucoinLogo} alt="KuCoin" className="h-20 md:h-24 object-contain opacity-80 hover:opacity-100 transition-opacity duration-300" />
                <img src={krakenLogo} alt="Kraken" className="h-20 md:h-24 object-contain opacity-80 hover:opacity-100 transition-opacity duration-300" />
                <img src={okxLogo} alt="OKX" className="h-20 md:h-24 object-contain opacity-80 hover:opacity-100 transition-opacity duration-300" />
                <img src={bybitLogo} alt="Bybit" className="h-20 md:h-24 object-contain opacity-80 hover:opacity-100 transition-opacity duration-300" />
                <img src={gateLogo} alt="Gate.io" className="h-20 md:h-24 object-contain opacity-80 hover:opacity-100 transition-opacity duration-300" />
                <img src={huobiLogo} alt="Huobi" className="h-20 md:h-24 object-contain opacity-80 hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            </div>
          </div>
          
          <motion.div 
            className="text-center mt-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <p className="text-sm text-crypto-blue font-medium">
              + 40 More Global Exchanges
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-r from-crypto-blue/10 to-crypto-green/10 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Start Your <span className="bg-gradient-to-r from-crypto-blue to-crypto-green bg-clip-text text-transparent">Crypto Journey</span>?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of successful traders who are already earning passive income with TradePilot's AI-powered arbitrage trading platform.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                className="crypto-gradient text-base font-bold px-8 py-3 rounded-xl hover:opacity-90 transition-all duration-300 shadow-xl w-full sm:w-auto max-w-xs mx-auto"
                onClick={() => setLocation("/register")}
                data-testid="button-final-cta"
              >
                Start Trading Now →
              </Button>
            </motion.div>
            <p className="text-sm text-gray-400 mt-4">
              Secure trading platform • Advanced AI technology • Professional support
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}