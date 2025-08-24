import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useArbitrageOpportunities } from "@/hooks/use-crypto-prices";
import { useLocation } from "wouter";
import MainLayout from "@/components/layout/main-layout";
import CryptoCard from "@/components/ui/crypto-card";
import { motion } from "framer-motion";

export default function ArbitrageFeed() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const { data: opportunities, isLoading: opportunitiesLoading } = useArbitrageOpportunities();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    } else if (user) {
      setIsVisible(true);
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen hero-3d-bg flex items-center justify-center">
          <motion.div 
            className="text-white text-xl"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Loading Live Arbitrage Feed...
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
        {/* Header Section */}
        <motion.div 
          className="mb-8 relative z-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="flex items-center justify-between mb-6">
            <motion.h1 
              className="text-4xl font-bold bg-gradient-to-r from-white via-crypto-green to-crypto-blue bg-clip-text text-transparent"
              data-testid="page-title"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Live Arbitrage Feed
            </motion.h1>
            <motion.div
              className="flex items-center space-x-2 text-sm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 20 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="w-3 h-3 rounded-full bg-crypto-green animate-pulse"></div>
              <span className="text-gray-300">Real-time market data</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Arbitrage Opportunities */}
        <motion.div 
          className="relative z-10"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 50 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {opportunitiesLoading ? (
            <div className="text-center text-gray-400 py-12">
              <motion.div 
                className="w-16 h-16 border-4 border-crypto-blue border-t-transparent rounded-full mx-auto mb-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <p className="text-lg">Scanning markets for arbitrage opportunities...</p>
              <p className="text-sm mt-2 text-gray-500">Analyzing price differences across exchanges</p>
            </div>
          ) : opportunities && opportunities.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {opportunities.map((opportunity: any, index: number) => (
                <motion.div
                  key={`${opportunity.symbol}-${opportunity.buyExchange}-${opportunity.sellExchange}-${index}`}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30, scale: isVisible ? 1 : 0.9 }}
                  transition={{ duration: 0.6, delay: 0.8 + (index * 0.1) }}
                  whileHover={{ scale: 1.02, y: -2 }}
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
                    isProfitable={index < 5} // Make first 5 show as most profitable
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              className="text-center text-gray-400 py-12"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.9 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-gray-600/20 to-gray-500/20 flex items-center justify-center text-4xl">
                📊
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Opportunities Found</h3>
              <p className="text-gray-400 mb-4">
                Markets are stable right now. Check back in a few moments for new opportunities.
              </p>
              <motion.button
                className="px-6 py-2 bg-crypto-blue/20 text-crypto-blue rounded-lg hover:bg-crypto-blue/30 transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.reload()}
              >
                Refresh Data
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </MainLayout>
  );
}
