import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { User, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function EditProfilePage() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation("/dashboard")}
            className="text-gray-400 hover:text-white mb-4"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3" data-testid="text-edit-profile-title">
            <User className="h-8 w-8" />
            Edit Profile
          </h1>
          <p className="text-gray-400" data-testid="text-edit-profile-description">
            Update your account information
          </p>
        </div>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Account Information</CardTitle>
            <CardDescription>
              Update your username and email address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-gray-300" htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={profileData.username}
                    onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                    className="bg-slate-900 border-slate-600 text-white placeholder-gray-400 focus:border-blue-500"
                    required
                    data-testid="input-username"
                  />
                </div>

                <div>
                  <Label className="text-gray-300" htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="bg-slate-900 border-slate-600 text-white placeholder-gray-400 focus:border-blue-500"
                    required
                    data-testid="input-email"
                  />
                </div>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">Referral Code</div>
                    <div className="text-blue-400 font-semibold" data-testid="text-referral-code">
                      {user.referralCode}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">Account Status</div>
                    <div className="text-green-400 font-semibold" data-testid="text-account-status">
                      Active
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">Member Since</div>
                    <div className="text-gray-300" data-testid="text-member-since">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">Account Balance</div>
                    <div className="text-green-400 font-semibold" data-testid="text-account-balance">
                      ${user.balance.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={updateProfileMutation.isPending}
                data-testid="button-update-profile"
              >
                {updateProfileMutation.isPending ? "Updating..." : "Update Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}