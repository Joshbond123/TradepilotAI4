import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface BalanceCardProps {
  title: string;
  value: string;
  change?: string;
  icon: LucideIcon;
  iconColor?: string;
  changeColor?: string;
}

export default function BalanceCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor = "text-crypto-green",
  changeColor = "text-crypto-green",
}: BalanceCardProps) {
  return (
    <Card className="bg-crypto-card border-gray-700" data-testid="balance-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-400" data-testid="card-title">{title}</h3>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div className="text-2xl font-bold text-white mb-2" data-testid="card-value">{value}</div>
        {change && (
          <div className={`text-sm ${changeColor}`} data-testid="card-change">{change}</div>
        )}
      </CardContent>
    </Card>
  );
}
