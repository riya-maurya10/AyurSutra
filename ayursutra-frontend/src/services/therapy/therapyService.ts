import apiClient from "../api/client";

export interface Therapy {
  id: string;
  name: string;
  stage: string;
  description: string | null;
  durationMinutes: number;
  active: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// =====================================================
// GET ALL THERAPIES
// =====================================================

export const getAllTherapies = async (): Promise<Therapy[]> => {
  const response = await apiClient.get<ApiResponse<Therapy[]>>(
    "/therapies"
  );

  return response.data.data;
};

// =====================================================
// GET THERAPY BY ID
// =====================================================

export const getTherapyById = async (
  id: string
): Promise<Therapy> => {
  const response = await apiClient.get<ApiResponse<Therapy>>(
    `/therapies/${id}`
  );

  return response.data.data;
};