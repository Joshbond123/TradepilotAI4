import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Key, Activity, Clock, TrendingUp } from 'lucide-react';

interface APIKey {
  id: string;
  name: string;
  key: string; // Partially masked
  status: 'active' | 'inactive' | 'failed';
  usage_count: number;
  last_used: string | null;
  created_at: string;
}

interface APIKeys {
  reply_keys: APIKey[];
  summary_keys: APIKey[];
}

export default function APIKeyManagement() {
  const [addKeyDialog, setAddKeyDialog] = useState(false);
  const [editKeyDialog, setEditKeyDialog] = useState(false);
  const [selectedKey, setSelectedKey] = useState<APIKey | null>(null);
  const [selectedKeyType, setSelectedKeyType] = useState<'reply' | 'summary'>('reply');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: apiKeys, isLoading } = useQuery({
    queryKey: ['/api/admin/ai-chat/api-keys'],
    queryFn: async () => {
      const response = await fetch('/api/admin/ai-chat/api-keys', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch API keys');
      return response.json() as Promise<APIKeys>;
    }
  });

  const addKeyMutation = useMutation({
    mutationFn: async (data: { name: string; key: string; type: 'reply' | 'summary' }) => {
      const response = await fetch('/api/admin/ai-chat/api-keys', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to add API key');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ai-chat/api-keys'] });
      setAddKeyDialog(false);
      toast({
        title: "Success",
        description: "API key added successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add API key",
        variant: "destructive"
      });
    }
  });

  const updateKeyMutation = useMutation({
    mutationFn: async (data: { id: string; type: 'reply' | 'summary'; name?: string; status?: 'active' | 'inactive' }) => {
      const response = await fetch(`/api/admin/ai-chat/api-keys/${data.id}?type=${data.type}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: data.name, status: data.status })
      });
      if (!response.ok) throw new Error('Failed to update API key');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ai-chat/api-keys'] });
      setEditKeyDialog(false);
      setSelectedKey(null);
      toast({
        title: "Success",
        description: "API key updated successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update API key",
        variant: "destructive"
      });
    }
  });

  const deleteKeyMutation = useMutation({
    mutationFn: async (data: { id: string; type: 'reply' | 'summary' }) => {
      const response = await fetch(`/api/admin/ai-chat/api-keys/${data.id}?type=${data.type}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to delete API key');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ai-chat/api-keys'] });
      toast({
        title: "Success",
        description: "API key deleted successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete API key",
        variant: "destructive"
      });
    }
  });

  const handleAddKey = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const key = formData.get('key') as string;
    const type = formData.get('type') as 'reply' | 'summary';

    if (!name || !key || !type) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    addKeyMutation.mutate({ name, key, type });
  };

  const handleEditKey = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedKey) return;

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const status = formData.get('status') as 'active' | 'inactive';

    updateKeyMutation.mutate({
      id: selectedKey.id,
      type: selectedKeyType,
      name,
      status
    });
  };

  const handleDeleteKey = (key: APIKey, type: 'reply' | 'summary') => {
    deleteKeyMutation.mutate({ id: key.id, type });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      active: "default",
      inactive: "secondary",
      failed: "destructive"
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  const KeyCard = ({ keyItem, type }: { keyItem: APIKey; type: 'reply' | 'summary' }) => (
    <Card className="mb-4" data-testid={`api-key-card-${keyItem.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Key className="h-4 w-4" />
            <CardTitle className="text-sm">{keyItem.name}</CardTitle>
            {getStatusBadge(keyItem.status)}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedKey(keyItem);
                setSelectedKeyType(type);
                setEditKeyDialog(true);
              }}
              data-testid={`edit-key-${keyItem.id}`}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" data-testid={`delete-key-${keyItem.id}`}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{keyItem.name}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDeleteKey(keyItem, type)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <Label className="text-xs text-muted-foreground">Key</Label>
            <p className="font-mono">{keyItem.key}</p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground flex items-center">
              <Activity className="h-3 w-3 mr-1" />
              Usage Count
            </Label>
            <p>{keyItem.usage_count.toLocaleString()}</p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              Last Used
            </Label>
            <p>{formatDate(keyItem.last_used)}</p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Created</Label>
            <p>{formatDate(keyItem.created_at)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded"></div>
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const totalKeys = (apiKeys?.reply_keys.length || 0) + (apiKeys?.summary_keys.length || 0);
  const activeKeys = (apiKeys?.reply_keys.filter(k => k.status === 'active').length || 0) + 
                    (apiKeys?.summary_keys.filter(k => k.status === 'active').length || 0);
  const totalUsage = (apiKeys?.reply_keys.reduce((sum, k) => sum + k.usage_count, 0) || 0) + 
                     (apiKeys?.summary_keys.reduce((sum, k) => sum + k.usage_count, 0) || 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">API Key Management</h2>
          <p className="text-muted-foreground">Manage Cerebras API keys for AI chat system</p>
        </div>
        <Dialog open={addKeyDialog} onOpenChange={setAddKeyDialog}>
          <DialogTrigger asChild>
            <Button data-testid="add-api-key-button">
              <Plus className="h-4 w-4 mr-2" />
              Add API Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleAddKey}>
              <DialogHeader>
                <DialogTitle>Add New API Key</DialogTitle>
                <DialogDescription>
                  Add a new Cerebras API key for the AI chat system
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Key Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="e.g., Primary Reply Key"
                    required
                    data-testid="key-name-input"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="key">API Key</Label>
                  <Input
                    id="key"
                    name="key"
                    type="password"
                    placeholder="Enter Cerebras API key"
                    required
                    data-testid="api-key-input"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Key Type</Label>
                  <Select name="type" defaultValue="reply" required>
                    <SelectTrigger data-testid="key-type-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reply">Reply Keys (Chat responses)</SelectItem>
                      <SelectItem value="summary">Summary Keys (Conversation summaries)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddKeyDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addKeyMutation.isPending} data-testid="submit-add-key">
                  {addKeyMutation.isPending ? 'Adding...' : 'Add Key'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total API Keys</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalKeys}</div>
            <p className="text-xs text-muted-foreground">
              {activeKeys} active keys
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsage.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              API calls made
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Keys</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeKeys}</div>
            <p className="text-xs text-muted-foreground">
              Ready for rotation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* API Key Lists */}
      <Tabs defaultValue="reply" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="reply" data-testid="reply-keys-tab">
            Reply Keys ({apiKeys?.reply_keys.length || 0})
          </TabsTrigger>
          <TabsTrigger value="summary" data-testid="summary-keys-tab">
            Summary Keys ({apiKeys?.summary_keys.length || 0})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="reply" className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Keys used for generating AI responses to user messages
          </div>
          {apiKeys?.reply_keys.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">No reply keys configured</p>
              </CardContent>
            </Card>
          ) : (
            apiKeys?.reply_keys.map((key) => (
              <KeyCard key={key.id} keyItem={key} type="reply" />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="summary" className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Keys used for generating conversation summaries
          </div>
          {apiKeys?.summary_keys.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">No summary keys configured</p>
              </CardContent>
            </Card>
          ) : (
            apiKeys?.summary_keys.map((key) => (
              <KeyCard key={key.id} keyItem={key} type="summary" />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Key Dialog */}
      <Dialog open={editKeyDialog} onOpenChange={setEditKeyDialog}>
        <DialogContent>
          <form onSubmit={handleEditKey}>
            <DialogHeader>
              <DialogTitle>Edit API Key</DialogTitle>
              <DialogDescription>
                Update the name or status of this API key
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Key Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={selectedKey?.name || ''}
                  required
                  data-testid="edit-key-name-input"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select name="status" defaultValue={selectedKey?.status || 'active'} required>
                  <SelectTrigger data-testid="edit-key-status-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditKeyDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateKeyMutation.isPending} data-testid="submit-edit-key">
                {updateKeyMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}