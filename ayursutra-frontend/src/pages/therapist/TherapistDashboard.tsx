import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  HeartPulse,
  UserRound,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import {
  getMyTherapistProfile,
  getSessionsByTherapist,
  getMyPatients,
} from "../../services/therapist/therapistService";

import type {
  TherapistResponse,
  TherapySession,
} from "../../services/therapist/therapistService";

//import { getAllPatients } from "../../services/doctor/doctorService";

function TherapistDashboard() {
  const { user } = useAuth();

  const [therapist, setTherapist] =
    useState<TherapistResponse | null>(null);

  const [sessions, setSessions] =
    useState<TherapySession[]>([]);

  const [patients, setPatients] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [profileError, setProfileError] =
    useState(false);

  const [sessionError, setSessionError] =
    useState(false);

  // =========================================================
  // LOAD DASHBOARD DATA
  // =========================================================

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      setLoading(true);
      setProfileError(false);
      setSessionError(false);

      let therapistProfile:
        | TherapistResponse
        | null = null;

      // -----------------------------------------------------
      // LOAD THERAPIST PROFILE
      // -----------------------------------------------------

      try {
        therapistProfile =
          await getMyTherapistProfile();

        if (mounted) {
          setTherapist(therapistProfile);
        }
      } catch (error) {
        console.error(
          "Failed to load therapist profile:",
          error
        );

        if (mounted) {
          setProfileError(true);
        }
      }

      // -----------------------------------------------------
      // LOAD THERAPIST SESSIONS
      // -----------------------------------------------------

      if (therapistProfile) {
        try {
          const therapistSessions =
            await getSessionsByTherapist(
              therapistProfile.id
            );

          if (mounted) {
            setSessions(
              therapistSessions ?? []
            );
          }

          // ---------------------------------------------------
          // PATIENT INFORMATION IS OPTIONAL
          // ---------------------------------------------------

          try {
            const assignedPatients =
              await getMyPatients();

            if (mounted) {
              setPatients(
                assignedPatients ?? []
              );
            }
          } catch (error) {
            console.warn(
              "Patient details could not be loaded:",
              error
            );

            if (mounted) {
              setPatients([]);
            }
          }
        } catch (error) {
          console.error(
            "Failed to load therapist sessions:",
            error
          );

          if (mounted) {
            setSessions([]);
            setSessionError(true);
          }
        }
      }

      if (mounted) {
        setLoading(false);
      }
    };

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  // =========================================================
  // TODAY
  // =========================================================

  const today = useMemo(() => {
    const date = new Date();

    const year =
      date.getFullYear();

    const month =
      String(date.getMonth() + 1)
        .padStart(2, "0");

    const day =
      String(date.getDate())
        .padStart(2, "0");

    return `${year}-${month}-${day}`;
  }, []);

  // =========================================================
  // GREETING
  // =========================================================

  const greeting = useMemo(() => {
    const hour =
      new Date().getHours();

    if (hour < 12) {
      return "Good morning";
    }

    if (hour < 17) {
      return "Good afternoon";
    }

    return "Good evening";
  }, []);

  // =========================================================
  // FORMATTED DATE
  // =========================================================

  const formattedToday = useMemo(() => {
    return new Date().toLocaleDateString(
      "en-IN",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  }, []);

  // =========================================================
  // TODAY'S SESSIONS
  // =========================================================

  const todaysSessions = useMemo(() => {
    return sessions
      .filter(
        (session) =>
          session.sessionDate === today
      )
      .sort((a, b) =>
        (a.startTime ?? "").localeCompare(
          b.startTime ?? ""
        )
      );
  }, [sessions, today]);

  // =========================================================
  // ASSIGNED PATIENTS
  // =========================================================

  const assignedPatientCount = useMemo(() => {
    const patientIds = new Set(
      sessions.map(
        (session) =>
          session.patientId
      )
    );

    return patientIds.size;
  }, [sessions]);

  // =========================================================
  // IN PROGRESS
  // =========================================================

  const inProgressCount = useMemo(() => {
    return sessions.filter(
      (session) =>
        session.status ===
        "IN_PROGRESS"
    ).length;
  }, [sessions]);

  // =========================================================
  // COMPLETED TODAY
  // =========================================================

  const completedTodayCount =
    useMemo(() => {
      return sessions.filter(
        (session) =>
          session.sessionDate ===
          today &&
          session.status ===
          "COMPLETED"
      ).length;
    }, [sessions, today]);

  // =========================================================
  // FORMAT TIME
  // =========================================================

  const formatTime = (
    time: string | null
  ) => {
    if (!time) {
      return "Time not set";
    }

    const [hours, minutes] =
      time.split(":");

    const date = new Date();

    date.setHours(
      Number(hours),
      Number(minutes),
      0,
      0
    );

    return date.toLocaleTimeString(
      "en-IN",
      {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }
    );
  };

  // =========================================================
  // STATUS LABEL
  // =========================================================

  const getStatusLabel = (
    status: string
  ) => {
    switch (
    status?.toUpperCase()
    ) {
      case "PLANNED":
      case "SCHEDULED":
        return "Scheduled";

      case "IN_PROGRESS":
        return "In Progress";

      case "COMPLETED":
        return "Completed";

      case "CANCELLED":
        return "Cancelled";

      case "SKIPPED":
        return "Skipped";

      default:
        return "Unknown";
    }
  };

  // =========================================================
  // STATUS STYLE
  // =========================================================

  const getStatusClasses = (
    status: string
  ) => {
    switch (
    status?.toUpperCase()
    ) {
      case "PLANNED":
      case "SCHEDULED":
        return "border-[#D7E2F0] bg-[#EEF3FA] text-[#466A94]";

      case "IN_PROGRESS":
        return "border-[#E9DCC4] bg-[#F7F0E3] text-[#947541]";

      case "COMPLETED":
        return "border-[#D5E8DE] bg-[#EAF3EF] text-[#3C8A70]";

      case "CANCELLED":
        return "border-[#ECD8D2] bg-[#F7EDEA] text-[#A66A5B]";

      case "SKIPPED":
        return "border-[#E1DED8] bg-[#F2F1EF] text-[#77736D]";

      default:
        return "border-gray-200 bg-gray-50 text-gray-600";
    }
  };

  const displayName =
    therapist?.fullName ||
    user?.fullName ||
    "Therapist";

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-full bg-[#F7F6F1] px-6 py-8 lg:px-8">
        <div className="mx-auto flex min-h-[620px] max-w-[1380px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-[#E5EBDD] border-t-[#1F3D2E]" />

            <p className="mt-4 text-sm font-medium text-[#3F4D40]">
              Preparing your workspace...
            </p>

            <p className="mt-1 text-xs text-[#8B847A]">
              Loading your therapy information
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // DASHBOARD
  // =========================================================

  return (
    <div className="min-h-full bg-[#F7F6F1] px-6 py-7 text-[#173D2D] lg:px-8 lg:py-8">
      <div className="mx-auto w-full max-w-[1380px]">

        {/* ===================================================
            WELCOME HEADER
        ==================================================== */}

        <section className="mb-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

            <div>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#173D2D] sm:text-4xl">
                {greeting},{" "}
                {displayName}
              </h1>

              <p className="mt-2 text-sm leading-6 text-[#6D655B] sm:text-[15px]">
                Your therapy schedule and patient care overview.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-[#DDDCD3] bg-white px-4 py-3 shadow-sm">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8EFE4] text-[#526B3D]">
                <CalendarDays className="h-4 w-4" />
              </div>

              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#91897C]">
                  Today
                </p>

                <p className="mt-0.5 text-sm font-medium text-[#315A46]">
                  {formattedToday}
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* ===================================================
            PROFILE ERROR
        ==================================================== */}

        {profileError && (
          <div className="mb-6 rounded-xl border border-[#E7CFC8] bg-[#FBF3F0] px-5 py-4">
            <p className="text-sm font-medium text-[#9A6257]">
              We couldn't load your therapist profile.
            </p>

            <p className="mt-1 text-xs text-[#A6786E]">
              Please refresh the page or contact an administrator if the problem continues.
            </p>
          </div>
        )}

        {/* ===================================================
            DAILY OVERVIEW
        ==================================================== */}

        <section className="mb-7">

          <div className="mb-4">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#71834F]">
              Today's Overview
            </p>

            {/* <h2 className="mt-1 text-xl font-semibold text-[#173D2D]">
              Your care at a glance
            </h2> */}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {/* MY PATIENTS */}

            <div className="rounded-2xl border border-[#DDDCD3] bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-medium text-[#665F56]">
                    My Patients
                  </p>

                  <p className="mt-2 text-3xl font-semibold text-[#173D2D]">
                    {assignedPatientCount}
                  </p>

                  <p className="mt-1 text-xs text-[#8B847A]">
                    Patients under your care
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8EFE4] text-[#526B3D]">
                  <UsersRound className="h-5 w-5" />
                </div>

              </div>
            </div>

            {/* TODAY'S SESSIONS */}

            <div className="rounded-2xl border border-[#DDDCD3] bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-medium text-[#665F56]">
                    Today's Sessions
                  </p>

                  <p className="mt-2 text-3xl font-semibold text-[#173D2D]">
                    {todaysSessions.length}
                  </p>

                  <p className="mt-1 text-xs text-[#8B847A]">
                    Scheduled for today
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F4EFE3] text-[#806A3B]">
                  <CalendarDays className="h-5 w-5" />
                </div>

              </div>
            </div>

            {/* IN PROGRESS */}

            <div className="rounded-2xl border border-[#DDDCD3] bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-medium text-[#665F56]">
                    In Progress
                  </p>

                  <p className="mt-2 text-3xl font-semibold text-[#173D2D]">
                    {inProgressCount}
                  </p>

                  <p className="mt-1 text-xs text-[#8B847A]">
                    Treatments underway
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F7F0E3] text-[#947541]">
                  <HeartPulse className="h-5 w-5" />
                </div>

              </div>
            </div>

            {/* COMPLETED */}

            <div className="rounded-2xl border border-[#DDDCD3] bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-medium text-[#665F56]">
                    Completed Today
                  </p>

                  <p className="mt-2 text-3xl font-semibold text-[#173D2D]">
                    {completedTodayCount}
                  </p>

                  <p className="mt-1 text-xs text-[#8B847A]">
                    Sessions completed
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF3EF] text-[#3C8A70]">
                  <CheckCircle2 className="h-5 w-5" />
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* ===================================================
            SCHEDULE + PROFILE
        ==================================================== */}

        <section className="grid items-start gap-6 xl:grid-cols-[1.55fr_0.85fr]">

          {/* =================================================
              TODAY'S SCHEDULE
          ================================================== */}

          <div className="overflow-hidden rounded-2xl border border-[#DDDCD3] bg-white shadow-sm">

            <div className="flex items-center justify-between border-b border-[#E8E5DD] px-5 py-5">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8EFE4] text-[#526B3D]">
                  <CalendarDays className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-[#173D2D]">
                    Today's Schedule
                  </h2>

                  <p className="mt-0.5 text-sm text-[#7A7268]">
                    Therapy sessions scheduled for today.
                  </p>
                </div>

              </div>

              <Link
                to="/therapist/sessions"
                className="hidden items-center gap-1.5 text-sm font-semibold text-[#4F6B3C] transition hover:text-[#173D2D] sm:inline-flex"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>

            </div>

            {sessionError ? (

              <div className="px-6 py-12 text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F7F0E3] text-[#947541]">
                  <CalendarDays className="h-5 w-5" />
                </div>

                <p className="mt-4 text-sm font-semibold text-[#3F4D40]">
                  Schedule unavailable
                </p>

                <p className="mt-1 text-sm text-[#8A8278]">
                  We couldn't load your therapy sessions.
                </p>

                <Link
                  to="/therapist/sessions"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#D9D2C3] px-4 py-2.5 text-sm font-medium text-[#315A46] transition hover:bg-[#F7F5EF]"
                >
                  Open sessions
                  <ArrowRight className="h-4 w-4" />
                </Link>

              </div>

            ) : todaysSessions.length === 0 ? (

              <div className="px-6 py-14 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EEF1E8] text-[#71834F]">
                  <Clock3 className="h-6 w-6" />
                </div>

                <p className="mt-4 text-sm font-semibold text-[#3F4D40]">
                  Your schedule is clear
                </p>

                <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-[#8A8278]">
                  You have no therapy sessions scheduled for today.
                </p>

                <Link
                  to="/therapist/sessions"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[#D9D2C3] px-4 py-2.5 text-sm font-medium text-[#315A46] transition hover:bg-[#F7F5EF]"
                >
                  View my sessions
                  <ArrowRight className="h-4 w-4" />
                </Link>

              </div>

            ) : (

              <div className="divide-y divide-[#EEEAE2]">

                {todaysSessions
                  .slice(0, 5)
                  .map((session) => {

                    const patient =
                      patients.find(
                        (item) =>
                          item.id ===
                          session.patientId
                      );

                    return (
                      <div
                        key={session.id}
                        className="px-5 py-4 transition hover:bg-[#FBFAF7]"
                      >

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                          <div className="min-w-0">

                            <div className="flex flex-wrap items-center gap-2">

                              <h3 className="text-sm font-semibold text-[#173D2D]">
                                {session.therapyName}
                              </h3>

                              <span
                                className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${getStatusClasses(
                                  session.status
                                )}`}
                              >
                                {getStatusLabel(
                                  session.status
                                )}
                              </span>

                            </div>

                            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#6D655B]">

                              <span className="inline-flex items-center gap-1.5">
                                <UserRound className="h-3.5 w-3.5 text-[#8A918B]" />

                                {patient?.fullName ??
                                  "Assigned patient"}
                              </span>

                              <span className="text-[#D5D0C8]">
                                •
                              </span>

                              <span>
                                Day {session.dayNumber}
                              </span>

                              <span className="text-[#D5D0C8]">
                                •
                              </span>

                              <span>
                                {session.plannedDurationMinutes} min
                              </span>

                            </div>

                          </div>

                          <div className="flex shrink-0 items-center gap-2 rounded-xl bg-[#F7F6F1] px-3 py-2.5">

                            <Clock3 className="h-4 w-4 text-[#71834F]" />

                            <div>
                              <p className="text-sm font-semibold text-[#3F4D40]">
                                {formatTime(
                                  session.startTime
                                )}
                              </p>

                              {session.endTime && (
                                <p className="text-[11px] text-[#91897C]">
                                  until{" "}
                                  {formatTime(
                                    session.endTime
                                  )}
                                </p>
                              )}
                            </div>

                          </div>

                        </div>

                      </div>
                    );
                  })}

              </div>
            )}

            <div className="border-t border-[#EEEAE2] px-5 py-4 sm:hidden">
              <Link
                to="/therapist/sessions"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#4F6B3C]"
              >
                View all sessions
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

          </div>

          {/* =================================================
              PROFESSIONAL PROFILE
          ================================================== */}

          <div className="overflow-hidden rounded-2xl border border-[#DDDCD3] bg-white shadow-sm">

            <div className="border-b border-[#E8E5DD] px-5 py-5">

              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#71834F]">
                Professional Profile
              </p>

              <h2 className="mt-1 text-lg font-semibold text-[#173D2D]">
                Your Details
              </h2>

            </div>

            {therapist ? (

              <div className="px-5 py-6">

                {/* PROFILE HEADER */}

                <div className="flex items-center gap-4 pb-6">

                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#E8EFE4] text-[#526B3D]">
                    <UserRound className="h-6 w-6" />
                  </div>

                  <div>
                    <p className="text-base font-semibold text-[#173D2D]">
                      {therapist.fullName}
                    </p>

                    <p className="mt-0.5 text-sm text-[#7A6A59]">
                      {therapist.therapistType}
                    </p>
                  </div>

                </div>

                {/* PROFILE DETAILS */}

                <div className="space-y-5 border-t border-[#EEEAE2] pt-6">

                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#8B7B68]">
                      Specialization
                    </p>

                    <p className="mt-1 text-sm font-medium text-[#3F4D40]">
                      {therapist.specialization}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#8B7B68]">
                      Qualification
                    </p>

                    <p className="mt-1 text-sm leading-5 text-[#3F4D40]">
                      {therapist.qualification}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#8B7B68]">
                      Experience
                    </p>

                    <p className="mt-1 text-sm font-medium text-[#3F4D40]">
                      {therapist.experienceYears} years
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#8B7B68]">
                      Availability
                    </p>

                    <div className="mt-1 flex items-center gap-2">

                      <span
                        className={`h-2 w-2 rounded-full ${therapist.available
                            ? "bg-[#6B7F4E]"
                            : "bg-[#A66A5B]"
                          }`}
                      />

                      <p className="text-sm font-medium text-[#3F4D40]">
                        {therapist.available
                          ? "Available"
                          : "Currently unavailable"}
                      </p>

                    </div>
                  </div>

                </div>

                {/* PROFILE LINK */}

                <Link
                  to="/therapist/profile"
                  className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#D9D2C3] px-4 py-2.5 text-sm font-medium text-[#315A46] transition hover:bg-[#F7F5EF]"
                >
                  View profile
                  <ArrowRight className="h-4 w-4" />
                </Link>

              </div>

            ) : (

              <div className="px-5 py-12 text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F7F0E3] text-[#947541]">
                  <UserRound className="h-5 w-5" />
                </div>

                <p className="mt-4 text-sm font-medium text-[#3F4D40]">
                  Therapist profile unavailable
                </p>

              </div>

            )}

          </div>

        </section>

      </div>
    </div>
  );
}

export default TherapistDashboard;