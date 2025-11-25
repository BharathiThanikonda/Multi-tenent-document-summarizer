import apiClient from "@/lib/api-client";

export interface Summary {
  id: string;
  document_id: string;
  summary_text: string;
  summary_type: string;
  tokens_used: number | null;
  organization_id: string;
  created_at: string;
}

export const summaryService = {
  createSummary: async (
    documentId: string,
    summaryType: "brief" | "standard" | "detailed" = "standard"
  ): Promise<Summary> => {
    const response = await apiClient.post(
      `/summaries/?document_id=${documentId}&summary_type=${summaryType}`
    );
    return response.data;
  },

  getSummariesForDocument: async (documentId: string): Promise<Summary[]> => {
    const response = await apiClient.get(`/summaries/document/${documentId}`);
    return response.data;
  },

  getSummary: async (summaryId: string): Promise<Summary> => {
    const response = await apiClient.get(`/summaries/${summaryId}`);
    return response.data;
  },

  listSummaries: async (): Promise<Summary[]> => {
    const response = await apiClient.get("/summaries/");
    return response.data;
  },

  deleteSummary: async (summaryId: string): Promise<void> => {
    await apiClient.delete(`/summaries/${summaryId}`);
  },
};
