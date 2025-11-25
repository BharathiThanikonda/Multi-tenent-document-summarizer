"use client"

import { Card } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

interface DocumentData {
  id: string
  filename: string
  original_filename: string
  file_type: string
  file_path: string
  status: string
}

export function DocumentViewer({ documentId }: { documentId: string }) {
  const [document, setDocument] = useState<DocumentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const token = localStorage.getItem("access_token")
        const response = await fetch(`${apiUrl}/api/documents/${documentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to load document")
        }

        const data = await response.json()
        setDocument(data)

        // Fetch the file blob with authentication
        if (data.file_type === "application/pdf") {
          const fileResponse = await fetch(`${apiUrl}/api/documents/${documentId}/download`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (fileResponse.ok) {
            const blob = await fileResponse.blob()
            const url = URL.createObjectURL(blob)
            setFileUrl(url)
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load document")
      } finally {
        setLoading(false)
      }
    }

    fetchDocument()

    // Cleanup blob URL on unmount
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl)
      }
    }
  }, [documentId, apiUrl])

  if (loading) {
    return (
      <Card className="p-6 h-[600px] flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading document...</p>
        </div>
      </Card>
    )
  }

  if (error || !document) {
    return (
      <Card className="p-6 h-[600px] flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="text-sm">{error || "Document not found"}</p>
        </div>
      </Card>
    )
  }

  const isPDF = document.file_type === "application/pdf"
  const downloadUrl = `${apiUrl}/api/documents/${documentId}/download`

  const handleDownload = async () => {
    try {
      const token = localStorage.getItem("access_token")
      const response = await fetch(downloadUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const link = window.document.createElement("a")
        link.href = url
        link.download = document.original_filename
        window.document.body.appendChild(link)
        link.click()
        window.document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }
    } catch (err) {
      console.error("Download failed:", err)
    }
  }

  return (
    <Card className="p-6 h-[600px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Document Preview</h3>
        <Button variant="outline" size="sm" onClick={handleDownload}>
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

      <div className="flex-1 bg-muted/30 rounded-lg overflow-hidden">
        {isPDF && fileUrl ? (
          <iframe
            src={fileUrl}
            className="w-full h-full"
            title={document.original_filename}
          />
        ) : isPDF && !fileUrl ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground p-6">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-sm font-medium mb-2">{document.original_filename}</p>
              <p className="text-xs mb-4">Preview not available for DOCX files</p>
              <Button variant="outline" onClick={handleDownload}>
                Download to View
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
