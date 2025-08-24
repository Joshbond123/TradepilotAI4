import { Bot, Headphones, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useLocation } from "wouter";

export function ContactPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-crypto-dark">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/dashboard')}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">Contact TradePilot</h1>
              <p className="text-gray-400">Choose how you'd like to get help</p>
            </div>
          </div>

          {/* Contact Options */}
          <div className="grid gap-6">
            {/* AI Chat Option */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card
                className="bg-gray-900/50 border-gray-700 hover:border-blue-500/50 transition-all cursor-pointer group"
                onClick={() => setLocation('/ai-chat')}
              >
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white group-hover:text-blue-400 transition-colors">
                        Chat with AI 🤖
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Get instant help from TradePilot AI Assistant
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Ask questions about trading strategies, profit calculations, market insights, or just have a friendly conversation. 
                    Available 24/7 with instant responses!
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-400">AI is online and ready</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Support Ticket Option */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card
                className="bg-gray-900/50 border-gray-700 hover:border-green-500/50 transition-all cursor-pointer group"
                onClick={() => setLocation('/inbox')}
              >
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Headphones className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white group-hover:text-green-400 transition-colors">
                        Contact Support 📩
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Create a support ticket for complex issues
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Need help with account issues, technical problems, or have detailed questions? 
                    Our support team will respond to your ticket within 24 hours.
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                    <span className="text-xs text-orange-400">Response within 24 hours</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Quick Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <Card className="bg-gray-900/30 border-gray-700">
              <CardHeader>
                <CardTitle className="text-sm text-gray-300">💡 Quick Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-gray-400">
                  • Use AI Chat for quick questions and general help
                </p>
                <p className="text-xs text-gray-400">
                  • Use Support Tickets for account-specific issues
                </p>
                <p className="text-xs text-gray-400">
                  • AI can help with trading strategies and profit calculations
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}