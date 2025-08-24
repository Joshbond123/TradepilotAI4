import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Phone, Key, RefreshCw } from "lucide-react";

interface CallMeBotSettings {
  enabled: boolean;
  admin_whatsapp_number: string;
  api_key: string;
  notifications: {
    new_registration: boolean;
    user_login: boolean;
    support_ticket: boolean;
    withdrawal_request: boolean;
    system_activity: boolean;
  };
}

const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Request failed");
  }

  return response.json();
};

export default function CallMeBotSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<CallMeBotSettings>({
    enabled: false,
    admin_whatsapp_number: '',
    api_key: '',
    notifications: {
      new_registration: true,
      user_login: false,
      support_ticket: true,
      withdrawal_request: true,
      system_activity: true,
    }
  });

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await fetchWithAuth("/admin/callmebot-settings");
        setSettings(data);
      } catch (error) {
        console.error("Failed to load CallMeBot settings:", error);
        toast({
          title: "Error",
          description: "Failed to load CallMeBot settings",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [toast]);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await fetchWithAuth("/admin/callmebot-settings", {
        method: "PATCH",
        body: JSON.stringify(settings),
      });

      toast({
        title: "Settings Saved",
        description: "CallMeBot notification settings have been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof CallMeBotSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationChange = (notificationType: keyof CallMeBotSettings['notifications'], enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [notificationType]: enabled
      }
    }));
  };

  if (loading) {
    return (
      <Card className="bg-crypto-card border-gray-700">
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-crypto-blue" />
          <span className="ml-2 text-gray-400">Loading settings...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">CallMeBot WhatsApp Notifications</h3>
        <Button 
          onClick={handleSaveSettings}
          disabled={saving}
          className="bg-crypto-blue hover:bg-blue-600"
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Settings'
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Settings */}
        <Card className="bg-crypto-card border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-crypto-blue" />
              Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white font-medium">Enable CallMeBot</Label>
                <p className="text-gray-400 text-sm">Turn on/off WhatsApp notifications</p>
              </div>
              <Switch
                checked={settings.enabled}
                onCheckedChange={(checked) => handleInputChange('enabled', checked)}
              />
            </div>

            {/* Admin WhatsApp Number */}
            <div className="space-y-2">
              <Label className="text-white flex items-center">
                <Phone className="w-4 h-4 mr-2 text-crypto-green" />
                Admin WhatsApp Number
              </Label>
              <Input
                type="text"
                placeholder="Enter your WhatsApp number (e.g., +1234567890)"
                value={settings.admin_whatsapp_number}
                onChange={(e) => handleInputChange('admin_whatsapp_number', e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
              />
              <p className="text-gray-400 text-xs">
                Include country code (e.g., +1 for US, +44 for UK)
              </p>
            </div>

            {/* API Key */}
            <div className="space-y-2">
              <Label className="text-white flex items-center">
                <Key className="w-4 h-4 mr-2 text-yellow-400" />
                CallMeBot API Key
              </Label>
              <Input
                type="password"
                placeholder="Enter your CallMeBot API key"
                value={settings.api_key}
                onChange={(e) => handleInputChange('api_key', e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
              />
              <p className="text-gray-400 text-xs">
                Get your API key from <a href="https://www.callmebot.com/blog/free-api-whatsapp-messages/" target="_blank" rel="noopener noreferrer" className="text-crypto-blue hover:underline">CallMeBot.com</a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-crypto-card border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-crypto-green" />
              Notification Types
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-400 text-sm">
              Choose which events should trigger WhatsApp notifications:
            </p>

            {/* New Registration */}
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <div>
                <Label className="text-white font-medium">New User Registration</Label>
                <p className="text-gray-400 text-sm">When a new user creates an account</p>
              </div>
              <Switch
                checked={settings.notifications.new_registration}
                onCheckedChange={(checked) => handleNotificationChange('new_registration', checked)}
                disabled={!settings.enabled}
              />
            </div>

            {/* User Login */}
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <div>
                <Label className="text-white font-medium">User Login</Label>
                <p className="text-gray-400 text-sm">When users log into the platform</p>
              </div>
              <Switch
                checked={settings.notifications.user_login}
                onCheckedChange={(checked) => handleNotificationChange('user_login', checked)}
                disabled={!settings.enabled}
              />
            </div>

            {/* Support Ticket */}
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <div>
                <Label className="text-white font-medium">Support Tickets</Label>
                <p className="text-gray-400 text-sm">When users submit support requests</p>
              </div>
              <Switch
                checked={settings.notifications.support_ticket}
                onCheckedChange={(checked) => handleNotificationChange('support_ticket', checked)}
                disabled={!settings.enabled}
              />
            </div>

            {/* Withdrawal Requests */}
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <div>
                <Label className="text-white font-medium">Withdrawal Requests</Label>
                <p className="text-gray-400 text-sm">When users request withdrawals</p>
              </div>
              <Switch
                checked={settings.notifications.withdrawal_request}
                onCheckedChange={(checked) => handleNotificationChange('withdrawal_request', checked)}
                disabled={!settings.enabled}
              />
            </div>

            {/* System Activity */}
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <div>
                <Label className="text-white font-medium">System Activity</Label>
                <p className="text-gray-400 text-sm">Important system events and alerts</p>
              </div>
              <Switch
                checked={settings.notifications.system_activity}
                onCheckedChange={(checked) => handleNotificationChange('system_activity', checked)}
                disabled={!settings.enabled}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Information Card */}
      <Card className="bg-blue-500/10 border-blue-500/20">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <MessageSquare className="w-5 h-5 text-blue-400 mt-1" />
            <div>
              <h4 className="text-blue-400 font-medium mb-2">How to set up CallMeBot:</h4>
              <ol className="text-gray-300 text-sm space-y-1 list-decimal list-inside">
                <li>Send a message to +34 621 21 64 79 with the text: "I allow callmebot to send me messages"</li>
                <li>Wait for the confirmation message with your API key</li>
                <li>Enter your WhatsApp number and API key above</li>
                <li>Enable the notification types you want to receive</li>
                <li>Save the settings to activate notifications</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}