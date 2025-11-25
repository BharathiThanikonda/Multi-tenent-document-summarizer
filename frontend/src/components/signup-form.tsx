"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";

export function SignupForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: "",
    fullName: "",
    email: "",
    password: "",
    agreeToTerms: false,
  });

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            organization_name: formData.organizationName,
            full_name: formData.fullName,
            email: formData.email,
            password: formData.password,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        router.push("/dashboard");
      } else {
        const error = await response.json();
        alert(`Signup failed: ${error.detail || "Unknown error"}`);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("Network error. Please try again.");
      setIsLoading(false);
    }
  };

  const handleOAuthSignup = async (provider: "google" | "microsoft") => {
    setIsLoading(true);
    // OAuth uses same login flow - new users are auto-created
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/${provider}/login`;
  };

  return (
    <div className="space-y-6">
      {/* OAuth Buttons */}
      <div className="space-y-3">
        <Button
          type="button"
          variant="outline"
          className="w-full bg-transparent"
          onClick={() => handleOAuthSignup("google")}
          disabled={isLoading}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign up with Google
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full bg-transparent"
          onClick={() => handleOAuthSignup("microsoft")}
          disabled={isLoading}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="#f25022" d="M0 0h11.5v11.5H0z" />
            <path fill="#00a4ef" d="M12.5 0H24v11.5H12.5z" />
            <path fill="#7fba00" d="M0 12.5h11.5V24H0z" />
            <path fill="#ffb900" d="M12.5 12.5H24V24H12.5z" />
          </svg>
          Sign up with Microsoft
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or sign up with email
          </span>
        </div>
      </div>

      {/* Email Signup Form */}
      <form onSubmit={handleEmailSignup} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="organization">Organization Name</Label>
          <Input
            id="organization"
            type="text"
            placeholder="Acme Inc."
            value={formData.organizationName}
            onChange={(e) =>
              setFormData({ ...formData, organizationName: e.target.value })
            }
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            type="text"
            placeholder="John Doe"
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Work Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="john@acme.com"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Min. 8 characters"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
            minLength={8}
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">
            Must be at least 8 characters long
          </p>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="terms"
            checked={formData.agreeToTerms}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, agreeToTerms: checked as boolean })
            }
            disabled={isLoading}
          />
          <label
            htmlFor="terms"
            className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I agree to the{" "}
            <a href="/terms" className="text-primary hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </label>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || !formData.agreeToTerms}
        >
          {isLoading ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <p className="text-xs text-center text-muted-foreground">
        By signing up, you'll start a 14-day free trial. No credit card
        required.
      </p>
    </div>
  );
}
