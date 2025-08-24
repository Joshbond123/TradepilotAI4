import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { verifyAccountSchema, type VerifyAccountData } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function VerifyAccount() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const form = useForm<VerifyAccountData>({
    resolver: zodResolver(verifyAccountSchema),
    defaultValues: {
      email: "",
      verificationCode: "",
    },
  });

  useEffect(() => {
    setIsVisible(true);
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    if (email) {
      form.setValue('email', email);
    }
  }, [form]);

  const onSubmit = async (data: VerifyAccountData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Account Verified!",
          description: result.message + " You can now log in to your account.",
        });
        setLocation("/auth/login");
      } else {
        const error = await response.json();
        toast({
          title: "Verification Failed",
          description: error.message || "Please check your verification code and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendCode = async () => {
    setIsResending(true);
    try {
      const email = form.getValues('email');
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        toast({
          title: "Code Resent!",
          description: "A new verification code has been sent to your email.",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to resend verification code.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen hero-3d-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="floating-3d absolute top-20 left-10 w-32 h-32 rounded-full bg-gradient-to-r from-green-500/10 to-transparent blur-xl"></div>
        <div className="floating-3d-alt absolute top-40 right-20 w-24 h-24 rounded-full bg-gradient-to-r from-blue-500/10 to-transparent blur-lg"></div>
        <div className="floating-3d absolute bottom-20 right-1/4 w-40 h-40 rounded-full bg-gradient-to-r from-emerald-500/5 to-teal-500/5 blur-2xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.9, y: isVisible ? 0 : 50 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="bg-crypto-card/90 backdrop-blur-xl border border-green-500/20 shadow-2xl card-float">
          <CardHeader className="text-center relative">
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
              className="flex justify-center mb-4"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.5 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.div 
                className="rounded-full bg-gradient-to-r from-green-500 to-emerald-500 p-3 shadow-lg"
                animate={{ 
                  boxShadow: [
                    "0 0 20px hsl(160, 84%, 39%, 0.3)",
                    "0 0 30px hsl(160, 84%, 39%, 0.5)",
                    "0 0 20px hsl(160, 84%, 39%, 0.3)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Verify Account
              </CardTitle>
              <CardDescription className="text-gray-400 mt-2">
                Enter the verification code sent to your email
              </CardDescription>
            </motion.div>
          </CardHeader>
          
          <CardContent>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -20 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                  >
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300 font-medium">Email Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Your email address"
                              {...field}
                              className="bg-crypto-dark/50 backdrop-blur-sm border-gray-600/50 text-black placeholder-gray-400 focus:border-green-500/50 input-focus-glow transition-all duration-300"
                              data-testid="input-email"
                              readOnly
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 20 }}
                    transition={{ duration: 0.6, delay: 1 }}
                  >
                    <FormField
                      control={form.control}
                      name="verificationCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300 font-medium">Verification Code</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your 5-digit code"
                              {...field}
                              className="bg-crypto-dark/50 backdrop-blur-sm border-gray-600/50 text-black placeholder-gray-400 focus:border-green-500/50 input-focus-glow transition-all duration-300 text-center text-2xl tracking-widest"
                              maxLength={5}
                              data-testid="input-verification-code"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                    transition={{ duration: 0.6, delay: 1.2 }}
                  >
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90 transition-all duration-300 button-hover-lift font-medium py-3 text-lg"
                      disabled={isSubmitting}
                      data-testid="button-verify"
                    >
                      {isSubmitting ? (
                        <motion.div 
                          className="flex items-center justify-center space-x-2"
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Verifying...</span>
                        </motion.div>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Verify Account
                        </>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </Form>
            </motion.div>
            
            <motion.div 
              className="mt-6 text-center space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: isVisible ? 1 : 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
            >
              <Button
                variant="link"
                className="text-gray-400 hover:text-green-400 transition-all duration-300 hover:scale-105"
                onClick={resendCode}
                disabled={isResending}
                data-testid="button-resend-code"
              >
                {isResending ? (
                  <motion.div 
                    className="flex items-center space-x-2"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <div className="w-4 h-4 border-2 border-gray-400/30 border-t-gray-400 rounded-full animate-spin"></div>
                    <span>Resending...</span>
                  </motion.div>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Resend Code
                  </>
                )}
              </Button>
              
              <div>
                <Button
                  variant="link"
                  className="text-gray-400 hover:text-white transition-all duration-300 hover:scale-105"
                  onClick={() => setLocation("/login")}
                  data-testid="link-back-to-login"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Login
                </Button>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}