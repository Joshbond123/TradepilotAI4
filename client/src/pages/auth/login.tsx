import { useState, useRef, useEffect } from "react";
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

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const { isEnabled: recaptchaEnabled, siteKey } = useRecaptcha();
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [recaptchaCompleted, setRecaptchaCompleted] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      await login(formData.email, formData.password, recaptchaToken);
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
        duration: 3000, // Show for 3 seconds only
      });
      setLocation("/dashboard");
    } catch (error) {
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
      
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
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
        <div className="floating-3d absolute top-20 left-10 w-32 h-32 rounded-full bg-gradient-to-r from-crypto-blue/10 to-transparent blur-xl"></div>
        <div className="floating-3d-alt absolute top-40 right-20 w-24 h-24 rounded-full bg-gradient-to-r from-crypto-green/10 to-transparent blur-lg"></div>
        <div className="floating-3d absolute bottom-20 left-1/4 w-40 h-40 rounded-full bg-gradient-to-r from-blue-500/5 to-purple-500/5 blur-2xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.9, y: isVisible ? 0 : 50 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="bg-crypto-card/90 backdrop-blur-xl border border-crypto-blue/20 shadow-2xl card-float">
          <CardHeader className="relative">
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
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center justify-center mb-4">
                <motion.div
                  animate={{ 
                    boxShadow: [
                      "0 0 20px hsl(217, 91%, 60%, 0.3)",
                      "0 0 30px hsl(217, 91%, 60%, 0.5)",
                      "0 0 20px hsl(217, 91%, 60%, 0.3)"
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
                Welcome Back
              </motion.h2>
              <motion.p 
                className="text-gray-400"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 20 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                Sign in to your TradePilot account
              </motion.p>
            </motion.div>
          </CardHeader>
          
          <CardContent>
            <motion.form 
              onSubmit={handleSubmit} 
              className="space-y-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -20 }}
                transition={{ duration: 0.6, delay: 1 }}
              >
                <Label className="text-gray-300 font-medium">Email</Label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-crypto-dark/50 backdrop-blur-sm border-gray-600/50 text-black placeholder-gray-400 focus:border-crypto-blue/50 input-focus-glow transition-all duration-300 mt-2"
                  required
                  data-testid="input-email"
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 20 }}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                <Label className="text-gray-300 font-medium">Password</Label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="bg-crypto-dark/50 backdrop-blur-sm border-gray-600/50 text-black placeholder-gray-400 focus:border-crypto-blue/50 input-focus-glow transition-all duration-300 mt-2"
                  required
                  data-testid="input-password"
                />
              </motion.div>
              
              {recaptchaEnabled && siteKey && (
                <motion.div 
                  className="flex flex-col items-center space-y-2"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.9 }}
                  transition={{ duration: 0.6, delay: 1.4 }}
                >
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={siteKey}
                    theme="dark"
                    onChange={(value) => {
                      setRecaptchaCompleted(!!value);
                    }}
                    onExpired={() => setRecaptchaCompleted(false)}
                    data-testid="recaptcha-login"
                  />
                  {!recaptchaCompleted && (
                    <p className="text-xs text-amber-400 text-center">
                      Please complete the reCAPTCHA to enable login
                    </p>
                  )}
                </motion.div>
              )}
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                transition={{ duration: 0.6, delay: 1.6 }}
              >
                <Button 
                  type="submit" 
                  className={`w-full transition-all duration-300 button-hover-lift font-medium py-3 text-lg ${
                    (recaptchaEnabled && !recaptchaCompleted) || isLoading
                      ? "bg-gray-600 cursor-not-allowed opacity-50" 
                      : "crypto-gradient hover:opacity-90"
                  }`}
                  disabled={isLoading || (recaptchaEnabled && !recaptchaCompleted)}
                  data-testid="button-signin"
                >
                  {isLoading ? (
                    <motion.div 
                      className="flex items-center justify-center space-x-2"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <span>Signing in...</span>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    </motion.div>
                  ) : (
                    "Sign In →"
                  )}
                </Button>
              </motion.div>
            </motion.form>
            
            <motion.div 
              className="mt-6 text-center space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: isVisible ? 1 : 0 }}
              transition={{ duration: 0.6, delay: 1.8 }}
            >
              <Button
                variant="link"
                className="text-orange-400 hover:text-orange-300 hover:underline p-0 transition-all duration-300 hover:scale-105"
                onClick={() => setLocation("/auth/forgot-password")}
                data-testid="link-forgot-password"
              >
                Forgot Password?
              </Button>
              
              <p className="text-gray-400">
                Don't have an account?{" "}
                <Button
                  variant="link"
                  className="text-crypto-blue hover:text-crypto-green hover:underline p-0 transition-all duration-300"
                  onClick={() => setLocation("/register")}
                  data-testid="link-signup"
                >
                  Sign up
                </Button>
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}