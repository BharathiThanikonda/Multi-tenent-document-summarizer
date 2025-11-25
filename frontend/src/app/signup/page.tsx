import { SignupForm } from "@/components/signup-form"
import { Logo } from "@/components/logo"
import Link from "next/link"

export default function SignupPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 p-12 flex-col justify-between">
        <div>
          <Logo variant="light" />
        </div>
        <div className="text-white">
          <h1 className="text-4xl font-bold mb-4 text-balance">Start Summarizing Documents Today</h1>
          <p className="text-lg text-blue-100 text-pretty">
            Join hundreds of companies using AI to process documents faster. Get started with a 14-day free trial.
          </p>
        </div>
        <div className="space-y-4 text-white/90">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-green-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <div className="font-semibold">Multi-tenant Architecture</div>
              <div className="text-sm text-blue-100">Isolated workspaces for each organization</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-green-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <div className="font-semibold">Role-based Access</div>
              <div className="text-sm text-blue-100">Admin and member roles with granular permissions</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-green-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <div className="font-semibold">Flexible Billing</div>
              <div className="text-sm text-blue-100">Pay only for what you use with Stripe integration</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden mb-8">
            <Logo />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-foreground">Create your account</h2>
            <p className="mt-2 text-muted-foreground">Get started with your free trial</p>
          </div>
          <SignupForm />
          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
