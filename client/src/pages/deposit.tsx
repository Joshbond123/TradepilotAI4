import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import MainLayout from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchWithAuth } from "@/lib/crypto-api";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const getDefaultCryptoOptions = (depositSettings: any = {}, wallets: any = {}) => [
  {
    symbol: "BTC",
    name: "Bitcoin",
    network: "Bitcoin",
    minDeposit: depositSettings?.BTC?.minDeposit ? `${depositSettings.BTC.minDeposit} BTC` : "0.001 BTC",
    confirmations: depositSettings?.BTC?.confirmations ? parseInt(depositSettings.BTC.confirmations) : 3,
    logoUrl: "https://assets.coincap.io/assets/icons/btc@2x.png",
    address: wallets?.BTC?.address || "",
    qrCode: wallets?.BTC?.qrCode || "",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    network: "Ethereum",
    minDeposit: depositSettings?.ETH?.minDeposit ? `${depositSettings.ETH.minDeposit} ETH` : "0.01 ETH",
    confirmations: depositSettings?.ETH?.confirmations ? parseInt(depositSettings.ETH.confirmations) : 12,
    logoUrl: "https://assets.coincap.io/assets/icons/eth@2x.png",
    address: wallets?.ETH?.address || "",
    qrCode: wallets?.ETH?.qrCode || "",
  },
  {
    symbol: "USDT",
    name: "Tether",
    network: "Tron (TRC-20)",
    minDeposit: depositSettings?.USDT?.minDeposit ? `${depositSettings.USDT.minDeposit} USDT` : "10 USDT",
    confirmations: depositSettings?.USDT?.confirmations ? parseInt(depositSettings.USDT.confirmations) : 20,
    logoUrl: "https://assets.coincap.io/assets/icons/usdt@2x.png",
    address: wallets?.USDT?.address || "",
    qrCode: wallets?.USDT?.qrCode || "",
  },
];

