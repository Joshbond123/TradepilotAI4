import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Plus, Minus, DollarSign, Users } from "lucide-react";

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

interface BalanceManagementProps {
  onClose?: () => void;
}

export default function BalanceManagement({ onClose }: BalanceManagementProps) {
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState<"add" | "subtract">("add");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  // Fetch all users
  const { data: users, isLoading } = useQuery({
    queryKey: ["/admin/users"],
    queryFn: () => fetchWithAuth("/admin/users"),
  });

  const adjustBalanceMutation = useMutation({
    mutationFn: (data: { userId: string; amount: number; type: string; notes: string }) =>
      fetchWithAuth(`/admin/users/${data.userId}/balance`, {
        method: "POST",
        body: JSON.stringify({
          amount: data.amount,
          type: data.type,
          notes: data.notes,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/admin/users"] });
      toast({ title: "Balance adjusted successfully" });
      setIsDialogOpen(false);
      setSelectedUser(null);
      setAmount("");
      setNotes("");
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error adjusting balance", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const handleAdjustment = () => {
    if (!selectedUser || !amount || isNaN(Number(amount))) return;
    
    adjustBalanceMutation.mutate({
      userId: selectedUser.id,
      amount: Number(amount),
      type: adjustmentType,
      notes: notes,
    });
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Balance Management</h2>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Back to Dashboard
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            User Balance Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Current Balance</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="font-medium">{user.username}</div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="font-medium text-green-600">
                        ${user.balance.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>{user.country || "Unknown"}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.isActive 
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" 
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                      }`}>
                        {user.isActive ? "Active" : "Blocked"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsDialogOpen(true);
                        }}
                        data-testid={`button-adjust-balance-${user.id}`}
                      >
                        <DollarSign className="w-4 h-4 mr-1" />
                        Adjust Balance
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!users || users.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust User Balance</DialogTitle>
            <DialogDescription>
              Add or subtract funds from {selectedUser?.username}'s account
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Current Balance:</span>
                  <span className="font-bold text-green-600">${selectedUser.balance.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <Label>Action Type</Label>
                <Select value={adjustmentType} onValueChange={(value: "add" | "subtract") => setAdjustmentType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add">Add Funds</SelectItem>
                    <SelectItem value="subtract">Subtract Funds</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Amount ($USD)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  data-testid="input-adjustment-amount"
                />
              </div>

              <div>
                <Label>Notes (Optional)</Label>
                <Textarea
                  placeholder="Reason for balance adjustment..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  data-testid="textarea-adjustment-notes"
                />
              </div>

              {amount && !isNaN(Number(amount)) && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">New Balance:</span>
                    <span className="font-bold">
                      ${adjustmentType === "add" 
                        ? (selectedUser.balance + Number(amount)).toFixed(2)
                        : Math.max(0, selectedUser.balance - Number(amount)).toFixed(2)
                      }
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleAdjustment}
                  disabled={adjustBalanceMutation.isPending || !amount || isNaN(Number(amount))}
                  variant={adjustmentType === "add" ? "default" : "destructive"}
                  data-testid="button-confirm-adjustment"
                >
                  {adjustmentType === "add" ? (
                    <Plus className="w-4 h-4 mr-2" />
                  ) : (
                    <Minus className="w-4 h-4 mr-2" />
                  )}
                  {adjustBalanceMutation.isPending ? "Processing..." : `${adjustmentType === "add" ? "Add" : "Subtract"} $${amount || "0"}`}
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}