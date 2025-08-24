import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface PlanCardProps {
  id: string;
  name: string;
  description: string;
  dailyReturn: string;
  duration: number;
  minInvestment: string;
  maxInvestment: string;
  totalReturn: string;
  icon: LucideIcon;
  isPopular?: boolean;
  isPremium?: boolean;
  onInvest: (planId: string) => void;
}

export default function PlanCard({
  id,
  name,
  description,
  dailyReturn,
  duration,
  minInvestment,
  maxInvestment,
  totalReturn,
  icon: Icon,
  isPopular = false,
  isPremium = false,
  onInvest,
}: PlanCardProps) {
  const getBorderColor = () => {
    if (isPremium) return "border-yellow-500";
    if (isPopular) return "border-crypto-green";
    return "border-gray-700";
  };

  const getIconBgColor = () => {
    if (isPremium) return "bg-yellow-500 bg-opacity-20 text-yellow-500";
    if (isPopular) return "bg-crypto-green bg-opacity-20 text-crypto-green";
    return "bg-crypto-blue bg-opacity-20 text-crypto-blue";
  };

  const getButtonStyle = () => {
    if (isPremium) return "bg-yellow-500 text-black hover:opacity-90";
    if (isPopular) return "crypto-gradient";
    return "bg-crypto-blue hover:opacity-90";
  };

  return (
    <Card className={`bg-crypto-card ${getBorderColor()} relative overflow-hidden`} data-testid="plan-card">
      {isPopular && (
        <div className="absolute top-0 right-0 bg-crypto-green text-white text-xs px-3 py-1" data-testid="popular-badge">
          Popular
        </div>
      )}
      
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${getIconBgColor()}`}>
            <Icon className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold mb-2" data-testid="plan-name">{name}</h3>
          <p className="text-gray-400" data-testid="plan-description">{description}</p>
        </div>
        
        <div className="space-y-4 mb-6">
          <div className="flex justify-between">
            <span className="text-gray-400">Daily Return</span>
            <span className="text-crypto-green font-semibold" data-testid="daily-return">{dailyReturn}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Duration</span>
            <span data-testid="duration">{duration} days</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Minimum</span>
            <span data-testid="min-investment">${minInvestment}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Maximum</span>
            <span data-testid="max-investment">${maxInvestment}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Total Return</span>
            <span className="text-crypto-green font-semibold" data-testid="total-return">{totalReturn}%</span>
          </div>
        </div>
        
        <Button 
          className={`w-full transition-opacity ${getButtonStyle()}`}
          onClick={() => onInvest(id)}
          data-testid="button-invest"
        >
          Invest Now
        </Button>
      </CardContent>
    </Card>
  );
}
