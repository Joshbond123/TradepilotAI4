import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import WithdrawalManagement from "@/components/admin/WithdrawalManagement";
import BalanceManagement from "@/components/admin/BalanceManagement";
import APIKeyManagement from "@/components/admin/APIKeyManagement";
import ReCaptchaSettings from "@/components/admin/ReCaptchaSettings";
import LogoManagement from "@/components/admin/LogoManagement";
import CallMeBotSettings from "@/components/admin/CallMeBotSettings";
import { 
  ShieldAlert,
  Users,
  DollarSign,
  Zap,
  Settings,
  MessageSquare,
  Activity,
  Wallet,
  CheckCircle,
  XCircle,
  BarChart3,
  TrendingUp,
  Database,
  Shield,
  Bot,
  Gift,
  Send,
  Edit,
  Plus,
  RefreshCw,
  Clock,
  Trash2,
  Reply,
  X
} from "lucide-react";

// Helper function to make authenticated requests
const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Request failed");
  }

  return response.json();
};

export default function Admin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Support ticket management state
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [activeSection, setActiveSection] = useState("dashboard");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [balanceAdjustment, setBalanceAdjustment] = useState({
    amount: "",
    type: "credit" as "credit" | "debit",
  });

  // Check admin access and redirect if not authorized
  const adminAccess = localStorage.getItem("admin_access") === "true";
  
  useEffect(() => {
    if (!adminAccess) {
      setLocation("/");
    }
  }, [adminAccess, setLocation]);

  if (!adminAccess) {
    return (
      <div className="min-h-screen bg-crypto-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">You need admin access to view this page.</p>
          <Button onClick={() => setLocation("/")} className="bg-crypto-blue hover:bg-blue-600">
            Return to Homepage
          </Button>
        </div>
      </div>
    );
  }

  // Real data fetching with authentication
  const { data: users = [], isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: () => fetchWithAuth("/admin/users"),
    retry: 1,
  });

  const { data: systemSettings, isLoading: settingsLoading, refetch: refetchSettings } = useQuery({
    queryKey: ["/api/admin/settings"],
    queryFn: () => fetchWithAuth("/admin/settings"),
    retry: 1,
  });

  const { data: referralData, isLoading: referralLoading, refetch: refetchReferrals } = useQuery({
    queryKey: ["/api/admin/referrals"],
    queryFn: () => fetchWithAuth("/admin/referrals"),
    retry: 1,
  });

  const { data: depositSettings = {}, isLoading: depositSettingsLoading, refetch: refetchDepositSettings } = useQuery({
    queryKey: ["/api/admin/deposit-settings"],
    queryFn: () => fetchWithAuth("/admin/deposit-settings"),
    retry: 1,
  });

  // Support tickets data fetching
  const { data: supportTickets = [], isLoading: ticketsLoading, refetch: refetchTickets } = useQuery({
    queryKey: ["/api/admin/support-tickets"],
    queryFn: () => fetchWithAuth("/admin/support-tickets"),
    retry: 1,
  });

  // Login logs data fetching
  const { data: loginLogs = [], isLoading: loginLogsLoading, refetch: refetchLoginLogs } = useQuery({
    queryKey: ["/api/admin/login-logs"],
    queryFn: () => fetchWithAuth("/admin/login-logs"),
    retry: 1,
  });

  const [tempDepositSettings, setTempDepositSettings] = useState<any>({});

  // Calculate dashboard statistics from real data with safe checks
  const totalUsers = Array.isArray(users) ? users.length : 0;
  const activeUsers = Array.isArray(users) ? users.filter((user: any) => user && user.isActive).length : 0;
  const blockedUsers = Array.isArray(users) ? users.filter((user: any) => user && !user.isActive).length : 0;
  const totalBalances = Array.isArray(users) ? users.reduce((sum: number, user: any) => sum + parseFloat(user?.balance || "0"), 0) : 0;
  const referralCount = Array.isArray(users) ? users.filter((user: any) => user && user.referredBy).length : 0;

  // Balance adjustment mutation
  const adjustBalanceMutation = useMutation({
    mutationFn: async ({ userId, amount, type }: { userId: string; amount: string; type: string }) => {
      return fetchWithAuth(`/admin/users/${userId}/balance`, {
        method: "POST",
        body: JSON.stringify({ amount: parseFloat(amount), type }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Balance Updated",
        description: "User balance has been successfully updated",
      });
      setIsUserDialogOpen(false);
      setBalanceAdjustment({ amount: "", type: "credit" });
      refetchUsers();
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return fetchWithAuth(`/admin/users/${userId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast({
        title: "User Deleted",
        description: "User and all associated data have been permanently deleted",
      });
      refetchUsers();
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update deposit settings mutation
  const updateDepositSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      return fetchWithAuth("/admin/deposit-settings", {
        method: "PATCH",
        body: JSON.stringify(settings),
      });
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Deposit settings have been successfully updated",
      });
      refetchDepositSettings();
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Support ticket management mutations
  const updateTicketMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      return fetchWithAuth(`/admin/support-tickets/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });
    },
    onSuccess: () => {
      toast({
        title: "Ticket Updated",
        description: "Support ticket has been updated successfully",
      });
      refetchTickets();
      setIsTicketDialogOpen(false);
      setReplyMessage("");
      setSelectedTicket(null);
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteTicketMutation = useMutation({
    mutationFn: async (id: string) => {
      return fetchWithAuth(`/admin/support-tickets/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast({
        title: "Ticket Deleted",
        description: "Support ticket has been deleted successfully",
      });
      refetchTickets();
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const adminSections = [
    {
      category: "Overview",
      sections: [
        { id: "dashboard", label: "Dashboard", icon: BarChart3, description: "System overview and statistics" },
      ]
    },
    {
      category: "User Management",
      sections: [
        { id: "users", label: "User Accounts", icon: Users, description: "Manage user accounts and profiles" },
        { id: "balances", label: "Balance Management", icon: DollarSign, description: "Adjust user account balances" },
        { id: "login-logs", label: "Login Logs", icon: Activity, description: "Track user login activities" },
      ]
    },
    {
      category: "Financial Operations", 
      sections: [
        { id: "withdrawals", label: "Withdrawals", icon: Send, description: "Process withdrawal requests" },
        { id: "deposits", label: "Deposit Settings", icon: Wallet, description: "Configure deposit parameters" },
      ]
    },
    {
      category: "Customer Support",
      sections: [
        { id: "support", label: "Support Tickets", icon: MessageSquare, description: "Handle customer support requests" },
      ]
    },
    {
      category: "AI & Automation",
      sections: [
        { id: "ai-keys", label: "AI API Keys", icon: Bot, description: "Manage AI service integrations" },
        { id: "ai-chat", label: "AI Chat Settings", icon: Bot, description: "Configure AI chat parameters" },
      ]
    },
    {
      category: "System Configuration",
      sections: [
        { id: "referrals", label: "Referral Program", icon: Gift, description: "Configure referral rewards" },
        { id: "settings", label: "System Settings", icon: Settings, description: "General system configuration" },
        { id: "security", label: "Security & reCAPTCHA", icon: Shield, description: "Security settings and protection" },
        { id: "callmebot", label: "WhatsApp Notifications", icon: MessageSquare, description: "Configure CallMeBot WhatsApp alerts" },
      ]
    }
  ];

  const handleBalanceAdjustment = () => {
    if (!selectedUser || !balanceAdjustment.amount) return;
    
    adjustBalanceMutation.mutate({
      userId: selectedUser.id,
      amount: balanceAdjustment.amount,
      type: balanceAdjustment.type,
    });
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center py-8 bg-gradient-to-r from-crypto-blue/10 to-crypto-green/10 rounded-xl border border-gray-700">
        <div className="mb-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-crypto-blue to-crypto-green rounded-full flex items-center justify-center mb-4">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to TradePilot Admin</h1>
          <p className="text-gray-400">Complete platform overview and control center</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-crypto-blue" />
          Key Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-crypto-card border-gray-700 hover:border-crypto-blue/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Users</CardTitle>
              <Users className="h-4 w-4 text-crypto-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white" data-testid="total-users">
                {totalUsers}
              </div>
              <p className="text-xs text-gray-400">Registered accounts</p>
            </CardContent>
          </Card>

          <Card className="bg-crypto-card border-gray-700 hover:border-green-500/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Active Users</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400" data-testid="active-users">
                {activeUsers}
              </div>
              <p className="text-xs text-gray-400">
                {totalUsers > 0 ? `${((activeUsers / totalUsers) * 100).toFixed(1)}% active` : "No users yet"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-crypto-card border-gray-700 hover:border-crypto-green/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Balances</CardTitle>
              <DollarSign className="h-4 w-4 text-crypto-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-crypto-green" data-testid="total-balances">
                ${totalBalances.toFixed(2)}
              </div>
              <p className="text-xs text-gray-400">Platform liquidity</p>
            </CardContent>
          </Card>

          <Card className="bg-crypto-card border-gray-700 hover:border-yellow-500/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Referrals</CardTitle>
              <Gift className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400" data-testid="referral-count">
                {referralCount}
              </div>
              <p className="text-xs text-gray-400">Referred users</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Zap className="w-5 h-5 mr-2 text-crypto-green" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button 
            onClick={() => setActiveSection("users")} 
            variant="outline"
            className="h-16 justify-start border-crypto-blue text-crypto-blue hover:bg-crypto-blue hover:text-white"
          >
            <Users className="mr-3 h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">Manage Users</div>
              <div className="text-xs opacity-70">View and edit user accounts</div>
            </div>
          </Button>

          <Button 
            onClick={() => setActiveSection("withdrawals")} 
            variant="outline"
            className="h-16 justify-start border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black"
          >
            <Send className="mr-3 h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">Process Withdrawals</div>
              <div className="text-xs opacity-70">Review withdrawal requests</div>
            </div>
          </Button>

          <Button 
            onClick={() => setActiveSection("support")} 
            variant="outline"
            className="h-16 justify-start border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white"
          >
            <MessageSquare className="mr-3 h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">Support Tickets</div>
              <div className="text-xs opacity-70">Handle customer support</div>
            </div>
          </Button>

          <Button 
            onClick={() => setActiveSection("deposits")} 
            variant="outline"
            className="h-16 justify-start border-crypto-green text-crypto-green hover:bg-crypto-green hover:text-black"
          >
            <Wallet className="mr-3 h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">Deposit Settings</div>
              <div className="text-xs opacity-70">Configure deposit limits</div>
            </div>
          </Button>

          <Button 
            onClick={() => setActiveSection("login-logs")} 
            variant="outline"
            className="h-16 justify-start border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white"
          >
            <Activity className="mr-3 h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">Login Logs</div>
              <div className="text-xs opacity-70">User activity tracking</div>
            </div>
          </Button>

          <Button 
            onClick={() => setActiveSection("settings")} 
            variant="outline"
            className="h-16 justify-start border-gray-500 text-gray-300 hover:bg-gray-500 hover:text-white"
          >
            <Settings className="mr-3 h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">System Settings</div>
              <div className="text-xs opacity-70">Platform configuration</div>
            </div>
          </Button>

          <Button 
            onClick={() => refetchUsers()} 
            disabled={usersLoading}
            variant="outline"
            className="h-16 justify-start border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
            data-testid="refresh-users"
          >
            <RefreshCw className="mr-3 h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">Refresh Data</div>
              <div className="text-xs opacity-70">Update all statistics</div>
            </div>
          </Button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-crypto-card border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Clock className="w-5 h-5 mr-2 text-crypto-blue" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.isArray(users) && users.length > 0 ? (
                users.slice(0, 5).map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-crypto-blue/20 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-crypto-blue" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{user.username}</p>
                        <p className="text-gray-400 text-xs">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Badge variant={user.isActive ? "default" : "secondary"} className="text-xs">
                      {user.isActive ? "Active" : "Blocked"}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No users registered yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-crypto-card border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Activity className="w-5 h-5 mr-2 text-crypto-green" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-white text-sm font-medium">Platform Status</p>
                    <p className="text-gray-400 text-xs">All systems operational</p>
                  </div>
                </div>
                <Badge className="bg-green-500 text-white">Online</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-crypto-blue/10 rounded-lg border border-crypto-blue/20">
                <div className="flex items-center space-x-3">
                  <Database className="w-5 h-5 text-crypto-blue" />
                  <div>
                    <p className="text-white text-sm font-medium">Database</p>
                    <p className="text-gray-400 text-xs">Connected and healthy</p>
                  </div>
                </div>
                <Badge className="bg-crypto-blue text-white">Connected</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="text-white text-sm font-medium">Security</p>
                    <p className="text-gray-400 text-xs">Monitoring active</p>
                  </div>
                </div>
                <Badge className="bg-yellow-500 text-black">Monitoring</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderLoginLogs = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Login Activity Logs</h3>
        <Button 
          onClick={() => refetchLoginLogs()}
          disabled={loginLogsLoading}
          variant="outline"
          className="text-crypto-blue border-crypto-blue hover:bg-crypto-blue hover:text-white"
          data-testid="refresh-logs"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loginLogsLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card className="bg-crypto-card border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Recent User Activities</CardTitle>
        </CardHeader>
        <CardContent>
          {loginLogsLoading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-crypto-blue" />
            </div>
          ) : loginLogs.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-50 text-gray-400" />
              <div className="text-gray-400">No activity logs available</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Time</TableHead>
                    <TableHead className="text-gray-300">User</TableHead>
                    <TableHead className="text-gray-300">Action</TableHead>
                    <TableHead className="text-gray-300">Country</TableHead>
                    <TableHead className="text-gray-300">IP Address</TableHead>
                    <TableHead className="text-gray-300">User Agent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loginLogs
                    .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .slice(0, 10)
                    .map((log: any, index: number) => (
                      <TableRow key={index} className="border-gray-700 hover:bg-gray-700/30">
                        <TableCell className="text-gray-300">
                          {new Date(log.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-white font-medium">
                          {log.username}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              log.action === 'login' 
                                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                : log.action === 'register' 
                                ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                                : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                            }
                          >
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {log.country || 'Unknown'}
                        </TableCell>
                        <TableCell className="text-gray-400 text-sm">
                          {log.ipAddress || 'N/A'}
                        </TableCell>
                        <TableCell className="text-gray-400 text-sm max-w-xs truncate">
                          {log.userAgent || 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderUserManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">User Management</h3>
        <Button 
          onClick={() => refetchUsers()} 
          disabled={usersLoading}
          variant="outline"
          className="border-gray-600"
          data-testid="refresh-button"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {usersLoading ? (
        <Card className="bg-crypto-card border-gray-700">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-gray-400">Loading users...</div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-crypto-card border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Registered Users ({users?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">ID</TableHead>
                    <TableHead className="text-gray-300">Username</TableHead>
                    <TableHead className="text-gray-300">Email</TableHead>
                    <TableHead className="text-gray-300">Country</TableHead>
                    <TableHead className="text-gray-300">Balance</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Created</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((user: any) => (
                    <TableRow key={user.id} className="border-gray-700">
                      <TableCell className="text-gray-300">{user.id}</TableCell>
                      <TableCell className="text-white font-medium">{user.username}</TableCell>
                      <TableCell className="text-gray-300">{user.email}</TableCell>
                      <TableCell className="text-gray-300">{user.country || 'Unknown'}</TableCell>
                      <TableCell className="text-crypto-green">${parseFloat(user.balance || "0").toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? "default" : "destructive"}>
                          {user.isActive ? "Active" : "Blocked"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(user);
                              setIsUserDialogOpen(true);
                            }}
                            className="border-crypto-blue text-crypto-blue hover:bg-crypto-blue hover:text-white"
                            data-testid={`edit-user-${user.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              if (confirm(`⚠️ PERMANENT DELETION WARNING ⚠️\n\nThis will permanently delete user "${user.username}" and ALL their data:\n• User account & profile\n• All investments & earnings\n• Deposit & withdrawal history\n• Messages & support tickets\n• Login logs & activity\n\nAfter deletion, they can register again with the same email/username.\n\nThis action CANNOT be undone. Are you absolutely sure?`)) {
                                deleteUserMutation.mutate(user.id);
                              }
                            }}
                            disabled={deleteUserMutation.isPending}
                            data-testid={`delete-user-${user.id}`}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Local state for deposit settings to show typing
  const [localDepositSettings, setLocalDepositSettings] = useState<any>({});
  
  // Update local state when depositSettings changes (but only when data is actually fetched)
  useEffect(() => {
    if (depositSettings && Object.keys(depositSettings).length > 0) {
      // Include wallet addresses from systemSettings in the local state
      const walletAddresses: any = {};
      if (systemSettings?.wallets) {
        Object.keys(systemSettings.wallets).forEach(crypto => {
          walletAddresses[`${crypto.toUpperCase()}_wallet_address`] = systemSettings.wallets[crypto]?.address || "";
        });
      }
      setLocalDepositSettings({
        ...depositSettings,
        ...walletAddresses
      });
    }
  }, [depositSettingsLoading, systemSettings]); // Update when loading state changes or systemSettings changes

  const renderDepositSettings = () => {
    const cryptoOptions = [
      { symbol: "BTC", name: "Bitcoin", logo: "https://assets.coincap.io/assets/icons/btc@2x.png" },
      { symbol: "ETH", name: "Ethereum", logo: "https://assets.coincap.io/assets/icons/eth@2x.png" },
      { symbol: "USDT", name: "Tether USDT", logo: "https://assets.coincap.io/assets/icons/usdt@2x.png" },
    ];

    const handleUpdateSettings = (crypto: string, field: string, value: string) => {
      // Update local state immediately for UI feedback
      const updatedLocalSettings = {
        ...localDepositSettings,
        [crypto]: {
          ...localDepositSettings[crypto],
          [field]: value,
        },
      };
      setLocalDepositSettings(updatedLocalSettings);
    };

    const handleSaveSettings = async (crypto: string) => {
      const settings = localDepositSettings[crypto] || {};
      const walletAddress = localDepositSettings[`${crypto}_wallet_address`] || "";
      
      // Save deposit settings
      updateDepositSettingsMutation.mutate({
        [crypto]: settings
      });
      
      // Save wallet address if it exists
      if (walletAddress) {
        try {
          await handleWalletAddressUpdate(crypto, walletAddress);
        } catch (error) {
          console.error('Failed to save wallet address:', error);
        }
      }
    };

    const handleQRCodeUpload = async (crypto: string, file?: File) => {
      try {
        const token = localStorage.getItem("token");
        
        if (!file) {
          // Remove QR code
          const response = await fetch('/api/admin/remove-qr-code', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ cryptocurrency: crypto })
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP ${response.status}: Failed to remove QR code`);
          }

          toast({
            title: "Success",
            description: `QR code removed for ${crypto}`,
          });
        } else {
          // Validate file size (5MB limit)
          if (file.size > 5 * 1024 * 1024) {
            throw new Error('File size must be less than 5MB');
          }

          // Validate file type
          if (!file.type.startsWith('image/')) {
            throw new Error('Please select a valid image file');
          }

          // Upload QR code
          const formData = new FormData();
          formData.append('qrCode', file);
          formData.append('cryptocurrency', crypto);

          const response = await fetch('/api/admin/upload-qr-code', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: formData
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP ${response.status}: Failed to upload QR code`);
          }

          const result = await response.json();
          toast({
            title: "Success",
            description: `QR code uploaded successfully for ${crypto}`,
          });
        }
        
        // Refresh system settings to show the changes
        refetchSettings();
      } catch (error: any) {
        console.error('QR Code upload error:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to process QR code",
        });
      }
    };

    const handleWalletAddressUpdate = async (crypto: string, address: string) => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch('/api/admin/update-wallet-address', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cryptocurrency: crypto,
            address: address
          })
        });

        if (!response.ok) {
          throw new Error('Failed to update wallet address');
        }

        toast({
          title: "Success",
          description: `Wallet address updated for ${crypto}`,
        });
        
        refetchSettings();
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to update wallet address",
        });
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Deposit Settings</h2>
            <p className="text-gray-400 mt-1">Configure minimum deposits and confirmations for each cryptocurrency</p>
          </div>
          <Button 
            onClick={() => refetchDepositSettings()} 
            disabled={depositSettingsLoading}
            variant="outline"
            className="border-crypto-blue text-crypto-blue hover:bg-crypto-blue hover:text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {depositSettingsLoading ? (
          <Card className="bg-crypto-card border-gray-700">
            <CardContent className="p-6">
              <div className="text-center text-gray-400">Loading deposit settings...</div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {cryptoOptions.map((crypto) => {
              const settings = localDepositSettings[crypto.symbol] || {};
              
              return (
                <Card key={crypto.symbol} className="bg-crypto-card border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center space-x-3">
                      <img src={crypto.logo} alt={crypto.name} className="w-8 h-8 rounded-full" />
                      <div>
                        <div className="text-lg">{crypto.name}</div>
                        <div className="text-sm text-gray-400 font-normal">{crypto.symbol}</div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Wallet Management Section */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Wallet className="h-4 w-4 text-crypto-blue" />
                        <Label className="text-gray-300 font-medium">Wallet Configuration</Label>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-gray-300">Wallet Address</Label>
                          <div className="flex space-x-2">
                            <Input
                              type="text"
                              value={localDepositSettings[`${crypto.symbol}_wallet_address`] !== undefined 
                                ? localDepositSettings[`${crypto.symbol}_wallet_address`] 
                                : (systemSettings?.wallets?.[crypto.symbol.toLowerCase()]?.address || "")}
                              onChange={(e) => {
                                setLocalDepositSettings((prev: any) => ({
                                  ...prev,
                                  [`${crypto.symbol}_wallet_address`]: e.target.value
                                }));
                              }}
                              placeholder={`Enter ${crypto.symbol} wallet address`}
                              className="bg-crypto-dark border-gray-600 text-white flex-1"
                              data-testid={`wallet-address-${crypto.symbol.toLowerCase()}`}
                            />

                          </div>
                          <p className="text-xs text-gray-400">
                            {crypto.symbol} wallet address for receiving deposits
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-gray-300">QR Code</Label>
                          <div className="space-y-2">
                            {systemSettings?.wallets?.[crypto.symbol.toLowerCase()]?.qr_code ? (
                              <div className="flex items-center space-x-3 p-3 bg-crypto-dark rounded-lg border border-gray-600">
                                <img 
                                  src={systemSettings.wallets[crypto.symbol.toLowerCase()].qr_code} 
                                  alt={`${crypto.symbol} QR Code`}
                                  className="w-12 h-12 rounded border border-gray-500"
                                />
                                <div className="flex-1">
                                  <p className="text-sm text-green-400 font-medium">QR Code Active</p>
                                  <p className="text-xs text-gray-400">Displayed on deposit page</p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                  onClick={() => {
                                    if (confirm(`Remove QR code for ${crypto.symbol}?`)) {
                                      handleQRCodeUpload(crypto.symbol);
                                    }
                                  }}
                                >
                                  Remove
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center p-6 border-2 border-dashed border-gray-600 rounded-lg bg-crypto-dark">
                                <label className="cursor-pointer text-center">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        handleQRCodeUpload(crypto.symbol, file);
                                      }
                                    }}
                                    data-testid={`qr-upload-${crypto.symbol.toLowerCase()}`}
                                  />
                                  <div className="space-y-2">
                                    <Plus className="w-8 h-8 text-gray-400 mx-auto" />
                                    <p className="text-sm text-gray-400">Upload QR Code</p>
                                    <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                                  </div>
                                </label>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Deposit Rules Section */}
                    <div className="space-y-4 pt-4 border-t border-gray-600">
                      <div className="flex items-center space-x-2">
                        <Settings className="h-4 w-4 text-crypto-green" />
                        <Label className="text-gray-300 font-medium">Deposit Rules</Label>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-gray-300">Minimum Deposit</Label>
                          <Input
                            type="text"
                            value={settings.minDeposit || ""}
                            onChange={(e) => handleUpdateSettings(crypto.symbol, "minDeposit", e.target.value)}
                            placeholder={`e.g., 0.001 ${crypto.symbol}`}
                            className="bg-crypto-dark border-gray-600 text-white"
                            data-testid={`min-deposit-${crypto.symbol.toLowerCase()}`}
                          />
                          <p className="text-xs text-gray-400">
                            Minimum amount users can deposit for {crypto.name}
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-gray-300">Confirmations Required</Label>
                          <Input
                            type="number"
                            min="1"
                            max="100"
                            value={settings.confirmations || ""}
                            onChange={(e) => handleUpdateSettings(crypto.symbol, "confirmations", e.target.value)}
                            placeholder="e.g., 3"
                            className="bg-crypto-dark border-gray-600 text-white"
                            data-testid={`confirmations-${crypto.symbol.toLowerCase()}`}
                          />
                          <p className="text-xs text-gray-400">
                            Network confirmations needed before crediting deposit
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-600">
                      <div className="text-sm text-gray-400">
                        Current: {settings.minDeposit || "Not set"} • {settings.confirmations || "Not set"} confirmations
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge 
                          variant={settings.minDeposit && settings.confirmations ? "default" : "secondary"}
                          className={settings.minDeposit && settings.confirmations ? "bg-crypto-green" : ""}
                        >
                          {settings.minDeposit && settings.confirmations ? "Configured" : "Needs Setup"}
                        </Badge>
                        <Button
                          onClick={() => handleSaveSettings(crypto.symbol)}
                          disabled={updateDepositSettingsMutation.isPending}
                          className="bg-crypto-blue hover:bg-blue-600 text-white"
                          size="sm"
                          data-testid={`save-deposit-settings-${crypto.symbol.toLowerCase()}`}
                        >
                          {updateDepositSettingsMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
        
        {/* Withdrawal Settings Section */}
        <Card className="bg-crypto-card border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-3">
              <TrendingUp className="w-6 h-6 text-crypto-blue" />
              <div>Withdrawal Settings</div>
            </CardTitle>
            <p className="text-gray-400">Configure minimum withdrawal amounts and processing settings</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Minimum Withdrawal ($USD)</Label>
                <Input
                  type="number"
                  min="1"
                  value={localDepositSettings.min_withdrawal || systemSettings?.withdrawal_limits?.min_withdrawal || ""}
                  onChange={(e) => setLocalDepositSettings((prev: any) => ({
                    ...prev,
                    min_withdrawal: e.target.value
                  }))}
                  placeholder="e.g., 10"
                  className="bg-crypto-dark border-gray-600 text-white"
                  data-testid="min-withdrawal-input"
                />
                <p className="text-xs text-gray-400">
                  Minimum amount users can withdraw in USD
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Processing Fee (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={localDepositSettings.withdrawal_fee || systemSettings?.withdrawal_limits?.fee_percentage || ""}
                  onChange={(e) => setLocalDepositSettings((prev: any) => ({
                    ...prev,
                    withdrawal_fee: e.target.value
                  }))}
                  placeholder="e.g., 2.5"
                  className="bg-crypto-dark border-gray-600 text-white"
                  data-testid="withdrawal-fee-input"
                />
                <p className="text-xs text-gray-400">
                  Percentage fee charged on withdrawals
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  const withdrawalSettings = {
                    min_withdrawal: parseFloat(localDepositSettings.min_withdrawal) || 10,
                    fee_percentage: parseFloat(localDepositSettings.withdrawal_fee) || 0
                  };
                  updateDepositSettingsMutation.mutate({ withdrawal_limits: withdrawalSettings });
                }}
                className="bg-crypto-blue hover:bg-blue-600 text-white"
                data-testid="save-withdrawal-settings"
              >
                Save Withdrawal Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-crypto-card border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-crypto-blue rounded-full mt-2 flex-shrink-0"></div>
              <div className="text-sm text-gray-300">
                <div className="font-medium mb-1">Configuration Notes:</div>
                <ul className="text-gray-400 space-y-1">
                  <li>• Changes are applied immediately to new deposits and withdrawals</li>
                  <li>• Minimum deposit amounts should include the cryptocurrency symbol</li>
                  <li>• Higher confirmation counts increase security but delay processing</li>
                  <li>• Wallet addresses must be saved with deposit settings to appear on deposit pages</li>
                  <li>• All deposits are automatically converted to USD in user accounts</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // State for AI settings
  const [aiSettings, setAiSettings] = useState({
    personality: "",
    greetingMessage: ""
  });

  // Fetch current AI settings
  const { data: currentAiSettings } = useQuery({
    queryKey: ["/api/admin/settings"],
    queryFn: () => fetchWithAuth("/admin/settings"),
  });

  // Update AI settings when data is fetched
  useEffect(() => {
    if (currentAiSettings?.ai_chat) {
      setAiSettings({
        personality: currentAiSettings.ai_chat.personality || "You are a helpful TradePilot AI assistant specializing in cryptocurrency trading and arbitrage opportunities. You are knowledgeable, professional, and always aim to provide accurate information about crypto markets and trading strategies.",
        greetingMessage: currentAiSettings.ai_chat.greeting_message || "Welcome to TradePilot! How can I assist you with your trading journey today?"
      });
    }
  }, [currentAiSettings]);

  // Save AI settings mutation
  const saveAiSettingsMutation = useMutation({
    mutationFn: async (settings: { personality: string; greetingMessage: string }) => {
      // Update AI personality
      await fetchWithAuth("/admin/ai-chat/personality", {
        method: "PUT",
        body: JSON.stringify({
          personality: settings.personality
        }),
      });
      
      // Update system settings for greeting message
      return fetchWithAuth("/admin/settings", {
        method: "PATCH",
        body: JSON.stringify({
          ai_chat: {
            enabled: true,
            personality: settings.personality,
            greeting_message: settings.greetingMessage,
            api_keys: currentAiSettings?.ai_chat?.api_keys || {
              reply_keys: [],
              summary_keys: [],
              current_reply_index: 0,
              current_summary_index: 0,
            }
          }
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "AI settings have been saved successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save AI settings",
      });
    },
  });

  // AI Chat Settings Component
  const renderAIChatSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">AI Chat Configuration</h2>
        <p className="text-gray-400">Configure AI personality and behavior</p>
      </div>

      <Card className="bg-crypto-card border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            AI Personality Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-gray-300 text-lg font-medium">AI Personality Prompt</Label>
            <Textarea
              value={aiSettings.personality}
              onChange={(e) => setAiSettings({...aiSettings, personality: e.target.value})}
              placeholder="You are a helpful TradePilot AI assistant specializing in cryptocurrency trading and arbitrage opportunities. You are knowledgeable, professional, and always aim to provide accurate information about crypto markets and trading strategies..."
              className="bg-gray-700 border-gray-600 text-white min-h-[120px] resize-vertical"
              rows={8}
            />
            <p className="text-xs text-gray-400">
              This prompt defines the AI's personality and behavior. Be specific about trading expertise, communication style, and helpful traits.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300 text-lg font-medium">AI Greeting Message</Label>
            <Input
              value={aiSettings.greetingMessage}
              onChange={(e) => setAiSettings({...aiSettings, greetingMessage: e.target.value})}
              placeholder="Welcome to TradePilot! How can I assist you with your trading journey today?"
              className="bg-gray-700 border-gray-600 text-white"
            />
            <p className="text-xs text-gray-400">
              The first message users see when they start a new chat session with the AI.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              onClick={() => saveAiSettingsMutation.mutate(aiSettings)}
              disabled={saveAiSettingsMutation.isPending}
              className="bg-crypto-green hover:bg-green-600"
            >
              <Edit className="w-4 h-4 mr-2" />
              {saveAiSettingsMutation.isPending ? "Saving..." : "Save AI Settings"}
            </Button>
            <Button 
              variant="outline" 
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
              onClick={() => setAiSettings({
                personality: "You are a helpful TradePilot AI assistant specializing in cryptocurrency trading and arbitrage opportunities. You are knowledgeable, professional, and always aim to provide accurate information about crypto markets and trading strategies.",
                greetingMessage: "Welcome to TradePilot! How can I assist you with your trading journey today?"
              })}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-crypto-card border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Bot className="h-5 w-5 mr-2" />
            AI Chat Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-crypto-blue">145</div>
              <div className="text-sm text-gray-400">Total Conversations</div>
            </div>
            <div className="text-center p-4 bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-crypto-green">89%</div>
              <div className="text-sm text-gray-400">User Satisfaction</div>
            </div>
            <div className="text-center p-4 bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-yellow-400">24</div>
              <div className="text-sm text-gray-400">Active Sessions</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Support ticket management helpers
  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-yellow-500";
      case "replied":
        return "bg-blue-500";
      case "closed":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  // Render support ticket management
  const renderSupportTickets = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Support Tickets</h2>
          <p className="text-gray-400 mt-1">Manage customer support tickets</p>
        </div>
        <Button onClick={() => refetchTickets()} disabled={ticketsLoading} variant="outline" className="border-crypto-blue text-crypto-blue hover:bg-crypto-blue hover:text-white">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {ticketsLoading ? (
        <Card className="bg-crypto-card border-gray-700">
          <CardContent className="p-6">
            <div className="text-center text-gray-400">Loading support tickets...</div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-crypto-card border-gray-700">
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-600">
                    <TableHead className="text-gray-300">ID</TableHead>
                    <TableHead className="text-gray-300">User</TableHead>
                    <TableHead className="text-gray-300">Subject</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Priority</TableHead>
                    <TableHead className="text-gray-300">Created</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!Array.isArray(supportTickets) || supportTickets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-400 py-8">
                        No support tickets found
                      </TableCell>
                    </TableRow>
                  ) : (
                    Array.isArray(supportTickets) ? supportTickets.map((ticket: any) => {
                      const user = Array.isArray(users) ? users.find((u: any) => u && u.id === ticket?.userId) : null;
                      return (
                        <TableRow key={ticket.id} className="border-gray-600">
                          <TableCell className="text-white font-mono text-xs">
                            {ticket?.id ? ticket.id.slice(0, 8) : 'N/A'}...
                          </TableCell>
                          <TableCell className="text-white">
                            {user?.username || 'Unknown'}
                          </TableCell>
                          <TableCell className="text-white max-w-xs truncate">
                            {ticket.subject}
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(ticket.status)} text-white`}>
                              {ticket.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getPriorityColor(ticket.priority)} text-white`}>
                              {ticket.priority}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {new Date(ticket.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                                onClick={() => {
                                  if (!ticket?.id) {
                                    toast({
                                      title: "Error",
                                      description: "Invalid ticket data. Please refresh the page.",
                                      variant: "destructive",
                                    });
                                    return;
                                  }
                                  setSelectedTicket(ticket);
                                  setReplyMessage(ticket.admin_reply || "");
                                  setIsTicketDialogOpen(true);
                                }}
                              >
                                <Reply className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                onClick={() => {
                                  if (confirm("Are you sure you want to delete this ticket?")) {
                                    deleteTicketMutation.mutate(ticket.id);
                                  }
                                }}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    }) : null
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ticket Reply Dialog */}
      <Dialog open={isTicketDialogOpen} onOpenChange={setIsTicketDialogOpen}>
        <DialogContent className="bg-crypto-card border-gray-700 text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle>Manage Support Ticket</DialogTitle>
            <DialogDescription className="text-gray-400">
              Reply to or update the support ticket status
            </DialogDescription>
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-6">
              {/* Original ticket info */}
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-white font-medium">{selectedTicket.subject}</h3>
                    <p className="text-gray-400 text-sm">
                      From: {Array.isArray(users) ? users.find((u: any) => u && u.id === selectedTicket?.userId)?.username || 'Unknown' : 'Unknown'} • 
                      Created: {selectedTicket?.created_at ? new Date(selectedTicket.created_at).toLocaleString() : 'Unknown'}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Badge className={`${getStatusColor(selectedTicket.status)} text-white`}>
                      {selectedTicket.status}
                    </Badge>
                    <Badge className={`${getPriorityColor(selectedTicket.priority)} text-white`}>
                      {selectedTicket.priority}
                    </Badge>
                  </div>
                </div>
                <p className="text-gray-300 whitespace-pre-wrap">{selectedTicket.message}</p>
              </div>

              {/* Admin reply section */}
              <div className="space-y-4">
                <Label className="text-gray-300">Admin Reply</Label>
                <Textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply here..."
                  className="bg-gray-700 border-gray-600 text-white min-h-[120px]"
                />
              </div>

              {/* Status and Priority controls */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Status</Label>
                  <Select
                    value={selectedTicket.status}
                    onValueChange={(value) =>
                      setSelectedTicket({ ...selectedTicket, status: value })
                    }
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="replied">Replied</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Priority</Label>
                  <Select
                    value={selectedTicket.priority}
                    onValueChange={(value) =>
                      setSelectedTicket({ ...selectedTicket, priority: value })
                    }
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setIsTicketDialogOpen(false)}
                  className="border-gray-600"
                >
                  Cancel
                </Button>
                <div className="space-x-2">
                  <Button
                    onClick={() => {
                      if (!selectedTicket?.id) {
                        toast({
                          title: "Error",
                          description: "Invalid ticket selected. Please refresh and try again.",
                          variant: "destructive",
                        });
                        return;
                      }
                      updateTicketMutation.mutate({
                        id: selectedTicket.id,
                        updates: {
                          admin_reply: replyMessage,
                          status: selectedTicket.status,
                          priority: selectedTicket.priority,
                        },
                      });
                    }}
                    disabled={updateTicketMutation.isPending || !selectedTicket?.id}
                    className="bg-crypto-green hover:bg-green-600"
                  >
                    {updateTicketMutation.isPending ? "Updating..." : "Update Ticket"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return renderDashboard();
      case "users":
        return renderUserManagement();
      case "support":
        return renderSupportTickets();
      case "withdrawals":
        return <WithdrawalManagement />;
      case "balances":
        return <BalanceManagement />;
      case "deposits":
        return renderDepositSettings();
      case "ai-keys":
        return <APIKeyManagement />;
      case "ai-chat":
        return renderAIChatSettings();
      case "referrals":
        return (
          <div className="text-center text-gray-400 py-8">
            <Gift className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <div className="text-lg">Referral Settings</div>
            <div className="text-sm">Configuration coming soon...</div>
          </div>
        );
      case "settings":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">System Settings</h2>
            
            {/* Brand Management Section */}
            <Card className="bg-crypto-card border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Brand Management</CardTitle>
              </CardHeader>
              <CardContent>
                <LogoManagement />
              </CardContent>
            </Card>
            
            <div className="text-center text-gray-400 py-8">
              <Settings className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <div className="text-lg">Additional Settings</div>
              <div className="text-sm">More configuration options coming soon...</div>
            </div>
          </div>
        );
      case "login-logs":
        return renderLoginLogs();
      case "security":
        return <ReCaptchaSettings />;
      case "callmebot":
        return <CallMeBotSettings />;
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-crypto-dark">
      <div className="flex h-screen">
        {/* Admin Sidebar */}
        <div className={`${isSidebarCollapsed ? "w-16" : "w-72"} bg-crypto-card border-r border-gray-700 transition-all duration-300 flex flex-col`}>
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <div className={`${isSidebarCollapsed ? 'hidden' : 'block'}`}>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-crypto-blue to-crypto-green flex items-center justify-center">
                  <ShieldAlert className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                  <p className="text-xs text-gray-400">TradePilot Management</p>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="text-gray-400 hover:text-white"
              data-testid="button-toggle-sidebar"
            >
              {isSidebarCollapsed ? <Plus className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            </Button>
          </div>

          <nav className="flex-1 p-4 overflow-y-auto">
            {!isSidebarCollapsed ? (
              <div className="space-y-6">
                {adminSections.map((category) => (
                  <div key={category.category}>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
                      {category.category}
                    </h3>
                    <div className="space-y-1">
                      {category.sections.map((section) => {
                        const Icon = section.icon;
                        const isActive = activeSection === section.id;
                        return (
                          <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`w-full text-left p-3 rounded-lg transition-colors ${
                              isActive 
                                ? "bg-crypto-blue/20 text-crypto-blue border-l-4 border-crypto-blue" 
                                : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                            }`}
                            data-testid={`nav-${section.id}`}
                          >
                            <div className="flex items-start space-x-3">
                              <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              <div className="text-left">
                                <div className="font-medium text-sm">{section.label}</div>
                                <div className="text-xs text-gray-400 mt-0.5">{section.description}</div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {adminSections.flatMap(category => category.sections).map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full p-2 rounded-lg transition-colors ${
                        activeSection === section.id 
                          ? "bg-crypto-blue text-white" 
                          : "text-gray-300 hover:text-white hover:bg-gray-700"
                      }`}
                      title={section.label}
                      data-testid={`nav-${section.id}`}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            )}
          </nav>

          <div className="p-4 border-t border-gray-700">
            <Button
              onClick={() => {
                localStorage.removeItem("admin_access");
                localStorage.removeItem("token"); 
                localStorage.removeItem("user");
                setLocation("/");
              }}
              variant="outline"
              className={`w-full border-red-500 text-red-400 hover:bg-red-500 hover:text-white ${
                isSidebarCollapsed ? 'p-2' : 'px-4 py-2'
              }`}
              data-testid="button-exit-admin"
              title={isSidebarCollapsed ? "Exit Admin" : undefined}
            >
              <Activity className="w-4 h-4" />
              {!isSidebarCollapsed && <span className="ml-2">Exit Admin</span>}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-crypto-card border-b border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white capitalize">
                  {adminSections.flatMap(cat => cat.sections).find(s => s.id === activeSection)?.label || "Dashboard"}
                </h2>
                <p className="text-gray-400">
                  {adminSections.flatMap(cat => cat.sections).find(s => s.id === activeSection)?.description || "Platform administration and management"}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 px-3 py-1 bg-red-500/20 rounded-full">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  <span className="text-red-400 text-sm font-medium">Live System</span>
                </div>
              </div>
            </div>
          </div>

          <main className="flex-1 p-6 overflow-y-auto bg-gradient-to-br from-crypto-dark to-gray-900">
            {renderContent()}
          </main>
        </div>
      </div>

      {/* User Edit Dialog */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="bg-crypto-card border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Edit User: {selectedUser?.username}</DialogTitle>
            <DialogDescription className="text-gray-400">
              Adjust user balance and manage account settings
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">User ID</Label>
                <Input 
                  value={selectedUser?.id || ""} 
                  disabled 
                  className="bg-gray-700 text-gray-400"
                />
              </div>
              <div>
                <Label className="text-gray-300">Email</Label>
                <Input 
                  value={selectedUser?.email || ""} 
                  disabled 
                  className="bg-gray-700 text-gray-400"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Current Balance</Label>
                <Input 
                  value={`$${parseFloat(selectedUser?.balance || "0").toFixed(2)}`} 
                  disabled 
                  className="bg-gray-700 text-gray-400"
                />
              </div>
              <div>
                <Label className="text-gray-300">Status</Label>
                <Input 
                  value={selectedUser?.isActive ? "Active" : "Blocked"} 
                  disabled 
                  className="bg-gray-700 text-gray-400"
                />
              </div>
            </div>

            <div className="space-y-3 border-t border-gray-700 pt-4">
              <h4 className="text-white font-medium">Balance Adjustment</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Amount ($)</Label>
                  <Input 
                    type="number"
                    placeholder="0.00"
                    value={balanceAdjustment.amount}
                    onChange={(e) => setBalanceAdjustment({ ...balanceAdjustment, amount: e.target.value })}
                    className="bg-gray-700 text-white border-gray-600"
                    data-testid="balance-amount-input"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Type</Label>
                  <select 
                    value={balanceAdjustment.type}
                    onChange={(e) => setBalanceAdjustment({ ...balanceAdjustment, type: e.target.value as "credit" | "debit" })}
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md"
                    data-testid="balance-type-select"
                  >
                    <option value="credit">Credit (+)</option>
                    <option value="debit">Debit (-)</option>
                  </select>
                </div>
              </div>
              
              <Button 
                onClick={handleBalanceAdjustment}
                disabled={!balanceAdjustment.amount || adjustBalanceMutation.isPending}
                className="w-full bg-crypto-blue hover:bg-blue-600"
                data-testid="adjust-balance-button"
              >
                {adjustBalanceMutation.isPending ? "Updating..." : "Update Balance"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}