export default function Deposit() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedCrypto, setSelectedCrypto] = useState<string>("");
  const [isVisible, setIsVisible] = useState(false);

  const { data: wallets } = useQuery({
    queryKey: ["/api/system/wallets"],
    queryFn: () => fetchWithAuth("/system/wallets"),
  });

  const { data: deposits } = useQuery({
    queryKey: ["/api/deposits"],
    queryFn: () => fetchWithAuth("/deposits"),
  });

  const { data: depositSettings } = useQuery({
    queryKey: ["/api/admin/deposit-settings"],
    queryFn: () => fetchWithAuth("/admin/deposit-settings"),
  });

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    } else if (user) {
      setIsVisible(true);
    }
  }, [user, isLoading, setLocation]);

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({
      title: "Address Copied!",
      description: "Wallet address has been copied to clipboard",
    });
  };

  const getDepositAddress = (symbol: string) => {
    // First check from the crypto options (which includes admin settings)
    const crypto = cryptoOptions.find(c => c.symbol === symbol);
    if (crypto && crypto.address) {
      return crypto.address;
    }
    
    // Fallback to direct wallet lookup
    if (wallets && wallets[symbol] && wallets[symbol].address) {
      return wallets[symbol].address;
    }
    return "";
  };

  const getQrCode = (symbol: string) => {
    // First check from the crypto options (which includes admin settings)
    const crypto = cryptoOptions.find(c => c.symbol === symbol);
    if (crypto && crypto.qrCode) {
      return crypto.qrCode;
    }
    
    // Fallback to direct wallet lookup
    if (wallets && wallets[symbol] && wallets[symbol].qrCode) {
      return wallets[symbol].qrCode;
    }
    return null;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">✓ Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">⏳ Pending</Badge>;
      case "failed":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">✗ Failed</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">● {status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen hero-3d-bg flex items-center justify-center">
          <motion.div 
            className="text-white text-xl"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Loading Deposit...
          </motion.div>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return null;
  }

  const cryptoOptions = getDefaultCryptoOptions(depositSettings, wallets);

  return (
    <MainLayout>
      <div className="relative">
        {/* Floating Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="floating-3d absolute top-20 left-10 w-32 h-32 rounded-full bg-gradient-to-r from-green-500/5 to-transparent blur-xl"></div>
          <div className="floating-3d-alt absolute top-40 right-20 w-24 h-24 rounded-full bg-gradient-to-r from-blue-500/5 to-transparent blur-lg"></div>
          <div className="floating-3d absolute bottom-20 right-1/4 w-40 h-40 rounded-full bg-gradient-to-r from-emerald-500/3 to-teal-500/3 blur-2xl"></div>
        </div>

        {/* Header Section */}
        <motion.div 
          className="mb-8 text-center relative z-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h1 
            className="text-4xl font-bold mb-4 bg-gradient-to-r from-white via-green-500 to-emerald-500 bg-clip-text text-transparent"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.9 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            💳 Deposit Funds
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-400 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Add funds to your account and start earning with AI-powered trading
          </motion.p>
        </motion.div>

        {/* Current Balance */}
        <motion.div 
          className="mb-8 relative z-10"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 50 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Card className="bg-crypto-card/90 backdrop-blur-xl border border-gray-700/50 shadow-2xl card-float">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center space-x-4">
                <motion.div 
                  className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-3xl font-bold text-white"
                  animate={{ 
                    boxShadow: [
                      "0 0 20px rgba(34, 197, 94, 0.3)",
                      "0 0 30px rgba(34, 197, 94, 0.5)",
                      "0 0 20px rgba(34, 197, 94, 0.3)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  $
                </motion.div>
                <div>
                  <p className="text-gray-400 text-sm">Current Balance</p>
                  <p className="text-3xl font-bold text-white">${user.balance.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Cryptocurrency Options */}
        <motion.div 
          className="mb-8 relative z-10"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 50 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <motion.h2 
            className="text-2xl font-semibold text-white mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -20 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            🪙 Select Cryptocurrency
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cryptoOptions.map((crypto, index) => (
              <motion.div
                key={crypto.symbol}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30, scale: isVisible ? 1 : 0.9 }}
                transition={{ duration: 0.6, delay: 1.2 + (index * 0.1) }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card 
                  className={`cursor-pointer transition-all duration-300 card-float ${
                    selectedCrypto === crypto.symbol
                      ? 'bg-crypto-card/95 border-2 border-green-500/50 shadow-xl shadow-green-500/20'
                      : 'bg-crypto-card/90 border border-gray-700/50 hover:border-gray-600/50'
                  }`}
                  onClick={() => setSelectedCrypto(crypto.symbol)}
                  data-testid={`crypto-${crypto.symbol.toLowerCase()}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <motion.div 
                        className="w-12 h-12 rounded-full bg-white p-1 flex items-center justify-center"
                        animate={selectedCrypto === crypto.symbol ? {
                          boxShadow: [
                            "0 0 20px rgba(34, 197, 94, 0.3)",
                            "0 0 30px rgba(34, 197, 94, 0.5)",
                            "0 0 20px rgba(34, 197, 94, 0.3)"
                          ]
                        } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <img 
                          src={crypto.logoUrl}
                          alt={`${crypto.name} logo`}
                          className="w-10 h-10 rounded-full"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "https://assets.coincap.io/assets/icons/btc@2x.png";
                          }}
                        />
                      </motion.div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{crypto.name}</h3>
                        <p className="text-sm text-gray-400">{crypto.network}</p>
                        <p className="text-xs text-crypto-green">Min: {crypto.minDeposit}</p>
                      </div>
                      {selectedCrypto === crypto.symbol && (
                        <motion.div 
                          className="text-green-500 text-2xl"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          ✓
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Deposit Address */}
        {selectedCrypto && (
          <motion.div 
            className="mb-8 relative z-10"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Card className="bg-crypto-card/95 backdrop-blur-xl border border-green-500/20 shadow-2xl card-float">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <motion.div 
                    className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white p-3 flex items-center justify-center"
                    animate={{ 
                      boxShadow: [
                        "0 0 20px rgba(34, 197, 94, 0.3)",
                        "0 0 30px rgba(34, 197, 94, 0.5)",
                        "0 0 20px rgba(34, 197, 94, 0.3)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <img 
                      src={cryptoOptions.find(c => c.symbol === selectedCrypto)?.logoUrl}
                      alt={`${selectedCrypto} logo`}
                      className="w-full h-full object-contain rounded-xl"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://assets.coincap.io/assets/icons/btc@2x.png";
                      }}
                    />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Send {selectedCrypto} to this address
                  </h3>
                  <p className="text-gray-400">
                    Scan the QR code or copy the address below
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* QR Code Section */}
                  <div className="bg-crypto-dark/50 rounded-xl p-6">
                    <p className="text-gray-400 text-sm mb-4">QR Code</p>
                    <div className="flex justify-center">
                      {getQrCode(selectedCrypto) ? (
                        <div className="bg-white p-4 rounded-xl">
                          <img 
                            src={getQrCode(selectedCrypto)!} 
                            alt={`${selectedCrypto} QR Code`} 
                            className="w-48 h-48 object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-48 h-48 bg-gray-700/50 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-600">
                          <div className="text-center text-gray-400">
                            <div className="text-4xl mb-2">📱</div>
                            <p className="text-sm">QR Code</p>
                            <p className="text-xs">Not Available</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Address Section */}
                  <div className="bg-crypto-dark/50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-gray-400 text-sm">Deposit Address</p>
                      <Button
                        onClick={() => handleCopyAddress(getDepositAddress(selectedCrypto))}
                        size="sm"
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 transition-all duration-300"
                        data-testid="button-copy-address"
                      >
                        📋 Copy
                      </Button>
                    </div>
                    <div className="bg-crypto-dark/30 rounded-lg p-4">
                      {getDepositAddress(selectedCrypto) ? (
                        <p className="text-white font-mono text-sm break-all">
                          {getDepositAddress(selectedCrypto)}
                        </p>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-gray-400 text-sm mb-2">⚠️ Wallet address not configured</p>
                          <p className="text-gray-500 text-xs">Please contact support or try again later</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-crypto-dark/30 rounded-xl p-4 text-center">
                    <p className="text-gray-400">Network</p>
                    <p className="text-white font-semibold">
                      {cryptoOptions.find(c => c.symbol === selectedCrypto)?.network}
                    </p>
                  </div>
                  <div className="bg-crypto-dark/30 rounded-xl p-4 text-center">
                    <p className="text-gray-400">Confirmations</p>
                    <p className="text-white font-semibold">
                      {cryptoOptions.find(c => c.symbol === selectedCrypto)?.confirmations}
                    </p>
                  </div>
                </div>

                <motion.div 
                  className="mt-6 p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-yellow-500 text-lg">⚠️</span>
                    <div className="text-sm text-gray-300">
                      <p className="font-semibold mb-1">Important Notice:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• Only send {selectedCrypto} to this address</li>
                        <li>• Deposits will be credited after network confirmation</li>
                        <li>• Minimum deposit: {cryptoOptions.find(c => c.symbol === selectedCrypto)?.minDeposit}</li>
                        <li>• Any amount sent will be automatically converted to USD</li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Recent Deposits */}
        <motion.div 
          className="relative z-10"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 50 }}
          transition={{ duration: 0.8, delay: 1.4 }}
        >
          <motion.h2 
            className="text-2xl font-semibold text-white mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -20 }}
            transition={{ duration: 0.6, delay: 1.6 }}
          >
            📋 Recent Deposits
          </motion.h2>
          
          <Card className="bg-crypto-card/90 backdrop-blur-xl border border-gray-700/50 shadow-2xl card-float">
            <CardContent className="p-6">
              {deposits && deposits.length > 0 ? (
                <div className="space-y-4">
                  {deposits.slice(0, 5).map((deposit: any, index: number) => (
                    <motion.div
                      key={deposit.id}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -30 }}
                      transition={{ duration: 0.6, delay: 1.8 + (index * 0.1) }}
                      className="flex items-center justify-between p-4 rounded-xl bg-crypto-dark/30 hover:bg-crypto-dark/50 transition-all duration-300"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-sm">
                          💰
                        </div>
                        <div>
                          <p className="text-white font-semibold">
                            {deposit.amount} {deposit.cryptocurrency}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {new Date(deposit.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(deposit.status)}
                        <p className="text-gray-400 text-xs mt-1">
                          ID: {deposit.id.slice(-8)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div 
                  className="text-center py-12"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.9 }}
                  transition={{ duration: 0.6, delay: 1.8 }}
                >
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-gray-600/20 to-gray-500/20 flex items-center justify-center text-4xl">
                    📥
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">No deposits yet</h3>
                  <p className="text-gray-400 mb-6">
                    Make your first deposit to start earning with AI trading
                  </p>
                  <Button
                    onClick={() => setSelectedCrypto(cryptoOptions[0].symbol)}
                    className="crypto-gradient hover:opacity-90 transition-all duration-300 button-hover-lift"
                    data-testid="button-make-first-deposit"
                  >
                    🚀 Make First Deposit
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </MainLayout>
  );
}