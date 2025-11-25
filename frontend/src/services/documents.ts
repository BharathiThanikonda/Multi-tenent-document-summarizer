import apiClient from "@/lib/api-client";

export interface Document {
  id: string;
  filename: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  status: string;
  page_count: number | null;
  organization_id: string;
  uploaded_by: string;
  created_at: string;
}

export const documentService = {
  uploadDocument: async (file: File): Promise<Document> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post("/documents/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  listDocuments: async (): Promise<Document[]> => {
    const response = await apiClient.get("/documents/");
    return response.data;
  },

  getDocument: async (documentId: string): Promise<Document> => {
    const response = await apiClient.get(`/documents/${documentId}`);
    return response.data;
  },

  deleteDocument: async (documentId: string): Promise<void> => {
    await apiClient.delete(`/documents/${documentId}`);
  },
};
