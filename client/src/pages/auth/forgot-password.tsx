import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordData } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function ForgotPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const form = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Reset Code Sent!",
          description: result.message,
        });
        setLocation(`/auth/reset-password?email=${encodeURIComponent(data.email)}`);
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to send reset code.",
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

  return (
    <div className="min-h-screen hero-3d-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="floating-3d absolute top-20 left-10 w-32 h-32 rounded-full bg-gradient-to-r from-orange-500/10 to-transparent blur-xl"></div>
        <div className="floating-3d-alt absolute top-40 right-20 w-24 h-24 rounded-full bg-gradient-to-r from-red-500/10 to-transparent blur-lg"></div>
        <div className="floating-3d absolute bottom-20 left-1/4 w-40 h-40 rounded-full bg-gradient-to-r from-yellow-500/5 to-orange-500/5 blur-2xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.9, y: isVisible ? 0 : 50 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="bg-crypto-card/90 backdrop-blur-xl border border-orange-500/20 shadow-2xl card-float">
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
                className="rounded-full bg-gradient-to-r from-orange-500 to-red-500 p-3 shadow-lg"
                animate={{ 
                  boxShadow: [
                    "0 0 20px hsl(20, 100%, 50%, 0.3)",
                    "0 0 30px hsl(20, 100%, 50%, 0.5)",
                    "0 0 20px hsl(20, 100%, 50%, 0.3)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Reset Password
              </CardTitle>
              <CardDescription className="text-gray-400 mt-2">
                Enter your email address and we'll send you a reset code
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
                              placeholder="Enter your email address"
                              {...field}
                              className="bg-crypto-dark/50 backdrop-blur-sm border-gray-600/50 text-black placeholder-gray-400 focus:border-orange-500/50 input-focus-glow transition-all duration-300"
                              data-testid="input-email"
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
                    transition={{ duration: 0.6, delay: 1 }}
                  >
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 transition-all duration-300 button-hover-lift font-medium py-3 text-lg"
                      disabled={isSubmitting}
                      data-testid="button-send-reset"
                    >
                      {isSubmitting ? (
                        <motion.div 
                          className="flex items-center justify-center space-x-2"
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Sending Reset Code...</span>
                        </motion.div>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Send Reset Code
                        </>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </Form>
            </motion.div>
            
            <motion.div 
              className="mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: isVisible ? 1 : 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
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
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}