import { useState, useEffect } from "react";
import { Inbox, Mail, MailOpen, MessageSquare, CheckCircle2, AlertCircle, Clock, Star, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { InboxMessage } from "@shared/schema";

interface InboxMessageWithRead extends InboxMessage {
  is_read: boolean;
}

export function InboxPage() {
  const [selectedMessage, setSelectedMessage] = useState<InboxMessageWithRead | null>(null);
  const queryClient = useQueryClient();

  // Get inbox messages
  const { data: messages = [], isLoading } = useQuery<InboxMessageWithRead[]>({
    queryKey: ['/api/inbox/messages'],
    refetchInterval: 5000, // Check for new messages every 5 seconds for faster updates
  });

  // Mark all messages as read mutation (when entering inbox)
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('PATCH', '/api/inbox/messages/mark-all-read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inbox/messages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inbox/unread-count'] });
    },
  });

  // Mark single message as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const response = await apiRequest('PATCH', `/api/inbox/messages/${messageId}/read`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inbox/messages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inbox/unread-count'] });
    },
  });

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const response = await apiRequest('DELETE', `/api/inbox/messages/${messageId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inbox/messages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inbox/unread-count'] });
      setSelectedMessage(null); // Clear selected message after deletion
    },
  });

  // Mark all messages as read when component mounts (user enters inbox)
  useEffect(() => {
    if (messages && messages.length > 0 && messages.some(msg => !msg.is_read)) {
      markAllAsReadMutation.mutate();
    }
  }, [messages?.length]); // Only run when messages are first loaded or count changes

  const handleMessageClick = (message: InboxMessageWithRead) => {
    setSelectedMessage(message);
    
    // Mark as read if not already read
    if (!message.is_read) {
      markAsReadMutation.mutate(message.id);
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'welcome':
        return <Star className="h-5 w-5 text-yellow-500" />;
      case 'support_reply':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'system':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'notification':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      default:
        return <Mail className="h-5 w-5 text-gray-500" />;
    }
  };

  const getMessageTypeLabel = (type: string) => {
    switch (type) {
      case 'welcome':
        return 'Welcome';
      case 'support_reply':
        return 'Support Reply';
      case 'system':
        return 'System';
      case 'notification':
        return 'Notification';
      default:
        return 'Message';
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const unreadCount = messages.filter(msg => !msg.is_read).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-700 rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-slate-700 rounded"></div>
                ))}
              </div>
              <div className="lg:col-span-2">
                <div className="h-96 bg-slate-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3" data-testid="text-inbox-title">
            <Inbox className="h-8 w-8" />
            Inbox
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2" data-testid="badge-unread-count">
                {unreadCount} unread
              </Badge>
            )}
          </h1>
          <p className="text-gray-400" data-testid="text-inbox-description">
            Your messages, support replies, and notifications
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Message List */}
          <div className="lg:col-span-1 space-y-3">
            <h2 className="text-xl font-semibold text-white mb-4">Messages ({messages.length})</h2>
            
            {messages.length === 0 ? (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6 text-center">
                  <Mail className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No messages yet</p>
                  <p className="text-sm text-gray-500 mt-2">
                    You'll receive welcome messages, support replies, and notifications here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`cursor-pointer transition-all duration-200 ${
                        selectedMessage?.id === message.id
                          ? 'ring-2 ring-blue-500'
                          : ''
                      }`}
                      onClick={() => handleMessageClick(message)}
                      data-testid={`message-item-${message.id}`}
                    >
                      <Card className={`bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 ${
                        !message.is_read ? 'border-blue-500/30' : ''
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getMessageIcon(message.type)}
                              {!message.is_read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                              )}
                            </div>
                            <Badge 
                              variant="outline" 
                              className="text-xs"
                            >
                              {getMessageTypeLabel(message.type)}
                            </Badge>
                          </div>
                          
                          <h3 className={`font-medium mb-1 ${
                            !message.is_read ? 'text-white' : 'text-gray-300'
                          }`}>
                            {message.title}
                          </h3>
                          
                          <p className="text-xs text-gray-500">
                            {formatDate(message.created_at)}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getMessageIcon(selectedMessage.type)}
                        <div>
                          <CardTitle className="text-white" data-testid="text-selected-message-title">
                            {selectedMessage.title}
                          </CardTitle>
                          <CardDescription>
                            <Badge variant="outline" className="mr-2">
                              {getMessageTypeLabel(selectedMessage.type)}
                            </Badge>
                            {formatDate(selectedMessage.created_at)}
                          </CardDescription>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {!selectedMessage.is_read && (
                          <Badge variant="default" className="bg-blue-600">
                            New
                          </Badge>
                        )}
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              data-testid="button-delete-message"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-slate-800 border-slate-700">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-white">Delete Message</AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-300">
                                Are you sure you want to delete this message? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMessageMutation.mutate(selectedMessage.id)}
                                className="bg-red-600 hover:bg-red-700 text-white"
                                data-testid="button-confirm-delete"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="prose prose-invert max-w-none"
                      data-testid="text-selected-message-content"
                    >
                      {selectedMessage.content.split('\n').map((paragraph, index) => (
                        <p key={index} className="text-gray-300 leading-relaxed mb-4">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                    
                    {selectedMessage.ticket_id && (
                      <div className="mt-6 p-4 bg-slate-900/50 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <MessageSquare className="h-4 w-4" />
                          <span>Support Ticket ID: {selectedMessage.ticket_id}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <Card className="bg-slate-800/50 border-slate-700 h-96 flex items-center justify-center">
                <CardContent className="text-center">
                  <MailOpen className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg mb-2">Select a message to read</p>
                  <p className="text-gray-500 text-sm">
                    Choose a message from the list to view its content
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}