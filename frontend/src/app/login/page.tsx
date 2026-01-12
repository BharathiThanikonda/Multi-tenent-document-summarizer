import { LoginForm } from "@/components/login-form";
import { Logo } from "@/components/logo";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 p-12 flex-col justify-between">
        <div>
          <Logo variant="light" />
        </div>
        <div className="text-white">
          <h1 className="text-4xl font-bold mb-4 text-balance">
            Transform Documents into Insights
          </h1>
          <p className="text-lg text-blue-100 text-pretty">
            AI-powered document summaries for modern teams. Upload PDFs and get
            intelligent summaries in seconds.
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden mb-8">
            <Logo />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-foreground">Welcome back</h2>
            <p className="mt-2 text-muted-foreground">
              Sign in to your workspace
            </p>
          </div>
          <LoginForm />
          <div className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
