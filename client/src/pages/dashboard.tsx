import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useArbitrageOpportunities } from "@/hooks/use-crypto-prices";
import MainLayout from "@/components/layout/main-layout";
import BalanceCard from "@/components/ui/balance-card";
import CryptoCard from "@/components/ui/crypto-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { fetchWithAuth } from "@/lib/crypto-api";
import { motion } from "framer-motion";
import PWAInstallButton from "@/components/ui/pwa-install-button";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  const { data: investments } = useQuery({
    queryKey: ["/api/investments"],
    queryFn: () => fetchWithAuth("/investments"),
  });

  const { data: plans } = useQuery({
    queryKey: ["/api/plans"],
    queryFn: () => fetchWithAuth("/plans"),
  });

  const { data: arbitrageData, isLoading: arbitrageLoading } = useArbitrageOpportunities();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    } else if (user) {
      setIsVisible(true);
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen hero-3d-bg flex items-center justify-center">
        <motion.div 
          className="text-white text-xl"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Loading Dashboard...
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Calculate total earnings from investments
  const totalEarnings = investments?.reduce((sum: number, inv: any) => 
    sum + parseFloat(inv.total_earned || "0"), 0
  ) || 0;

  return (
    <MainLayout>
      <div className="relative">
        {/* Floating Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block">
          <div className="floating-3d absolute top-20 left-10 w-32 h-32 rounded-full bg-gradient-to-r from-crypto-green/5 to-transparent blur-xl"></div>
          <div className="floating-3d-alt absolute top-40 right-20 w-24 h-24 rounded-full bg-gradient-to-r from-crypto-blue/5 to-transparent blur-lg"></div>
          <div className="floating-3d absolute bottom-20 right-1/4 w-40 h-40 rounded-full bg-gradient-to-r from-purple-500/3 to-blue-500/3 blur-2xl"></div>
        </div>

        {/* Welcome Section */}
        <motion.div 
          className="mb-8 relative z-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h1 
            className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
            data-testid="page-title"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Welcome back, {user.username}!
          </motion.h1>
          <motion.p 
            className="text-gray-400 text-lg"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Your AI trading dashboard is ready for action
          </motion.p>
        </motion.div>

        {/* Balance Overview */}
        <motion.div 
          className="mb-8 relative z-10"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 50 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 max-w-full">
            {[
              {
                title: "Total Balance",
                value: `$${user.balance.toLocaleString()}`,
                change: user.balance > 1000 ? "+12.4% this week" : "Ready to invest",
                icon: (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-300">
                    <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center text-green-600 font-black text-sm">$</div>
                  </div>
                ),
                gradient: "from-green-500 to-emerald-500",
                delay: 0.8
              },
              {
                title: "Active Plans",
                value: investments?.length.toString() || "0",
                change: "Currently running",
                icon: (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-600 shadow-lg flex items-center justify-center transform -rotate-12 hover:rotate-0 transition-transform duration-300">
                    <div className="w-6 h-4 bg-white rounded-sm flex items-center justify-center">
                      <div className="w-4 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                    </div>
                  </div>
                ),
                gradient: "from-blue-500 to-cyan-500",
                delay: 1.0
              },
              {
                title: "Total Earnings",
                value: `$${totalEarnings.toLocaleString()}`,
                change: totalEarnings > 0 ? `+${((totalEarnings / (user.balance || 1)) * 100).toFixed(1)}% ROI` : "Start earning today",
                icon: (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-pink-600 shadow-lg flex items-center justify-center transform rotate-12 hover:rotate-0 transition-transform duration-300">
                    <div className="flex flex-col space-y-px">
                      <div className="w-5 h-1 bg-white rounded-full"></div>
                      <div className="w-4 h-1 bg-white/80 rounded-full ml-1"></div>
                      <div className="w-3 h-1 bg-white/60 rounded-full ml-2"></div>
                    </div>
                  </div>
                ),
                gradient: "from-purple-500 to-pink-500",
                delay: 1.2
              },
              {
                title: "Referral Earnings",
                value: (user as any).referralEarnings ? `$${(user as any).referralEarnings.toLocaleString()}` : "$0.00",
                change: (user as any).referralCount ? `From ${(user as any).referralCount} referrals` : "Share your link to earn",
                icon: (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-600 shadow-lg flex items-center justify-center transform -rotate-6 hover:rotate-0 transition-transform duration-300">
                    <div className="flex space-x-px">
                      <div className="w-2 h-4 bg-white rounded-full"></div>
                      <div className="w-2 h-3 bg-white/80 rounded-full mt-0.5"></div>
                      <div className="w-2 h-2 bg-white/60 rounded-full mt-1"></div>
                    </div>
                  </div>
                ),
                gradient: "from-yellow-500 to-orange-500",
                delay: 1.4
              }
            ].map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.9, y: isVisible ? 0 : 30 }}
                transition={{ duration: 0.6, delay: card.delay }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group"
              >
                <Card className="bg-crypto-card/90 backdrop-blur-xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 shadow-lg hover:shadow-xl card-float">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-gray-400 text-sm mb-1">{card.title}</p>
                        <p className="text-2xl font-bold text-white mb-2">{card.value}</p>
                        <p className="text-xs text-gray-500">{card.change}</p>
                      </div>
                      <motion.div 
                        className={`w-12 h-12 rounded-xl bg-gradient-to-r ${card.gradient} flex items-center justify-center text-2xl`}
                        animate={{ 
                          boxShadow: [
                            "0 0 20px rgba(255, 255, 255, 0.1)",
                            "0 0 30px rgba(255, 255, 255, 0.2)",
                            "0 0 20px rgba(255, 255, 255, 0.1)"
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {card.icon}
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Live Arbitrage Preview */}
        <motion.div 
          className="mb-8 relative z-10"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 50 }}
          transition={{ duration: 0.8, delay: 1.6 }}
        >
          <div className="flex items-center justify-between mb-6">
            <motion.h2 
              className="text-2xl font-semibold text-white"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -20 }}
              transition={{ duration: 0.6, delay: 1.8 }}
            >
              🚀 Live Arbitrage Opportunities
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 20 }}
              transition={{ duration: 0.6, delay: 2.0 }}
            >
              <Button
                variant="link"
                className="text-crypto-blue hover:text-crypto-green hover:underline text-sm transition-all duration-300 hover:scale-105"
                onClick={() => setLocation("/arbitrage")}
                data-testid="link-view-all-arbitrage"
              >
                View All Opportunities →
              </Button>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.95 }}
            transition={{ duration: 0.8, delay: 2.2 }}
          >
            <Card className="bg-crypto-card/90 backdrop-blur-xl border border-gray-700/50 shadow-2xl card-float">
              <CardContent className="p-6">
                {arbitrageLoading ? (
                  <motion.div 
                    className="text-center text-gray-400 py-8"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    🔍 Scanning markets for arbitrage opportunities...
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {arbitrageData?.slice(0, 3).map((opportunity: any, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 30, scale: 0.9 }}
                        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30, scale: isVisible ? 1 : 0.9 }}
                        transition={{ duration: 0.6, delay: 2.4 + (index * 0.2) }}
                        whileHover={{ scale: 1.05, y: -5 }}
                      >
                        <CryptoCard
                          symbol={opportunity.symbol}
                          name={opportunity.name}
                          buyExchange={opportunity.buyExchange}
                          sellExchange={opportunity.sellExchange}
                          buyPrice={opportunity.buyPrice}
                          sellPrice={opportunity.sellPrice}
                          profitPercentage={opportunity.profitPercentage}
                          volume={opportunity.volume}
                          isProfitable={index === 0}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Active Investment Plans */}
        <motion.div 
          className="mb-8 relative z-10"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 50 }}
          transition={{ duration: 0.8, delay: 3.0 }}
        >
          <div className="flex items-center justify-between mb-6">
            <motion.h2 
              className="text-2xl font-semibold text-white"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -20 }}
              transition={{ duration: 0.6, delay: 3.2 }}
            >
              💼 Your Active Investments
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 20 }}
              transition={{ duration: 0.6, delay: 3.4 }}
            >
              <Button
                className="crypto-gradient hover:opacity-90 transition-all duration-300 button-hover-lift"
                onClick={() => setLocation("/plans")}
                data-testid="button-browse-plans"
              >
                📊 Browse Investment Plans
              </Button>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.95 }}
            transition={{ duration: 0.8, delay: 3.6 }}
            className="relative"
          >
            {/* Decorative background effects */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-emerald-600/10 rounded-3xl blur-2xl"></div>
            
            {investments && investments.length > 0 ? (
              <div className="grid gap-4 sm:gap-6 lg:grid-cols-1">
                {investments.map((investment: any, index: number) => {
                  // Calculate progress based on actual plan data
                  const planData = plans?.find((p: any) => p.id === investment.planId);
                  const totalDays = planData?.duration_days || 30;
                  const daysRemaining = investment.days_remaining || totalDays;
                  const daysElapsed = totalDays - daysRemaining;
                  const progressPercent = (daysElapsed / totalDays) * 100;
                  
                  return (
                    <motion.div
                      key={investment.id}
                      initial={{ opacity: 0, y: 30, rotateX: -15 }}
                      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30, rotateX: 0 }}
                      transition={{ duration: 0.7, delay: 3.8 + (index * 0.2) }}
                      whileHover={{ 
                        scale: 1.02, 
                        rotateX: 2,
                        rotateY: -2,
                        y: -8,
                        transition: { duration: 0.3 }
                      }}
                      style={{ transformStyle: "preserve-3d" }}
                      className="relative group"
                    >
                      {/* 3D Card Container */}
                      <div className="relative bg-gradient-to-br from-gray-900/80 via-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-gray-600/50 rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 group-hover:border-gray-500/70">
                        {/* Animated background gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        {/* Floating particles */}
                        <div className="absolute inset-0 overflow-hidden">
                          {[...Array(3)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute w-1 h-1 bg-gradient-to-r from-blue-400 to-emerald-400 rounded-full opacity-60"
                              animate={{
                                x: [0, 100, 0],
                                y: [0, -60, 0],
                                opacity: [0, 1, 0],
                              }}
                              transition={{
                                duration: 6,
                                delay: i * 1.5,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                              style={{
                                left: `${20 + i * 30}%`,
                                top: `${70 + i * 10}%`,
                              }}
                            />
                          ))}
                        </div>

                        <div className="relative z-10 p-6">
                          {/* Header Section */}
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                              <motion.div
                                whileHover={{ rotate: 360, scale: 1.1 }}
                                transition={{ duration: 0.6 }}
                                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 via-blue-500 to-purple-500 shadow-lg flex items-center justify-center relative"
                                style={{ 
                                  boxShadow: "0 8px 32px rgba(59, 130, 246, 0.3)",
                                  transform: "translateZ(10px)"
                                }}
                              >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                                <motion.div 
                                  animate={{ 
                                    scale: [1, 1.1, 1],
                                    rotate: [0, 180, 360]
                                  }}
                                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                  className="text-white text-xl"
                                >
                                  🤖
                                </motion.div>
                              </motion.div>
                              
                              <div>
                                <h3 className="text-xl font-bold text-white mb-1">
                                  {investment.plan_name || 'AI Trading Plan'}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                                  <span>Active • Started {new Date(investment.created_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                            
                            <motion.div 
                              className="text-right"
                              whileHover={{ scale: 1.05 }}
                            >
                              <div className="text-2xl font-bold text-emerald-400 mb-1">
                                +${parseFloat(investment.total_earned || "0").toFixed(2)}
                              </div>
                              <div className="text-sm text-gray-400">Total Earned</div>
                            </motion.div>
                          </div>

                          {/* Investment Details Grid */}
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-6">
                            <motion.div 
                              className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-3 border border-blue-500/30"
                              whileHover={{ scale: 1.05, rotateY: 5 }}
                              style={{ transformStyle: "preserve-3d" }}
                            >
                              <div className="text-blue-300 text-xs font-medium mb-1">Investment</div>
                              <div className="text-white font-bold text-lg">${parseFloat(investment.amount).toFixed(2)}</div>
                            </motion.div>
                            
                            <motion.div 
                              className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-xl p-3 border border-emerald-500/30"
                              whileHover={{ scale: 1.05, rotateY: -5 }}
                              style={{ transformStyle: "preserve-3d" }}
                            >
                              <div className="text-emerald-300 text-xs font-medium mb-1">Daily Profit</div>
                              <div className="text-white font-bold text-lg">${parseFloat(investment.daily_return || "0").toFixed(2)}</div>
                            </motion.div>
                            
                            <motion.div 
                              className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-3 border border-purple-500/30"
                              whileHover={{ scale: 1.05, rotateY: 5 }}
                              style={{ transformStyle: "preserve-3d" }}
                            >
                              <div className="text-purple-300 text-xs font-medium mb-1">Days Left</div>
                              <div className="text-white font-bold text-lg">{investment.days_remaining || 0}</div>
                            </motion.div>
                            
                            <motion.div 
                              className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl p-3 border border-yellow-500/30"
                              whileHover={{ scale: 1.05, rotateY: -5 }}
                              style={{ transformStyle: "preserve-3d" }}
                            >
                              <div className="text-yellow-300 text-xs font-medium mb-1">ROI</div>
                              <div className="text-white font-bold text-lg">
                                {investment.plan_profit_percentage ? `${investment.plan_profit_percentage}%` : "17.5%"}
                              </div>
                            </motion.div>
                          </div>

                          {/* Progress Section */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-300">Investment Progress</span>
                              <span className="text-sm font-bold text-blue-400">
                                {Math.min(100, progressPercent).toFixed(1)}%
                              </span>
                            </div>
                            
                            <div className="relative">
                              <div className="w-full h-3 bg-gray-700/50 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: isVisible ? `${Math.min(100, progressPercent)}%` : '0%' }}
                                  transition={{ duration: 1.5, delay: 4.0 + (index * 0.2), ease: "easeOut" }}
                                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 rounded-full relative"
                                >
                                  <div className="absolute inset-0 bg-white/20 rounded-full"></div>
                                  <motion.div
                                    animate={{
                                      boxShadow: [
                                        "0 0 10px rgba(59, 130, 246, 0.5)",
                                        "0 0 20px rgba(59, 130, 246, 0.8)",
                                        "0 0 10px rgba(59, 130, 246, 0.5)"
                                      ]
                                    }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute inset-0 rounded-full"
                                  />
                                </motion.div>
                              </div>
                            </div>
                            
                            <div className="flex justify-between text-xs text-gray-400">
                              <span>Started: {new Date(investment.created_at).toLocaleDateString()}</span>
                              <span>Status: {investment.is_active ? 'Active' : 'Completed'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <Card className="bg-crypto-card/90 backdrop-blur-xl border border-gray-700/50 shadow-2xl card-float">
                <CardContent className="p-6">
                  <motion.div 
                    className="text-center py-12"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.9 }}
                    transition={{ duration: 0.6, delay: 3.8 }}
                  >
                    <motion.div 
                      className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-crypto-blue/20 to-crypto-green/20 shadow-xl flex items-center justify-center"
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.8 }}
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-crypto-blue to-crypto-green shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform">
                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                          <div className="w-3 h-3 bg-gradient-to-br from-crypto-blue to-crypto-green rounded-full"></div>
                        </div>
                      </div>
                    </motion.div>
                    <h3 className="text-xl font-semibold text-white mb-2">Ready to Start Trading?</h3>
                    <p className="text-gray-400 mb-6">
                      Choose from our AI-powered investment plans and start earning passive income today
                    </p>
                    <Button
                      className="crypto-gradient hover:opacity-90 transition-all duration-300 button-hover-lift"
                      onClick={() => setLocation("/plans")}
                      data-testid="button-start-investing"
                    >
                      🚀 Start Your First Investment
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </motion.div>


      </div>
    </MainLayout>
  );
}