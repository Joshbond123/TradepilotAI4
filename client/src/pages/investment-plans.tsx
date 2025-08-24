import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import MainLayout from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { fetchWithAuth } from "@/lib/crypto-api";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { motion } from "framer-motion";

export default function InvestmentPlans() {
  const { user, isLoading, refreshUser } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ["/api/plans"],
    queryFn: () => fetchWithAuth("/plans"),
  });

  const investMutation = useMutation({
    mutationFn: ({ planId, amount }: { planId: string; amount: number }) =>
      apiRequest("POST", "/api/investments", { planId, amount }).then(res => res.json()),
    onSuccess: async () => {
      toast({
        title: "Investment Activated!",
        description: "Your AI trading plan is now active and generating returns.",
      });
      setIsDialogOpen(false);
      setInvestmentAmount("");
      setSelectedPlan(null);
      
      // Refresh all data immediately
      await refreshUser(); // Update balance in auth context
      queryClient.invalidateQueries({ queryKey: ["/api/investments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      
      // Redirect to dashboard to see the new investment
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1000);
    },
    onError: (error: any) => {
      toast({
        title: "Investment Failed",
        description: error.message || "Failed to create investment",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    } else if (user) {
      setIsVisible(true);
    }
  }, [user, isLoading, setLocation]);

  const handleInvest = (plan: any) => {
    setSelectedPlan(plan);
    setIsDialogOpen(true);
  };

  const handleSubmitInvestment = () => {
    if (!selectedPlan || !investmentAmount) return;

    const amount = parseFloat(investmentAmount);
    const minAmount = selectedPlan.min_deposit;
    const maxAmount = selectedPlan.max_deposit;
    const userBalance = user?.balance || 0;

    if (amount < minAmount) {
      toast({
        title: "Amount Too Low",
        description: `Minimum investment is $${minAmount}`,
        variant: "destructive",
      });
      return;
    }

    if (amount > maxAmount) {
      toast({
        title: "Amount Too High",
        description: `Maximum investment is $${maxAmount}`,
        variant: "destructive",
      });
      return;
    }

    if (amount > userBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for this investment",
        variant: "destructive",
      });
      return;
    }

    investMutation.mutate({
      planId: selectedPlan.id,
      amount,
    });
  };

  const getPlanIcon = (name: string) => {
    if (name.toLowerCase().includes("starter")) return "🤖";
    if (name.toLowerCase().includes("professional")) return "⚡";
    if (name.toLowerCase().includes("elite")) return "👑";
    return "🚀";
  };

  const getPlanColor = (name: string) => {
    if (name.toLowerCase().includes("starter")) return "from-blue-500 to-cyan-500";
    if (name.toLowerCase().includes("professional")) return "from-crypto-green to-emerald-500";
    if (name.toLowerCase().includes("elite")) return "from-yellow-500 to-orange-500";
    return "from-crypto-blue to-blue-600";
  };

  const isPlanPopular = (name: string) => name.toLowerCase().includes("professional");
  const isPlanPremium = (name: string) => name.toLowerCase().includes("elite");

  if (isLoading || plansLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen hero-3d-bg flex items-center justify-center">
          <motion.div 
            className="text-white text-xl"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Loading Investment Plans...
          </motion.div>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <MainLayout>
      <div className="relative">
        {/* Floating Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="floating-3d absolute top-20 left-10 w-32 h-32 rounded-full bg-gradient-to-r from-crypto-green/5 to-transparent blur-xl"></div>
          <div className="floating-3d-alt absolute top-40 right-20 w-24 h-24 rounded-full bg-gradient-to-r from-crypto-blue/5 to-transparent blur-lg"></div>
          <div className="floating-3d absolute bottom-20 right-1/4 w-40 h-40 rounded-full bg-gradient-to-r from-purple-500/3 to-blue-500/3 blur-2xl"></div>
        </div>

        {/* Header Section */}
        <motion.div 
          className="mb-12 text-center relative z-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h1 
            className="text-5xl font-bold mb-4 bg-gradient-to-r from-white via-crypto-green to-crypto-blue bg-clip-text text-transparent"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.9 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            🚀 AI Trading Plans
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-400 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Choose from our AI-powered investment plans and let advanced algorithms generate passive income for you
          </motion.p>
          
          <motion.div 
            className="mt-8 flex items-center justify-center space-x-8 text-sm text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="flex items-center space-x-2">
              <span className="text-crypto-green text-lg">✓</span>
              <span>24/7 AI Trading</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-crypto-green text-lg">✓</span>
              <span>Daily Returns</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-crypto-green text-lg">✓</span>
              <span>Risk Management</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Plans Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: isVisible ? 1 : 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          {plans?.map((plan: any, index: number) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 50, scale: isVisible ? 1 : 0.9 }}
              transition={{ duration: 0.6, delay: 1.0 + (index * 0.2) }}
              whileHover={{ scale: 1.05, y: -10 }}
              className="relative group"
            >
              {/* Popular/Premium Badge */}
              {(isPlanPopular(plan.name) || isPlanPremium(plan.name)) && (
                <motion.div 
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.2 + (index * 0.2) }}
                >
                  <div className={`px-4 py-2 rounded-full text-xs font-bold text-white shadow-lg ${
                    isPlanPopular(plan.name) ? 'bg-gradient-to-r from-crypto-green to-emerald-500' : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                  }`}>
                    {isPlanPopular(plan.name) ? '🔥 MOST POPULAR' : '⭐ PREMIUM'}
                  </div>
                </motion.div>
              )}

              <Card className={`h-full bg-crypto-card/90 backdrop-blur-xl border-2 transition-all duration-300 shadow-2xl card-float ${
                isPlanPopular(plan.name) ? 'border-crypto-green/50 hover:border-crypto-green' : 
                isPlanPremium(plan.name) ? 'border-yellow-500/50 hover:border-yellow-500' :
                'border-gray-700/50 hover:border-gray-600'
              }`}>
                <CardContent className="p-8">
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <motion.div 
                      className={`w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${getPlanColor(plan.name)} flex items-center justify-center text-4xl shadow-lg`}
                      animate={{ 
                        boxShadow: [
                          "0 0 20px rgba(255, 255, 255, 0.1)",
                          "0 0 30px rgba(255, 255, 255, 0.2)",
                          "0 0 20px rgba(255, 255, 255, 0.1)"
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {getPlanIcon(plan.name)}
                    </motion.div>
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-gray-400 text-sm">{plan.description}</p>
                  </div>

                  {/* Plan Stats */}
                  <div className="space-y-6 mb-8">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-white mb-2">
                        {plan.profit_percentage}%
                      </div>
                      <div className="text-sm text-gray-400">Daily Return</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-crypto-dark/50 rounded-xl p-4 text-center">
                        <div className="text-white font-semibold">${plan.min_deposit.toLocaleString()}</div>
                        <div className="text-gray-400">Min Deposit</div>
                      </div>
                      <div className="bg-crypto-dark/50 rounded-xl p-4 text-center">
                        <div className="text-white font-semibold">${plan.max_deposit.toLocaleString()}</div>
                        <div className="text-gray-400">Max Deposit</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-crypto-dark/50 rounded-xl p-4 text-center">
                        <div className="text-white font-semibold">{plan.duration_days} Days</div>
                        <div className="text-gray-400">Duration</div>
                      </div>
                      <div className="bg-crypto-dark/50 rounded-xl p-4 text-center">
                        <div className="text-crypto-green font-semibold">
                          {(plan.profit_percentage * plan.duration_days).toFixed(1)}%
                        </div>
                        <div className="text-gray-400">Total ROI</div>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mb-8">
                    <h4 className="text-white font-semibold mb-4">✨ Plan Features</h4>
                    <div className="space-y-3">
                      {plan.features?.map((feature, idx) => (
                        <div key={idx} className="flex items-center space-x-3 text-sm">
                          <span className="text-crypto-green">✓</span>
                          <span className="text-gray-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={() => handleInvest(plan)}
                    className={`w-full py-3 text-lg font-semibold rounded-xl transition-all duration-300 button-hover-lift ${
                      isPlanPopular(plan.name) ? 'crypto-gradient' : 
                      isPlanPremium(plan.name) ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:opacity-90' :
                      'bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90'
                    }`}
                    data-testid={`invest-${plan.id}`}
                  >
                    {isPlanPremium(plan.name) ? '👑 Invest Now' : '🚀 Start Trading'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Investment Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-crypto-card/95 backdrop-blur-xl border border-gray-700 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">
                💰 Invest in {selectedPlan?.name}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Enter your investment amount to start earning with AI trading
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 mt-6">
              <div className="bg-crypto-dark/50 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <div className="text-gray-400">Daily Return</div>
                    <div className="text-crypto-green font-semibold">
                      {selectedPlan?.profit_percentage}%
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">Duration</div>
                    <div className="text-white font-semibold">
                      {selectedPlan?.duration_days} days
                    </div>
                  </div>
                </div>

                {/* Dynamic Profit Calculations */}
                {investmentAmount && !isNaN(parseFloat(investmentAmount)) && (
                  <div className="border-t border-gray-600 pt-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg p-3">
                        <div className="text-blue-300 text-xs font-medium">Daily Profit</div>
                        <div className="text-blue-100 font-bold text-lg">
                          ${((parseFloat(investmentAmount) * (selectedPlan?.profit_percentage || 0)) / 100).toFixed(2)}
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg p-3">
                        <div className="text-green-300 text-xs font-medium">Total Profit</div>
                        <div className="text-green-100 font-bold text-lg">
                          ${((parseFloat(investmentAmount) * (selectedPlan?.profit_percentage || 0) * (selectedPlan?.duration_days || 0)) / 100).toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 text-center">
                      <div className="text-xs text-gray-400">Total Return</div>
                      <div className="text-yellow-400 font-bold text-lg">
                        ${(parseFloat(investmentAmount) + ((parseFloat(investmentAmount) * (selectedPlan?.profit_percentage || 0) * (selectedPlan?.duration_days || 0)) / 100)).toFixed(2)}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Investment Amount</Label>
                <Input
                  type="number"
                  placeholder={`Min: $${selectedPlan?.min_deposit} - Max: $${selectedPlan?.max_deposit}`}
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  className="bg-white/90 border-gray-600 text-black placeholder-gray-500 focus:border-crypto-green focus:bg-white"
                  data-testid="input-investment-amount"
                />
                <div className="text-sm text-gray-400">
                  Your balance: ${user?.balance?.toLocaleString() || '0'}
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1 border-gray-600 text-gray-300 hover:text-white"
                  data-testid="button-cancel-investment"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitInvestment}
                  disabled={investMutation.isPending}
                  className="flex-1 crypto-gradient"
                  data-testid="button-confirm-investment"
                >
                  {investMutation.isPending ? (
                    <motion.div 
                      className="flex items-center space-x-2"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Investing...</span>
                    </motion.div>
                  ) : (
                    "🚀 Confirm Investment"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}