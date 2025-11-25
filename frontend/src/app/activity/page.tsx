"use client";

import { DashboardHeader } from "@/components/dashboard-header";
import { ActivityLog } from "@/components/activity-log";

export default function ActivityPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Activity Log</h1>
        <ActivityLog />
      </main>
    </div>
  );
}
