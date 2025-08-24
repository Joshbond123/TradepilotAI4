import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import ReCAPTCHA from "react-google-recaptcha";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useRecaptcha } from "@/hooks/use-recaptcha";
import { motion } from "framer-motion";
import BrandLogo from "@/components/ui/brand-logo";

export default function Register() {
  const [, setLocation] = useLocation();
  const { register } = useAuth();
  const { toast } = useToast();
  const { isEnabled: recaptchaEnabled, siteKey } = useRecaptcha();
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [recaptchaCompleted, setRecaptchaCompleted] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    country: "",
  });

  useEffect(() => {
    setIsVisible(true);
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get("ref");
    if (refCode) {
      setReferralCode(refCode);
    }

    // Auto-detect country based on IP
    const detectCountry = async () => {
      try {
        const response = await fetch('/api/detect-country');
        if (response.ok) {
          const data = await response.json();
          setFormData(prev => ({ ...prev, country: data.country || "" }));
        }
      } catch (error) {
        console.log('Country detection failed:', error);
      }
    };
    
    detectCountry();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      let recaptchaToken = "";
      
      if (recaptchaEnabled && recaptchaRef.current) {
        recaptchaToken = recaptchaRef.current.getValue() || "";
        if (!recaptchaToken) {
          toast({
            title: "reCAPTCHA Required",
            description: "Please complete the reCAPTCHA verification.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      }

      const result = await register({
        ...formData,
        referralCode: referralCode || undefined,
        recaptchaToken,
      });
      
      toast({
        title: "Registration Successful!",
        description: "Please check your email for a verification code to activate your account.",
        variant: "default",
      });
      
      setLocation(`/auth/verify?email=${encodeURIComponent(formData.email)}`);
    } catch (error) {
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
      
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-3d-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="floating-3d absolute top-20 left-10 w-32 h-32 rounded-full bg-gradient-to-r from-crypto-green/10 to-transparent blur-xl"></div>
        <div className="floating-3d-alt absolute top-40 right-20 w-24 h-24 rounded-full bg-gradient-to-r from-crypto-blue/10 to-transparent blur-lg"></div>
        <div className="floating-3d absolute bottom-20 right-1/4 w-40 h-40 rounded-full bg-gradient-to-r from-purple-500/5 to-blue-500/5 blur-2xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.9, y: isVisible ? 0 : 50 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-lg relative z-10"
      >
        <Card className="bg-crypto-card/90 backdrop-blur-xl border border-crypto-green/20 shadow-2xl card-float">
          <CardHeader className="relative pb-0">
            <motion.button
              className="absolute right-4 top-4 text-gray-400 hover:text-white transition-all duration-300 hover:scale-110 z-10"
              onClick={() => setLocation("/")}
              data-testid="button-close"
              whileHover={{ rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
            
            <motion.div 
              className="text-center pt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center justify-center mb-4">
                <motion.div
                  animate={{ 
                    boxShadow: [
                      "0 0 20px hsl(160, 84%, 39%, 0.3)",
                      "0 0 30px hsl(160, 84%, 39%, 0.5)",
                      "0 0 20px hsl(160, 84%, 39%, 0.3)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <BrandLogo size="md" showText={false} />
                </motion.div>
              </div>
              <motion.h2 
                className="text-3xl font-bold text-white mb-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -20 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Join TradePilot
              </motion.h2>
              <motion.p 
                className="text-gray-400"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 20 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                Start your AI arbitrage trading journey
              </motion.p>
            </motion.div>
            
            {referralCode && (
              <motion.div 
                className="mt-6 p-4 rounded-xl bg-gradient-to-r from-crypto-green/20 to-green-600/20 border border-crypto-green/30"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.9 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 text-crypto-green">🎁</div>
                  <div>
                    <p className="text-crypto-green font-semibold text-sm">Referral Bonus!</p>
                    <p className="text-gray-300 text-xs">You'll earn a bonus when you make your first deposit</p>
                  </div>
                </div>
              </motion.div>
            )}
          </CardHeader>
          
          <CardContent className="pt-6">
            <motion.form 
              onSubmit={handleSubmit} 
              className="space-y-5"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -20 }}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                <Label className="text-gray-300 font-medium">Username</Label>
                <Input
                  type="text"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="bg-crypto-dark/50 backdrop-blur-sm border-gray-600/50 text-black placeholder-gray-400 focus:border-crypto-green/50 input-focus-glow transition-all duration-300 mt-2"
                  required
                  minLength={3}
                  maxLength={20}
                  data-testid="input-username"
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 20 }}
                transition={{ duration: 0.6, delay: 1.4 }}
              >
                <Label className="text-gray-300 font-medium">Email Address</Label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-crypto-dark/50 backdrop-blur-sm border-gray-600/50 text-black placeholder-gray-400 focus:border-crypto-green/50 input-focus-glow transition-all duration-300 mt-2"
                  required
                  data-testid="input-email"
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -20 }}
                transition={{ duration: 0.6, delay: 1.6 }}
              >
                <Label className="text-gray-300 font-medium">Password</Label>
                <Input
                  type="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="bg-crypto-dark/50 backdrop-blur-sm border-gray-600/50 text-black placeholder-gray-400 focus:border-crypto-green/50 input-focus-glow transition-all duration-300 mt-2"
                  required
                  minLength={6}
                  data-testid="input-password"
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 20 }}
                transition={{ duration: 0.6, delay: 1.8 }}
              >
                <Label className="text-gray-300 font-medium">Confirm Password</Label>
                <Input
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="bg-crypto-dark/50 backdrop-blur-sm border-gray-600/50 text-black placeholder-gray-400 focus:border-crypto-green/50 input-focus-glow transition-all duration-300 mt-2"
                  required
                  minLength={6}
                  data-testid="input-confirm-password"
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                transition={{ duration: 0.6, delay: 2 }}
              >
                <Label className="text-gray-300 font-medium">Referral Code (Optional)</Label>
                <Input
                  type="text"
                  placeholder="Enter referral code if you have one"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  className="bg-crypto-dark/50 backdrop-blur-sm border-gray-600/50 text-black placeholder-gray-400 focus:border-crypto-green/50 input-focus-glow transition-all duration-300 mt-2"
                  data-testid="input-referral"
                />
                {referralCode && (
                  <motion.p 
                    className="text-xs text-crypto-green mt-1 flex items-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="w-3 h-3 mr-1">✓</span>
                    Referral code applied
                  </motion.p>
                )}
              </motion.div>

              {recaptchaEnabled && siteKey && (
                <motion.div 
                  className="flex flex-col items-center space-y-2"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.9 }}
                  transition={{ duration: 0.6, delay: 2.2 }}
                >
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={siteKey}
                    theme="dark"
                    onChange={(value) => {
                      setRecaptchaCompleted(!!value);
                    }}
                    onExpired={() => setRecaptchaCompleted(false)}
                    data-testid="recaptcha-register"
                  />
                  {!recaptchaCompleted && (
                    <p className="text-xs text-amber-400 text-center">
                      Please complete the reCAPTCHA to enable registration
                    </p>
                  )}
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                transition={{ duration: 0.6, delay: 2.4 }}
              >
                <Button 
                  type="submit" 
                  className={`w-full text-lg font-semibold py-6 rounded-xl transition-all duration-300 button-hover-lift ${
                    (recaptchaEnabled && !recaptchaCompleted) || isLoading
                      ? "bg-gray-600 cursor-not-allowed opacity-50" 
                      : "crypto-gradient hover:opacity-90"
                  }`}
                  disabled={isLoading || (recaptchaEnabled && !recaptchaCompleted)}
                  data-testid="button-create-account"
                >
                  {isLoading ? (
                    <motion.div 
                      className="flex items-center justify-center space-x-2"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Creating Account...</span>
                    </motion.div>
                  ) : (
                    "Create Account & Start Trading →"
                  )}
                </Button>
              </motion.div>
            </motion.form>

            <motion.div 
              className="mt-8 space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: isVisible ? 1 : 0 }}
              transition={{ duration: 0.6, delay: 2.6 }}
            >
              <motion.div 
                className="flex items-center space-x-4 p-4 rounded-xl bg-crypto-blue/10 border border-crypto-blue/20"
                whileHover={{ scale: 1.02, borderColor: "hsl(217, 91%, 60%, 0.4)" }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-5 h-5 text-crypto-blue">👥</div>
                <div>
                  <p className="text-white text-sm font-medium">Join 15,000+ Traders</p>
                  <p className="text-gray-400 text-xs">Earning passive income with AI arbitrage</p>
                </div>
              </motion.div>
              
              <div className="text-center">
                <p className="text-gray-400 text-sm">
                  Already have an account?{" "}
                  <Button
                    variant="link"
                    className="text-crypto-blue hover:text-crypto-green hover:underline p-0 font-semibold transition-all duration-300"
                    onClick={() => setLocation("/login")}
                    data-testid="link-signin"
                  >
                    Sign in here
                  </Button>
                </p>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}