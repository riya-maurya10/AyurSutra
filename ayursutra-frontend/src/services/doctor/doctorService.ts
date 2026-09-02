import apiClient from "../api/client";

/*
 * ============================================================
 * PATIENT
 * ============================================================
 */

export interface PatientResponse {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  age: number | null;
  gender: string;
  address: string;
  medicalHistory: string;
}

/*
 * ============================================================
 * DOCTOR
 * ============================================================
 */

export interface DoctorResponse {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  specialization: string;
  qualification: string;
  experienceYears: number;
  licenseNumber: string;
  available: boolean;
}

/*
 * ============================================================
 * THERAPIST
 * ============================================================
 */

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

/*
 * ============================================================
 * ROOM
 * ============================================================
 */

export interface RoomResponse {
  id: string;
  roomNumber: string;
  name: string;
  type: string;
  capacity: number | null;
  description: string | null;
  active: boolean;
}

/*
 * ============================================================
 * DIET PLAN
 * ============================================================
 */

export interface DietMeal {
  sequenceOrder: number;
  mealType: string;
  mealTime: string;
  foodItems: string;
  instructions: string;
  restrictions: string;
}

export interface DietPlanDay {
  dayNumber: number;
  date: string;
  phase: string;
  meals: DietMeal[];
}

export interface DietPlan {
  id: string;
  patientId: string;
  therapyPlanId: string | null;
  doctorId: string;
  planName: string;
  diagnosis: string | null;
  startDate: string;
  endDate: string;
  status: string;
  notes: string | null;
  days: DietPlanDay[];
}

export interface DietMealRequest {
  sequenceOrder: number;
  mealType: string;
  mealTime: string;
  foodItems: string;
  instructions: string;
  restrictions: string;
}

export interface DietPlanDayRequest {
  dayNumber: number;
  date: string;
  phase: string;
  meals: DietMealRequest[];
}

export interface DietPlanRequest {
  patientId: string;
  therapyPlanId?: string;
  doctorId: string;
  planName: string;
  diagnosis?: string;
  startDate: string;
  endDate: string;
  status?: string;
  notes?: string;
  days: DietPlanDayRequest[];
}

/*
 * ============================================================
 * API RESPONSE
 * ============================================================
 */

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/*
 * ============================================================
 * PATIENT APIs
 * ============================================================
 */

export const getAllPatients = async (): Promise<
  PatientResponse[]
> => {
  const response =
    await apiClient.get<
      ApiResponse<PatientResponse[]>
    >("/patients");

  return response.data.data;
};

export const getPatientById = async (
  id: string
): Promise<PatientResponse> => {
  const response =
    await apiClient.get<
      ApiResponse<PatientResponse>
    >(`/patients/${id}`);

  return response.data.data;
};

/*
 * ============================================================
 * DOCTOR APIs
 * ============================================================
 */

export const getMyDoctorProfile =
  async (): Promise<DoctorResponse> => {
    const response =
      await apiClient.get<
        ApiResponse<DoctorResponse>
      >("/doctors/me");

    return response.data.data;
  };

export const getDoctorById = async (
  id: string
): Promise<DoctorResponse> => {
  const response =
    await apiClient.get<
      ApiResponse<DoctorResponse>
    >(`/doctors/${id}`);

  return response.data.data;
};

export const getAllDoctors = async (): Promise<
  DoctorResponse[]
> => {
  const response =
    await apiClient.get<
      ApiResponse<DoctorResponse[]>
    >("/doctors");

  return response.data.data;
};

/*
 * ============================================================
 * THERAPIST APIs
 * ============================================================
 */

export const getAllTherapists =
  async (): Promise<TherapistResponse[]> => {
    const response =
      await apiClient.get<
        ApiResponse<TherapistResponse[]>
      >("/therapists");

    return response.data.data;
  };

export const getTherapistById = async (
  id: string
): Promise<TherapistResponse> => {
  const response =
    await apiClient.get<
      ApiResponse<TherapistResponse>
    >(`/therapists/${id}`);

  return response.data.data;
};

/*
 * ============================================================
 * ROOM APIs
 * ============================================================
 */

export const getAllRooms =
  async (): Promise<RoomResponse[]> => {
    const response =
      await apiClient.get<
        ApiResponse<RoomResponse[]>
      >("/rooms");

    return response.data.data;
  };

export const getActiveRooms =
  async (): Promise<RoomResponse[]> => {
    const response =
      await apiClient.get<
        ApiResponse<RoomResponse[]>
      >("/rooms/active");

    return response.data.data;
  };

export const getRoomById = async (
  id: string
): Promise<RoomResponse> => {
  const response =
    await apiClient.get<
      ApiResponse<RoomResponse>
    >(`/rooms/${id}`);

  return response.data.data;
};

/*
 * ============================================================
 * DIET PLAN APIs
 * ============================================================
 */

export const createDietPlan = async (
  request: DietPlanRequest
): Promise<DietPlan> => {
  const response =
    await apiClient.post<
      ApiResponse<DietPlan>
    >("/diet-plans", request);

  return response.data.data;
};

export const getDietPlansByPatient =
  async (
    patientId: string
  ): Promise<DietPlan[]> => {
    const response =
      await apiClient.get<
        ApiResponse<DietPlan[]>
      >(`/diet-plans/patient/${patientId}`);

    return response.data.data;
  };

export const getDietPlanById = async (
  id: string
): Promise<DietPlan> => {
  const response =
    await apiClient.get<
      ApiResponse<DietPlan>
    >(`/diet-plans/${id}`);

  return response.data.data;
};

export const getDietPlansByTherapyPlan =
  async (
    therapyPlanId: string
  ): Promise<DietPlan[]> => {
    const response =
      await apiClient.get<
        ApiResponse<DietPlan[]>
      >(
        `/diet-plans/therapy-plan/${therapyPlanId}`
      );

    return response.data.data;
  };

export const getDietPlansByDoctor =
  async (
    doctorId: string
  ): Promise<DietPlan[]> => {
    const response =
      await apiClient.get<
        ApiResponse<DietPlan[]>
      >(`/diet-plans/doctor/${doctorId}`);

    return response.data.data;
  };

export const updateDietPlan = async (
  id: string,
  request: DietPlanRequest
): Promise<DietPlan> => {
  const response =
    await apiClient.put<
      ApiResponse<DietPlan>
    >(`/diet-plans/${id}`, request);

  return response.data.data;
};

export const deleteDietPlan = async (
  id: string
): Promise<void> => {
  await apiClient.delete(`/diet-plans/${id}`);
};