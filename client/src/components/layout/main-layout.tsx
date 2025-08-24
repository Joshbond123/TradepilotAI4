import { useState } from "react";
import Header from "./header";
import Sidebar from "./sidebar";
import MobileNav from "./mobile-nav";
import { FloatingContactButton } from "@/components/floating-contact-button";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuClick = () => {
    setSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-crypto-dark overflow-x-hidden">
      <div className="flex min-w-0">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header onMenuClick={handleMenuClick} />
          <main className="flex-1 p-3 sm:p-6 overflow-y-auto overflow-x-hidden pb-24 md:pb-6 max-w-full">
            <div className="max-w-full overflow-x-hidden">
              {children}
            </div>
          </main>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <MobileNav />
      
      {/* Floating Contact Button */}
      <FloatingContactButton />
    </div>
  );
}