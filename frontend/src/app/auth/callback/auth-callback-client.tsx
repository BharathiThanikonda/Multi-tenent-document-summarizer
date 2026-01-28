"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { authService } from "@/services/auth";

export default function AuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      const accessToken = searchParams.get("access_token");
      const refreshToken = searchParams.get("refresh_token");

      if (accessToken && refreshToken) {
        try {
          // Get user info
          localStorage.setItem("access_token", accessToken);
          localStorage.setItem("refresh_token", refreshToken);

          const user = await authService.getCurrentUser();
          setAuth(user, accessToken, refreshToken);

          router.push("/dashboard");
        } catch (error) {
          console.error("Auth callback error:", error);
          router.push("/login");
        }
      } else {
        router.push("/login");
      }
    };

    handleCallback();
  }, [searchParams, router, setAuth]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Authenticating...</h2>
        <p className="text-gray-600">Please wait while we sign you in.</p>
      </div>
    </div>
  );
}
