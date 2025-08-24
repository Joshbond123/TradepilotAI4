import { useState, useEffect, useRef } from "react";
import { Bot, Send, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { fetchWithAuth } from "@/lib/crypto-api";
import type { AIChatMessage } from "@shared/schema";

interface AIChatData {
  messages: AIChatMessage[];
  greeting?: string;
}

// TypewriterMessage component removed - all AI messages now display permanently

// Typing indicator component for when AI is preparing response (no bot icon to avoid duplication)
function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-start space-x-2 mb-4"
    >
      <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
        {/* Empty space to align with bot messages but no duplicate bot icon */}
      </div>
      <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-2xl bg-gray-700/30">
        <div className="flex space-x-1 items-center">
          <span className="text-xs text-gray-400 mr-2">AI is thinking</span>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 bg-blue-400 rounded-full"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function AIChatPage() {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Get chat messages with regular polling
  const { data: chatData, isLoading } = useQuery<AIChatData>({
    queryKey: ['/api/ai-chat/messages'],
    queryFn: () => fetchWithAuth("/ai-chat/messages"),
    refetchInterval: isTyping ? false : 5000, // Only poll when not sending user message
    refetchIntervalInBackground: false,
    enabled: !!user, // Only run query if user is authenticated
  });

  // Handle data changes and trigger initial greeting
  useEffect(() => {
    if (chatData && user) {
      // Auto-trigger first AI message on initial load (fresh conversation)
      if (isFirstLoad && chatData.messages?.length === 0) {
        setIsFirstLoad(false);
        // Trigger initial AI greeting automatically
        triggerInitialGreeting();
      }
      // Update message count but don't trigger typing animation for existing messages
      if (chatData.messages?.length !== lastMessageCount) {
        setLastMessageCount(chatData.messages.length);
      }
    }
  }, [chatData, isFirstLoad, user]);

  // Trigger initial greeting when user opens chat
  const triggerInitialGreeting = async () => {
    try {
      setIsTyping(true);
      await fetchWithAuth("/ai-chat/initial-greeting", {
        method: "POST",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ai-chat/messages'] });
    } catch (error) {
      console.error('Failed to trigger initial greeting:', error);
    } finally {
      setTimeout(() => setIsTyping(false), 1000);
    }
  };

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async (messageText: string) => {
      return fetchWithAuth("/ai-chat/send", {
        method: "POST",
        body: JSON.stringify({ message: messageText }),
      });
    },
    onMutate: () => {
      setIsTyping(true);
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ['/api/ai-chat/messages'] });
      
      // Set typing timeout for AI response
      setTimeout(() => {
        setIsTyping(false);
      }, 2000);
    },
    onError: (error: any) => {
      setIsTyping(false);
      console.error('Send message error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send message",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !sendMessage.isPending) {
      sendMessage.mutate(message.trim());
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatData?.messages, isTyping]);

  // Clear chat when user leaves the chat page or website
  useEffect(() => {
    const clearChat = () => {
      fetchWithAuth("/ai-chat/clear", {
        method: "POST",
      }).then(() => {
        // Reset for fresh conversation
        setIsFirstLoad(true);
      }).catch(() => {
        // Ignore errors during cleanup
      });
    };

    const handleBeforeUnload = () => clearChat();
    const handlePageHide = () => clearChat();

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);
    
    // Also clear when component unmounts (user navigates away)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
      clearChat();
    };
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-crypto-dark flex items-center justify-center">
        <Card className="w-96 bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-center text-red-400">Authentication Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 text-center mb-4">Please log in to chat with TradePilot AI</p>
            <Button onClick={() => setLocation('/login')} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-crypto-dark">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/dashboard')}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">TradePilot AI Assistant</h1>
                <p className="text-sm text-gray-400">
                  Your smart AI trading  companion 🚀, profit insights 💵, and reliable AI support 🔑
                </p>
              </div>
            </div>
          </div>

          {/* Chat Container */}
          <Card className="bg-gray-900/50 border-gray-700 h-[600px] flex flex-col">
            <CardHeader className="border-b border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-400">AI is online and ready to help</span>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <>
                  {chatData?.messages?.map((msg) => {
                    // Display all messages permanently without typing animation
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.isAI ? 'justify-start' : 'justify-end'} mb-4`}
                      >
                        {msg.isAI && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 mr-2">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                            msg.isAI
                              ? 'bg-gray-700/50 text-gray-100'
                              : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white ml-auto'
                          }`}
                        >
                          <div className="text-sm leading-relaxed">
                            {msg.message.split('\n').map((line, index, array) => {
                              const trimmedLine = line.trim();
                              if (trimmedLine === '') {
                                return index < array.length - 1 ? <br key={index} /> : null;
                              }
                              
                              // Handle bullet points
                              if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
                                return (
                                  <div key={index} className="flex items-start mb-1">
                                    <span className="text-blue-400 mr-2 flex-shrink-0">•</span>
                                    <span>{trimmedLine.substring(1).trim()}</span>
                                  </div>
                                );
                              }
                              
                              // Handle numbered lists
                              const numberedMatch = trimmedLine.match(/^(\d+\.\s*)/);
                              if (numberedMatch) {
                                return (
                                  <div key={index} className="flex items-start mb-1">
                                    <span className="text-blue-400 mr-2 flex-shrink-0 font-medium">
                                      {numberedMatch[1]}
                                    </span>
                                    <span>{trimmedLine.substring(numberedMatch[1].length)}</span>
                                  </div>
                                );
                              }
                              
                              // Regular paragraphs
                              return (
                                <p key={index} className={index > 0 ? "mt-2" : ""}>
                                  {trimmedLine}
                                </p>
                              );
                            })}
                          </div>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(msg.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}

                  {isTyping && <TypingIndicator />}
                  <div ref={messagesEndRef} />
                </>
              )}
            </CardContent>

            {/* Input */}
            <div className="border-t border-gray-700 p-4">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400"
                  disabled={sendMessage.isPending}
                />
                <Button
                  type="submit"
                  disabled={!message.trim() || sendMessage.isPending}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  {sendMessage.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}