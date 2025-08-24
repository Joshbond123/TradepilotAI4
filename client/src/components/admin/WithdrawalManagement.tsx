import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { CheckCircle, XCircle, Eye, DollarSign } from "lucide-react";

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

interface WithdrawalManagementProps {
  onClose?: () => void;
}

export default function WithdrawalManagement({ onClose }: WithdrawalManagementProps) {
  const { toast } = useToast();
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<"approved" | "rejected">("approved");
  const [adminNotes, setAdminNotes] = useState("");

  // Fetch all withdrawals for admin
  const { data: withdrawals, isLoading } = useQuery({
    queryKey: ["/admin/withdrawals"],
    queryFn: () => fetchWithAuth("/admin/withdrawals"),
  });

  const approveWithdrawalMutation = useMutation({
    mutationFn: (data: { id: string; status: string; admin_notes: string }) =>
      fetchWithAuth(`/admin/withdrawals/${data.id}/approve`, {
        method: "POST",
        body: JSON.stringify({ 
          status: data.status, 
          admin_notes: data.admin_notes 
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/admin/withdrawals"] });
      toast({ title: "Withdrawal processed successfully" });
      setIsDialogOpen(false);
      setSelectedWithdrawal(null);
      setAdminNotes("");
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error processing withdrawal", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const handleApproval = () => {
    if (!selectedWithdrawal) return;
    
    approveWithdrawalMutation.mutate({
      id: selectedWithdrawal.id,
      status: approvalStatus,
      admin_notes: adminNotes,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "approved": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "rejected": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading withdrawals...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Withdrawal Management</h2>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Back to Dashboard
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            All Withdrawal Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Cryptocurrency</TableHead>
                  <TableHead>Wallet Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals?.map((withdrawal: any) => (
                  <TableRow key={withdrawal.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{withdrawal.user?.username}</div>
                        <div className="text-sm text-gray-500">{withdrawal.user?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{withdrawal.amount} {withdrawal.cryptocurrency}</div>
                        <div className="text-sm text-gray-500">${withdrawal.usd_value || withdrawal.usdValue}</div>
                      </div>
                    </TableCell>
                    <TableCell>{withdrawal.cryptocurrency}</TableCell>
                    <TableCell>
                      <div className="max-w-[150px] truncate" title={withdrawal.wallet_address || withdrawal.walletAddress}>
                        {withdrawal.wallet_address || withdrawal.walletAddress}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(withdrawal.status)}>
                        {withdrawal.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {withdrawal.created_at || withdrawal.createdAt ? 
                        new Date(withdrawal.created_at || withdrawal.createdAt).toLocaleString() :
                        "Processing"
                      }
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedWithdrawal(withdrawal);
                          setIsDialogOpen(true);
                        }}
                        data-testid={`button-review-withdrawal-${withdrawal.id}`}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!withdrawals || withdrawals.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No withdrawal requests found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Withdrawal Request</DialogTitle>
            <DialogDescription>
              Review and approve or reject this withdrawal request
            </DialogDescription>
          </DialogHeader>
          
          {selectedWithdrawal && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">User</Label>
                  <p className="text-sm">{selectedWithdrawal.user?.username} ({selectedWithdrawal.user?.email})</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Amount</Label>
                  <p className="text-sm">{selectedWithdrawal.amount} {selectedWithdrawal.cryptocurrency} (${selectedWithdrawal.usd_value || selectedWithdrawal.usdValue})</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Wallet Address</Label>
                  <p className="text-sm break-all">{selectedWithdrawal.wallet_address || selectedWithdrawal.walletAddress}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Current Status</Label>
                  <Badge className={getStatusColor(selectedWithdrawal.status)}>
                    {selectedWithdrawal.status}
                  </Badge>
                </div>
              </div>

              {selectedWithdrawal.status === "pending" && (
                <div className="space-y-4 border-t pt-4">
                  <div>
                    <Label>Action</Label>
                    <Select value={approvalStatus} onValueChange={(value: "approved" | "rejected") => setApprovalStatus(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="approved">Approve Withdrawal</SelectItem>
                        <SelectItem value="rejected">Reject Withdrawal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Admin Notes</Label>
                    <Textarea
                      placeholder="Add any notes about this withdrawal..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      data-testid="textarea-admin-notes"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleApproval}
                      disabled={approveWithdrawalMutation.isPending}
                      variant={approvalStatus === "approved" ? "default" : "destructive"}
                      data-testid="button-process-withdrawal"
                    >
                      {approvalStatus === "approved" ? (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      ) : (
                        <XCircle className="w-4 h-4 mr-2" />
                      )}
                      {approveWithdrawalMutation.isPending ? "Processing..." : `${approvalStatus === "approved" ? "Approve" : "Reject"} Withdrawal`}
                    </Button>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {(selectedWithdrawal.admin_notes || selectedWithdrawal.adminNotes) && (
                <div className="border-t pt-4">
                  <Label className="text-sm font-medium">Previous Admin Notes</Label>
                  <p className="text-sm mt-1 bg-gray-50 dark:bg-gray-900 p-3 rounded">
                    {selectedWithdrawal.admin_notes || selectedWithdrawal.adminNotes}
                  </p>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-sm font-medium">Request Date</Label>
                    <p className="text-sm">{selectedWithdrawal.created_at || selectedWithdrawal.createdAt ? 
                      new Date(selectedWithdrawal.created_at || selectedWithdrawal.createdAt).toLocaleString() :
                      "Processing"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">User Country</Label>
                    <p className="text-sm">{selectedWithdrawal.user?.country || "Not specified"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}