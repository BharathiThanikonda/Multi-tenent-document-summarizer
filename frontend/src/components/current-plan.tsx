"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function CurrentPlan() {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">Current Plan</h2>
          <p className="text-sm text-muted-foreground mt-1">Your subscription details</p>
        </div>
        <Badge className="bg-primary">Active</Badge>
      </div>

      <div className="space-y-6">
        {/* Plan Details */}
        <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800">
          <div className="flex items-baseline gap-2 mb-2">
            <h3 className="text-2xl font-bold">Professional</h3>
            <span className="text-sm text-muted-foreground">Plan</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">$49</span>
            <span className="text-muted-foreground">/month</span>
          </div>
        </div>

        {/* Plan Features */}
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="text-sm font-medium">100 summaries per month</p>
              <p className="text-xs text-muted-foreground">73 used, 27 remaining</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm font-medium">Unlimited team members</p>
          </div>
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm font-medium">10GB storage</p>
          </div>
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm font-medium">Priority support</p>
          </div>
        </div>

        {/* Billing Info */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Next billing date</span>
            <span className="font-medium">Feb 15, 2025</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Amount</span>
            <span className="font-medium">$49.00</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button className="flex-1">Upgrade Plan</Button>
          <Button variant="outline" className="flex-1 bg-transparent">
            Cancel Subscription
          </Button>
        </div>
      </div>
    </Card>
  )
}
