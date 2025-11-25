"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function PlanComparison() {
  const plans = [
    {
      name: "Starter",
      price: 19,
      description: "Perfect for small teams getting started",
      features: ["25 summaries/month", "5 team members", "2GB storage", "Email support"],
      current: false,
    },
    {
      name: "Professional",
      price: 49,
      description: "For growing teams with higher volume",
      features: ["100 summaries/month", "Unlimited team members", "10GB storage", "Priority support"],
      current: true,
    },
    {
      name: "Enterprise",
      price: 149,
      description: "Advanced features for large organizations",
      features: [
        "Unlimited summaries",
        "Unlimited team members",
        "100GB storage",
        "Dedicated support",
        "Custom integrations",
        "SSO",
      ],
      current: false,
    },
  ]

  const handleChangePlan = (planName: string) => {
    // TODO: Integrate with Stripe Checkout
    // Create checkout session via FastAPI backend
    // POST /api/billing/checkout with plan_id and tenant_id
    console.log("[v0] Changing to plan:", planName)
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Available Plans</h2>
        <p className="text-sm text-muted-foreground mt-1">Choose the plan that best fits your needs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative p-6 rounded-lg border-2 transition-all ${
              plan.current ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
          >
            {plan.current && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Current Plan</Badge>}

            <div className="text-center mb-6">
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="text-3xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-sm text-muted-foreground text-balance">{plan.description}</p>
            </div>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <svg
                    className="w-5 h-5 text-green-600 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              variant={plan.current ? "outline" : "default"}
              className="w-full"
              disabled={plan.current}
              onClick={() => handleChangePlan(plan.name)}
            >
              {plan.current ? "Current Plan" : "Upgrade"}
            </Button>
          </div>
        ))}
      </div>
    </Card>
  )
}
