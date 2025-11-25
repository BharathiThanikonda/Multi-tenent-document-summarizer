"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function PaymentMethod() {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold">Payment Method</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage your payment details</p>
        </div>
        <Button variant="outline" size="sm">
          Update
        </Button>
      </div>

      <div className="space-y-4">
        {/* Card Display */}
        <div className="p-4 rounded-lg border border-border bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <div className="flex items-start justify-between mb-8">
            <div className="text-xs font-medium opacity-70">CREDIT CARD</div>
            <Badge variant="secondary" className="bg-white/20 text-white">
              Default
            </Badge>
          </div>

          <div className="space-y-4">
            <div className="font-mono text-lg tracking-wider">•••• •••• •••• 4242</div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs opacity-70 mb-1">Cardholder</div>
                <div className="text-sm font-medium">John Doe</div>
              </div>
              <div>
                <div className="text-xs opacity-70 mb-1">Expires</div>
                <div className="text-sm font-medium">12/26</div>
              </div>
              <div className="text-right">
                <svg className="h-8 w-12" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="15" cy="16" r="10" fill="#EB001B" />
                  <circle cx="33" cy="16" r="10" fill="#F79E1B" />
                  <path
                    d="M24 8.5c2.8 2.2 4.5 5.6 4.5 9.5s-1.7 7.3-4.5 9.5c-2.8-2.2-4.5-5.6-4.5-9.5s1.7-7.3 4.5-9.5z"
                    fill="#FF5F00"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Billing Address */}
        <div className="p-4 rounded-lg border border-border">
          <h3 className="text-sm font-medium mb-2">Billing Address</h3>
          <p className="text-sm text-muted-foreground">
            123 Business Street
            <br />
            San Francisco, CA 94102
            <br />
            United States
          </p>
        </div>

        {/* Additional Info */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <svg
            className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <p className="text-xs text-blue-900 dark:text-blue-100">
            Your payment information is securely processed by Stripe. We never store your card details on our servers.
          </p>
        </div>
      </div>
    </Card>
  )
}
