"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"

interface Summary {
  id: string
  summary_text: string
  summary_type: string
  created_at: string
}

export function DocumentSummary({ documentId }: { documentId: string }) {
  const [copied, setCopied] = useState(false)
  const [summaries, setSummaries] = useState<Summary[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    fetchSummaries()
  }, [documentId])

  const fetchSummaries = async () => {
    try {
      const token = localStorage.getItem("access_token")
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      
      const response = await fetch(`${apiUrl}/api/summaries/document/${documentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Fetched summaries:", data)
        setSummaries(data)
      }
    } catch (error) {
      console.error("Error fetching summaries:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const token = localStorage.getItem("access_token")
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      
      const response = await fetch(`${apiUrl}/api/summaries/?document_id=${documentId}&summary_type=standard`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const newSummary = await response.json()
        console.log("Generated summary:", newSummary)
        // Refresh summaries list
        await fetchSummaries()
      } else {
        const error = await response.json()
        alert(`Failed to generate summary: ${error.detail || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error generating summary:", error)
      alert("An error occurred while generating summary")
    } finally {
      setGenerating(false)
    }
  }

  const latestSummary = summaries.length > 0 ? summaries[summaries.length - 1] : null

  const handleCopy = () => {
    if (!latestSummary) return
    
    navigator.clipboard.writeText(latestSummary.summary_text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <Card className="p-6 h-[600px] flex items-center justify-center">
        <p className="text-muted-foreground">Loading summary...</p>
      </Card>
    )
  }

  return (
    <Card className="p-6 h-[600px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">AI Summary</h3>
          {latestSummary && (
            <Badge variant="secondary" className="text-xs">
              Generated
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          {latestSummary && (
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Copy
                </>
              )}
            </Button>
          )}
          <Button 
            size="sm" 
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? "Generating..." : summaries.length > 0 ? "Regenerate" : "Generate Summary"}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!latestSummary ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <svg
              className="w-16 h-16 text-muted-foreground/50 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-lg font-medium mb-1">No summary yet</h3>
            <p className="text-muted-foreground mb-4">Generate an AI summary to get insights from this document</p>
          </div>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
              {latestSummary.summary_text}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
