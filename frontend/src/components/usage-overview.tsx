"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function UsageOverview() {
  const [usage, setUsage] = useState({
    summaries: { used: 0, limit: 100, percentage: 0 },
    storage: { used: 0, limit: 10, percentage: 0 },
    teamMembers: { used: 0, limit: null, percentage: 0 },
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsageData = async () => {
      try {
        const token = localStorage.getItem("access_token")
        if (!token) {
          setLoading(false)
          return
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        const response = await fetch(`${apiUrl}/api/analytics/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setUsage({
            summaries: {
              used: data.summaries_this_month || 0,
              limit: 100,
              percentage: Math.round(((data.summaries_this_month || 0) / 100) * 100),
            },
            storage: {
              used: data.storage_used_gb || 0,
              limit: data.storage_limit_gb || 10,
              percentage: Math.round(((data.storage_used_gb || 0) / (data.storage_limit_gb || 10)) * 100),
            },
            teamMembers: {
              used: data.active_team_members || 0,
              limit: null,
              percentage: 0,
            },
          })
        }
      } catch (error) {
        console.error("Error fetching usage data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsageData()
  }, [])

  if (loading) {
    return (
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Usage Overview</h2>
          <p className="text-sm text-muted-foreground mt-1">Your current usage this billing period</p>
        </div>
        <p className="text-muted-foreground">Loading usage data...</p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Usage Overview</h2>
        <p className="text-sm text-muted-foreground mt-1">Your current usage this billing period</p>
      </div>

      <div className="space-y-6">
        {/* Summaries Usage */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-medium">Document Summaries</p>
              <p className="text-xs text-muted-foreground">Resets on Feb 15, 2025</p>
            </div>
            <span className="text-sm font-medium">
              {usage.summaries.used} / {usage.summaries.limit}
            </span>
          </div>
          <Progress value={usage.summaries.percentage} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {usage.summaries.limit - usage.summaries.used} summaries remaining
          </p>
        </div>

        {/* Storage Usage */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Storage</p>
            <span className="text-sm font-medium">
              {usage.storage.used} GB / {usage.storage.limit} GB
            </span>
          </div>
          <Progress value={usage.storage.percentage} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {(usage.storage.limit - usage.storage.used).toFixed(1)} GB available
          </p>
        </div>

        {/* Team Members */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Team Members</p>
            <span className="text-sm font-medium">{usage.teamMembers.used}</span>
          </div>
          <div className="h-2 bg-muted rounded-full">
            <div className="h-full w-full bg-primary rounded-full" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Unlimited</p>
        </div>

        {/* Usage Alert */}
        {usage.summaries.percentage > 70 && (
          <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  You've used {usage.summaries.percentage}% of your monthly summaries
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  Consider upgrading to the Enterprise plan for unlimited summaries
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
