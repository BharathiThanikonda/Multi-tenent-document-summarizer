"use client"

import { use, useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DocumentViewer } from "@/components/document-viewer"
import { DocumentSummary } from "@/components/document-summary"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Document {
  id: string
  original_filename: string
  uploaded_by: string
  created_at: string
  page_count: number
  file_size: number
}

export default function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [document, setDocument] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const token = localStorage.getItem("access_token")
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        
        const response = await fetch(`${apiUrl}/api/documents/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setDocument(data)
        }
      } catch (error) {
        console.error("Error fetching document:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDocument()
  }, [id])

  const formatFileSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2) + " MB"
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    
    if (diffHours < 1) return "Just now"
    if (diffHours < 24) return `${diffHours} hours ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return "1 day ago"
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link href="/documents">
              <Button variant="ghost" size="icon">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Button>
            </Link>
            {loading ? (
              <div className="flex-1">
                <div className="h-8 bg-muted animate-pulse rounded w-64 mb-2"></div>
                <div className="h-4 bg-muted animate-pulse rounded w-96"></div>
              </div>
            ) : document ? (
              <>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-foreground">{document.original_filename}</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Uploaded {formatDate(document.created_at)} • {document.page_count || 0} pages • {formatFileSize(document.file_size)}
                  </p>
                </div>
                <Button variant="outline">
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
              </>
            ) : (
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-foreground">Document not found</h1>
              </div>
            )}
          </div>

          {/* Main Grid */}
          {document && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DocumentViewer documentId={id} />
              <DocumentSummary documentId={id} />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
