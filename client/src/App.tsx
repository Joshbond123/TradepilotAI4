import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import ScrollToTop from "@/components/scroll-to-top";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import ArbitrageFeed from "@/pages/arbitrage-feed";
import InvestmentPlans from "@/pages/investment-plans";
import Deposit from "@/pages/deposit";
import Withdraw from "@/pages/withdraw";
import Messages from "@/pages/messages";
import Referrals from "@/pages/referrals";
import Settings from "@/pages/settings";
import Support from "@/pages/support";
import { ChatPage } from "@/pages/chat";
import { InboxPage } from "@/pages/inbox";
import { EditProfilePage } from "@/pages/edit-profile";
import { ChangePasswordPage } from "@/pages/change-password";
import { AIChatPage } from "@/pages/ai-chat";
import { ContactPage } from "@/pages/contact";
import Admin from "@/pages/admin-new-working";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import VerifyAccount from "@/pages/auth/verify-account";
import ForgotPassword from "@/pages/auth/forgot-password";
import ResetPassword from "@/pages/auth/reset-password";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/auth/login" component={Login} />
        <Route path="/auth/register" component={Register} />
        <Route path="/auth/verify" component={VerifyAccount} />
        <Route path="/auth/forgot-password" component={ForgotPassword} />
        <Route path="/auth/reset-password" component={ResetPassword} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/arbitrage" component={ArbitrageFeed} />
        <Route path="/plans" component={InvestmentPlans} />
        <Route path="/deposit" component={Deposit} />
        <Route path="/withdraw" component={Withdraw} />
        <Route path="/messages" component={Messages} />
        <Route path="/referrals" component={Referrals} />
        <Route path="/settings" component={Settings} />
        <Route path="/support" component={Support} />
        <Route path="/chat" component={ChatPage} />
        <Route path="/ai-chat" component={AIChatPage} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/inbox" component={InboxPage} />
        <Route path="/edit-profile" component={EditProfilePage} />
        <Route path="/change-password" component={ChangePasswordPage} />
        <Route path="/admin" component={Admin} />
        <Route path="/admin-new-working" component={Admin} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <div className="dark min-h-screen bg-crypto-dark">
            <Toaster />
            <Router />
          </div>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
