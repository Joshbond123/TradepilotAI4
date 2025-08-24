import { useState } from "react";
import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import { Download, Smartphone, Share } from "lucide-react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PWAInstallButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
  showText?: boolean;
}

export default function PWAInstallButton({ 
  variant = "default", 
  size = "default",
  className = "",
  showText = true
}: PWAInstallButtonProps) {
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const { 
    isInstallable, 
    isInstalled, 
    isIOS, 
    isStandalone,
    install,
    isInstallSupported 
  } = usePWAInstall();

  // Don't show the button if already installed/running as PWA
  if (isInstalled || isStandalone) {
    return null;
  }

  const handleInstall = async () => {
    console.log('PWA Install clicked', { isIOS, isInstallable, isInstallSupported });
    if (isIOS) {
      setShowIOSInstructions(true);
    } else if (isInstallable) {
      await install();
    } else {
      // Fallback for browsers that don't support beforeinstallprompt
      setShowIOSInstructions(true); // Show instructions as fallback
    }
  };

  const buttonContent = (
    <>
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Download className="w-4 h-4" />
      </motion.div>
      {showText && <span className="ml-2">Download App</span>}
    </>
  );

  if (isIOS) {
    return (
      <Dialog open={showIOSInstructions} onOpenChange={setShowIOSInstructions}>
        <DialogTrigger asChild>
          <Button
            variant={variant}
            size={size}
            className={`${className} crypto-gradient hover:opacity-90 text-white border-0`}
            onClick={handleInstall}
          >
            {buttonContent}
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-crypto-card border-crypto-blue/20">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-crypto-blue" />
              Install TradePilot AI
            </DialogTitle>
            <DialogDescription className="text-gray-300 space-y-4">
              <p>To install TradePilot AI as an app:</p>
              {isIOS ? (
                <div className="space-y-3 text-left">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-crypto-blue flex items-center justify-center text-white text-sm font-bold">1</div>
                    <div>
                      <p className="font-medium text-white">Open Safari Menu</p>
                      <p className="text-sm">Tap the <Share className="w-4 h-4 inline" /> share button at the bottom of Safari</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-crypto-blue flex items-center justify-center text-white text-sm font-bold">2</div>
                    <div>
                      <p className="font-medium text-white">Add to Home Screen</p>
                      <p className="text-sm">Scroll down and tap "Add to Home Screen"</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-crypto-blue flex items-center justify-center text-white text-sm font-bold">3</div>
                    <div>
                      <p className="font-medium text-white">Confirm Installation</p>
                      <p className="text-sm">Tap "Add" to install TradePilot AI as an app</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-left">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-crypto-blue flex items-center justify-center text-white text-sm font-bold">1</div>
                    <div>
                      <p className="font-medium text-white">Look for Install Option</p>
                      <p className="text-sm">Check your browser's address bar or menu for an "Install" or "Add to Home Screen" option</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-crypto-blue flex items-center justify-center text-white text-sm font-bold">2</div>
                    <div>
                      <p className="font-medium text-white">Chrome/Edge Users</p>
                      <p className="text-sm">Look for a small install icon in the address bar, or go to browser menu → "Install TradePilot AI"</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-crypto-blue flex items-center justify-center text-white text-sm font-bold">3</div>
                    <div>
                      <p className="font-medium text-white">Alternative Method</p>
                      <p className="text-sm">You can also bookmark this page for quick access to TradePilot AI</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="p-3 bg-crypto-blue/10 rounded-lg border border-crypto-blue/20">
                <p className="text-sm text-crypto-blue">
                  💡 Once installed, you'll have quick access to your trading platform from your home screen!
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={`${className} crypto-gradient hover:opacity-90 text-white border-0`}
      onClick={handleInstall}
      disabled={false} // Always enable the button
    >
      {buttonContent}
    </Button>
  );
}