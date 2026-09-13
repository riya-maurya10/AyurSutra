import apiClient from "../api/client";

import type {
  PatientResponse,
  DoctorResponse,
  TherapistResponse,
  RoomResponse,
} from "../doctor/doctorService";
export type { RoomResponse } from "../doctor/doctorService";

import type {
  TherapyPlan,
} from "../therapyPlan/therapyPlanService";

// =====================================================
// API RESPONSE
// =====================================================

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// =====================================================
// SCHEDULING REQUEST
// =====================================================

export interface SchedulingRequest {
  therapyPlanId: string;
  therapyId: string;
  sessionDate: string;
  startTime: string;
  therapistId?: string;
  roomId?: string;
  notes?: string;
}

// =====================================================
// THERAPY SESSION
// =====================================================

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

// =====================================================
// SCHEDULE RESPONSE
// =====================================================

export interface SchedulingResponse {
  success: boolean;
  message: string;
  session: TherapySession;
}

// =====================================================
// MULTI-DAY SCHEDULE
// =====================================================

export interface MultiDaySessionRequest {
  therapyId: string;
  sessionDate: string;
  startTime: string;
  therapistId?: string;
  roomId?: string;
  notes?: string;
}

export interface MultiDayScheduleRequest {
  therapyPlanId: string;
  sessions: MultiDaySessionRequest[];
}

export interface MultiDayScheduleResponse {
  success: boolean;
  message: string;
  therapyPlanId: string;
  totalSessionsCreated: number;
  sessions: TherapySession[];
}

export const generateMultiDaySchedule =
  async (
    request: MultiDayScheduleRequest
  ): Promise<MultiDayScheduleResponse> => {
    const response =
      await apiClient.post<
        ApiResponse<MultiDayScheduleResponse>
      >(
        "/scheduler/generate-multi-day",
        request
      );

    return response.data.data;
  };

// =====================================================
// PATIENTS
// =====================================================

export const getReceptionistPatients =
  async (): Promise<PatientResponse[]> => {
    const response =
      await apiClient.get<
        ApiResponse<PatientResponse[]>
      >("/patients");

    return response.data.data;
  };

// =====================================================
// DOCTORS
// =====================================================

export const getReceptionistDoctors =
  async (): Promise<DoctorResponse[]> => {
    const response =
      await apiClient.get<
        ApiResponse<DoctorResponse[]>
      >("/doctors");

    return response.data.data;
  };

// =====================================================
// THERAPISTS
// =====================================================

export const getReceptionistTherapists =
  async (): Promise<TherapistResponse[]> => {
    const response =
      await apiClient.get<
        ApiResponse<TherapistResponse[]>
      >("/therapists");

    return response.data.data;
  };

// =====================================================
// ROOMS
// =====================================================

export type RoomType =
  | "THERAPY_ROOM"
  | "PANCHAKARMA_ROOM"
  | "CONSULTATION_ROOM"
  | "STEAM_ROOM"
  | "SHIRODHARA_ROOM"
  | "RECOVERY_ROOM";

export interface RoomRequest {
  roomNumber: string;
  name: string;
  type: RoomType;
  capacity: number;
  description?: string;
  active: boolean;
}

export const getReceptionistRooms =
  async (): Promise<RoomResponse[]> => {
    const response =
      await apiClient.get<
        ApiResponse<RoomResponse[]>
      >("/rooms");

    return response.data.data;
  };

// =====================================================
// ACTIVE ROOMS
// =====================================================

export const getReceptionistActiveRooms =
  async (): Promise<RoomResponse[]> => {
    const response =
      await apiClient.get<
        ApiResponse<RoomResponse[]>
      >("/rooms/active");

    return response.data.data;
  };

// =====================================================
// CREATE ROOM
// =====================================================

export const createReceptionistRoom =
  async (
    request: RoomRequest
  ): Promise<RoomResponse> => {
    const response =
      await apiClient.post<
        ApiResponse<RoomResponse>
      >(
        "/rooms",
        request
      );

    return response.data.data;
  };

// =====================================================
// UPDATE ROOM
// =====================================================

export const updateReceptionistRoom =
  async (
    id: string,
    request: RoomRequest
  ): Promise<RoomResponse> => {
    const response =
      await apiClient.put<
        ApiResponse<RoomResponse>
      >(
        `/rooms/${id}`,
        request
      );

    return response.data.data;
  };

// =====================================================
// DELETE ROOM
// =====================================================

export const deleteReceptionistRoom =
  async (
    id: string
  ): Promise<string> => {
    const response =
      await apiClient.delete<
        ApiResponse<string>
      >(
        `/rooms/${id}`
      );

    return response.data.data;
  };

// =====================================================
// EQUIPMENT
// =====================================================

export interface EquipmentResponse {
  id: string;
  equipmentCode: string;
  name: string;
  type: string;
  quantity: number | null;
  availableQuantity: number | null;
  roomId: string | null;
  status: string;
  description: string | null;
  active: boolean;
}

export interface EquipmentRequest {
  equipmentCode: string;
  name: string;
  type: string;
  quantity: number;
  availableQuantity: number;
  roomId?: string;
  status: string;
  description?: string;
  active: boolean;
}

