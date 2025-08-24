import React, { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Upload, Image, Trash2, Eye } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

interface LogoSettings {
  logoUrl?: string;
  logoName?: string;
  uploadedAt?: string;
}

export default function LogoManagement() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch current logo settings
  const { data: logoSettings, isLoading } = useQuery<LogoSettings>({
    queryKey: ['/api/admin/logo-settings'],
    retry: 1
  });

  // Upload logo mutation
  const uploadLogoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await fetch('/api/admin/upload-logo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload logo');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/logo-settings'] });
      toast({
        title: "Success",
        description: "Logo uploaded successfully! The new logo will appear across all pages.",
        variant: "default"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive"
      });
    },
    onSettled: () => {
      setIsUploading(false);
    }
  });

  // Delete logo mutation
  const deleteLogoMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/admin/delete-logo', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete logo');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/logo-settings'] });
      toast({
        title: "Success",
        description: "Logo deleted successfully! The default logo will be restored.",
        variant: "default"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file (PNG, JPG, GIF, SVG)",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    uploadLogoMutation.mutate(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteLogo = () => {
    if (window.confirm('Are you sure you want to delete the current logo? This will restore the default logo.')) {
      deleteLogoMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Website Logo Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="w-5 h-5" />
          Website Logo Management
        </CardTitle>
        <CardDescription>
          Upload a custom logo that will appear on the homepage, login, and register pages.
          Recommended size: 200x200px or larger. Supported formats: PNG, JPG, GIF, SVG.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Logo Display */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Current Logo</Label>
          <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
            {logoSettings?.logoUrl ? (
              <>
                <div className="flex items-center justify-center w-16 h-16 border rounded-lg bg-white">
                  <img 
                    src={logoSettings.logoUrl} 
                    alt="Current logo" 
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Custom Logo Uploaded</p>
                  {logoSettings.logoName && (
                    <p className="text-xs text-muted-foreground">
                      File: {logoSettings.logoName}
                    </p>
                  )}
                  {logoSettings.uploadedAt && (
                    <p className="text-xs text-muted-foreground">
                      Uploaded: {new Date(logoSettings.uploadedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleDeleteLogo}
                  disabled={deleteLogoMutation.isPending}
                  data-testid="button-delete-logo"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center w-16 h-16 border rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                  <span className="text-2xl font-bold text-white">T</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Default Logo (Placeholder)</p>
                  <p className="text-xs text-muted-foreground">
                    Upload a custom logo to replace the default "T" icon
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Upload Section */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Upload New Logo</Label>
          <div className="flex flex-col gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              data-testid="input-logo-file"
            />
            <Button
              onClick={handleUploadClick}
              disabled={isUploading}
              className="w-full"
              data-testid="button-upload-logo"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? "Uploading..." : "Choose Logo File"}
            </Button>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Supported formats: PNG, JPG, GIF, SVG</p>
            <p>• Maximum file size: 5MB</p>
            <p>• Recommended dimensions: 200x200px or larger</p>
            <p>• Logo will automatically replace the "T" icon across all pages</p>
          </div>
        </div>

        {/* Preview Information */}
        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Preview Information
            </span>
          </div>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Once uploaded, your logo will immediately replace the placeholder "T" icon on:
            Homepage header, Login page, Register page, and all other TradePilot branding locations.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}