import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";

import MobileNav from "@/components/layout/mobile-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  User, 
  Mail, 
  Lock, 
  Shield, 
  Settings as SettingsIcon,
  Eye,
  EyeOff 
} from "lucide-react";

export default function Settings() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
    if (user) {
      setProfileData({
        username: user.username,
        email: user.email,
      });
    }
  }, [user, isLoading, setLocation]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { username: string; email: string }) => {
      const response = await apiRequest("PATCH", "/api/auth/profile", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await apiRequest("PATCH", "/api/auth/password", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Password Changed",
        description: "Your password has been successfully updated",
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Password Change Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileData);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
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

  return (
    <div className="min-h-screen bg-crypto-dark">
      <Header />
      <main className="p-6 overflow-y-auto pb-20">
        <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" data-testid="page-title">
              Account Settings
            </h1>
            <p className="text-gray-400">
              Manage your account preferences and security settings
            </p>
          </div>

          <div className="max-w-4xl space-y-6">
            {/* Account Information */}
            <Card className="bg-crypto-card border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <User className="w-5 h-5 text-crypto-blue" />
                  <h3 className="text-lg font-semibold">Account Information</h3>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-gray-300">Username</Label>
                      <Input
                        type="text"
                        value={profileData.username}
                        onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                        className="bg-crypto-dark border-gray-600 text-white placeholder-gray-400 focus:border-crypto-blue"
                        required
                        data-testid="input-username"
                      />
                    </div>

                    <div>
                      <Label className="text-gray-300">Email Address</Label>
                      <Input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="bg-crypto-dark border-gray-600 text-white placeholder-gray-400 focus:border-crypto-blue"
                        required
                        data-testid="input-email"
                      />
                    </div>
                  </div>

                  <div className="bg-crypto-dark rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-400">Referral Code</div>
                        <div className="text-crypto-blue font-semibold" data-testid="referral-code">
                          {user.referralCode}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400">Account Status</div>
                        <div className="text-crypto-green font-semibold" data-testid="account-status">
                          Active
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400">Member Since</div>
                        <div className="text-white" data-testid="member-since">
                          {new Date().toLocaleDateString()} {/* Would be user.createdAt in real data */}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400">Account Type</div>
                        <div className="text-white" data-testid="account-type">
                          {user.isAdmin ? "Administrator" : "Standard User"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="crypto-gradient"
                    disabled={updateProfileMutation.isPending}
                    data-testid="button-update-profile"
                  >
                    {updateProfileMutation.isPending ? "Updating..." : "Update Profile"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="bg-crypto-card border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Shield className="w-5 h-5 text-crypto-green" />
                  <h3 className="text-lg font-semibold">Security Settings</h3>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-6">
                  <div>
                    <Label className="text-gray-300">Current Password</Label>
                    <div className="relative">
                      <Input
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="bg-crypto-dark border-gray-600 text-white placeholder-gray-400 focus:border-crypto-blue pr-10"
                        placeholder="Enter current password"
                        required
                        data-testid="input-current-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        data-testid="toggle-current-password"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <Separator className="bg-gray-600" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-gray-300">New Password</Label>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className="bg-crypto-dark border-gray-600 text-white placeholder-gray-400 focus:border-crypto-blue pr-10"
                          placeholder="Enter new password"
                          required
                          minLength={6}
                          data-testid="input-new-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          data-testid="toggle-new-password"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-gray-300">Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          className="bg-crypto-dark border-gray-600 text-white placeholder-gray-400 focus:border-crypto-blue pr-10"
                          placeholder="Confirm new password"
                          required
                          minLength={6}
                          data-testid="input-confirm-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          data-testid="toggle-confirm-password"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {passwordData.newPassword && passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                    <div className="text-sm text-red-400" data-testid="password-mismatch">
                      Passwords do not match
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="outline"
                    className="border-crypto-green text-crypto-green hover:bg-crypto-green hover:text-white"
                    disabled={changePasswordMutation.isPending || passwordData.newPassword !== passwordData.confirmPassword}
                    data-testid="button-change-password"
                  >
                    {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Additional Settings */}
            <Card className="bg-crypto-card border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <SettingsIcon className="w-5 h-5 text-yellow-500" />
                  <h3 className="text-lg font-semibold">Additional Settings</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-crypto-dark rounded-lg">
                    <div>
                      <div className="font-medium">Two-Factor Authentication</div>
                      <div className="text-sm text-gray-400">Add an extra layer of security to your account</div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-gray-600 text-gray-400"
                      disabled
                      data-testid="button-2fa"
                    >
                      Coming Soon
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-crypto-dark rounded-lg">
                    <div>
                      <div className="font-medium">API Access</div>
                      <div className="text-sm text-gray-400">Generate API keys for programmatic access</div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-gray-600 text-gray-400"
                      disabled
                      data-testid="button-api-access"
                    >
                      Coming Soon
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-crypto-dark rounded-lg">
                    <div>
                      <div className="font-medium">Notification Preferences</div>
                      <div className="text-sm text-gray-400">Manage how you receive notifications</div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-gray-600 text-gray-400"
                      disabled
                      data-testid="button-notifications"
                    >
                      Coming Soon
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card className="bg-crypto-card border-red-700 border-opacity-50">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-red-900 bg-opacity-20 rounded-lg border border-red-700 border-opacity-30">
                    <div>
                      <div className="font-medium text-red-300">Delete Account</div>
                      <div className="text-sm text-gray-400">
                        Permanently delete your account and all associated data
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                      disabled
                      data-testid="button-delete-account"
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
