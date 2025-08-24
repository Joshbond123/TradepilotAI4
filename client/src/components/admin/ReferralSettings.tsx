import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { fetchWithAuth } from "@/lib/crypto-api";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Users,
  Percent,
  Save,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Eye,
  Target
} from "lucide-react";

interface ReferralSettings {
  referralBonusPercent: number;
  minReferralPayout: number;
  maxReferralPayout: number;
  referralLevels: {
    level1: number;
    level2: number;
    level3: number;
  };
}

interface ReferralStats {
  totalReferrals: number;
  totalCommissionsPaid: number;
  activeReferrers: number;
  averageCommissionPerReferral: number;
  topReferrers: Array<{
    id: string;
    username: string;
    referralCount: number;
    totalEarnings: number;
  }>;
}

export default function ReferralSettings() {
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<ReferralSettings>({
    referralBonusPercent: 10,
    minReferralPayout: 1,
    maxReferralPayout: 1000,
    referralLevels: {
      level1: 10,
      level2: 5,
      level3: 2,
    },
  });

  // Local input state for free typing
  const [localReferralInput, setLocalReferralInput] = useState("10");

  // Fetch current referral settings
  const { data: currentSettings, isLoading } = useQuery({
    queryKey: ["/api/admin/settings"],
    queryFn: () => fetchWithAuth("/admin/settings"),
  });

  // Fetch referral statistics
  const { data: referralStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/referral-stats"],
    queryFn: () => fetchWithAuth("/admin/referrals"),
  });

  // Update settings when data is fetched
  useEffect(() => {
    if (currentSettings?.system) {
      const referralPercent = currentSettings.system.referral_bonus_percentage || 10;
      setSettings(prev => ({
        ...prev,
        referralBonusPercent: referralPercent,
      }));
      setLocalReferralInput(referralPercent.toString());
    }
  }, [currentSettings]);

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (updatedSettings: any) =>
      apiRequest("PATCH", "/api/admin/settings", {
        system: {
          referral_bonus_percentage: updatedSettings.referralBonusPercent,
        }
      }).then(res => res.json()),
    onSuccess: () => {
      toast({
        title: "Referral Settings Updated",
        description: "Changes will be applied to all future referral earnings",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/referrals"] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update referral settings",
        variant: "destructive",
      });
    },
  });

  const handleUpdateReferralSettings = () => {
    const value = parseFloat(localReferralInput);
    if (isNaN(value) || value < 0 || value > 50) {
      toast({
        title: "Invalid Percentage",
        description: "Referral commission must be between 0% and 50%",
        variant: "destructive",
      });
      return;
    }
    updateSettingsMutation.mutate({
      ...settings,
      referralBonusPercent: value
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const stats = referralStats ? {
    totalReferrals: referralStats.length || 0,
    totalCommissionsPaid: referralStats.reduce((sum: number, ref: any) => sum + (ref.balance * 0.1), 0),
    activeReferrers: new Set(referralStats.map((ref: any) => ref.referredBy)).size,
    averageCommissionPerReferral: referralStats.length > 0 ? 
      (referralStats.reduce((sum: number, ref: any) => sum + (ref.balance * 0.1), 0) / referralStats.length) : 0,
  } : {
    totalReferrals: 0,
    totalCommissionsPaid: 0,
    activeReferrers: 0,
    averageCommissionPerReferral: 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Referral Commission Settings</h2>
        <p className="text-gray-400">Configure global referral commission rates and limits</p>
      </div>

      {/* Current Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Referrals</p>
                <p className="text-2xl font-bold text-white">{stats.totalReferrals}</p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Referrers</p>
                <p className="text-2xl font-bold text-white">{stats.activeReferrers}</p>
              </div>
              <Target className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Commissions Paid</p>
                <p className="text-2xl font-bold text-white">${stats.totalCommissionsPaid.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg per Referral</p>
                <p className="text-2xl font-bold text-white">${stats.averageCommissionPerReferral.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Global Referral Commission */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Percent className="h-5 w-5 mr-2" />
            Global Referral Commission
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Percent className="h-4 w-4 text-blue-400" />
              <span className="text-blue-400 font-semibold">Current Commission Rate</span>
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {settings.referralBonusPercent}%
            </div>
            <p className="text-sm text-gray-400">
              This percentage is applied to all deposits and investments made by referred users
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-gray-300">Referral Commission (%)</Label>
                <div className="flex items-center space-x-2 mt-2">
                  <Input
                    data-testid="input-referral-commission"
                    type="text"
                    value={localReferralInput}
                    onChange={(e) => setLocalReferralInput(e.target.value)}
                    onBlur={(e) => {
                      const value = e.target.value.trim();
                      if (value === '' || isNaN(Number(value)) || Number(value) < 0 || Number(value) > 50) {
                        setLocalReferralInput(settings.referralBonusPercent.toString());
                        if (value !== '' && (isNaN(Number(value)) || Number(value) < 0 || Number(value) > 50)) {
                          toast({
                            title: "Invalid Value",
                            description: "Referral commission must be between 0% and 50%",
                            variant: "destructive",
                          });
                        }
                      } else {
                        setSettings({
                          ...settings,
                          referralBonusPercent: parseFloat(value)
                        });
                      }
                    }}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="0-50"
                  />
                  <Button
                    data-testid="button-update-referral"
                    onClick={handleUpdateReferralSettings}
                    disabled={updateSettingsMutation.isPending}
                    className="bg-green-600 hover:bg-green-700 min-w-[100px]"
                  >
                    {updateSettingsMutation.isPending ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-1" />
                        Update
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Recommended: 5% - 15%. Higher rates may impact platform profitability.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-900 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-3">Impact Preview</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">On $100 deposit:</span>
                    <span className="text-green-400">${(100 * settings.referralBonusPercent / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">On $500 investment:</span>
                    <span className="text-green-400">${(500 * settings.referralBonusPercent / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">On $1000 investment:</span>
                    <span className="text-green-400">${(1000 * settings.referralBonusPercent / 100).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <RefreshCw className="h-4 w-4 text-yellow-400" />
              <span className="text-yellow-400 font-semibold">Live Updates</span>
            </div>
            <p className="text-sm text-gray-300">
              Changes to referral commission rates will be applied immediately across the platform:
            </p>
            <ul className="text-xs text-gray-400 mt-2 space-y-1 list-disc list-inside">
              <li>User referral pages will show new rates</li>
              <li>Future referral earnings will use new percentage</li>
              <li>Admin reports will reflect updated commission structure</li>
              <li>Existing referral links remain valid</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Recent Referrals */}
      {referralStats && referralStats.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Recent Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {referralStats.slice(0, 5).map((referral: any, index: number) => (
                <div key={referral.id || index} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                      {referral.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-white font-medium">{referral.username}</div>
                      <div className="text-gray-400 text-sm">{referral.email}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">${referral.balance.toFixed(2)}</div>
                    <div className="text-green-400 text-sm">
                      +${(referral.balance * settings.referralBonusPercent / 100).toFixed(2)} earned
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}