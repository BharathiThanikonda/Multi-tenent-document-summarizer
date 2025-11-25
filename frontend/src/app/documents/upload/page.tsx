import { DashboardHeader } from "@/components/dashboard-header"
import { DocumentUploader } from "@/components/document-uploader"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardHeader />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <div>
              <h1 className="text-3xl font-bold text-foreground">Upload Document</h1>
              <p className="text-muted-foreground mt-1">Upload PDFs or documents to generate AI summaries</p>
            </div>
          </div>

          {/* Uploader */}
          <DocumentUploader />
        </div>
      </main>
    </div>
  )
}
