import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import MainLayout from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { fetchWithAuth, createWithdrawal } from "@/lib/crypto-api";
import { queryClient } from "@/lib/queryClient";
import { CheckCircle, Clock, XCircle, AlertTriangle } from "lucide-react";

const cryptoOptions = [
  { 
    value: "BTC", 
    label: "Bitcoin (BTC)", 
    networkFee: 0,
    logoUrl: "https://assets.coincap.io/assets/icons/btc@2x.png"
  },
  { 
    value: "ETH", 
    label: "Ethereum (ETH)", 
    networkFee: 0,
    logoUrl: "https://assets.coincap.io/assets/icons/eth@2x.png"
  },
  { 
    value: "USDT", 
    label: "Tether USDT-TRC20", 
    networkFee: 0,
    logoUrl: "https://assets.coincap.io/assets/icons/usdt@2x.png"
  },
];

export default function Withdraw() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    cryptocurrency: "",
    walletAddress: "",
    amount: "",
  });

  const { data: withdrawals } = useQuery({
    queryKey: ["/api/withdrawals"],
    queryFn: () => fetchWithAuth("/withdrawals"),
  });

  const withdrawMutation = useMutation({
    mutationFn: createWithdrawal,
    onSuccess: () => {
      toast({
        title: "Withdrawal Request Submitted",
        description: "Your withdrawal request has been submitted and is being processed.",
      });
      setFormData({ cryptocurrency: "", walletAddress: "", amount: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
    onError: (error: any) => {
      toast({
        title: "Withdrawal Failed",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount);
    const selectedCrypto = cryptoOptions.find(c => c.value === formData.cryptocurrency);
    const networkFee = selectedCrypto?.networkFee || 0;
    const userBalance = parseFloat(user?.balance?.toString() || "0");

    if (amount < 10) {
      toast({
        title: "Invalid Amount",
        description: "Minimum withdrawal amount is $10",
        variant: "destructive",
      });
      return;
    }
    
    if (amount > userBalance) {
      toast({
        title: "Insufficient Balance",
        description: `You only have $${userBalance.toLocaleString()} available for withdrawal`,
        variant: "destructive",
      });
      return;
    }

    if (amount > userBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for this withdrawal",
        variant: "destructive",
      });
      return;
    }

    withdrawMutation.mutate({
      cryptocurrency: formData.cryptocurrency,
      amount: "0", // Will be calculated on backend
      usdValue: formData.amount,
      walletAddress: formData.walletAddress,
      networkFee: networkFee.toString(),
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-crypto-green";
      case "approved":
        return "bg-blue-500";
      case "pending":
        return "bg-yellow-500";
      case "rejected":
        return "bg-red-600";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return CheckCircle;
      case "approved":
        return CheckCircle;
      case "pending":
        return Clock;
      case "rejected":
        return XCircle;
      default:
        return AlertTriangle;
    }
  };

  const selectedCrypto = cryptoOptions.find(c => c.value === formData.cryptocurrency);
  const networkFee = selectedCrypto?.networkFee || 0;
  const amount = parseFloat(formData.amount) || 0;
  const youReceive = Math.max(0, amount - networkFee);

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

  return (
    <MainLayout>
      <h1 className="text-3xl font-bold mb-6" data-testid="page-title">
        Withdraw Funds
      </h1>

          <div className="max-w-4xl space-y-6">
            {/* Balance Overview */}
            <Card className="bg-crypto-card border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Available Balance</h3>
                <div className="text-3xl font-bold text-crypto-green mb-2" data-testid="available-balance">
                  ${parseFloat(user.balance?.toString() || "0").toLocaleString()}
                </div>
                {parseFloat(user.balance?.toString() || "0") < 10 ? (
                  <div className="text-sm text-red-400">
                    Insufficient balance for withdrawal (minimum $10 required)
                  </div>
                ) : (
                  <div className="text-sm text-gray-400">Ready for withdrawal</div>
                )}
              </CardContent>
            </Card>

            {/* Withdrawal Form */}
            <Card className="bg-crypto-card border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Request Withdrawal</h3>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label className="text-gray-300">Cryptocurrency</Label>
                    <Select
                      value={formData.cryptocurrency}
                      onValueChange={(value) => setFormData({ ...formData, cryptocurrency: value })}
                    >
                      <SelectTrigger className="bg-crypto-dark border-gray-600 text-white focus:border-crypto-blue" data-testid="select-cryptocurrency">
                        <SelectValue placeholder="Select cryptocurrency" />
                      </SelectTrigger>
                      <SelectContent className="bg-crypto-dark border-gray-600">
                        {cryptoOptions.map((crypto) => (
                          <SelectItem 
                            key={crypto.value} 
                            value={crypto.value}
                            className="text-white hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white data-[highlighted]:bg-gray-700 data-[highlighted]:text-white"
                          >
                            <div className="flex items-center space-x-3">
                              <img 
                                src={crypto.logoUrl} 
                                alt={`${crypto.value} logo`} 
                                className="w-5 h-5 rounded-full"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "https://assets.coincap.io/assets/icons/btc@2x.png";
                                }}
                              />
                              <span className="text-white">{crypto.label}</span>
                              {formData.cryptocurrency === crypto.value && (
                                <span className="ml-auto text-green-500 text-lg">✓</span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-gray-300">Wallet Address</Label>
                    <Input
                      type="text"
                      placeholder="Enter your wallet address"
                      value={formData.walletAddress}
                      onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                      className="bg-crypto-dark border-gray-600 text-white placeholder-gray-400 focus:border-crypto-blue"
                      required
                      data-testid="input-wallet-address"
                    />
                    <div className="text-sm text-gray-400 mt-1">
                      Make sure this address is correct. Transactions cannot be reversed.
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-300">Amount (USD)</Label>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="bg-crypto-dark border-gray-600 text-white placeholder-gray-400 focus:border-crypto-blue"
                      required
                      min="10"
                      step="0.01"
                      data-testid="input-amount"
                    />
                    <div className="text-sm text-gray-400 mt-2">
                      Minimum withdrawal: $10 • Available balance: ${parseFloat(user.balance?.toString() || "0").toLocaleString()}
                    </div>
                  </div>

                  {formData.cryptocurrency && formData.amount && (
                    <div className="bg-crypto-dark rounded-lg p-4">
                      <Label className="text-gray-300 block mb-3">Transaction Summary</Label>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Withdrawal Amount:</span>
                          <span className="text-white" data-testid="summary-amount">${amount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Network Fee:</span>
                          <span className="text-white" data-testid="summary-fee">${networkFee.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between border-t border-gray-600 pt-2">
                          <span className="text-gray-400">You'll receive:</span>
                          <span className="text-crypto-green font-semibold" data-testid="summary-receive">
                            ${youReceive.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full crypto-gradient"
                    disabled={
                      withdrawMutation.isPending || 
                      !formData.cryptocurrency || 
                      !formData.walletAddress || 
                      !formData.amount ||
                      parseFloat(user.balance?.toString() || "0") < 10 ||
                      parseFloat(formData.amount || "0") > parseFloat(user.balance?.toString() || "0")
                    }
                    data-testid="button-request-withdrawal"
                  >
                    {withdrawMutation.isPending ? "Processing..." : 
                     parseFloat(user.balance?.toString() || "0") < 10 ? "Insufficient Balance" :
                     "Request Withdrawal"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Withdrawal History */}
            <Card className="bg-crypto-card border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Withdrawal History</h3>
                {withdrawals && withdrawals.length > 0 ? (
                  <div className="space-y-3">
                    {withdrawals.map((withdrawal: any) => {
                      const StatusIcon = getStatusIcon(withdrawal.status);
                      
                      return (
                        <div key={withdrawal.id} className="p-4 bg-crypto-dark rounded-lg" data-testid={`withdrawal-${withdrawal.id}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 rounded-full bg-white/10 border border-gray-600 flex items-center justify-center p-1">
                                <img 
                                  src={cryptoOptions.find(c => c.value === withdrawal.cryptocurrency)?.logoUrl || "https://assets.coincap.io/assets/icons/btc@2x.png"} 
                                  alt={`${withdrawal.cryptocurrency} logo`}
                                  className="w-8 h-8 object-contain"
                                />
                              </div>
                              <div>
                                <div className="font-semibold" data-testid="withdrawal-amount">
                                  Amount: ${parseFloat(withdrawal.amount || withdrawal.usd_value || withdrawal.usdValue || "0").toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-400" data-testid="withdrawal-crypto">
                                  Currency: {withdrawal.cryptocurrency} • Date: {(withdrawal.created_at || withdrawal.createdAt) && !isNaN(new Date(withdrawal.created_at || withdrawal.createdAt).getTime()) ? 
                                    new Date(withdrawal.created_at || withdrawal.createdAt).toLocaleString() : 
                                    "Processing"}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <StatusIcon className="w-4 h-4" />
                              <Badge className={`${getStatusColor(withdrawal.status)} text-white`} data-testid="withdrawal-status">
                                Status: {withdrawal.status ? withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1) : 'Pending'}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 truncate" data-testid="withdrawal-address">
                            Withdrawal Address: {withdrawal.wallet_address || withdrawal.walletAddress || "Not specified"}
                          </div>
                          {withdrawal.adminNotes && (
                            <div className="text-sm text-gray-400 mt-2" data-testid="admin-notes">
                              Note: {withdrawal.adminNotes}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    <div className="text-lg mb-2">No withdrawal history</div>
                    <div className="text-sm">Your withdrawal requests will appear here</div>
                  </div>
                )}
              </CardContent>
            </Card>
      </div>
    </MainLayout>
  );
}
