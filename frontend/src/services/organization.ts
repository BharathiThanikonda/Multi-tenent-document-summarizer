import apiClient from "@/lib/api-client";

export interface Organization {
  id: string;
  name: string;
  domain: string | null;
  subscription_status: string;
  plan_type: string;
  summaries_limit: number;
  summaries_used_current_month: number;
  is_active: boolean;
  created_at: string;
}

export interface SubscriptionStatus {
  organization_id: string;
  subscription_status: string;
  plan_type: string;
  stripe_subscription_id: string | null;
  summaries_limit: number;
  summaries_used_current_month: number;
}

export const organizationService = {
  getOrganization: async (): Promise<Organization> => {
    const response = await apiClient.get("/organizations/");
    return response.data;
  },

  updateOrganization: async (data: {
    name?: string;
    domain?: string;
  }): Promise<Organization> => {
    const response = await apiClient.put("/organizations/", data);
    return response.data;
  },

  getSubscriptionStatus: async (): Promise<SubscriptionStatus> => {
    const response = await apiClient.get("/billing/subscription");
    return response.data;
  },

  createCheckoutSession: async (
    planType: "basic" | "pro"
  ): Promise<{ session_id: string; url: string }> => {
    const response = await apiClient.post(
      `/billing/create-checkout-session?plan_type=${planType}`
    );
    return response.data;
  },

  cancelSubscription: async (): Promise<void> => {
    await apiClient.post("/billing/cancel-subscription");
  },
};
