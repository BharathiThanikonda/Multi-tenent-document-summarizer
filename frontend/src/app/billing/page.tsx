import { DashboardHeader } from "@/components/dashboard-header"
import { CurrentPlan } from "@/components/current-plan"
import { UsageOverview } from "@/components/usage-overview"
import { PlanComparison } from "@/components/plan-comparison"
import { BillingHistory } from "@/components/billing-history"
import { PaymentMethod } from "@/components/payment-method"

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Billing & Subscription</h1>
            <p className="text-muted-foreground mt-1">Manage your subscription, usage, and payment details</p>
          </div>

          {/* Current Plan & Usage */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CurrentPlan />
            <UsageOverview />
          </div>

          {/* Plan Comparison */}
          <PlanComparison />

          {/* Payment & History */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PaymentMethod />
            <BillingHistory />
          </div>
        </div>
      </main>
    </div>
  )
}
