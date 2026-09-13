import apiClient from "../api/client";

export interface TherapyPlanItem {
  day: number;
  therapyId: string;
  therapyName: string;
  durationMinutes: number;
  sequenceOrder: number;
}

export interface TherapyPlan {
  id: string;
  patientId: string;
  doctorId: string;
  planName: string;
  diagnosis: string | null;
  startDate: string;
  endDate: string;
  status: string;
  therapies: TherapyPlanItem[];
}

export interface CreateTherapyPlanRequest {
  patientId: string;
  doctorId: string;
  planName: string;
  diagnosis?: string;
  startDate: string;
  endDate: string;
  status?: string;
  therapies: TherapyPlanItem[];
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// =====================================================
// GET ALL THERAPY PLANS
// Used by ADMIN / RECEPTIONIST / other management views
// =====================================================

export const getAllTherapyPlans = async (): Promise<
  TherapyPlan[]
> => {
  const response =
    await apiClient.get<
      ApiResponse<TherapyPlan[]>
    >("/therapy-plans");

  return response.data.data;
};

// =====================================================
// GET MY THERAPY PLANS
// Used by PATIENT
// =====================================================

export const getMyTherapyPlans = async (): Promise<
  TherapyPlan[]
> => {
  const response =
    await apiClient.get<
      ApiResponse<TherapyPlan[]>
    >("/therapy-plans/my");

  return response.data.data;
};

// =====================================================
// GET THERAPY PLAN BY ID
// =====================================================

export const getTherapyPlanById = async (
  id: string
): Promise<TherapyPlan> => {
  const response =
    await apiClient.get<
      ApiResponse<TherapyPlan>
    >(`/therapy-plans/${id}`);

  return response.data.data;
};

// =====================================================
// CREATE THERAPY PLAN
// Used by DOCTOR
// =====================================================

export const createTherapyPlan = async (
  request: CreateTherapyPlanRequest
): Promise<TherapyPlan> => {
  const response =
    await apiClient.post<
      ApiResponse<TherapyPlan>
    >("/therapy-plans", request);

  return response.data.data;
};

// =====================================================
// UPDATE THERAPY PLAN
// =====================================================

export const updateTherapyPlan = async (
  id: string,
  request: CreateTherapyPlanRequest
): Promise<TherapyPlan> => {
  const response =
    await apiClient.put<
      ApiResponse<TherapyPlan>
    >(`/therapy-plans/${id}`, request);

  return response.data.data;
};

// =====================================================
// DELETE THERAPY PLAN
// =====================================================

export const deleteTherapyPlan = async (
  id: string
): Promise<void> => {
  await apiClient.delete(`/therapy-plans/${id}`);
};


// import apiClient from "../api/client";

// export interface TherapyPlanItem {
//   day: number;
//   therapyId: string;
//   therapyName: string;
//   durationMinutes: number;
//   sequenceOrder: number;
// }

// export interface TherapyPlan {
//   id: string;
//   patientId: string;
//   doctorId: string;
//   planName: string;
//   diagnosis: string | null;
//   startDate: string;
//   endDate: string;
//   status: string;
//   therapies: TherapyPlanItem[];
// }

// export interface CreateTherapyPlanRequest {
//   patientId: string;
//   doctorId: string;
//   planName: string;
//   diagnosis?: string;
//   startDate: string;
//   endDate: string;
//   status?: string;
//   therapies: TherapyPlanItem[];
// }

// interface ApiResponse<T> {
//   success: boolean;
//   message: string;
//   data: T;
// }


// // =====================================================
// // GET MY THERAPY PLANS
// // Used by PATIENT
// // =====================================================

// export const getMyTherapyPlans = async (): Promise<TherapyPlan[]> => {
//   const response = await apiClient.get<ApiResponse<TherapyPlan[]>>(
//     "/therapy-plans/my"
//   );

//   return response.data.data;
// };


// // =====================================================
// // GET THERAPY PLAN BY ID
// // =====================================================

// export const getTherapyPlanById = async (
//   id: string
// ): Promise<TherapyPlan> => {
//   const response = await apiClient.get<ApiResponse<TherapyPlan>>(
//     `/therapy-plans/${id}`
//   );

//   return response.data.data;
// };


// // =====================================================
// // CREATE THERAPY PLAN
// // Used by DOCTOR
// // =====================================================

// export const createTherapyPlan = async (
//   request: CreateTherapyPlanRequest
// ): Promise<TherapyPlan> => {
//   const response = await apiClient.post<ApiResponse<TherapyPlan>>(
//     "/therapy-plans",
//     request
//   );

//   return response.data.data;
// };


// // =====================================================
// // UPDATE THERAPY PLAN
// // =====================================================

// export const updateTherapyPlan = async (
//   id: string,
//   request: CreateTherapyPlanRequest
// ): Promise<TherapyPlan> => {
//   const response = await apiClient.put<ApiResponse<TherapyPlan>>(
//     `/therapy-plans/${id}`,
//     request
//   );

//   return response.data.data;
// };


// // =====================================================
// // DELETE THERAPY PLAN
// // =====================================================

// export const deleteTherapyPlan = async (
//   id: string
// ): Promise<void> => {
//   await apiClient.delete(`/therapy-plans/${id}`);
// };



