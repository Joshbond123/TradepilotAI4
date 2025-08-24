import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import MainLayout from "@/components/layout/main-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { fetchWithAuth } from "@/lib/crypto-api";
import { 
  Users, 
  DollarSign, 
  Copy, 
  Share2, 
  TrendingUp,
  UserPlus 
} from "lucide-react";

export default function Referrals() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: referralData, isLoading: referralLoading } = useQuery({
    queryKey: ["/api/referrals"],
    queryFn: () => fetchWithAuth("/referrals"),
  });

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  const handleCopyReferralCode = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      toast({
        title: "Referral Code Copied",
        description: "Your referral code has been copied to clipboard",
      });
    }
  };

  const handleCopyReferralLink = () => {
    const referralLink = `${window.location.origin}/register?ref=${user?.referralCode}`;
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Referral Link Copied",
      description: "Your referral link has been copied to clipboard",
    });
  };

  const handleShareReferral = () => {
    const referralLink = `${window.location.origin}/register?ref=${user?.referralCode}`;
    const text = `Join TradePilot and start earning with AI-powered crypto arbitrage trading! Use my referral code: ${user?.referralCode}`;
    
    if (navigator.share) {
      navigator.share({
        title: "Join TradePilot",
        text: text,
        url: referralLink,
      });
    } else {
      navigator.clipboard.writeText(`${text}\n${referralLink}`);
      toast({
        title: "Referral Info Copied",
        description: "Referral text and link copied to clipboard",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-crypto-dark flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const totalEarnings = referralData?.totalEarnings || 0;
  const totalReferrals = referralData?.totalReferrals || 0;
  const referredUsers = referralData?.referredUsers || [];
  const earnings = referralData?.earnings || [];

  return (
    <MainLayout>
      <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" data-testid="page-title">
              Referral Program
            </h1>
            <p className="text-gray-400">
              Earn rewards by inviting friends to TradePilot
            </p>
          </div>

          <div className="max-w-6xl space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-crypto-card border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-400">Total Referrals</h3>
                    <Users className="w-5 h-5 text-crypto-blue" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-2" data-testid="total-referrals">
                    {totalReferrals}
                  </div>
                  <div className="text-sm text-gray-400">Active users referred</div>
                </CardContent>
              </Card>

              <Card className="bg-crypto-card border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-400">Total Earnings</h3>
                    <DollarSign className="w-5 h-5 text-crypto-green" />
                  </div>
                  <div className="text-2xl font-bold text-crypto-green mb-2" data-testid="total-earnings">
                    ${totalEarnings.toLocaleString()}
                  </div>
                  <div className="text-sm text-crypto-green">All-time earnings</div>
                </CardContent>
              </Card>

              <Card className="bg-crypto-card border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-400">Commission Rate</h3>
                    <TrendingUp className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-2">10%</div>
                  <div className="text-sm text-gray-400">On referred user deposits</div>
                </CardContent>
              </Card>

              <Card className="bg-crypto-card border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-400">This Month</h3>
                    <UserPlus className="w-5 h-5 text-purple-500" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-2">
                    {referredUsers.filter((user: any) => {
                      const userDate = new Date(user.createdAt);
                      const now = new Date();
                      return userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear();
                    }).length}
                  </div>
                  <div className="text-sm text-gray-400">New referrals</div>
                </CardContent>
              </Card>
            </div>

            {/* Referral Tools */}
            <Card className="bg-crypto-card border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-6">Your Referral Tools</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Referral Code */}
                  <div>
                    <div className="text-sm text-gray-400 mb-2">Your Referral Code</div>
                    <div className="bg-crypto-dark rounded-lg p-4 mb-4">
                      <div className="text-2xl font-bold text-crypto-blue mb-2" data-testid="referral-code">
                        {user.referralCode}
                      </div>
                      <div className="text-sm text-gray-400">
                        Share this code with friends to earn commissions
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-crypto-blue text-crypto-blue hover:bg-crypto-blue hover:text-white"
                        onClick={handleCopyReferralCode}
                        data-testid="button-copy-code"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Code
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 crypto-gradient"
                        onClick={handleShareReferral}
                        data-testid="button-share"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>

                  {/* Referral Link */}
                  <div>
                    <div className="text-sm text-gray-400 mb-2">Your Referral Link</div>
                    <div className="bg-crypto-dark rounded-lg p-4 mb-4">
                      <div className="text-sm text-white break-all mb-2" data-testid="referral-link">
                        {window.location.origin}/register?ref={user.referralCode}
                      </div>
                      <div className="text-sm text-gray-400">
                        Direct link for easy sharing
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full border-crypto-green text-crypto-green hover:bg-crypto-green hover:text-white"
                      onClick={handleCopyReferralLink}
                      data-testid="button-copy-link"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Link
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Referred Users */}
              <Card className="bg-crypto-card border-gray-700">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Referred Users</h3>
                  {referredUsers.length > 0 ? (
                    <div className="space-y-3">
                      {referredUsers.slice(0, 10).map((referredUser: any) => (
                        <div key={referredUser.id} className="flex items-center justify-between p-3 bg-crypto-dark rounded-lg" data-testid={`referred-user-${referredUser.id}`}>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-crypto-blue flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {referredUser.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-semibold text-white" data-testid="referred-username">
                                {referredUser.username}
                              </div>
                              <div className="text-sm text-gray-400" data-testid="referred-date">
                                Joined {new Date(referredUser.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <Badge className="bg-crypto-green text-white" data-testid="active-badge">
                            Active
                          </Badge>
                        </div>
                      ))}
                      {referredUsers.length > 10 && (
                        <div className="text-center text-sm text-gray-400 pt-2">
                          And {referredUsers.length - 10} more users
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 py-8">
                      <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <div className="text-sm">No referrals yet</div>
                      <div className="text-xs">Start sharing your referral code to earn commissions</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Earnings History */}
              <Card className="bg-crypto-card border-gray-700">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Earnings History</h3>
                  {earnings.length > 0 ? (
                    <div className="space-y-3">
                      {earnings.slice(0, 10).map((earning: any) => (
                        <div key={earning.id} className="flex items-center justify-between p-3 bg-crypto-dark rounded-lg" data-testid={`earning-${earning.id}`}>
                          <div>
                            <div className="font-semibold text-crypto-green" data-testid="earning-amount">
                              +${parseFloat(earning.amount).toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-400" data-testid="earning-type">
                              {earning.type === 'deposit' ? 'Deposit commission' : 'Investment commission'}
                            </div>
                          </div>
                          <div className="text-sm text-gray-400" data-testid="earning-date">
                            {new Date(earning.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                      {earnings.length > 10 && (
                        <div className="text-center text-sm text-gray-400 pt-2">
                          And {earnings.length - 10} more earnings
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 py-8">
                      <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <div className="text-sm">No earnings yet</div>
                      <div className="text-xs">Earnings will appear when your referrals make deposits or investments</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* How It Works */}
            <Card className="bg-crypto-card border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">How the Referral Program Works</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-crypto-blue bg-opacity-20 flex items-center justify-center mx-auto mb-3">
                      <Share2 className="w-6 h-6 text-crypto-blue" />
                    </div>
                    <h4 className="font-semibold mb-2">1. Share Your Code</h4>
                    <p className="text-sm text-gray-400">
                      Share your unique referral code or link with friends and family
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-crypto-green bg-opacity-20 flex items-center justify-center mx-auto mb-3">
                      <UserPlus className="w-6 h-6 text-crypto-green" />
                    </div>
                    <h4 className="font-semibold mb-2">2. They Join & Invest</h4>
                    <p className="text-sm text-gray-400">
                      When they sign up and start investing, you earn commission
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-yellow-500 bg-opacity-20 flex items-center justify-center mx-auto mb-3">
                      <DollarSign className="w-6 h-6 text-yellow-500" />
                    </div>
                    <h4 className="font-semibold mb-2">3. Earn Rewards</h4>
                    <p className="text-sm text-gray-400">
                      Receive 10% commission on their deposits and investments
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
      </div>
    </MainLayout>
  );
}
