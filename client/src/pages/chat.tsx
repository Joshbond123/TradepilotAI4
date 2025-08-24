import { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, Headphones, Users, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { ChatMessage } from "@shared/schema";

interface ChatData {
  messages: ChatMessage[];
  status: string;
  isActive: boolean;
  typingStatus?: string;
}

interface ChatStatus {
  status: string;
  isActive: boolean;
  onlineCount: number;
  typingStatus: string;
}

// Typing indicator component
function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center space-x-1 text-gray-400 px-3 py-2"
    >
      <span className="text-xs">Someone is typing</span>
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1 h-1 bg-gray-400 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

export function ChatPage() {
  const [message, setMessage] = useState("");
  const [supportSubject, setSupportSubject] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get chat messages
  const { data: chatData } = useQuery<ChatData>({
    queryKey: ['/api/chat/messages'],
    refetchInterval: 3000, // Refetch every 3 seconds for real-time feel
  });

  // Get chat status with fluctuating online count
  const { data: chatStatus } = useQuery<ChatStatus>({
    queryKey: ['/api/chat/status'],
    refetchInterval: 90000, // Update every 1.5 minutes for realistic fluctuation
  });

  // Send chat message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ message: messageText }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send message');
      }
      
      return response.json();
    },
    onSuccess: () => {
      setMessage("");
      // Show typing indicator briefly to simulate AI response
      setShowTyping(true);
      setTimeout(() => setShowTyping(false), 2000);
      
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['/api/chat/messages'] });
      }, 2500);
      
      scrollToBottom();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Send support ticket mutation
  const sendSupportMutation = useMutation({
    mutationFn: async (ticketData: { subject: string; message: string }) => {
      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(ticketData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send support ticket');
      }
      
      return response.json();
    },
    onSuccess: () => {
      setSupportSubject("");
      setSupportMessage("");
      setShowSupportModal(false);
      setShowSuccessMessage(true);
      
      // Hide success message after 3s
      setTimeout(() => setShowSuccessMessage(false), 3000);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send support ticket",
        variant: "destructive",
      });
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatData?.messages, showTyping]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sendMessageMutation.isPending) return;
    
    if (!chatData?.isActive) {
      toast({
        title: "Chat Closed",
        description: "The chatroom is currently closed. It opens at 7:00 AM.",
        variant: "destructive",
      });
      return;
    }

    sendMessageMutation.mutate(message.trim());
  };

  const handleSendSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportSubject.trim() || !supportMessage.trim() || sendSupportMutation.isPending) return;
    
    sendSupportMutation.mutate({
      subject: supportSubject.trim(),
      message: supportMessage.trim(),
    });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-3 flex items-center gap-3">
            💬 Community Chatroom
          </h1>
          <p className="text-gray-300 text-lg">
            Share your thoughts, ask questions, and connect with others 🚀
          </p>
          
          {/* Online Users Count */}
          <div className="mt-4 flex items-center gap-2">
            <div className="flex items-center gap-2 bg-green-600/20 border border-green-500/30 rounded-full px-3 py-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-400 text-sm font-medium">
                🔴 {chatStatus?.onlineCount || 312} users online
              </span>
            </div>
            
            {!chatData?.isActive && (
              <div className="flex items-center gap-2 bg-yellow-600/20 border border-yellow-500/30 rounded-full px-3 py-1">
                <Clock className="h-3 w-3 text-yellow-400" />
                <span className="text-yellow-400 text-sm">Opens at 7:00 AM</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Chat Messages Container */}
        <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-0">
            {/* Messages Area */}
            <div className="h-[500px] overflow-y-auto p-6 space-y-4">
              <AnimatePresence mode="popLayout">
                {chatData?.messages?.map((msg, index) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ 
                      duration: 0.3,
                      delay: index * 0.05, // Stagger animation
                    }}
                    className={`flex ${msg.isAI ? 'justify-start' : 'justify-start'}`}
                    data-testid={`message-${msg.id}`}
                  >
                    <div className={`max-w-xs lg:max-w-md rounded-2xl px-4 py-3 shadow-lg ${
                      msg.isAI 
                        ? 'bg-slate-700/80 text-gray-100 border border-slate-600/50' 
                        : 'bg-blue-600/90 text-white border border-blue-500/50'
                    }`}>
                      <div className="text-xs font-medium mb-1 opacity-75">
                        {msg.username}
                      </div>
                      <div className="text-sm leading-relaxed">{msg.message}</div>
                      <div className="text-xs opacity-50 mt-2">
                        {formatTime(msg.created_at)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {/* Typing indicator */}
              <AnimatePresence>
                {(showTyping || (chatStatus?.typingStatus && chatData?.isActive)) && (
                  <TypingIndicator />
                )}
              </AnimatePresence>
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t border-slate-700/50 p-6">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={chatData?.isActive ? "Type your message... 💬🚀💰" : "Chat is closed"}
                  disabled={!chatData?.isActive || sendMessageMutation.isPending}
                  className="bg-slate-900/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                  maxLength={500}
                  data-testid="input-chat-message"
                />
                <Button
                  type="submit"
                  disabled={!message.trim() || !chatData?.isActive || sendMessageMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 px-6"
                  data-testid="button-send-message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        {/* Contact Support Button */}
        <div className="mt-6 text-center">
          <Button
            onClick={() => setShowSupportModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            data-testid="button-contact-support"
          >
            <Headphones className="h-5 w-5 mr-2" />
            Contact Support 📩
          </Button>
        </div>
      </div>

      {/* Support Modal */}
      <AnimatePresence>
        {showSupportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowSupportModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-800 rounded-xl p-8 max-w-md w-full border border-slate-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  📩 Contact Support
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSupportModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <form onSubmit={handleSendSupport} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="support-subject" className="text-white">
                    Subject
                  </Label>
                  <Input
                    id="support-subject"
                    value={supportSubject}
                    onChange={(e) => setSupportSubject(e.target.value)}
                    placeholder="Brief description of your issue"
                    className="bg-slate-900/50 border-slate-600 text-white"
                    maxLength={100}
                    data-testid="input-support-subject"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="support-message" className="text-white">
                    Message
                  </Label>
                  <Textarea
                    id="support-message"
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    placeholder="Describe your issue in detail..."
                    className="bg-slate-900/50 border-slate-600 text-white min-h-32"
                    maxLength={1000}
                    data-testid="input-support-message"
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={!supportSubject.trim() || !supportMessage.trim() || sendSupportMutation.isPending}
                  className="w-full bg-green-600 hover:bg-green-700 py-3"
                  data-testid="button-send-support"
                >
                  {sendSupportMutation.isPending ? "Sending..." : "Send Support Ticket"}
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Message */}
      <AnimatePresence>
        {showSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl z-50"
          >
            ✅ Ticket sent! We'll get back to you soon.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}