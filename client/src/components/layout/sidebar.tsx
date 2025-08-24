import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import {
  Inbox,
  Settings,
  User,
  LogOut,
} from "lucide-react";

const sidebarMenuItems = [
  { path: "/inbox", label: "Inbox", icon: Inbox },
  { path: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();

  // Get unread inbox count
  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ['/api/inbox/unread-count'],
    refetchInterval: 30000,
    enabled: !!user,
  });

  const unreadCount = unreadData?.count || 0;

  const handleNavigation = (path: string) => {
    setLocation(path);
    onClose();
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={cn(
        "fixed top-0 left-0 h-full w-80 bg-slate-900 border-r border-slate-700 z-50 transform transition-transform duration-300 ease-in-out",
        "lg:relative lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Profile Section */}
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center gap-3 p-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="text-white font-medium" data-testid="text-username">
                  {user?.username}
                </div>
                <div className="text-sm text-gray-400" data-testid="text-balance">
                  ${user?.balance.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Menu Items */}
          <div className="p-4 space-y-2">
            {sidebarMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              
              return (
                <Button
                  key={item.path}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-gray-300 hover:text-white hover:bg-slate-800",
                    isActive && "bg-slate-800 text-white"
                  )}
                  onClick={() => handleNavigation(item.path)}
                  data-testid={`sidebar-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                  {item.path === "/inbox" && unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-auto h-5 text-xs" data-testid="badge-sidebar-inbox-count">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>

          {/* Spacer */}
          <div className="flex-1"></div>
          
          {/* Logout at bottom */}
          <div className="p-4 border-t border-slate-700">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Logout
            </Button>
          </div>

          {/* Footer */}
          <div className="p-4">
            <div className="text-center text-xs text-gray-500">
              TradePilot v2.0
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
