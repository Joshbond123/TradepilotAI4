import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { fetchWithAuth } from "@/lib/crypto-api";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Users,
  Mail,
  DollarSign,
  Shield,
  ShieldOff,
  Eye,
  Trash2,
  UserPlus,
  Search,
  Settings2
} from "lucide-react";

interface User {
  id: string;
  username: string;
  email: string;
  balance: number;
  isActive: boolean;
  isAdmin: boolean;
  referralCode: string;
  referredBy?: string;
  createdAt: string;
}

interface UserInvestment {
  id: string;
  user_id: string;
  plan_id: string;
  amount: number;
  is_active: boolean;
  plan_name?: string;
}

interface ReferralStats {
  totalReferrals: number;
  totalEarnings: number;
  referredUsers: User[];
}

interface UserManagementProps {
  onUserSelect?: (user: User) => void;
}

export default function UserManagement({ onUserSelect }: UserManagementProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userInvestments, setUserInvestments] = useState<UserInvestment[]>([]);
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  
  // Fetch users
  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: () => fetchWithAuth("/admin/users"),
  });

  // Fetch user investments when a user is selected
  const { data: investments } = useQuery({
    queryKey: ["/api/admin/investments", selectedUser?.id],
    queryFn: () => fetchWithAuth(`/admin/investments?userId=${selectedUser?.id}`),
    enabled: !!selectedUser,
  });

  // Fetch referral stats for selected user
  const { data: referrals } = useQuery({
    queryKey: ["/api/admin/referrals", selectedUser?.id],
    queryFn: () => fetchWithAuth(`/admin/referrals?userId=${selectedUser?.id}`),
    enabled: !!selectedUser,
  });

  // Filter users based on search
  const filteredUsers = users?.filter((user: User) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      apiRequest("PATCH", `/api/admin/users/${id}`, updates).then(res => res.json()),
    onSuccess: () => {
      toast({
        title: "User Updated",
        description: "User information has been updated successfully",
      });
      refetch();
      setSelectedUser(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("DELETE", `/api/admin/users/${id}`).then(res => res.json()),
    onSuccess: () => {
      toast({
        title: "User Deleted",
        description: "User has been deleted successfully",
      });
      refetch();
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setEditingUser({ ...user });
    if (onUserSelect) {
      onUserSelect(user);
    }
  };


  const handleToggleActive = (user: User) => {
    updateUserMutation.mutate({ 
      id: user.id, 
      updates: { isActive: !user.isActive } 
    });
  };

  const handleToggleAdmin = (user: User) => {
    updateUserMutation.mutate({ 
      id: user.id, 
      updates: { isAdmin: !user.isAdmin } 
    });
  };


  const handleUpdateUserDetails = () => {
    if (!editingUser || !selectedUser) return;
    
    const updates: any = {};
    if (editingUser.username !== selectedUser.username) updates.username = editingUser.username;
    if (editingUser.email !== selectedUser.email) updates.email = editingUser.email;
    
    if (Object.keys(updates).length > 0) {
      updateUserMutation.mutate({ 
        id: selectedUser.id, 
        updates 
      });
    }
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">User Management</h2>
          <p className="text-gray-400">Manage all registered users and their settings</p>
        </div>
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          {filteredUsers.length} Users
        </Badge>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          data-testid="input-search-users"
          placeholder="Search by username or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-gray-800 border-gray-700 text-white"
        />
      </div>

      {/* Users Grid */}
      <div className="grid gap-4">
        {filteredUsers.map((user: User) => (
          <Card 
            key={user.id} 
            className="bg-gray-800 border-gray-700 hover:bg-gray-750 cursor-pointer transition-colors"
            onClick={() => handleUserClick(user)}
            data-testid={`card-user-${user.id}`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{user.username}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <Mail className="h-3 w-3" />
                      <span>{user.email}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={user.isActive ? "default" : "destructive"}>
                    {user.isActive ? "Active" : "Blocked"}
                  </Badge>
                  {user.isAdmin && (
                    <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                      Admin
                    </Badge>
                  )}
                  <div className="text-right space-y-1">
                    <div className="font-semibold text-white">${user.balance.toFixed(2)}</div>
                    <div className="text-xs text-gray-400">Balance</div>
                    <div className="text-xs text-blue-400">
                      Referrals: {users?.filter((u: User) => u.referredBy === user.referralCode).length || 0}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>User Management - {selectedUser.username}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 max-h-[80vh] overflow-y-auto">
              {/* User Profile */}
              <div className="bg-gray-900 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-3">Full Profile</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>ID</Label>
                    <div className="text-gray-300 text-xs font-mono">{selectedUser.id}</div>
                  </div>
                  <div>
                    <Label>Current Balance</Label>
                    <div className="text-green-400 font-semibold">${selectedUser.balance.toFixed(2)}</div>
                  </div>
                  <div>
                    <Label>Username</Label>
                    <div className="text-gray-300">{selectedUser.username}</div>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <div className="text-gray-300">{selectedUser.email}</div>
                  </div>
                  <div>
                    <Label>Referral Code</Label>
                    <div className="text-blue-400 font-mono">{selectedUser.referralCode}</div>
                  </div>
                  <div>
                    <Label>Joined Date</Label>
                    <div className="text-gray-300">
                      {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <Label>Total Referrals</Label>
                    <div className="text-cyan-400">
                      {users?.filter((u: User) => u.referredBy === selectedUser.referralCode).length || 0}
                    </div>
                  </div>
                  <div>
                    <Label>Active Plans</Label>
                    <div className="text-purple-400">
                      {investments?.filter((inv: UserInvestment) => inv.is_active).length || 0}
                    </div>
                  </div>
                </div>
              </div>

              {/* Balance Management Notice */}
              <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Balance Management</h3>
                <p className="text-blue-300 text-sm">
                  To adjust user balances, please use the dedicated <strong>Balance Management</strong> section. 
                  This ensures proper tracking of all balance changes as deposit records.
                </p>
              </div>

              {/* Edit User Details */}
              <div className="bg-gray-900 p-4 rounded-lg space-y-4">
                <h3 className="text-lg font-semibold text-white">Edit User Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Username</Label>
                    <Input
                      data-testid="input-edit-username"
                      value={editingUser?.username || ""}
                      onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      data-testid="input-edit-email"
                      type="email"
                      value={editingUser?.email || ""}
                      onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                </div>
                <Button
                  data-testid="button-update-details"
                  onClick={handleUpdateUserDetails}
                  disabled={updateUserMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Settings2 className="h-4 w-4 mr-1" />
                  Update Details
                </Button>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <Button
                  data-testid="button-toggle-status"
                  variant={selectedUser.isActive ? "destructive" : "default"}
                  onClick={() => handleToggleActive(selectedUser)}
                  disabled={updateUserMutation.isPending}
                >
                  {selectedUser.isActive ? (
                    <>
                      <ShieldOff className="h-4 w-4 mr-1" />
                      Block User
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-1" />
                      Unblock User
                    </>
                  )}
                </Button>
                
                <Button
                  data-testid="button-toggle-admin"
                  variant={selectedUser.isAdmin ? "outline" : "secondary"}
                  onClick={() => handleToggleAdmin(selectedUser)}
                  disabled={updateUserMutation.isPending}
                >
                  {selectedUser.isAdmin ? "Remove Admin" : "Make Admin"}
                </Button>

                <Button
                  data-testid="button-delete-user"
                  variant="destructive"
                  onClick={() => {
                    if (confirm(`⚠️ PERMANENT DELETION WARNING ⚠️\n\nThis will permanently delete user "${selectedUser.username}" and ALL their data:\n• User account & profile\n• All investments & earnings\n• Deposit & withdrawal history\n• Messages & support tickets\n• Login logs & activity\n\nAfter deletion, they can register again with the same email/username.\n\nThis action CANNOT be undone. Are you absolutely sure?`)) {
                      deleteUserMutation.mutate(selectedUser.id);
                    }
                  }}
                  disabled={deleteUserMutation.isPending}
                  className="bg-red-600 hover:bg-red-700 border-red-500"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  {deleteUserMutation.isPending ? "Deleting..." : "🗑️ Permanently Delete User"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {filteredUsers.length === 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Users Found</h3>
            <p className="text-gray-400">
              {searchTerm ? "No users match your search criteria" : "No users have registered yet"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}