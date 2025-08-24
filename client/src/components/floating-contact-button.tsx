import { useState, useEffect } from "react";
import { MessageCircle, X, Bot, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

interface FloatingContactButtonProps {
  onChatClick?: () => void;
}

export function FloatingContactButton({ onChatClick }: FloatingContactButtonProps) {
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [showMainModal, setShowMainModal] = useState(false);
  const [showGreetingBubble, setShowGreetingBubble] = useState(false);
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  // Show greeting bubble immediately when user visits dashboard
  useEffect(() => {
    if (user?.id) {
      const currentUserId = sessionStorage.getItem('tradepilot-current-user');
      const greetingShown = sessionStorage.getItem('tradepilot-greeting-shown') === 'true';
      
      // Show greeting if:
      // 1. No greeting shown yet for this session, OR
      // 2. Different user logged in
      if (!greetingShown || currentUserId !== user.id) {
        // Update session tracking
        sessionStorage.setItem('tradepilot-current-user', user.id);
        sessionStorage.setItem('tradepilot-greeting-shown', 'true');
        
        // Show greeting bubble immediately
        setShowGreetingBubble(true);
        
        // Auto-hide greeting bubble after 6 seconds
        const timer = setTimeout(() => {
          setShowGreetingBubble(false);
        }, 6000);

        return () => clearTimeout(timer);
      }
    } else {
      // User logged out - clear session storage
      sessionStorage.removeItem('tradepilot-greeting-shown');
      sessionStorage.removeItem('tradepilot-current-user');
      setShowGreetingBubble(false);
    }
  }, [user?.id]);

  const handleButtonClick = () => {
    setShowMainModal(true);
    onChatClick?.();
  };

  const handleChatClick = () => {
    setShowMainModal(false);
    // Navigate to AI chat which will automatically trigger the first message
    setLocation('/ai-chat');
  };

  const handleSupportClick = () => {
    setShowMainModal(false);
    setLocation('/support');
  };

  return (
    <>
      <div className="fixed bottom-24 right-6 z-50">
        {/* Greeting Bubble on Hover */}
        <AnimatePresence>
          {showGreetingBubble && user && (
            <motion.div
              initial={{ 
                opacity: 0, 
                scale: 0.3,
                x: 50, 
                y: 20,
                originX: 1,
                originY: 1
              }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                x: 0, 
                y: 0 
              }}
              exit={{ 
                opacity: 0, 
                scale: 0.3,
                x: 50, 
                y: 20,
                transition: { duration: 0.4, ease: "easeInOut" }
              }}
              transition={{ 
                duration: 0.6, 
                type: "spring", 
                damping: 18, 
                stiffness: 280 
              }}
              className="absolute bottom-20 right-0 w-64 mb-2 z-10"
            >
              <div className="relative">
                {/* Soft glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-200/40 via-purple-200/40 to-cyan-200/40 rounded-2xl blur-xl"></div>
                
                {/* Main greeting bubble */}
                <div className="relative bg-white/95 dark:bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-xl border border-gray-200/80">
                  <div className="flex items-center gap-2">
                    <div className="text-xl animate-bounce">👋</div>
                    <div className="flex-1">
                      <p className="text-gray-800 dark:text-gray-800 text-sm font-medium">
                        Hi {user.username}! TradePilot AI is ready to chat
                      </p>
                    </div>
                  </div>
                  
                  {/* Subtle inner glow */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 pointer-events-none"></div>
                </div>
                
                {/* Enhanced pointer tail pointing toward the floating icon */}
                <div className="absolute bottom-0 right-6 transform translate-y-full">
                  <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[12px] border-t-white/95 dark:border-t-white/90 filter drop-shadow-sm"></div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Welcome Popup */}
        <AnimatePresence>
          {showWelcomePopup && (
            <motion.div
              initial={{ 
                opacity: 0, 
                scale: 0.3, 
                x: 20, 
                y: 20,
                originX: 1,
                originY: 1
              }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                x: 0, 
                y: 0 
              }}
              exit={{ 
                opacity: 0, 
                scale: 0.3, 
                x: 20, 
                y: 20,
                transition: { duration: 0.3, ease: "easeIn" }
              }}
              transition={{ 
                duration: 0.6, 
                type: "spring", 
                damping: 15, 
                stiffness: 300 
              }}
              className="absolute bottom-20 right-0 w-80 mb-2"
            >
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/30 via-blue-500/30 to-purple-600/30 rounded-2xl blur-xl"></div>
                
                {/* Main popup */}
                <div className="relative bg-gray-900/95 backdrop-blur-xl border border-gray-700/30 rounded-2xl p-5 shadow-2xl">
                  {/* Decorative elements */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-t-2xl"></div>
                  <div className="absolute -top-2 left-6 w-4 h-4 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full animate-pulse"></div>
                  
                  <div className="flex items-start gap-4">
                    {/* AI Icon */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0 animate-pulse">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-base mb-1">
                        TradePilot AI Assistant 🚀
                      </h3>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Your intelligent crypto trading companion is ready to help with market analysis, strategies, and trading insights!
                      </p>
                      
                      {/* Action button */}
                      <button
                        onClick={() => {
                          setShowWelcomePopup(false);
                          setLocation('/ai-chat');
                        }}
                        className="mt-3 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-medium rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg"
                      >
                        Start Chat 💬
                      </button>
                    </div>
                    
                    {/* Close button */}
                    <button
                      onClick={() => setShowWelcomePopup(false)}
                      className="text-gray-400 hover:text-white transition-all duration-200 hover:scale-110 p-1 rounded-lg hover:bg-gray-700/50"
                      data-testid="button-close-welcome"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* Bottom accent line */}
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent rounded-b-2xl"></div>
                </div>
                
                {/* Pointer tail sliding from button */}
                <div className="absolute bottom-0 right-6 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-gray-900/95 transform translate-y-full"></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Button */}
        <motion.div
          whileHover={{ 
            scale: 1.05, 
            y: -3,
            transition: { duration: 0.2 }
          }}
          whileTap={{ scale: 0.95 }}
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative"
        >
          <Button
            size="sm"
            className="h-14 w-14 rounded-full bg-gradient-to-br from-emerald-500 via-blue-500 to-purple-600 hover:from-emerald-400 hover:via-blue-400 hover:to-purple-500 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 border-2 border-white/30 transform hover:scale-110 hover:-translate-y-2 active:scale-95"
            style={{
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 4px 12px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.2)'
            }}
            onClick={handleButtonClick}
            data-testid="button-floating-contact"
          >
            {/* 3D Chat Bubble */}
            <div className="relative w-8 h-8">
              {/* Main chat bubble */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white via-gray-50 to-gray-100 shadow-lg border border-gray-200/50 transform rotate-3">
                {/* Chat lines */}
                <div className="absolute top-2 left-2 right-2 space-y-1">
                  <div className="h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
                  <div className="h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full w-4/5"></div>
                  <div className="h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full w-3/5"></div>
                </div>
                {/* Inner shadow for depth */}
                <div className="absolute inset-0 rounded-xl shadow-inner bg-gradient-to-br from-transparent via-transparent to-black/5"></div>
              </div>
              
              {/* Chat bubble tail */}
              <div className="absolute -bottom-1 left-2 w-2 h-2 bg-gradient-to-br from-white to-gray-100 transform rotate-45 border-r border-b border-gray-200/50"></div>
              
              {/* Notification dot */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-red-400 to-red-600 rounded-full shadow-lg border border-white/50 animate-pulse"></div>
              
              {/* Highlight effect */}
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-tr from-white/20 via-transparent to-transparent pointer-events-none"></div>
            </div>
          </Button>
          
          {/* Notification dot removed - notifications only show on profile icon and inbox */}
        </motion.div>
      </div>

      {/* Full-screen Modal */}
      <AnimatePresence>
        {showMainModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
            onClick={() => setShowMainModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.3, type: "spring", damping: 20, stiffness: 300 }}
              className="w-full max-w-sm mx-auto relative px-4 sm:px-0"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative Background Elements */}
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-emerald-600/20 rounded-2xl blur-lg"></div>
              
              <div className="relative bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="text-center pt-6 pb-4 px-4">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
                    className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-blue-500 via-purple-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg"
                  >
                    <MessageCircle className="w-6 h-6 text-white" />
                  </motion.div>
                  <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-2">
                    TradePilot Support
                  </h2>
                  <p className="text-gray-300 text-sm">Get help with your crypto trading journey</p>
                </div>

                <div className="px-4 pb-6 space-y-3">
                  {/* AI Chat Card */}
                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="group"
                  >
                    <Card 
                      className="bg-gradient-to-r from-blue-600/90 to-cyan-600/90 border-0 cursor-pointer transition-all duration-200 group-hover:shadow-lg"
                      onClick={handleChatClick}
                      data-testid="card-ai-chat"
                    >
                      <CardContent className="p-4 text-white">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Bot className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold mb-1">TradePilot AI Assistant</h3>
                            <p className="text-blue-100 text-xs leading-tight">
                              Smart AI assistant
                            </p>
                          </div>
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0"></div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Contact Support Card */}
                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="group"
                  >
                    <Card 
                      className="bg-gradient-to-r from-purple-600/90 to-pink-600/90 border-0 cursor-pointer transition-all duration-200 group-hover:shadow-lg"
                      onClick={handleSupportClick}
                      data-testid="card-support"
                    >
                      <CardContent className="p-4 text-white">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Headphones className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold mb-1">Human Support</h3>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                {/* Close button */}
                <div className="border-t border-gray-700/50 p-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMainModal(false)}
                    className="w-full text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all duration-200 text-sm"
                    data-testid="button-close-modal"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}