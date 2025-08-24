import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

// Helper function to make authenticated admin requests
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

import { Shield, Key, AlertCircle, Save, ExternalLink } from "lucide-react";

interface ReCaptchaSettings {
  recaptcha: {
    enabled: boolean;
    site_key: string;
    secret_key: string;
  };
}

export default function ReCaptchaSettings() {
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<ReCaptchaSettings>({
    recaptcha: {
      enabled: false,
      site_key: "",
      secret_key: "",
    },
  });

  const [localInputs, setLocalInputs] = useState({
    enabled: false,
    siteKey: "",
    secretKey: "",
  });

  // Fetch current settings
  const { data: currentSettings, isLoading } = useQuery({
    queryKey: ["/api/admin/settings"],
    queryFn: () => fetchWithAuth("/admin/settings"),
  });

  // Update settings when data is fetched
  useEffect(() => {
    if (currentSettings?.recaptcha) {
      setSettings({ recaptcha: currentSettings.recaptcha });
      setLocalInputs({
        enabled: currentSettings.recaptcha.enabled || false,
        siteKey: currentSettings.recaptcha.site_key || "",
        secretKey: currentSettings.recaptcha.secret_key || "",
      });
    }
  }, [currentSettings]);

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (updates: Partial<ReCaptchaSettings>) => 
      fetchWithAuth("/admin/settings", {
        method: "PATCH",
        body: JSON.stringify(updates),
      }),
    onSuccess: () => {
      toast({
        title: "reCAPTCHA Settings Updated",
        description: "Security settings have been applied successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update reCAPTCHA settings",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    const updates = {
      recaptcha: {
        enabled: localInputs.enabled,
        site_key: localInputs.siteKey.trim(),
        secret_key: localInputs.secretKey.trim(),
      },
    };

    updateSettingsMutation.mutate(updates);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setLocalInputs(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-crypto-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">reCAPTCHA Security Settings</h2>
        <Button
          onClick={handleSave}
          disabled={updateSettingsMutation.isPending}
          className="crypto-gradient"
          data-testid="button-save-recaptcha"
        >
          <Save className="w-4 h-4 mr-2" />
          {updateSettingsMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Card className="bg-crypto-card border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Shield className="w-5 h-5 mr-3 text-crypto-blue" />
            Google reCAPTCHA v2 Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between p-4 bg-crypto-dark rounded-lg">
            <div className="space-y-1">
              <Label className="text-white font-medium">Enable reCAPTCHA</Label>
              <p className="text-sm text-gray-400">
                Protect login and registration forms with Google reCAPTCHA verification
              </p>
            </div>
            <Switch
              checked={localInputs.enabled}
              onCheckedChange={(checked) => handleInputChange("enabled", checked)}
              data-testid="switch-recaptcha-enabled"
            />
          </div>

          {/* Site Key Input */}
          <div className="space-y-2">
            <Label className="text-gray-300 flex items-center">
              <Key className="w-4 h-4 mr-2" />
              Site Key (Public)
            </Label>
            <Input
              type="text"
              placeholder="6LcXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
              value={localInputs.siteKey}
              onChange={(e) => handleInputChange("siteKey", e.target.value)}
              className="bg-crypto-dark border-gray-600 text-white placeholder-gray-400 focus:border-crypto-blue"
              data-testid="input-site-key"
            />
            <p className="text-xs text-gray-500">
              This key will be visible in your HTML code and used by the frontend
            </p>
          </div>

          {/* Secret Key Input */}
          <div className="space-y-2">
            <Label className="text-gray-300 flex items-center">
              <Key className="w-4 h-4 mr-2" />
              Secret Key (Private)
            </Label>
            <Input
              type="password"
              placeholder="6LcXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
              value={localInputs.secretKey}
              onChange={(e) => handleInputChange("secretKey", e.target.value)}
              className="bg-crypto-dark border-gray-600 text-white placeholder-gray-400 focus:border-crypto-blue"
              data-testid="input-secret-key"
            />
            <p className="text-xs text-gray-500">
              This key is used for server-side verification and must be kept secure
            </p>
          </div>

          {/* Setup Instructions */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
              <div className="space-y-2">
                <h4 className="text-blue-400 font-medium">How to get reCAPTCHA keys:</h4>
                <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
                  <li>Visit the Google reCAPTCHA Admin Console</li>
                  <li>Create a new site with reCAPTCHA v2 "I'm not a robot" checkbox</li>
                  <li>Add your domain to the authorized domains list</li>
                  <li>Copy the Site Key and Secret Key to the fields above</li>
                  <li>Enable reCAPTCHA and save your settings</li>
                </ol>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 border-blue-500 text-blue-400 hover:bg-blue-500/20"
                  onClick={() => window.open("https://www.google.com/recaptcha/admin", "_blank")}
                  data-testid="button-recaptcha-console"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open reCAPTCHA Console
                </Button>
              </div>
            </div>
          </div>

          {/* Current Status */}
          <div className="border-t border-gray-600 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-400 text-sm">Current Status</Label>
                <div className={`mt-1 px-3 py-1 rounded-full text-sm inline-block ${
                  localInputs.enabled 
                    ? "bg-green-500/20 text-green-400" 
                    : "bg-red-500/20 text-red-400"
                }`}>
                  {localInputs.enabled ? "Active" : "Disabled"}
                </div>
              </div>
              <div>
                <Label className="text-gray-400 text-sm">Configuration</Label>
                <div className={`mt-1 px-3 py-1 rounded-full text-sm inline-block ${
                  localInputs.siteKey && localInputs.secretKey
                    ? "bg-green-500/20 text-green-400" 
                    : "bg-yellow-500/20 text-yellow-400"
                }`}>
                  {localInputs.siteKey && localInputs.secretKey ? "Complete" : "Incomplete"}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}