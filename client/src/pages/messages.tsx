import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";

import MobileNav from "@/components/layout/mobile-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchWithAuth, markMessageAsRead } from "@/lib/crypto-api";
import { queryClient } from "@/lib/queryClient";
import { 
  Mail, 
  MailOpen, 
  Info, 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle 
} from "lucide-react";

export default function Messages() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/messages"],
    queryFn: () => fetchWithAuth("/messages"),
  });

  const markAsReadMutation = useMutation({
    mutationFn: markMessageAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
  });

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  const handleMarkAsRead = (messageId: string) => {
    markAsReadMutation.mutate(messageId);
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case "success":
        return CheckCircle;
      case "warning":
        return AlertTriangle;
      case "error":
        return AlertCircle;
      default:
        return Info;
    }
  };

  const getMessageColor = (type: string) => {
    switch (type) {
      case "success":
        return "text-crypto-green";
      case "warning":
        return "text-yellow-500";
      case "error":
        return "text-red-500";
      default:
        return "text-crypto-blue";
    }
  };

  const getMessageBadgeColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-crypto-green";
      case "warning":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-crypto-blue";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-crypto-dark flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const unreadCount = messages?.filter((msg: any) => !msg.isRead).length || 0;
  const sortedMessages = messages?.sort((a: any, b: any) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ) || [];

  return (
    <div className="min-h-screen bg-crypto-dark">
      <Header />
      <main className="p-6 overflow-y-auto pb-20">
        <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold" data-testid="page-title">Messages</h1>
              <p className="text-gray-400 mt-1">
                System notifications and important updates
              </p>
            </div>
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white" data-testid="unread-count">
                {unreadCount} unread
              </Badge>
            )}
          </div>

          <div className="max-w-4xl">
            {messagesLoading ? (
              <div className="text-center text-gray-400 py-12">
                <div className="animate-spin w-8 h-8 border-2 border-crypto-blue border-t-transparent rounded-full mx-auto mb-4"></div>
                Loading messages...
              </div>
            ) : sortedMessages.length > 0 ? (
              <div className="space-y-4">
                {sortedMessages.map((message: any) => {
                  const MessageIcon = getMessageIcon(message.type);
                  const isUnread = !message.isRead;
                  
                  return (
                    <Card 
                      key={message.id} 
                      className={`bg-crypto-card border-gray-700 ${
                        isUnread ? "border-crypto-blue border-opacity-50" : ""
                      }`}
                      data-testid={`message-${message.id}`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            {isUnread ? (
                              <Mail className="w-6 h-6 text-crypto-blue" />
                            ) : (
                              <MailOpen className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-3">
                                <h3 className={`font-semibold ${isUnread ? "text-white" : "text-gray-300"}`} data-testid="message-title">
                                  {message.title}
                                </h3>
                                <div className="flex items-center space-x-2">
                                  <MessageIcon className={`w-4 h-4 ${getMessageColor(message.type)}`} />
                                  <Badge className={`${getMessageBadgeColor(message.type)} text-white text-xs`} data-testid="message-type">
                                    {message.type}
                                  </Badge>
                                  {isUnread && (
                                    <Badge className="bg-red-500 text-white text-xs" data-testid="unread-badge">
                                      New
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="text-sm text-gray-400 flex-shrink-0" data-testid="message-date">
                                {new Date(message.createdAt).toLocaleDateString()} {new Date(message.createdAt).toLocaleTimeString()}
                              </div>
                            </div>
                            
                            <div className={`text-sm mb-4 ${isUnread ? "text-gray-200" : "text-gray-400"}`} data-testid="message-content">
                              {message.content}
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="text-xs text-gray-500">
                                {message.userId ? "Personal message" : "System-wide message"}
                              </div>
                              {isUnread && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-crypto-blue border-crypto-blue hover:bg-crypto-blue hover:text-white"
                                  onClick={() => handleMarkAsRead(message.id)}
                                  disabled={markAsReadMutation.isPending}
                                  data-testid={`button-mark-read-${message.id}`}
                                >
                                  Mark as Read
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="bg-crypto-card border-gray-700">
                <CardContent className="p-12 text-center">
                  <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <div className="text-xl font-semibold text-gray-300 mb-2">
                    No messages yet
                  </div>
                  <div className="text-gray-400">
                    System notifications and important updates will appear here
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
      </main>
      <MobileNav />
    </div>
  );
}
