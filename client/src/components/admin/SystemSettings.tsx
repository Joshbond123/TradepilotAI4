import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { fetchWithAuth } from "@/lib/crypto-api";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Settings,
  DollarSign,
  Users,
  Percent,
  Clock,
  Save,
  RefreshCw,
  Bot,
  Mail
} from "lucide-react";

interface SystemSettings {
  system: {
    maintenance_mode: boolean;
    global_profit_multiplier: number;
    referral_bonus_percentage: number;
    arbitrage_refresh_rate: number;
  };
  withdrawal_limits: {
    min_withdrawal: number;
    max_daily_withdrawal: number;
    processing_time_hours: number;
  };
  recaptcha?: {
    enabled: boolean;
    site_key: string;
    secret_key: string;
  };
  ai_chat?: {
    enabled: boolean;
    personality: string;
    api_keys: {
      reply_keys: any[];
      summary_keys: any[];
      current_reply_index: number;
      current_summary_index: number;
    };
  };
  welcome_message?: {
    title: string;
    content: string;
  };
}

export default function SystemSettings() {
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<SystemSettings>({
    system: {
      maintenance_mode: false,
      global_profit_multiplier: 1.0,
      referral_bonus_percentage: 10,
      arbitrage_refresh_rate: 30,
    },
    withdrawal_limits: {
      min_withdrawal: 10,
      max_daily_withdrawal: 10000,
      processing_time_hours: 24,
    },
  });

  // Local input states to allow free typing
  const [localInputs, setLocalInputs] = useState({
    referralCommission: "10",
    minWithdrawal: "10",
    maxWithdrawal: "10000",
    processingTime: "24",
    profitMultiplier: "1.0",
    refreshRate: "30",
    aiPersonality: "You are a helpful TradePilot AI assistant specializing in cryptocurrency trading and arbitrage opportunities.",
    welcomeTitle: "🎉 Welcome to TradePilot!",
    welcomeContent: `Welcome to TradePilot! We're excited to have you join our community of successful crypto investors.

Here's what you can expect:
• Daily profits from automated arbitrage trading
• Real-time market opportunities
• 24/7 professional support
• Active investor community

Your journey to financial freedom starts now. Join our chatroom to connect with other investors and share your success!

Best regards,
The TradePilot Team 🚀`
  });

  // Fetch current settings
  const { data: currentSettings, isLoading } = useQuery({
    queryKey: ["/api/admin/settings"],
    queryFn: () => fetchWithAuth("/admin/settings"),
  });

  // Update settings when data is fetched
  useEffect(() => {
    if (currentSettings) {
      setSettings(currentSettings);
      setLocalInputs({
        referralCommission: currentSettings.system?.referral_bonus_percentage?.toString() || "10",
        minWithdrawal: currentSettings.withdrawal_limits?.min_withdrawal?.toString() || "10",
        maxWithdrawal: currentSettings.withdrawal_limits?.max_daily_withdrawal?.toString() || "10000",
        processingTime: currentSettings.withdrawal_limits?.processing_time_hours?.toString() || "24",
        profitMultiplier: currentSettings.system?.global_profit_multiplier?.toString() || "1.0",
        refreshRate: currentSettings.system?.arbitrage_refresh_rate?.toString() || "30",
        aiPersonality: currentSettings.ai_chat?.personality || "You are a helpful TradePilot AI assistant specializing in cryptocurrency trading and arbitrage opportunities.",
        welcomeTitle: currentSettings.welcome_message?.title || "🎉 Welcome to TradePilot!",
        welcomeContent: currentSettings.welcome_message?.content || `Welcome to TradePilot! We're excited to have you join our community of successful crypto investors.

Here's what you can expect:
• Daily profits from automated arbitrage trading
• Real-time market opportunities
• 24/7 professional support
• Active investor community

Your journey to financial freedom starts now. Join our chatroom to connect with other investors and share your success!

Best regards,
The TradePilot Team 🚀`
      });
    }
  }, [currentSettings]);

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (updatedSettings: Partial<SystemSettings>) =>
      apiRequest("PATCH", "/api/admin/settings", updatedSettings).then(res => res.json()),
    onSuccess: (data) => {
      toast({
        title: "Settings Updated",
        description: "System settings have been updated successfully",
      });
      // Update local state with the returned data
      setSettings(data);
      setLocalInputs({
        referralCommission: data.system?.referral_bonus_percentage?.toString() || "10",
        minWithdrawal: data.withdrawal_limits?.min_withdrawal?.toString() || "10",
        maxWithdrawal: data.withdrawal_limits?.max_daily_withdrawal?.toString() || "10000",
        processingTime: data.withdrawal_limits?.processing_time_hours?.toString() || "24",
        profitMultiplier: data.system?.global_profit_multiplier?.toString() || "1.0",
        refreshRate: data.system?.arbitrage_refresh_rate?.toString() || "30",
        aiPersonality: data.ai_chat?.personality || "You are a helpful TradePilot AI assistant specializing in cryptocurrency trading and arbitrage opportunities.",
        welcomeTitle: data.welcome_message?.title || "🎉 Welcome to TradePilot!",
        welcomeContent: data.welcome_message?.content || `Welcome to TradePilot! We're excited to have you join our community of successful crypto investors.

Here's what you can expect:
• Daily profits from automated arbitrage trading
• Real-time market opportunities
• 24/7 professional support
• Active investor community

Your journey to financial freedom starts now. Join our chatroom to connect with other investors and share your success!

Best regards,
The TradePilot Team 🚀`
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update system settings",
        variant: "destructive",
      });
    },
  });

  const handleUpdateReferralCommission = () => {
    updateSettingsMutation.mutate({
      system: {
        ...settings.system,
        referral_bonus_percentage: settings.system.referral_bonus_percentage,
      },
    });
  };

  const handleUpdateMinWithdrawal = () => {
    updateSettingsMutation.mutate({
      withdrawal_limits: {
        ...settings.withdrawal_limits,
        min_withdrawal: settings.withdrawal_limits.min_withdrawal,
      },
    });
  };

  const handleUpdateAllSettings = () => {
    // Update the main settings state with current local inputs first
    const finalSettings = {
      ...settings,
      system: {
        ...settings.system,
        referral_bonus_percentage: parseFloat(localInputs.referralCommission) || 10,
        global_profit_multiplier: parseFloat(localInputs.profitMultiplier) || 1.0,
        arbitrage_refresh_rate: parseFloat(localInputs.refreshRate) || 30,
      },
      withdrawal_limits: {
        ...settings.withdrawal_limits,
        min_withdrawal: parseFloat(localInputs.minWithdrawal) || 10,
        max_daily_withdrawal: parseFloat(localInputs.maxWithdrawal) || 10000,
        processing_time_hours: parseFloat(localInputs.processingTime) || 24,
      },
      ai_chat: {
        ...settings.ai_chat,
        enabled: true,
        personality: localInputs.aiPersonality.trim() || "You are a helpful TradePilot AI assistant specializing in cryptocurrency trading and arbitrage opportunities.",
        api_keys: settings.ai_chat?.api_keys || {
          reply_keys: [],
          summary_keys: [],
          current_reply_index: 0,
          current_summary_index: 0,
        }
      },
      welcome_message: {
        title: localInputs.welcomeTitle.trim() || "🎉 Welcome to TradePilot!",
        content: localInputs.welcomeContent.trim() || `Welcome to TradePilot! We're excited to have you join our community of successful crypto investors.

Here's what you can expect:
• Daily profits from automated arbitrage trading
• Real-time market opportunities
• 24/7 professional support
• Active investor community

Your journey to financial freedom starts now. Join our chatroom to connect with other investors and share your success!

Best regards,
The TradePilot Team 🚀`
      }
    };
    
    // Update the local settings state as well
    setSettings(finalSettings);
    
    // Send the mutation
    updateSettingsMutation.mutate(finalSettings);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">System Settings</h2>
        <p className="text-gray-400">Configure system-wide settings and limits</p>
      </div>

      {/* Referral Commission Settings */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Referral Commission Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Referral Commission (%)</Label>
              <div className="flex items-center space-x-2">
                <Input
                  data-testid="input-referral-commission"
                  type="text"
                  value={localInputs.referralCommission}
                  onChange={(e) => {
                    setLocalInputs({
                      ...localInputs,
                      referralCommission: e.target.value
                    });
                  }}
                  onBlur={(e) => {
                    const value = e.target.value.trim();
                    if (value === '' || isNaN(Number(value)) || Number(value) < 0 || Number(value) > 100) {
                      setLocalInputs({
                        ...localInputs,
                        referralCommission: settings.system.referral_bonus_percentage.toString()
                      });
                      if (value !== '' && (isNaN(Number(value)) || Number(value) < 0 || Number(value) > 100)) {
                        toast({
                          title: "Invalid Value",
                          description: "Referral commission must be between 0 and 100",
                          variant: "destructive",
                        });
                      }
                    } else {
                      setSettings({
                        ...settings,
                        system: {
                          ...settings.system,
                          referral_bonus_percentage: parseFloat(value)
                        }
                      });
                    }
                  }}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="0-100"
                />
                <Button
                  data-testid="button-update-referral"
                  onClick={handleUpdateReferralCommission}
                  disabled={updateSettingsMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Percent className="h-4 w-4 mr-1" />
                  Update
                </Button>
              </div>
              <p className="text-xs text-gray-400">
                Percentage of deposit/investment earned by referrer
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Withdrawal Limits */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Withdrawal Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Minimum Withdrawal ($)</Label>
              <div className="flex items-center space-x-2">
                <Input
                  data-testid="input-min-withdrawal"
                  type="text"
                  value={localInputs.minWithdrawal}
                  onChange={(e) => {
                    setLocalInputs({
                      ...localInputs,
                      minWithdrawal: e.target.value
                    });
                  }}
                  onBlur={(e) => {
                    const value = e.target.value.trim();
                    if (value === '' || isNaN(Number(value)) || Number(value) < 1) {
                      setLocalInputs({
                        ...localInputs,
                        minWithdrawal: settings.withdrawal_limits.min_withdrawal.toString()
                      });
                      if (value !== '' && (isNaN(Number(value)) || Number(value) < 1)) {
                        toast({
                          title: "Invalid Value",
                          description: "Minimum withdrawal must be at least $1",
                          variant: "destructive",
                        });
                      }
                    } else {
                      setSettings({
                        ...settings,
                        withdrawal_limits: {
                          ...settings.withdrawal_limits,
                          min_withdrawal: parseFloat(value)
                        }
                      });
                    }
                  }}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Minimum amount"
                />
                <Button
                  data-testid="button-update-min-withdrawal"
                  onClick={handleUpdateMinWithdrawal}
                  disabled={updateSettingsMutation.isPending}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  Update
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-gray-300">Max Daily Withdrawal ($)</Label>
              <Input
                data-testid="input-max-withdrawal"
                type="text"
                value={localInputs.maxWithdrawal}
                onChange={(e) => {
                  setLocalInputs({
                    ...localInputs,
                    maxWithdrawal: e.target.value
                  });
                }}
                onBlur={(e) => {
                  const value = e.target.value.trim();
                  if (value === '' || isNaN(Number(value)) || Number(value) < 1) {
                    setLocalInputs({
                      ...localInputs,
                      maxWithdrawal: settings.withdrawal_limits.max_daily_withdrawal.toString()
                    });
                    if (value !== '' && (isNaN(Number(value)) || Number(value) < 1)) {
                      toast({
                        title: "Invalid Value",
                        description: "Maximum daily withdrawal must be at least $1",
                        variant: "destructive",
                      });
                    }
                  } else {
                    setSettings({
                      ...settings,
                      withdrawal_limits: {
                        ...settings.withdrawal_limits,
                        max_daily_withdrawal: parseFloat(value)
                      }
                    });
                  }
                }}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Maximum daily amount"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Processing Time (hours)</Label>
              <Input
                data-testid="input-processing-time"
                type="text"
                value={localInputs.processingTime}
                onChange={(e) => {
                  setLocalInputs({
                    ...localInputs,
                    processingTime: e.target.value
                  });
                }}
                onBlur={(e) => {
                  const value = e.target.value.trim();
                  if (value === '' || isNaN(Number(value)) || Number(value) < 1) {
                    setLocalInputs({
                      ...localInputs,
                      processingTime: settings.withdrawal_limits.processing_time_hours.toString()
                    });
                    if (value !== '' && (isNaN(Number(value)) || Number(value) < 1)) {
                      toast({
                        title: "Invalid Value",
                        description: "Processing time must be at least 1 hour",
                        variant: "destructive",
                      });
                    }
                  } else {
                    setSettings({
                      ...settings,
                      withdrawal_limits: {
                        ...settings.withdrawal_limits,
                        processing_time_hours: parseFloat(value)
                      }
                    });
                  }
                }}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Hours"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Configuration */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            System Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Global Profit Multiplier</Label>
              <Input
                data-testid="input-profit-multiplier"
                type="text"
                value={localInputs.profitMultiplier}
                onChange={(e) => {
                  setLocalInputs({
                    ...localInputs,
                    profitMultiplier: e.target.value
                  });
                }}
                onBlur={(e) => {
                  const value = e.target.value.trim();
                  if (value === '' || isNaN(Number(value)) || Number(value) < 0.1 || Number(value) > 10) {
                    setLocalInputs({
                      ...localInputs,
                      profitMultiplier: settings.system.global_profit_multiplier.toString()
                    });
                    if (value !== '' && (isNaN(Number(value)) || Number(value) < 0.1 || Number(value) > 10)) {
                      toast({
                        title: "Invalid Value",
                        description: "Profit multiplier must be between 0.1 and 10",
                        variant: "destructive",
                      });
                    }
                  } else {
                    setSettings({
                      ...settings,
                      system: {
                        ...settings.system,
                        global_profit_multiplier: parseFloat(value)
                      }
                    });
                  }
                }}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="0.1 - 10"
              />
              <p className="text-xs text-gray-400">Multiplier for all investment returns</p>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Arbitrage Refresh Rate (seconds)</Label>
              <Input
                data-testid="input-refresh-rate"
                type="text"
                value={localInputs.refreshRate}
                onChange={(e) => {
                  setLocalInputs({
                    ...localInputs,
                    refreshRate: e.target.value
                  });
                }}
                onBlur={(e) => {
                  const value = e.target.value.trim();
                  if (value === '' || isNaN(Number(value)) || Number(value) < 10 || Number(value) > 300) {
                    setLocalInputs({
                      ...localInputs,
                      refreshRate: settings.system.arbitrage_refresh_rate.toString()
                    });
                    if (value !== '' && (isNaN(Number(value)) || Number(value) < 10 || Number(value) > 300)) {
                      toast({
                        title: "Invalid Value",
                        description: "Refresh rate must be between 10 and 300 seconds",
                        variant: "destructive",
                      });
                    }
                  } else {
                    setSettings({
                      ...settings,
                      system: {
                        ...settings.system,
                        arbitrage_refresh_rate: parseFloat(value)
                      }
                    });
                  }
                }}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="10 - 300 seconds"
              />
              <p className="text-xs text-gray-400">How often arbitrage data refreshes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Welcome Message Configuration */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            Welcome Message Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Welcome Message Title</Label>
            <Input
              data-testid="input-welcome-title"
              type="text"
              value={localInputs.welcomeTitle}
              onChange={(e) => {
                setLocalInputs({
                  ...localInputs,
                  welcomeTitle: e.target.value
                });
              }}
              onBlur={(e) => {
                const value = e.target.value.trim();
                if (value === '') {
                  setLocalInputs({
                    ...localInputs,
                    welcomeTitle: settings.welcome_message?.title || '🎉 Welcome to TradePilot!'
                  });
                } else {
                  setSettings({
                    ...settings,
                    welcome_message: {
                      title: value,
                      content: settings.welcome_message?.content || `Welcome to TradePilot! We're excited to have you join our community of successful crypto investors.

Here's what you can expect:
• Daily profits from automated arbitrage trading
• Real-time market opportunities
• 24/7 professional support
• Active investor community

Your journey to financial freedom starts now. Join our chatroom to connect with other investors and share your success!

Best regards,
The TradePilot Team 🚀`
                    }
                  });
                }
              }}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="Enter the welcome message title..."
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Welcome Message Content</Label>
            <textarea
              data-testid="textarea-welcome-content"
              value={localInputs.welcomeContent}
              onChange={(e) => {
                setLocalInputs({
                  ...localInputs,
                  welcomeContent: e.target.value
                });
              }}
              onBlur={(e) => {
                const value = e.target.value.trim();
                if (value === '') {
                  setLocalInputs({
                    ...localInputs,
                    welcomeContent: settings.welcome_message?.content || `Welcome to TradePilot! We're excited to have you join our community of successful crypto investors.

Here's what you can expect:
• Daily profits from automated arbitrage trading
• Real-time market opportunities
• 24/7 professional support
• Active investor community

Your journey to financial freedom starts now. Join our chatroom to connect with other investors and share your success!

Best regards,
The TradePilot Team 🚀`
                  });
                } else {
                  setSettings({
                    ...settings,
                    welcome_message: {
                      title: settings.welcome_message?.title || '🎉 Welcome to TradePilot!',
                      content: value
                    }
                  });
                }
              }}
              className="bg-gray-700 border-gray-600 text-white min-h-[200px] resize-vertical"
              placeholder="Enter the welcome message content that new users will receive..."
            />
            <p className="text-xs text-gray-400">
              This message will be sent to new users when they verify their account. You can use emojis and line breaks.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* AI Chat Configuration */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Bot className="h-5 w-5 mr-2" />
            AI Chat Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-300">AI Personality Prompt</Label>
            <textarea
              data-testid="textarea-ai-personality"
              value={localInputs.aiPersonality}
              onChange={(e) => {
                setLocalInputs({
                  ...localInputs,
                  aiPersonality: e.target.value
                });
              }}
              onBlur={(e) => {
                const value = e.target.value.trim();
                if (value === '') {
                  setLocalInputs({
                    ...localInputs,
                    aiPersonality: settings.ai_chat?.personality || 'You are a helpful TradePilot AI assistant specializing in cryptocurrency trading and arbitrage opportunities.'
                  });
                } else {
                  setSettings({
                    ...settings,
                    ai_chat: {
                      ...settings.ai_chat,
                      personality: value,
                      enabled: true,
                      api_keys: settings.ai_chat?.api_keys || {
                        reply_keys: [],
                        summary_keys: [],
                        current_reply_index: 0,
                        current_summary_index: 0,
                      }
                    }
                  });
                }
              }}
              className="bg-gray-700 border-gray-600 text-white min-h-[120px] resize-vertical"
              placeholder="Enter the AI personality prompt that defines how the AI should behave and respond..."
            />
            <p className="text-xs text-gray-400">
              This prompt defines the AI's personality and behavior. Be specific about trading expertise, communication style, and helpful traits.
            </p>
          </div>


        </CardContent>
      </Card>

      {/* Save All Settings */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <Button
            data-testid="button-save-all-settings"
            onClick={handleUpdateAllSettings}
            disabled={updateSettingsMutation.isPending}
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
          >
            {updateSettingsMutation.isPending ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save All Settings
          </Button>
          <p className="text-center text-xs text-gray-400 mt-2">
            Changes will be applied immediately and affect all users
          </p>
        </CardContent>
      </Card>
    </div>
  );
}