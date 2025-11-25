import { DashboardHeader } from "@/components/dashboard-header"
import { DocumentLibrary } from "@/components/document-library"
import { DocumentFilters } from "@/components/document-filters"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DocumentsPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Documents</h1>
              <p className="text-muted-foreground mt-1">Manage and view all your processed documents</p>
            </div>
            <Link href="/documents/upload">
              <Button>
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                Upload Document
              </Button>
            </Link>
          </div>

          {/* Filters */}
          <DocumentFilters />

          {/* Document Library */}
          <DocumentLibrary />
        </div>
      </main>
    </div>
  )
}
