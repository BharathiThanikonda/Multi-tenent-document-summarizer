"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Invoice {
  id: string
  date: string
  amount: number
  status: string
  downloadUrl?: string
}

export function BillingHistory() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const token = localStorage.getItem("access_token")
        if (!token) {
          setLoading(false)
          return
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        const response = await fetch(`${apiUrl}/api/billing/invoices`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setInvoices(data)
        } else {
          setInvoices([])
        }
      } catch (error) {
        console.error("Error fetching invoices:", error)
        setInvoices([])
      } finally {
        setLoading(false)
      }
    }

    fetchInvoices()
  }, [])

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold">Billing History</h2>
          <p className="text-sm text-muted-foreground mt-1">Download your past invoices</p>
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading invoices...</p>
      ) : invoices.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No invoices yet</p>
          <p className="text-sm text-muted-foreground mt-1">Your billing history will appear here</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
        {invoices.map((invoice) => (
          <div
            key={invoice.id}
            className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-green-600 dark:text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{invoice.id}</p>
                  <Badge
                    variant="secondary"
                    className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                  >
                    {invoice.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{invoice.date}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">${invoice.amount.toFixed(2)}</span>
              <Button variant="ghost" size="sm">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download
              </Button>
            </div>
          </div>
        ))}
          </div>

          <div className="mt-4">
            <Button variant="outline" className="w-full bg-transparent" size="sm">
              View All Invoices
            </Button>
          </div>
        </>
      )}
    </Card>
  )
}
