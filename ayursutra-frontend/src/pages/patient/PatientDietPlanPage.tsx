import React, { useEffect, useState } from "react";

import {
  CalendarDays,
  Clock3,
  FileText,
  Leaf,
  UserRound,
  Utensils,
} from "lucide-react";

import apiClient from "../../services/api/client";

// =====================================================
// API RESPONSE
// =====================================================

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// =====================================================
// PATIENT
// =====================================================

interface PatientProfile {
  id: string;
  fullName?: string;
  name?: string;
  email?: string;
}

// =====================================================
// DIET MEAL
// =====================================================

interface DietMeal {
  sequenceOrder: number | null;
  mealType: string | null;
  mealTime: string | null;
  foodItems: string | null;
  instructions: string | null;
  restrictions: string | null;
}

// =====================================================
// DIET PLAN DAY
// =====================================================

interface DietPlanDay {
  dayNumber: number;
  date: string;
  phase: string | null;
  meals: DietMeal[];
}

// =====================================================
// DIET PLAN
// =====================================================

interface DietPlan {
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

// =====================================================
// DOCTOR
// =====================================================

interface DoctorResponse {
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

// =====================================================
// COMPONENT
// =====================================================

const PatientDietPlanPage: React.FC = () => {
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);

  const [doctorNames, setDoctorNames] =
    useState<Record<string, string>>({});

  const [loading, setLoading] = useState(true);

  const [errorMessage, setErrorMessage] =
    useState<string>("");

  // ===================================================
  // FETCH DIET PLANS
  // ===================================================

