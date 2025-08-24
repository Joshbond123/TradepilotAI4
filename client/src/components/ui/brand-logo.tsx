import React from "react";
import { useQuery } from "@tanstack/react-query";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
  textClassName?: string;
  onClick?: () => void;
}

interface LogoSettings {
  logoUrl?: string;
  logoName?: string;
  uploadedAt?: string;
}

export default function BrandLogo({ 
  size = "md", 
  className = "", 
  showText = true,
  textClassName = "",
  onClick 
}: BrandLogoProps) {
  // Fetch logo settings from public API
  const { data: logoSettings } = useQuery<LogoSettings>({
    queryKey: ['/api/logo'],
    retry: 1,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16"
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl"
  };

  return (
    <div 
      className={`flex items-center space-x-3 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {/* Logo */}
      <div className={`${sizeClasses[size]} rounded-xl flex items-center justify-center overflow-hidden ${!logoSettings?.logoUrl ? 'crypto-gradient shadow-lg glow-pulse' : 'bg-white shadow-lg border border-gray-200'}`}>
        {logoSettings?.logoUrl ? (
          <img 
            src={logoSettings.logoUrl} 
            alt="TradePilot Logo" 
            className="w-full h-full object-contain"
            onError={(e) => {
              // Fallback to default logo if custom logo fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.className = `${sizeClasses[size]} rounded-xl crypto-gradient flex items-center justify-center shadow-lg glow-pulse`;
                parent.innerHTML = `<span class="${textSizeClasses[size]} font-bold text-white">T</span>`;
              }
            }}
          />
        ) : (
          <span className={`${textSizeClasses[size]} font-bold text-white`}>T</span>
        )}
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={`${textSizeClasses[size]} font-bold text-white ${textClassName}`}>
            TradePilot AI
          </span>
          <span className="text-xs text-crypto-blue font-medium">
            AI Arbitrage Trading
          </span>
        </div>
      )}
    </div>
  );
}