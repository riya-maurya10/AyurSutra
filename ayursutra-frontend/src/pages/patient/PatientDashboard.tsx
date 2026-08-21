import { useEffect, useState } from "react";
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

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

function PatientDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileExists, setProfileExists] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response =
          await apiClient.get<ApiResponse<PatientProfile>>(
            "/patients/me"
          );

        setProfile(response.data.data);
        setProfileExists(true);
      } catch (error: any) {
        /*
         * 404 / profile-not-found is expected for a newly
         * registered patient who has not completed their profile.
         */
        if (
          error.response?.status === 404 ||
          error.response?.status === 400
        ) {
          setProfileExists(false);
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

  const getProfileCompletion = () => {
    if (!profile) return 25;

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

    return Math.round((completed / fields.length) * 100);
  };

  const profileCompletion = getProfileCompletion();

  return (
    <div className="min-h-screen bg-[#F7F6F0] text-[#173D2D]">

      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <header className="sticky top-0 z-30 border-b border-[#E3E1D6] bg-[#FBFAF5]/95 backdrop-blur">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">

          {/* Logo */}
          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#A8B39A] bg-[#EEF1E8] text-lg font-medium text-[#173D2D]">
              A
            </div>

            <div>
              <p className="text-[11px] font-semibold tracking-[0.25em] text-[#71834F]">
                AYURSUTRA
              </p>

              <p className="text-xs tracking-[0.12em] text-[#8A9188]">
                PANCHAKARMA & WELLNESS
              </p>
            </div>

          </div>

          {/* User */}
          <div className="flex items-center gap-4">

            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-[#173D2D]">
                {user?.fullName}
              </p>

              <p className="text-xs uppercase tracking-[0.12em] text-[#71834F]">
                Patient
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#173D2D] text-sm font-semibold text-white">
              {user?.fullName?.charAt(0).toUpperCase()}
            </div>

            <button
              onClick={logout}
              className="rounded-full border border-[#C9CEC2] bg-white px-4 py-2 text-sm font-medium text-[#173D2D] transition hover:border-[#173D2D] hover:bg-[#173D2D] hover:text-white"
            >
              Logout
            </button>

          </div>
        </div>
      </header>


      {/* ===================================================== */}
      {/* MAIN */}
      {/* ===================================================== */}

      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8 lg:py-10">

        {/* =================================================== */}
        {/* WELCOME */}
        {/* =================================================== */}

        <section className="mb-8">

          <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-[#71834F]">
            Your Wellness Journey
          </p>

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-[#173D2D] sm:text-4xl">
                Welcome, {user?.fullName?.split(" ")[0]}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#68736C] sm:text-base">
                Your Ayurvedic care journey, thoughtfully organized
                in one place.
              </p>
            </div>

            <button
              onClick={() => navigate("/patient/profile")}
              className="w-fit rounded-full bg-[#173D2D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#24533F] hover:shadow-lg"
            >
              {profileExists
                ? "View My Profile"
                : "Complete My Profile"}
            </button>

          </div>
        </section>


        {/* =================================================== */}
        {/* PROFILE COMPLETION */}
        {/* =================================================== */}

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
                      {profileExists
                        ? "Your patient profile"
                        : "Complete your patient profile"}
                    </p>

                    <p className="mt-1 text-sm leading-6 text-[#718078]">
                      {profileExists
                        ? "Keep your information up to date so your care team has the right details."
                        : "Add your basic health information to help your AyurSutra care team personalize your experience."}
                    </p>
                  </div>

                </div>

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

              <div className="flex items-center border-t border-[#E5E5DD] bg-[#F3F4ED] px-6 py-5 lg:border-l lg:border-t-0">

                <button
                  onClick={() =>
                    navigate("/patient/profile")
                  }
                  className="w-full rounded-full border border-[#AEB8A4] px-5 py-2.5 text-sm font-semibold text-[#173D2D] transition hover:bg-[#173D2D] hover:text-white lg:w-auto"
                >
                  {profileExists
                    ? "Manage Profile"
                    : "Complete Profile"}
                </button>

              </div>

            </div>

          </div>

        </section>


        {/* =================================================== */}
        {/* QUICK ACCESS */}
        {/* =================================================== */}

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

            {/* Profile */}
            <button
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


            {/* Therapies */}
            <button
              disabled
              className="cursor-default rounded-3xl border border-[#DDDCD3] bg-white p-6 text-left"
            >

              <div className="flex items-center justify-between">

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F2EEDC] text-lg">
                  ◈
                </div>

                <span className="rounded-full bg-[#F1F2ED] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-[#7D867E]">
                  Coming Soon
                </span>

              </div>

              <p className="mt-5 text-xs font-medium uppercase tracking-[0.16em] text-[#71834F]">
                My Therapies
              </p>

              <h3 className="mt-1 text-lg font-semibold text-[#173D2D]">
                Panchakarma Care
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#778078]">
                View your assigned therapies and treatment schedule.
              </p>

            </button>


            {/* Progress */}
            <button
              disabled
              className="cursor-default rounded-3xl border border-[#DDDCD3] bg-white p-6 text-left"
            >

              <div className="flex items-center justify-between">

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E8EFEB] text-lg">
                  ↗
                </div>

                <span className="rounded-full bg-[#F1F2ED] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-[#7D867E]">
                  Coming Soon
                </span>

              </div>

              <p className="mt-5 text-xs font-medium uppercase tracking-[0.16em] text-[#71834F]">
                My Progress
              </p>

              <h3 className="mt-1 text-lg font-semibold text-[#173D2D]">
                Wellness Progress
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#778078]">
                Track your treatment journey and wellness progress.
              </p>

            </button>

          </div>

        </section>


        {/* =================================================== */}
        {/* LOWER GRID */}
        {/* =================================================== */}

        <section className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">

          {/* Care Overview */}
          <div className="rounded-3xl border border-[#DDDCD3] bg-white p-6 sm:p-7">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#71834F]">
                  Care Overview
                </p>

                <h2 className="mt-1 text-xl font-semibold text-[#173D2D]">
                  Your Ayurvedic care
                </h2>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EEF1E8]">
                ✦
              </div>

            </div>


            <div className="mt-6 divide-y divide-[#ECECE5]">

              <div className="flex items-center justify-between py-4">

                <div>
                  <p className="text-sm font-medium text-[#173D2D]">
                    Current treatment plan
                  </p>

                  <p className="mt-1 text-xs text-[#7A827C]">
                    Your personalized Panchakarma plan
                  </p>
                </div>

                <span className="rounded-full bg-[#F2F3ED] px-3 py-1 text-xs text-[#7A827C]">
                  Not assigned
                </span>

              </div>


              <div className="flex items-center justify-between py-4">

                <div>
                  <p className="text-sm font-medium text-[#173D2D]">
                    Next therapy
                  </p>

                  <p className="mt-1 text-xs text-[#7A827C]">
                    Your upcoming therapy session
                  </p>
                </div>

                <span className="rounded-full bg-[#F2F3ED] px-3 py-1 text-xs text-[#7A827C]">
                  Not scheduled
                </span>

              </div>


              <div className="flex items-center justify-between py-4">

                <div>
                  <p className="text-sm font-medium text-[#173D2D]">
                    Wellness progress
                  </p>

                  <p className="mt-1 text-xs text-[#7A827C]">
                    Treatment progress and observations
                  </p>
                </div>

                <span className="rounded-full bg-[#F2F3ED] px-3 py-1 text-xs text-[#7A827C]">
                  Coming soon
                </span>

              </div>

            </div>

          </div>


          {/* Wellness Card */}
          <div className="relative overflow-hidden rounded-3xl bg-[#173D2D] p-7 text-white">

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
                Ayurveda encourages consistency. Stay connected
                with your care plan and make space for rest,
                mindful routines and balanced living.
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


        {/* =================================================== */}
        {/* FOOTER */}
        {/* =================================================== */}

        <footer className="mt-10 border-t border-[#DDDCD3] pt-6">

          <div className="flex flex-col justify-between gap-2 text-xs text-[#8A918B] sm:flex-row">

            <p>
              AyurSutra · Panchakarma & Wellness
            </p>

            <p>
              Your care, thoughtfully organized.
            </p>

          </div>

        </footer>

      </main>
    </div>
  );
}

export default PatientDashboard;