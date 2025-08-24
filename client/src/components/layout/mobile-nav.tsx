import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  PlusCircle,
  MinusCircle,
  Bot,
  Users,
} from "lucide-react";

const mobileNavItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/deposit", label: "Deposit", icon: PlusCircle },
  { path: "/withdraw", label: "Withdraw", icon: MinusCircle },
  { path: "/plans", label: "AI Plans", icon: Bot },
  { path: "/referrals", label: "Referrals", icon: Users },
];

export default function MobileNav() {
  const [location, setLocation] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-crypto-card border-t border-gray-700 px-6 py-2 z-50 md:hidden">
      <div className="flex items-center justify-around">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center py-2 relative ${
                isActive ? "text-crypto-blue" : "text-gray-400"
              }`}
              onClick={() => setLocation(item.path)}
              data-testid={`mobile-nav-${item.label.toLowerCase()}`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs">{item.label}</span>

            </Button>
          );
        })}
      </div>
    </nav>
  );
}
