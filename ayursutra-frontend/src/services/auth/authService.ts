import apiClient from "../api/client";

import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
} from "../../types/auth";

export const login = async (
  credentials: LoginRequest
): Promise<LoginResponse> => {

  const response = await apiClient.post<ApiResponse<LoginResponse>>(
    "/auth/login",
    credentials
  );

  return response.data.data;
};


export const register = async (data: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}) => {

  const response = await apiClient.post(
    "/auth/register",
    {
      ...data,
      role: "PATIENT",
    }
  );

  return response.data;
};