export const getReceptionistEquipment =
  async (): Promise<EquipmentResponse[]> => {
    const response =
      await apiClient.get<
        ApiResponse<EquipmentResponse[]>
      >("/equipment");

    return response.data.data;
  };


// =====================================================
// ACTIVE EQUIPMENT
// =====================================================

export const getReceptionistActiveEquipment =
  async (): Promise<EquipmentResponse[]> => {
    const response =
      await apiClient.get<
        ApiResponse<EquipmentResponse[]>
      >("/equipment/active");

    return response.data.data;
  };


// =====================================================
// AVAILABLE EQUIPMENT
// =====================================================

export const getReceptionistAvailableEquipment =
  async (): Promise<EquipmentResponse[]> => {
    const response =
      await apiClient.get<
        ApiResponse<EquipmentResponse[]>
      >("/equipment/available");

    return response.data.data;
  };


// =====================================================
// CREATE EQUIPMENT
// =====================================================

export const createReceptionistEquipment =
  async (
    request: EquipmentRequest
  ): Promise<EquipmentResponse> => {
    const response =
      await apiClient.post<
        ApiResponse<EquipmentResponse>
      >(
        "/equipment",
        request
      );

    return response.data.data;
  };


// =====================================================
// UPDATE EQUIPMENT
// =====================================================

export const updateReceptionistEquipment =
  async (
    id: string,
    request: EquipmentRequest
  ): Promise<EquipmentResponse> => {
    const response =
      await apiClient.put<
        ApiResponse<EquipmentResponse>
      >(
        `/equipment/${id}`,
        request
      );

    return response.data.data;
  };


// =====================================================
// DELETE EQUIPMENT
// =====================================================

export const deleteReceptionistEquipment =
  async (
    id: string
  ): Promise<string | null> => {
    const response =
      await apiClient.delete<
        ApiResponse<string | null>
      >(
        `/equipment/${id}`
      );

    return response.data.data;
  };

// =====================================================
// THERAPY PLANS
// =====================================================

export const getReceptionistTherapyPlans =
  async (): Promise<TherapyPlan[]> => {
    const response =
      await apiClient.get<
        ApiResponse<TherapyPlan[]>
      >("/therapy-plans");

    return response.data.data;
  };

  // =====================================================
// THERAPIES
// =====================================================

export interface ReceptionistTherapy {
  id: string;
  name: string;
  stage: string;
  description: string | null;
  durationMinutes: number;
  active: boolean;
}

export interface TherapyRequest {
  name: string;
  stage: string;
  description?: string;
  durationMinutes: number;
  active: boolean;
}

export const getReceptionistTherapies =
  async (): Promise<ReceptionistTherapy[]> => {
    const response =
      await apiClient.get<
        ApiResponse<ReceptionistTherapy[]>
      >("/therapies");

    return response.data.data;
  };

export const createReceptionistTherapy =
  async (
    request: TherapyRequest
  ): Promise<ReceptionistTherapy> => {
    const response =
      await apiClient.post<
        ApiResponse<ReceptionistTherapy>
      >(
        "/therapies",
        request
      );

    return response.data.data;
  };

export const updateReceptionistTherapy =
  async (
    id: string,
    request: TherapyRequest
  ): Promise<ReceptionistTherapy> => {
    const response =
      await apiClient.put<
        ApiResponse<ReceptionistTherapy>
      >(
        `/therapies/${id}`,
        request
      );

    return response.data.data;
  };

export const deleteReceptionistTherapy =
  async (
    id: string
  ): Promise<string> => {
    const response =
      await apiClient.delete<
        ApiResponse<string>
      >(
        `/therapies/${id}`
      );

    return response.data.data;
  };

// =====================================================
// SCHEDULE THERAPY
// =====================================================

export const scheduleTherapy =
  async (
    request: SchedulingRequest
  ): Promise<SchedulingResponse> => {
    const response =
      await apiClient.post<
        SchedulingResponse
      >(
        "/scheduler/schedule",
        request
      );

    return response.data;
  };


// =====================================================
// THERAPY SESSIONS
// =====================================================

export const getReceptionistSessions =
  async (): Promise<TherapySession[]> => {
    const response =
      await apiClient.get<
        ApiResponse<TherapySession[]>
      >("/therapy-sessions");

    return response.data.data;
  };

// =====================================================
// SESSIONS BY DATE
// =====================================================

export const getReceptionistSessionsByDate =
  async (
    date: string
  ): Promise<TherapySession[]> => {
    const response =
      await apiClient.get<
        ApiResponse<TherapySession[]>
      >(
        `/therapy-sessions/date/${date}`
      );

    return response.data.data;
  };

// =====================================================
// SESSION BY ID
// =====================================================

export const getReceptionistSessionById =
  async (
    id: string
  ): Promise<TherapySession> => {
    const response =
      await apiClient.get<
        ApiResponse<TherapySession>
      >(
        `/therapy-sessions/${id}`
      );

    return response.data.data;
  };

// =====================================================
// UPDATE SESSION
// =====================================================

export const updateReceptionistSession =
  async (
    id: string,
    request: {
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
  ): Promise<TherapySession> => {
    const response =
      await apiClient.put<
        ApiResponse<TherapySession>
      >(
        `/therapy-sessions/${id}`,
        request
      );

    return response.data.data;
  };