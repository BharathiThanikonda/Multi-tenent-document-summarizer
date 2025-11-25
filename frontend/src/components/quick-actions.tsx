import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function QuickActions() {
  const actions = [
    {
      title: "Upload Document",
      description: "Upload a new PDF or document for AI summarization",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
      ),
      href: "/documents/upload",
      variant: "primary" as const,
    },
    {
      title: "Invite Team Member",
      description: "Add new members to your workspace",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
          />
        </svg>
      ),
      href: "/admin",
      variant: "secondary" as const,
    },
    {
      title: "View Usage",
      description: "Check your plan limits and usage statistics",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      href: "/billing",
      variant: "secondary" as const,
    },
  ];

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-6">Quick Actions</h2>

      <div className="space-y-4">
        {actions.map((action) => (
          <Link key={action.title} href={action.href}>
            <div className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  action.variant === "primary"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {action.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm">{action.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 text-pretty">
                  {action.description}
                </p>
              </div>
              <svg
                className="w-5 h-5 text-muted-foreground flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      {/* Plan Info */}
      <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Professional Plan
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              73 of 100 summaries used this month
            </p>
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-blue-600 dark:text-blue-400 mt-2"
            >
              Upgrade Plan
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