  useEffect(() => {
    const fetchDietPlans = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        // =============================================
        // 1. GET LOGGED-IN PATIENT
        // =============================================

        const profileResponse =
          await apiClient.get<
            ApiResponse<PatientProfile>
          >("/patients/me");

        const patientId =
          profileResponse.data.data?.id;

        if (!patientId) {
          throw new Error(
            "Patient ID not found"
          );
        }

        console.log(
          "Fetching diet plans for patient:",
          patientId
        );

        // =============================================
        // 2. GET PATIENT DIET PLANS
        // =============================================

        const dietResponse =
          await apiClient.get<
            ApiResponse<DietPlan[]>
          >(
            `/diet-plans/patient/${patientId}`
          );

        const plans: DietPlan[] =
          dietResponse.data.data || [];

        console.log(
          "Diet plans:",
          plans
        );

        setDietPlans(plans);

        // =============================================
        // 3. GET DOCTOR NAMES
        // =============================================

        const uniqueDoctorIds: string[] = [
          ...new Set(
            plans
              .map(
                (plan: DietPlan) =>
                  plan.doctorId
              )
              .filter(
                (doctorId): doctorId is string =>
                  Boolean(doctorId)
              )
          ),
        ];

        console.log(
          "Doctor IDs:",
          uniqueDoctorIds
        );

        // =============================================
        // 4. FETCH DOCTORS
        // =============================================

        const doctorResults: Array<{
          id: string;
          name: string;
        }> = await Promise.all(
          uniqueDoctorIds.map(
            async (
              doctorId: string
            ) => {
              try {
                console.log(
                  "Fetching doctor:",
                  doctorId
                );

                const response =
                  await apiClient.get<
                    ApiResponse<DoctorResponse>
                  >(
                    `/doctors/${doctorId}`
                  );

                const doctor =
                  response.data.data;

                return {
                  id: doctorId,
                  name:
                    doctor?.fullName ||
                    "Doctor",
                };
              } catch (error) {
                console.error(
                  `Unable to fetch doctor ${doctorId}:`,
                  error
                );

                return {
                  id: doctorId,
                  name: "Doctor",
                };
              }
            }
          )
        );

        // =============================================
        // 5. CREATE DOCTOR NAME MAP
        // =============================================

        const doctorMap: Record<
          string,
          string
        > = {};

        doctorResults.forEach(
          (
            doctor: {
              id: string;
              name: string;
            }
          ) => {
            doctorMap[doctor.id] =
              doctor.name;
          }
        );

        setDoctorNames(doctorMap);
      } catch (error: any) {
        console.error(
          "Unable to fetch patient diet plans:",
          error
        );

        if (
          error.response?.status === 404
        ) {
          setDietPlans([]);
        } else {
          setErrorMessage(
            error.response?.data?.message ||
              error.message ||
              "Unable to load your diet plan."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDietPlans();
  }, []);

  // ===================================================
  // DATE FORMAT
  // ===================================================

  const formatDate = (
    dateString: string
  ): string => {
    if (!dateString) {
      return "Date not available";
    }

    const date = new Date(
      `${dateString}T00:00:00`
    );

    if (Number.isNaN(date.getTime())) {
      return "Date not available";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ===================================================
  // STATUS CLASSES
  // ===================================================

  const getStatusClasses = (
    status: string
  ): string => {
    switch (
      status?.toUpperCase()
    ) {
      case "ACTIVE":
      case "IN_PROGRESS":
        return "bg-[#E8EFE4] text-[#526B3D]";

      case "COMPLETED":
        return "bg-[#E8F0EC] text-[#245B43]";

      case "CANCELLED":
        return "bg-[#F5E8E5] text-[#9A5145]";

      default:
        return "bg-[#F2F3ED] text-[#7A806F]";
    }
  };

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F6F0] text-[#173D2D] p-8">
        <div className="max-w-6xl mx-auto">

          <div className="animate-pulse">

            <div className="h-4 w-40 bg-[#E8E8DE] rounded mb-4" />

            <div className="h-10 w-72 bg-[#E8E8DE] rounded mb-3" />

            <div className="h-5 w-96 bg-[#E8E8DE] rounded mb-10" />

            <div className="h-64 bg-white rounded-3xl border border-[#DDDDC8]" />

          </div>

        </div>
      </div>
    );
  }

  // ===================================================
  // ERROR
  // ===================================================

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-[#F7F6F0] p-8">
        <div className="max-w-6xl mx-auto">

          <div className="bg-white border border-[#E1DCD0] rounded-3xl p-8 text-center">

            <FileText
              size={40}
              className="mx-auto mb-4 text-[#9A5145]"
            />

            <h2 className="text-xl font-semibold text-[#173D2D]">
              Unable to load diet plan
            </h2>

            <p className="mt-2 text-[#778078]">
              {errorMessage}
            </p>

          </div>

        </div>
      </div>
    );
  }

  // ===================================================
  // NO PLAN
  // ===================================================

  if (dietPlans.length === 0) {
    return (
      <div className="min-h-screen bg-[#F7F6F0] text-[#173D2D] p-8">

        <div className="max-w-6xl mx-auto">

          <p className="text-xs tracking-[0.25em] uppercase text-[#7B806A]">
            Your Ayurvedic Care
          </p>

          <h1 className="text-4xl font-semibold mt-2">
            My Diet Plan
          </h1>

          <p className="mt-2 text-[#778078]">
            Your personalized Ayurvedic dietary recommendations.
          </p>

          <div className="mt-10 bg-white border border-[#DDDDC8] rounded-3xl p-12 text-center">

            <Leaf
              size={48}
              className="mx-auto text-[#7A8F5A] mb-4"
            />

            <h2 className="text-xl font-semibold">
              No diet plan available
            </h2>

            <p className="mt-2 text-[#778078]">
              Your doctor has not assigned a diet plan yet.
            </p>

          </div>

        </div>

      </div>
    );
  }

  // ===================================================
  // MAIN PAGE
  // ===================================================

  return (
    <div className="min-h-screen bg-[#F7F6F0] text-[#173D2D]">

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* =============================================
            PAGE HEADER
            ============================================= */}

        <div className="mb-8">

          <p className="text-xs tracking-[0.28em] uppercase text-[#7B806A]">
            Your Ayurvedic Care
          </p>

          <h1 className="text-4xl font-semibold mt-2">
            My Diet Plan
          </h1>

          <p className="mt-2 text-[#778078]">
            Follow your personalized dietary plan during
            your Panchakarma treatment.
          </p>

        </div>

        {/* =============================================
            PLANS
            ============================================= */}

        <div className="space-y-8">

          {dietPlans.map(
            (plan: DietPlan) => (

              <div
                key={plan.id}
                className="bg-white border border-[#DDDDC8] rounded-3xl overflow-hidden"
              >

                {/* =====================================
                    PLAN HEADER
                    ===================================== */}

                <div className="p-8 border-b border-[#E7E5DC]">

                  <div className="flex items-start justify-between gap-6">

                    <div className="flex items-start gap-4">

                      <div className="w-12 h-12 rounded-2xl bg-[#EAF0E4] flex items-center justify-center">

                        <Leaf
                          size={25}
                          className="text-[#657D4A]"
                        />

                      </div>

                      <div>

                        <p className="text-xs tracking-[0.2em] uppercase text-[#7B806A]">
                          Diet Plan
                        </p>

                        <h2 className="text-2xl font-semibold mt-1">
                          {plan.planName}
                        </h2>

                        {plan.diagnosis && (
                          <p className="text-sm text-[#778078] mt-2">
                            {plan.diagnosis}
                          </p>
                        )}

                      </div>

                    </div>

                    <span
                      className={`px-4 py-2 rounded-full text-xs font-medium uppercase tracking-wide ${getStatusClasses(
                        plan.status
                      )}`}
                    >
                      {plan.status?.replace(
                        /_/g,
                        " "
                      )}
                    </span>

                  </div>

                  {/* =================================
                      BASIC INFO
                      ================================= */}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">

                    {/* START DATE */}

                    <div className="rounded-2xl bg-[#F7F6F0] p-4">

                      <div className="flex items-center gap-2 text-[#778078] text-sm">

                        <CalendarDays size={17} />

                        Start Date

                      </div>

                      <p className="mt-1 font-medium">
                        {formatDate(
                          plan.startDate
                        )}
                      </p>

                    </div>

                    {/* END DATE */}

                    <div className="rounded-2xl bg-[#F7F6F0] p-4">

                      <div className="flex items-center gap-2 text-[#778078] text-sm">

                        <CalendarDays size={17} />

                        End Date

                      </div>

                      <p className="mt-1 font-medium">
                        {formatDate(
                          plan.endDate
                        )}
                      </p>

                    </div>

                    {/* DOCTOR */}

                    <div className="rounded-2xl bg-[#F7F6F0] p-4">

                      <div className="flex items-center gap-2 text-[#778078] text-sm">

                        <UserRound size={17} />

                        Doctor

                      </div>

                      <p className="mt-1 font-medium">

                        {doctorNames[
                          plan.doctorId
                        ] ||
                          "Loading..."}

                      </p>

                    </div>

                  </div>

                </div>

                {/* =====================================
                    DIET SCHEDULE
                    ===================================== */}

                <div className="p-8">

                  <div className="flex items-center justify-between mb-6">

                    <div>

                      <p className="text-xs tracking-[0.25em] uppercase text-[#7B806A]">
                        Dietary Schedule
                      </p>

                      <h3 className="text-xl font-semibold mt-1">
                        Daily Meals
                      </h3>

                    </div>

                    <span className="px-4 py-2 rounded-full bg-[#F2F3ED] text-[#65705B] text-sm">
                      {plan.days?.length || 0} days
                    </span>

                  </div>

                  <div className="space-y-6">

                    {plan.days
                      ?.slice()
                      .sort(
                        (
                          a: DietPlanDay,
                          b: DietPlanDay
                        ) =>
                          a.dayNumber -
                          b.dayNumber
                      )
                      .map(
                        (
                          day: DietPlanDay
                        ) => (

                          <div
                            key={`${plan.id}-${day.dayNumber}`}
                            className="border border-[#E3E1D8] rounded-2xl overflow-hidden"
                          >

                            {/* DAY HEADER */}

                            <div className="bg-[#F7F6F0] px-6 py-4 flex items-center justify-between">

                              <div className="flex items-center gap-3">

                                <div className="w-10 h-10 rounded-xl bg-[#E8EFE4] flex items-center justify-center font-semibold text-[#526B3D]">
                                  {day.dayNumber}
                                </div>

                                <div>

                                  <p className="text-xs uppercase tracking-[0.18em] text-[#7B806A]">
                                    Day {day.dayNumber}
                                  </p>

                                  <p className="font-medium">
                                    {formatDate(
                                      day.date
                                    )}
                                  </p>

                                </div>

                              </div>

                              {day.phase && (
                                <span className="text-xs px-3 py-1.5 rounded-full bg-white border border-[#DCDCCF] text-[#6F7868]">
                                  {day.phase.replace(
                                    /_/g,
                                    " "
                                  )}
                                </span>
                              )}

                            </div>

                            {/* MEALS */}

                            <div className="divide-y divide-[#ECEAE2]">

                              {day.meals?.length ? (

                                day.meals
                                  .slice()
                                  .sort(
                                    (
                                      a: DietMeal,
                                      b: DietMeal
                                    ) =>
                                      (
                                        a.sequenceOrder ??
                                        0
                                      ) -
                                      (
                                        b.sequenceOrder ??
                                        0
                                      )
                                  )
                                  .map(
                                    (
                                      meal: DietMeal,
                                      index: number
                                    ) => (

                                      <div
                                        key={`${plan.id}-${day.dayNumber}-${index}`}
                                        className="p-6"
                                      >

                                        <div className="flex items-start gap-4">

                                          <div className="w-10 h-10 rounded-xl bg-[#EEF2E9] flex items-center justify-center shrink-0">

                                            <Utensils
                                              size={18}
                                              className="text-[#6B8052]"
                                            />

                                          </div>

                                          <div className="flex-1">

                                            <div className="flex flex-wrap items-center gap-3">

                                              <h4 className="font-semibold">
                                                {meal.mealType ||
                                                  "Meal"}
                                              </h4>

                                              {meal.mealTime && (
                                                <span className="flex items-center gap-1 text-sm text-[#778078]">

                                                  <Clock3
                                                    size={14}
                                                  />

                                                  {meal.mealTime}

                                                </span>
                                              )}

                                            </div>

                                            {meal.foodItems && (
                                              <p className="mt-2 text-[#42564D] leading-6">
                                                {
                                                  meal.foodItems
                                                }
                                              </p>
                                            )}

                                            {meal.instructions && (
                                              <div className="mt-3">

                                                <p className="text-xs uppercase tracking-[0.15em] text-[#7B806A]">
                                                  Instructions
                                                </p>

                                                <p className="mt-1 text-sm text-[#778078]">
                                                  {
                                                    meal.instructions
                                                  }
                                                </p>

                                              </div>
                                            )}

                                            {meal.restrictions && (
                                              <div className="mt-3 px-4 py-3 rounded-xl bg-[#FBF4EC] text-sm text-[#8A684D]">

                                                <strong>
                                                  Restrictions:
                                                </strong>{" "}

                                                {
                                                  meal.restrictions
                                                }

                                              </div>
                                            )}

                                          </div>

                                        </div>

                                      </div>

                                    )
                                  )

                              ) : (

                                <div className="p-6 text-sm text-[#778078]">
                                  No meals specified for this day.
                                </div>

                              )}

                            </div>

                          </div>

                        )
                      )}

                  </div>

                </div>

                {/* =====================================
                    NOTES
                    ===================================== */}

                {plan.notes && (

                  <div className="border-t border-[#E7E5DC] px-8 py-6">

                    <p className="text-xs tracking-[0.2em] uppercase text-[#7B806A]">
                      Doctor's Notes
                    </p>

                    <p className="mt-2 text-[#52615A]">
                      {plan.notes}
                    </p>

                  </div>

                )}

              </div>

            )
          )}

        </div>

      </div>

    </div>
  );
};

export default PatientDietPlanPage;