import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { fetchWithAuth, createSupportTicket } from "@/lib/crypto-api";
import { queryClient } from "@/lib/queryClient";
import { 
  MessageCircle, 
  Plus, 
  Clock, 
  MessageSquare, 
  CheckCircle,
  HelpCircle,
  Mail,
  Phone
} from "lucide-react";

const supportCategories = [
  { value: "account", label: "Account Issues", icon: "👤" },
  { value: "deposit", label: "Deposit Problems", icon: "💳" },
  { value: "withdrawal", label: "Withdrawal Issues", icon: "💰" },
  { value: "investment", label: "Investment Plans", icon: "📈" },
  { value: "technical", label: "Technical Support", icon: "🔧" },
  { value: "other", label: "Other", icon: "❓" },
];

export default function Support() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
  });

  const { data: tickets, isLoading: ticketsLoading } = useQuery({
    queryKey: ["/api/support-tickets"],
    queryFn: () => fetchWithAuth("/support-tickets"),
  });

  const createTicketMutation = useMutation({
    mutationFn: createSupportTicket,
    onSuccess: () => {
      toast({
        title: "Support Ticket Created",
        description: "Your support ticket has been submitted successfully",
      });
      setIsDialogOpen(false);
      setFormData({ subject: "", message: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/support-tickets"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create Ticket",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (formData.subject.length < 5) {
      toast({
        title: "Invalid Subject",
        description: "Subject must be at least 5 characters long",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.message.length < 10) {
      toast({
        title: "Invalid Message",
        description: "Message must be at least 10 characters long",
        variant: "destructive",
      });
      return;
    }
    
    console.log("Submitting ticket:", formData);
    createTicketMutation.mutate(formData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-yellow-500";
      case "replied":
        return "bg-crypto-blue";
      case "closed":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return Clock;
      case "replied":
        return MessageSquare;
      case "closed":
        return CheckCircle;
      default:
        return HelpCircle;
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

  const openTickets = tickets?.filter((ticket: any) => ticket.status === "open") || [];
  const sortedTickets = tickets?.sort((a: any, b: any) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ) || [];

  return (
    <div className="min-h-screen bg-crypto-dark flex">
      {/* We don't use Sidebar here as support page doesn't need it */}
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto pb-20 md:pb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold" data-testid="page-title">Support Center</h1>
              <p className="text-gray-400 mt-1">Get help with your TradePilot account</p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="crypto-gradient" data-testid="button-new-ticket">
                  <Plus className="w-4 h-4 mr-2" />
                  New Ticket
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-crypto-card border-gray-700 text-white max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Support Ticket</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Describe your issue and we'll get back to you as soon as possible
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmitTicket} className="space-y-6">
                  <div>
                    <Label className="text-gray-300">Subject</Label>
                    <Input
                      type="text"
                      placeholder="Brief description of your issue (minimum 5 characters)"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="bg-crypto-dark border-gray-600 text-white placeholder-gray-400 focus:border-crypto-blue"
                      required
                      minLength={5}
                      data-testid="input-subject"
                    />
                    {formData.subject.length > 0 && formData.subject.length < 5 && (
                      <p className="text-red-400 text-xs mt-1">Subject must be at least 5 characters long</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-gray-300">Message</Label>
                    <Textarea
                      placeholder="Please provide detailed information about your issue (minimum 10 characters)..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="bg-crypto-dark border-gray-600 text-white placeholder-gray-400 focus:border-crypto-blue min-h-[120px]"
                      required
                      minLength={10}
                      data-testid="textarea-message"
                    />
                    {formData.message.length > 0 && formData.message.length < 10 && (
                      <p className="text-red-400 text-xs mt-1">Message must be at least 10 characters long</p>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 border-gray-600"
                      onClick={() => setIsDialogOpen(false)}
                      data-testid="button-cancel-ticket"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 crypto-gradient"
                      disabled={createTicketMutation.isPending}
                      data-testid="button-submit-ticket"
                    >
                      {createTicketMutation.isPending ? "Submitting..." : "Submit Ticket"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="max-w-4xl space-y-6">

            {/* Support Tickets */}
            <Card className="bg-crypto-card border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Your Support Tickets</h3>
                {ticketsLoading ? (
                  <div className="text-center text-gray-400 py-8">
                    <div className="animate-spin w-8 h-8 border-2 border-crypto-blue border-t-transparent rounded-full mx-auto mb-4"></div>
                    Loading tickets...
                  </div>
                ) : sortedTickets.length > 0 ? (
                  <div className="space-y-4">
                    {sortedTickets.map((ticket: any) => {
                      const StatusIcon = getStatusIcon(ticket.status);
                      
                      return (
                        <div key={ticket.id} className="p-4 bg-crypto-dark rounded-lg border border-gray-600" data-testid={`ticket-${ticket.id}`}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="font-semibold text-white" data-testid="ticket-subject">
                                  {ticket.subject}
                                </h4>
                                <div className="flex items-center space-x-2">
                                  <StatusIcon className="w-4 h-4" />
                                  <Badge className={`${getStatusColor(ticket.status || 'open')} text-white`} data-testid="ticket-status">
                                    {ticket.status ? ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1) : 'Open'}
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-sm text-gray-400 mb-3" data-testid="ticket-message">
                                {ticket.message}
                              </p>
                              {ticket.status === "replied" && (
                                <div className="mt-3 p-3 bg-green-600 bg-opacity-10 border-l-4 border-green-500 rounded">
                                  <div className="text-sm font-medium text-green-400 mb-1">
                                    Admin has replied to your ticket - check your inbox for the response
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="text-sm text-gray-400 ml-4" data-testid="ticket-date">
                              {new Date(ticket.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <div className="text-lg mb-2">No support tickets yet</div>
                    <div className="text-sm">Create a ticket if you need help with anything</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
