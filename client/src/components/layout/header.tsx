import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

// Add 3D pulse animation for the logo text
const logoStyles = `
  @keyframes pulse3d {
    0%, 100% { 
      transform: perspective(600px) rotateX(20deg) rotateY(-5deg) scale(1); 
      filter: drop-shadow(0 4px 8px rgba(0,255,255,0.3)) drop-shadow(0 8px 16px rgba(65,105,225,0.2));
    }
    50% { 
      transform: perspective(600px) rotateX(20deg) rotateY(-5deg) scale(1.05); 
      filter: drop-shadow(0 6px 12px rgba(0,255,255,0.5)) drop-shadow(0 12px 24px rgba(65,105,225,0.3));
    }
  }
`;

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuth();

  // Get unread inbox count for profile icon notification
  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ['/api/inbox/unread-count'],
    refetchInterval: 5000, // Check every 5 seconds for faster updates
    enabled: !!user,
  });

  const unreadCount = unreadData?.count || 0;

  return (
    <>
      <style>{logoStyles}</style>
      <header className="bg-crypto-card border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
        {/* Left side - 3D TradePilot Ai text */}
        <div className="flex items-center space-x-2">
          <span 
            className="text-xl font-bold relative select-none cursor-pointer text-white"
          >
            TradePilot AI
          </span>
        </div>

        {/* Right side - 3D Profile icon */}
        <div className="relative">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onMenuClick}
            className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-700 via-slate-600 to-slate-500 hover:from-slate-600 hover:via-slate-500 hover:to-slate-400 shadow-2xl border-2 border-slate-400/30 transform hover:scale-110 hover:-translate-y-1 transition-all duration-300 active:scale-95"
            style={{
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 8px rgba(0,0,0,0.3), 0 8px 16px rgba(0,0,0,0.15)'
            }}
            data-testid="button-profile-menu"
          >
            {/* 3D Profile Avatar */}
            <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-600 shadow-inner border border-gray-400/50">
              {/* Face */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white to-gray-200">
                {/* Head */}
                <div className="absolute top-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-full bg-gradient-to-br from-gray-100 to-gray-300 shadow-sm"></div>
                {/* Body */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-5 h-3 rounded-t-full bg-gradient-to-br from-gray-500 to-gray-700"></div>
                {/* Inner shadow for depth */}
                <div className="absolute inset-0 rounded-full shadow-inner bg-gradient-to-br from-transparent via-transparent to-black/10"></div>
              </div>
              {/* Outer ring highlight */}
              <div className="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-white/30 via-transparent to-transparent"></div>
            </div>
          </Button>
          
          {/* Red notification dot for profile icon */}
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg border-2 border-gray-800"
                data-testid="profile-notification-dot"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
    </>
  );
}
