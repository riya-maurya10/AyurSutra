import apiClient from "../api/client";

import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
} from "../../types/auth";

export interface RegisterUserRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export interface RegisterUserResponse {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: "PATIENT";
}

export const login = async (
  credentials: LoginRequest
): Promise<LoginResponse> => {
  const response = await apiClient.post<ApiResponse<LoginResponse>>(
    "/auth/login",
    credentials
  );

  return response.data.data;
};

export const register = async (
  data: RegisterUserRequest
): Promise<RegisterUserResponse> => {
  const response = await apiClient.post<
    ApiResponse<RegisterUserResponse>
  >("/auth/register", {
    ...data,
    role: "PATIENT",
  });

  return response.data.data;
};



// import apiClient from "../api/client";

// import type {
//   ApiResponse,
//   LoginRequest,
//   LoginResponse,
// } from "../../types/auth";

// export const login = async (
//   credentials: LoginRequest
// ): Promise<LoginResponse> => {

//   const response = await apiClient.post<ApiResponse<LoginResponse>>(
//     "/auth/login",
//     credentials
//   );

//   return response.data.data;
// };


// export const register = async (data: {
//   fullName: string;
//   email: string;
//   phone: string;
//   password: string;
// }) => {

//   const response = await apiClient.post(
//     "/auth/register",
//     {
//       ...data,
//       role: "PATIENT",
//     }
//   );

//   return response.data;
// };