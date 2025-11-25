"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface Organization {
  id: string;
  name: string;
  domain?: string;
  plan_type: string;
  auto_generate_summaries: boolean;
  email_notifications: boolean;
  require_approval: boolean;
  two_factor_auth: boolean;
  document_retention_days: number;
  allow_data_export: boolean;
}

export function WorkspaceSettings() {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceDomain, setWorkspaceDomain] = useState("");
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [requireApproval, setRequireApproval] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [retentionDays, setRetentionDays] = useState(90);
  const [allowExport, setAllowExport] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch(
          "http://localhost:8000/api/organizations/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setOrganization(data);
          setWorkspaceName(data.name || "");
          setWorkspaceDomain(data.domain || "");
          setAutoGenerate(data.auto_generate_summaries ?? true);
          setEmailNotifications(data.email_notifications ?? false);
          setRequireApproval(data.require_approval ?? false);
          setTwoFactorAuth(data.two_factor_auth ?? false);
          setRetentionDays(data.document_retention_days ?? 90);
          setAllowExport(data.allow_data_export ?? true);
        }
      } catch (error) {
        console.error("Failed to fetch organization:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganization();
  }, []);

  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("http://localhost:8000/api/organizations/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: workspaceName,
          domain: workspaceDomain,
          auto_generate_summaries: autoGenerate,
          email_notifications: emailNotifications,
          require_approval: requireApproval,
          two_factor_auth: twoFactorAuth,
          document_retention_days: retentionDays,
          allow_data_export: allowExport,
        }),
      });

      if (response.ok) {
        const updatedOrg = await response.json();
        setOrganization(updatedOrg);
        toast({
          title: "Settings saved",
          description:
            "Your workspace settings have been updated successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to save workspace settings.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast({
        title: "Error",
        description: "An error occurred while saving settings.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteWorkspace = async () => {
    const confirmed = window.confirm(
      "Are you absolutely sure you want to delete this workspace? This action cannot be undone and will permanently delete all documents, summaries, and team members."
    );

    if (!confirmed) return;

    const doubleConfirm = window.prompt(
      `Type "${workspaceName}" to confirm deletion:`
    );

    if (doubleConfirm !== workspaceName) {
      toast({
        title: "Deletion cancelled",
        description: "Workspace name did not match.",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("http://localhost:8000/api/organizations/", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Workspace deleted",
          description: "Your workspace has been permanently deleted.",
        });
        // Clear tokens and redirect to signup
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/signup";
      } else {
        toast({
          title: "Error",
          description: "Failed to delete workspace.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to delete workspace:", error);
      toast({
        title: "Error",
        description: "An error occurred while deleting workspace.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              Loading workspace settings...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">General Settings</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workspace-name">Workspace Name</Label>
            <Input
              id="workspace-name"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              placeholder="Your organization name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="workspace-slug">Workspace Domain</Label>
            <Input
              id="workspace-slug"
              value={workspaceDomain}
              onChange={(e) => setWorkspaceDomain(e.target.value)}
              placeholder="example.com"
              className="flex-1"
            />
          </div>
          <div className="pt-2">
            <Button onClick={handleSaveChanges}>Save Changes</Button>
          </div>
        </div>
      </Card>

      {/* Document Settings */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Document Settings</h2>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-generate Summaries</Label>
              <p className="text-sm text-muted-foreground">
                Automatically generate AI summaries when documents are uploaded
              </p>
            </div>
            <Switch 
              checked={autoGenerate} 
              onCheckedChange={setAutoGenerate}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Notify team members when new documents are processed
              </p>
            </div>
            <Switch 
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Approval</Label>
              <p className="text-sm text-muted-foreground">
                Admins must approve documents before processing
              </p>
            </div>
            <Switch 
              checked={requireApproval}
              onCheckedChange={setRequireApproval}
            />
          </div>
          <div className="pt-2">
            <Button onClick={handleSaveChanges}>Save Changes</Button>
          </div>
        </div>
      </Card>

      {/* Security Settings */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Security & Privacy</h2>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Require 2FA for all team members
              </p>
            </div>
            <Switch 
              checked={twoFactorAuth}
              onCheckedChange={setTwoFactorAuth}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Document Retention</Label>
              <p className="text-sm text-muted-foreground">
                Automatically delete documents after {retentionDays} days
              </p>
            </div>
            <Switch 
              checked={retentionDays > 0}
              onCheckedChange={(checked) => setRetentionDays(checked ? 90 : 0)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Data Export</Label>
              <p className="text-sm text-muted-foreground">
                Allow members to export their data
              </p>
            </div>
            <Switch 
              checked={allowExport}
              onCheckedChange={setAllowExport}
            />
          </div>
          <div className="pt-2">
            <Button onClick={handleSaveChanges}>Save Changes</Button>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 border-destructive">
        <h2 className="text-lg font-semibold text-destructive mb-4">
          Danger Zone
        </h2>
        <div className="space-y-4">
          <div className="flex items-start justify-between p-4 rounded-lg border border-destructive/50 bg-destructive/5">
            <div>
              <h3 className="font-medium text-sm">Delete Workspace</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Permanently delete this workspace and all associated data. This
                action cannot be undone.
              </p>
            </div>
            <Button 
              variant="destructive" 
              className="flex-shrink-0"
              onClick={handleDeleteWorkspace}
            >
              Delete
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
