import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import apiClient from "../../services/api/client";

interface PatientProfile {
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

interface DietMeal {
  sequenceOrder: number;
  mealType: string;
  mealTime: string;
  foodItems: string;
  instructions: string;
  restrictions: string;
}

interface DietPlanDay {
  dayNumber: number;
  date: string;
  phase: string;
  meals: DietMeal[];
}

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

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] =
    useState<PatientProfile | null>(null);

  const [loadingProfile, setLoadingProfile] =
    useState(true);

  const [dietPlans, setDietPlans] =
    useState<DietPlan[]>([]);

  const [loadingDietPlans, setLoadingDietPlans] =
    useState(true);

  // =========================================================
  // FETCH PATIENT PROFILE
  // =========================================================

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response =
          await apiClient.get<ApiResponse<PatientProfile>>(
            "/patients/me"
          );

        setProfile(response.data.data);
      } catch (error: any) {
        /*
         * A 404 or 400 means the logged-in patient
         * has not created their patient profile yet.
         */

        if (
          error.response?.status === 404 ||
          error.response?.status === 400
        ) {
          setProfile(null);
        } else {
          console.error(
            "Unable to fetch patient profile:",
            error
          );
        }
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  // =========================================================
  // FETCH PATIENT DIET PLANS
  // =========================================================

  useEffect(() => {
    if (!profile?.id) {
      setDietPlans([]);
      setLoadingDietPlans(false);
      return;
    }

    const fetchDietPlans = async () => {
      try {
        setLoadingDietPlans(true);

        const response =
          await apiClient.get<ApiResponse<DietPlan[]>>(
            `/diet-plans/patient/${profile.id}`
          );

        setDietPlans(response.data.data || []);
      } catch (error) {
        console.error(
          "Unable to fetch patient diet plans:",
          error
        );

        setDietPlans([]);
      } finally {
        setLoadingDietPlans(false);
      }
    };

    fetchDietPlans();
  }, [profile?.id]);

  // =========================================================
  // PROFILE COMPLETION
  // =========================================================

  const getProfileCompletion = () => {
    if (!profile) {
      return 25;
    }

    const fields = [
      profile.fullName,
      profile.email,
      profile.phone,
      profile.age,
      profile.gender,
      profile.address,
      profile.medicalHistory,
    ];

    const completed = fields.filter(
      (field) =>
        field !== null &&
        field !== undefined &&
        String(field).trim() !== ""
    ).length;

    return Math.round(
      (completed / fields.length) * 100
    );
  };

  const profileCompletion =
    getProfileCompletion();

  const showProfileCompletion =
    !loadingProfile &&
    profileCompletion < 100;

  // =========================================================
  // FIRST NAME
  // =========================================================

  const firstName =
    user?.fullName?.split(" ")[0] || "there";

  // =========================================================
  // TODAY'S DATE
  // =========================================================
  //
  // We deliberately create the date using local browser time
  // instead of toISOString(), so Indian timezone dates don't
  // shift by one day.
  // =========================================================

  const today = useMemo(() => {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");
    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }, []);

  // =========================================================
  // FIND CURRENT DIET PLAN
  // =========================================================
  //
  // Priority:
  // 1. Plan whose date range contains today
  // 2. Active plan
  // 3. Most recent plan
  //
  // This means if the patient has multiple diet plans,
  // the dashboard shows the relevant/current one instead
  // of showing an empty "Not assigned" state.
  // =========================================================

  const currentDietPlan = useMemo(() => {
    if (!dietPlans.length) {
      return null;
    }

    const planForToday = dietPlans.find(
      (plan) =>
        today >= plan.startDate &&
        today <= plan.endDate
    );

    if (planForToday) {
      return planForToday;
    }

    const activePlan = dietPlans.find(
      (plan) =>
        plan.status?.toUpperCase() === "ACTIVE"
    );

    if (activePlan) {
      return activePlan;
    }

    return [...dietPlans].sort((a, b) =>
      b.startDate.localeCompare(a.startDate)
    )[0];
  }, [dietPlans, today]);

  // =========================================================
  // TODAY'S DIET DAY
  // =========================================================

  const currentDietDay = useMemo(() => {
    if (!currentDietPlan) {
      return null;
    }

    /*
     * First try to find the exact calendar date.
     */
    const exactDay =
      currentDietPlan.days?.find(
        (day) => day.date === today
      );

    if (exactDay) {
      return exactDay;
    }

    /*
     * If today is inside the plan but the backend stores
     * dates differently, calculate the treatment day.
     */
    const start = new Date(
      `${currentDietPlan.startDate}T00:00:00`
    );

    const current = new Date(
      `${today}T00:00:00`
    );

    const difference =
      Math.floor(
        (current.getTime() - start.getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1;

    return (
      currentDietPlan.days?.find(
        (day) =>
          day.dayNumber === difference
      ) || null
    );
  }, [currentDietPlan, today]);

  // =========================================================
  // MEAL HELPER
  // =========================================================

  const getMeal = (
    mealType: string
  ) => {
    if (!currentDietDay?.meals) {
      return null;
    }

    return (
      currentDietDay.meals.find(
        (meal) =>
          meal.mealType?.toLowerCase() ===
          mealType.toLowerCase()
      ) || null
    );
  };

  const breakfast = getMeal("breakfast");
  const lunch = getMeal("lunch");
  const dinner = getMeal("dinner");

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (
    dateString: string
  ) => {
    if (!dateString) {
      return "";
    }

    const [year, month, day] =
      dateString.split("-");

    if (!year || !month || !day) {
      return dateString;
    }

    const date = new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    );

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-[#F7F6F0] text-[#173D2D]">

      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8 lg:py-10">

        {/* ===================================================
            WELCOME SECTION
        =================================================== */}

        <section className="mb-8">

          <h1 className="text-3xl font-semibold tracking-tight text-[#173D2D] sm:text-4xl">
            Welcome, {firstName}
          </h1>

        </section>


        {/* ===================================================
            PROFILE COMPLETION
        =================================================== */}

        {showProfileCompletion && (

          <section className="mb-8">

            <div className="overflow-hidden rounded-3xl border border-[#DCDDD3] bg-white">

              <div className="grid lg:grid-cols-[1fr_auto]">

                <div className="p-6 sm:p-7">

                  <div className="flex items-start gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EEF1E8] text-xl">
                      ✦
                    </div>

                    <div>

                      <p className="text-sm font-semibold text-[#173D2D]">
                        Complete your patient profile
                      </p>

                      <p className="mt-1 text-sm leading-6 text-[#718078]">
                        Add your basic health information
                        to help your AyurSutra care team
                        personalize your experience.
                      </p>

                    </div>

                  </div>


                  {/* PROGRESS */}

                  <div className="mt-6">

                    <div className="mb-2 flex items-center justify-between">

                      <span className="text-xs font-medium uppercase tracking-[0.15em] text-[#71834F]">
                        Profile completion
                      </span>

                      <span className="text-sm font-semibold text-[#173D2D]">
                        {loadingProfile
                          ? "..."
                          : `${profileCompletion}%`}
                      </span>

                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-[#E9EBE3]">

                      <div
                        className="h-full rounded-full bg-[#71834F] transition-all duration-500"
                        style={{
                          width: `${profileCompletion}%`,
                        }}
                      />

                    </div>

                  </div>

                </div>


                {/* ACTION */}

                <div className="flex items-center border-t border-[#E5E5DD] bg-[#F3F4ED] px-6 py-5 lg:border-l lg:border-t-0">

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/patient/profile")
                    }
                    className="w-full rounded-full border border-[#AEB8A4] px-5 py-2.5 text-sm font-semibold text-[#173D2D] transition hover:bg-[#173D2D] hover:text-white lg:w-auto"
                  >
                    Complete Profile
                  </button>

                </div>

              </div>

            </div>

          </section>

        )}


        {/* ===================================================
            QUICK ACCESS
        =================================================== */}

        <section className="mb-10">

          <div className="mb-4">

            <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#71834F]">
              Quick Access
            </p>

            <h2 className="mt-1 text-xl font-semibold text-[#173D2D]">
              Your care at a glance
            </h2>

          </div>


          <div className="grid gap-5 md:grid-cols-3">

            {/* =================================================
                MY PROFILE
            ================================================= */}

            <button
              type="button"
              onClick={() =>
                navigate("/patient/profile")
              }
              className="group rounded-3xl border border-[#DDDCD3] bg-white p-6 text-left transition hover:-translate-y-1 hover:border-[#AEB8A4] hover:shadow-lg"
            >

              <div className="flex items-center justify-between">

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF1E8] text-lg">
                  ◌
                </div>

                <span className="text-lg text-[#A0AA9A] transition group-hover:translate-x-1">
                  →
                </span>

              </div>

              <p className="mt-5 text-xs font-medium uppercase tracking-[0.16em] text-[#71834F]">
                My Profile
              </p>

              <h3 className="mt-1 text-lg font-semibold text-[#173D2D]">
                Personal & Health Details
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#778078]">
                View and manage your personal information.
              </p>

            </button>


            {/* =================================================
                MY THERAPIES
            ================================================= */}

            <button
              type="button"
              onClick={() =>
                navigate("/patient/plan")
              }
              className="group rounded-3xl border border-[#DDDCD3] bg-white p-6 text-left transition hover:-translate-y-1 hover:border-[#AEB8A4] hover:shadow-lg"
            >

              <div className="flex items-center justify-between">

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F2EEDC] text-lg">
                  ◈
                </div>

                <span className="text-lg text-[#A0AA9A] transition group-hover:translate-x-1">
                  →
                </span>

              </div>

              <p className="mt-5 text-xs font-medium uppercase tracking-[0.16em] text-[#71834F]">
                My Therapies
              </p>

              <h3 className="mt-1 text-lg font-semibold text-[#173D2D]">
                Panchakarma Care
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#778078]">
                View your assigned therapies and treatment
                schedule.
              </p>

            </button>


            {/* =================================================
                MY PROGRESS
            ================================================= */}

            <button
              type="button"
              onClick={() =>
                navigate("/patient/progress")
              }
              className="group rounded-3xl border border-[#DDDCD3] bg-white p-6 text-left transition hover:-translate-y-1 hover:border-[#AEB8A4] hover:shadow-lg"
            >

              <div className="flex items-center justify-between">

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E8EFEB] text-lg">
                  ↗
                </div>

                <span className="text-lg text-[#A0AA9A] transition group-hover:translate-x-1">
                  →
                </span>

              </div>

              <p className="mt-5 text-xs font-medium uppercase tracking-[0.16em] text-[#71834F]">
                My Progress
              </p>

              <h3 className="mt-1 text-lg font-semibold text-[#173D2D]">
                Wellness Progress
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#778078]">
                Track your treatment journey and wellness
                progress.
              </p>

            </button>

          </div>

        </section>


        {/* ===================================================
            LOWER GRID
            DIET + DAILY WELLNESS
        =================================================== */}

        <section className="grid items-stretch gap-6 lg:grid-cols-[1.35fr_0.65fr]">


          {/* =================================================
              TODAY'S DIET PLAN
          ================================================= */}

          <div className="min-h-[400px] overflow-hidden rounded-3xl border border-[#DDDCD3] bg-white">

            {/* DIET HEADER */}

            <div className="border-b border-[#ECECE5] p-6 sm:p-7">

              <div className="flex items-start justify-between gap-5">

                <div className="min-w-0">

                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#71834F]">
                    Today's Care
                  </p>

                  <h2 className="mt-1 text-xl font-semibold text-[#173D2D]">
                    Today's Diet Plan
                  </h2>

                  {loadingDietPlans ? (
                    <p className="mt-2 text-sm text-[#778078]">
                      Loading your dietary recommendations...
                    </p>
                  ) : currentDietPlan ? (
                    <div className="mt-2">

                      <p className="text-sm font-medium text-[#315A46]">
                        {currentDietPlan.planName}
                      </p>

                      <p className="mt-1 text-xs text-[#8A918B]">
                        {formatDate(
                          currentDietPlan.startDate
                        )}
                        {" → "}
                        {formatDate(
                          currentDietPlan.endDate
                        )}
                      </p>

                    </div>
                  ) : (
                    <p className="mt-2 text-sm leading-6 text-[#778078]">
                      Your personalized Ayurvedic dietary
                      recommendations will appear here.
                    </p>
                  )}

                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EEF1E8] text-lg">
                  ◌
                </div>

              </div>

            </div>


            {/* =================================================
                DIET PREVIEW
            ================================================= */}

            <div className="px-6 sm:px-7">

              {loadingDietPlans ? (

                <div className="flex min-h-[210px] items-center justify-center">

                  <div className="text-center">

                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#EEF1E8] text-[#71834F]">
                      ◌
                    </div>

                    <p className="mt-3 text-sm text-[#778078]">
                      Loading today's diet...
                    </p>

                  </div>

                </div>

              ) : !currentDietPlan ? (

                <div className="flex min-h-[210px] items-center justify-center">

                  <div className="text-center">

                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F2F3ED] text-[#71834F]">
                      ◌
                    </div>

                    <p className="mt-4 text-sm font-medium text-[#4E463D]">
                      No diet plan assigned
                    </p>

                    <p className="mt-1 text-xs text-[#91897C]">
                      Your dietary recommendations will appear
                      once a plan is prescribed.
                    </p>

                  </div>

                </div>

              ) : !currentDietDay ? (

                <div className="flex min-h-[210px] items-center justify-center">

                  <div className="text-center">

                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F2F3ED] text-[#71834F]">
                      ◌
                    </div>

                    <p className="mt-4 text-sm font-medium text-[#4E463D]">
                      No meals scheduled for today
                    </p>

                    <p className="mt-1 text-xs text-[#91897C]">
                      View your full diet plan for the complete
                      dietary schedule.
                    </p>

                  </div>

                </div>

              ) : (

                <div className="divide-y divide-[#ECECE5]">

                  {/* BREAKFAST */}

                  <div className="flex items-center justify-between gap-4 py-4">

                    <div className="min-w-0">

                      <p className="text-sm font-medium text-[#173D2D]">
                        Breakfast
                      </p>

                      <p className="mt-1 truncate text-xs text-[#7A827C]">
                        {breakfast?.foodItems ||
                          breakfast?.instructions ||
                          "No recommendation"}
                      </p>

                    </div>

                    <span className="shrink-0 rounded-full bg-[#F2F3ED] px-3 py-1 text-xs text-[#7A827C]">
                      {breakfast?.mealTime ||
                        "Not assigned"}
                    </span>

                  </div>


                  {/* LUNCH */}

                  <div className="flex items-center justify-between gap-4 py-4">

                    <div className="min-w-0">

                      <p className="text-sm font-medium text-[#173D2D]">
                        Lunch
                      </p>

                      <p className="mt-1 truncate text-xs text-[#7A827C]">
                        {lunch?.foodItems ||
                          lunch?.instructions ||
                          "No recommendation"}
                      </p>

                    </div>

                    <span className="shrink-0 rounded-full bg-[#F2F3ED] px-3 py-1 text-xs text-[#7A827C]">
                      {lunch?.mealTime ||
                        "Not assigned"}
                    </span>

                  </div>


                  {/* DINNER */}

                  <div className="flex items-center justify-between gap-4 py-4">

                    <div className="min-w-0">

                      <p className="text-sm font-medium text-[#173D2D]">
                        Dinner
                      </p>

                      <p className="mt-1 truncate text-xs text-[#7A827C]">
                        {dinner?.foodItems ||
                          dinner?.instructions ||
                          "No recommendation"}
                      </p>

                    </div>

                    <span className="shrink-0 rounded-full bg-[#F2F3ED] px-3 py-1 text-xs text-[#7A827C]">
                      {dinner?.mealTime ||
                        "Not assigned"}
                    </span>

                  </div>

                </div>

              )}

              {/* VIEW FULL DIET PLAN */}

              <div className="border-t border-[#ECECE5] py-4">

                <button
                  type="button"
                  onClick={() =>
                    navigate("/patient/diet-plan")
                  }
                  className="group inline-flex items-center gap-2 text-sm font-semibold text-[#173D2D] transition hover:text-[#71834F]"
                >

                  View Full Diet Plan

                  <span className="transition group-hover:translate-x-1">
                    →
                  </span>

                </button>

              </div>

            </div>

          </div>


          {/* =================================================
              DAILY WELLNESS
          ================================================= */}

          <div className="relative min-h-[400px] overflow-hidden rounded-3xl bg-[#173D2D] p-7 text-white">

            <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full border border-white/10" />

            <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full border border-white/10" />

            <div className="relative">

              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#DCD7A5]">
                Daily Wellness
              </p>

              <h2 className="mt-4 text-2xl font-semibold leading-tight">
                Small rituals,
                <br />
                meaningful balance.
              </h2>

              <p className="mt-4 text-sm leading-6 text-white/70">
                Ayurveda encourages consistency. Stay
                connected with your care plan and make space
                for rest, mindful routines and balanced living.
              </p>

              <div className="mt-7 border-t border-white/10 pt-5">

                <p className="text-xs uppercase tracking-[0.15em] text-white/50">
                  AyurSutra
                </p>

                <p className="mt-1 text-sm text-[#E6E2B3]">
                  A more balanced approach to care.
                </p>

              </div>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default PatientDashboard;