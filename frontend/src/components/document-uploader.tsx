"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"

export function DocumentUploader() {
  const router = useRouter()
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file) => file.type === "application/pdf" || file.type.includes("document"),
    )

    setFiles((prev) => [...prev, ...droppedFiles])
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      setFiles((prev) => [...prev, ...selectedFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setUploading(true)
    setProgress(0)

    try {
      const token = localStorage.getItem("access_token")
      
      if (!token) {
        alert("You are not logged in. Please log in and try again.")
        router.push("/login")
        return
      }
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      
      let uploaded = 0
      const totalFiles = files.length

      for (const file of files) {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch(`${apiUrl}/api/documents/upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        })

        if (!response.ok) {
          if (response.status === 401) {
            alert("Your session has expired. Please log in again.")
            localStorage.removeItem("access_token")
            router.push("/login")
            return
          }
          
          const error = await response.json().catch(() => ({ detail: "Unknown error" }))
          console.error("Upload failed:", error)
          alert(`Failed to upload ${file.name}: ${error.detail || "Unknown error"}`)
          continue
        }

        uploaded++
        setProgress((uploaded / totalFiles) * 100)
      }

      if (uploaded > 0) {
        // Successfully uploaded, redirect to documents page
        setTimeout(() => {
          router.push("/documents")
        }, 500)
      } else {
        alert("No files were uploaded successfully")
        setUploading(false)
      }
    } catch (error) {
      console.error("Upload error:", error)
      alert("An error occurred during upload. Please try again.")
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card
        className={`p-12 border-2 border-dashed transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "border-border bg-background"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Drag and drop your files here</h3>
            <p className="text-sm text-muted-foreground mt-1">or click to browse from your computer</p>
          </div>

          <input
            type="file"
            multiple
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button variant="outline" asChild>
              <span>Browse Files</span>
            </Button>
          </label>

          <p className="text-xs text-muted-foreground">Supports: PDF, DOCX (Office 2007+) only (Max 10MB per file)</p>
        </div>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Selected Files ({files.length})</h3>
          <div className="space-y-3">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-blue-600 dark:text-blue-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeFile(index)} disabled={uploading}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
            ))}
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Uploading...</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Upload Button */}
          <div className="mt-6 flex gap-3">
            <Button onClick={handleUpload} disabled={uploading} className="flex-1">
              {uploading ? "Processing..." : "Upload & Generate Summaries"}
            </Button>
            <Button variant="outline" onClick={() => setFiles([])} disabled={uploading}>
              Clear All
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
