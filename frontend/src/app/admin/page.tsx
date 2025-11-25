import { DashboardHeader } from "@/components/dashboard-header";
import { TeamMembers } from "@/components/team-members";
import { WorkspaceSettings } from "@/components/workspace-settings";
import { ActivityLog } from "@/components/activity-log";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-muted-foreground mt-1">
              Manage your workspace, team members, and settings
            </p>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="team" className="space-y-6">
            <TabsList>
              <TabsTrigger value="team">Team Members</TabsTrigger>
              <TabsTrigger value="settings">Workspace Settings</TabsTrigger>
              <TabsTrigger value="activity">Activity Log</TabsTrigger>
            </TabsList>

            <TabsContent value="team" className="space-y-6">
              <TeamMembers />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <WorkspaceSettings />
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <ActivityLog />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
