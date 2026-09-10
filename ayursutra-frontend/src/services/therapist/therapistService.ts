import apiClient from "../api/client";

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface TherapistResponse {
    id: string;
    userId: string;
    fullName: string;
    email: string;
    phone: string;
    specialization: string;
    qualification: string;
    experienceYears: number;
    therapistType: string;
    available: boolean;
}

export interface PatientResponse {
    id: string;
    userId: string;
    fullName: string;
    email: string;
    phone: string;
    age: number | null;
    gender: string | null;
    address: string | null;
    medicalHistory: string | null;
}

export type TherapySessionStatus =
    | "PLANNED"
    | "SCHEDULED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED"
    | "SKIPPED";

export interface TherapySession {
    id: string;
    therapyPlanId: string;
    patientId: string;
    therapistId: string | null;
    roomId: string | null;
    therapyId: string;
    therapyName: string;
    dayNumber: number;
    sequenceOrder: number;
    sessionDate: string;
    startTime: string | null;
    endTime: string | null;
    plannedDurationMinutes: number;
    actualDurationMinutes: number | null;
    status: TherapySessionStatus;
    notes: string | null;
}

export interface TherapySessionUpdateRequest {
    therapyPlanId: string;
    patientId: string;
    therapistId?: string;
    roomId?: string;
    therapyId: string;
    therapyName: string;
    dayNumber: number;
    sequenceOrder: number;
    sessionDate: string;
    startTime?: string;
    endTime?: string;
    plannedDurationMinutes: number;
    actualDurationMinutes?: number;
    status?: TherapySessionStatus;
    notes?: string;
}

export const getTherapistById = async (
    id: string
): Promise<TherapistResponse> => {
    const response = await apiClient.get<ApiResponse<TherapistResponse>>(
        `/therapists/${id}`
    );

    return response.data.data;
};

export const getMyTherapistProfile = async (): Promise<TherapistResponse> => {
    const response = await apiClient.get<ApiResponse<TherapistResponse>>(
        "/therapists/me"
    );

    return response.data.data;
};

export const getAllTherapists = async (): Promise<TherapistResponse[]> => {
    const response = await apiClient.get<ApiResponse<TherapistResponse[]>>(
        "/therapists"
    );

    return response.data.data;
};

export const getMyPatients = async (): Promise<PatientResponse[]> => {
    const response = await apiClient.get<ApiResponse<PatientResponse[]>>(
        "/therapists/me/patients"
    );

    return response.data.data;
};

export const getSessionsByPatient = async (
    patientId: string
): Promise<TherapySession[]> => {
    const response = await apiClient.get<ApiResponse<TherapySession[]>>(
        `/therapy-sessions/patient/${patientId}`
    );

    return response.data.data;
};

export const getSessionsByTherapist = async (
    therapistId: string
): Promise<TherapySession[]> => {
    const response = await apiClient.get<ApiResponse<TherapySession[]>>(
        `/therapy-sessions/therapist/${therapistId}`
    );

    return response.data.data;
};

export const getTherapySessionById = async (
    id: string
): Promise<TherapySession> => {
    const response = await apiClient.get<ApiResponse<TherapySession>>(
        `/therapy-sessions/${id}`
    );

    return response.data.data;
};

export const updateTherapySession = async (
    id: string,
    request: TherapySessionUpdateRequest
): Promise<TherapySession> => {
    const response = await apiClient.put<ApiResponse<TherapySession>>(
        `/therapy-sessions/${id}`,
        request
    );

    return response.data.data;
};

export const updateTherapist = async (
  id: string,
  request: {
    userId: string;
    fullName: string;
    email: string;
    phone: string;
    specialization: string;
    qualification: string;
    experienceYears: number;
    therapistType: string;
    available: boolean;
  }
): Promise<TherapistResponse> => {
    const response = await apiClient.put<ApiResponse<TherapistResponse>>(
        `/therapists/${id}`,
        request
    );

    return response.data.data;
};