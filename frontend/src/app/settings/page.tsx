"use client";

import { DashboardHeader } from "@/components/dashboard-header";
import { WorkspaceSettings } from "@/components/workspace-settings";
import { TeamMembers } from "@/components/team-members";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        <Tabs defaultValue="workspace" className="w-full">
          <TabsList>
            <TabsTrigger value="workspace">Workspace</TabsTrigger>
            <TabsTrigger value="team">Team Members</TabsTrigger>
          </TabsList>

          <TabsContent value="workspace" className="mt-6">
            <WorkspaceSettings />
          </TabsContent>

          <TabsContent value="team" className="mt-6">
            <TeamMembers />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
