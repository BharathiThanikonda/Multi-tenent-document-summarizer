import apiClient from "@/lib/api-client";

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin" | "member";
  organization_id: string;
  is_active: boolean;
  created_at: string;
}

export const authService = {
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get("/users/me");
    return response.data;
  },

  loginWithGoogle: () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    window.location.href = `${apiUrl}/api/auth/google/login`;
  },

  loginWithMicrosoft: () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    window.location.href = `${apiUrl}/api/auth/microsoft/login`;
  },

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/login";
  },
};
