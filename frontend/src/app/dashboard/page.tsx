"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { StatsOverview } from "@/components/stats-overview"
import { RecentDocuments } from "@/components/recent-documents"
import { QuickActions } from "@/components/quick-actions"
import { UsageChart } from "@/components/usage-chart"

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token) {
      router.push("/login")
    }
  }, [router])

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Welcome back</h1>
            <p className="text-muted-foreground mt-1">Here's what's happening with your documents today</p>
          </div>

          {/* Stats Overview */}
          <StatsOverview />

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Recent Documents & Usage */}
            <div className="lg:col-span-2 space-y-6">
              <RecentDocuments />
              <UsageChart />
            </div>

            {/* Right Column - Quick Actions */}
            <div>
              <QuickActions />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
