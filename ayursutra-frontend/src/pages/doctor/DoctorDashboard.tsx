import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  DoorOpen,
  FileText,
  UserRound,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import apiClient from "../../services/api/client";

import {
  getAllPatients,
  getAllRooms,
  getAllTherapists,
  type PatientResponse,
  type RoomResponse,
  type TherapistResponse,
} from "../../services/doctor/doctorService";

/*
 * ============================================================
 * TYPES
 * ============================================================
 */

interface TherapyPlan {
  id: string;
  patientId: string;
  doctorId: string;
  planName: string;
  diagnosis: string | null;
  startDate: string;
  endDate: string;
  status: string;
  therapies: {
    day: number;
    therapyId: string;
    therapyName: string;
    durationMinutes: number;
    sequenceOrder: number;
  }[];
}

interface TherapySession {
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
  startTime: string;
  endTime: string;
  plannedDurationMinutes: number;
  actualDurationMinutes: number | null;
  status: string;
  notes: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/*
 * ============================================================
 * COMPONENT
 * ============================================================
 */

function DoctorDashboard() {
  const { user } = useAuth();

  /*
   * ============================================================
   * STATE
   * ============================================================
   */

  const [patients, setPatients] = useState<
    PatientResponse[]
  >([]);

  const [therapists, setTherapists] = useState<
    TherapistResponse[]
  >([]);

  const [rooms, setRooms] = useState<
    RoomResponse[]
  >([]);

  const [therapyPlans, setTherapyPlans] =
    useState<TherapyPlan[]>([]);

  const [sessions, setSessions] = useState<
    TherapySession[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /*
   * ============================================================
   * LOAD DASHBOARD DATA
   * ============================================================
   */

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        /*
         * Load the doctor's plans and supporting data.
         */
        const [
          plansResponse,
          patientsResponse,
          therapistsResponse,
          roomsResponse,
        ] = await Promise.all([
          apiClient.get<
            ApiResponse<TherapyPlan[]>
          >("/therapy-plans/doctor/my"),

          getAllPatients(),

          getAllTherapists(),

          getAllRooms(),
        ]);

        const doctorPlans =
          plansResponse.data.data ?? [];

        setTherapyPlans(doctorPlans);
        setPatients(
          patientsResponse ?? []
        );
        setTherapists(
          therapistsResponse ?? []
        );
        setRooms(roomsResponse ?? []);

        /*
         * ======================================================
         * LOAD SESSIONS FOR DOCTOR'S PLANS
         * ======================================================
         *
         * We don't use the generic date endpoint because it
         * could potentially return sessions belonging to other
         * doctors.
         *
         * Instead:
         *
         * Doctor
         *   ↓
         * Doctor's Therapy Plans
         *   ↓
         * Sessions belonging to those plans
         */

        const sessionResponses =
          await Promise.all(
            doctorPlans.map(async (plan) => {
              try {
                const response =
                  await apiClient.get<
                    ApiResponse<TherapySession[]>
                  >(
                    `/therapy-sessions/plan/${plan.id}`
                  );

                return (
                  response.data.data ?? []
                );
              } catch (sessionError) {
                console.error(
                  `Failed to load sessions for plan ${plan.id}:`,
                  sessionError
                );

                return [];
              }
            })
          );

        setSessions(
          sessionResponses.flat()
        );
      } catch (err) {
        console.error(
          "Failed to load doctor dashboard data:",
          err
        );

        setError(
          "Unable to load dashboard data. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  /*
   * ============================================================
   * CURRENT DATE
   * ============================================================
   *
   * We generate YYYY-MM-DD using the browser's local date.
   */

  const today = useMemo(() => {
    const date = new Date();

    const year =
      date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }, []);

  /*
   * ============================================================
   * TODAY'S SESSIONS
   * ============================================================
   */

  const todaysSessions = useMemo(() => {
    return sessions
      .filter(
        (session) =>
          session.sessionDate === today
      )
      .sort((a, b) => {
        const timeA =
          a.startTime ?? "";

        const timeB =
          b.startTime ?? "";

        return timeA.localeCompare(
          timeB
        );
      });
  }, [sessions, today]);

  /*
   * ============================================================
   * ACTIVE PLANS
   * ============================================================
   */

  const activePlans = useMemo(() => {
    return therapyPlans.filter(
      (plan) => {
        const status =
          plan.status?.toUpperCase();

        return (
          status === "IN_PROGRESS" ||
          status === "ACTIVE"
        );
      }
    );
  }, [therapyPlans]);

  /*
   * ============================================================
   * COMPLETED PLANS
   * ============================================================
   */

  const completedPlans = useMemo(() => {
    return therapyPlans.filter(
      (plan) =>
        plan.status?.toUpperCase() ===
        "COMPLETED"
    );
  }, [therapyPlans]);
  /*
 * ============================================================
 * PATIENTS UNDER THIS DOCTOR'S CARE
 * ============================================================
 *
 * A patient belongs to this doctor's dashboard when they have
 * a therapy plan created by this doctor.
 */

  const doctorPatientIds = useMemo(() => {
    return new Set(
      therapyPlans.map(
        (plan) => plan.patientId
      )
    );
  }, [therapyPlans]);

  /*
   * ============================================================
   * RECENT PATIENTS
   * ============================================================
   *
   * A patient is considered recent when they have a therapy
   * plan. We sort plans by start date and take the latest
   * unique patients.
   */

  const recentPatients =
    useMemo(() => {
      const sortedPlans = [
        ...therapyPlans,
      ].sort((a, b) =>
        (b.startDate ?? "").localeCompare(
          a.startDate ?? ""
        )
      );

      const patientIds =
        new Set<string>();

      const result: PatientResponse[] =
        [];

      for (const plan of sortedPlans) {
        if (
          patientIds.has(
            plan.patientId
          )
        ) {
          continue;
        }

        const patient =
          patients.find(
            (item) =>
              item.id ===
              plan.patientId
          );

        if (patient) {
          patientIds.add(
            plan.patientId
          );

          result.push(patient);
        }

        if (result.length === 5) {
          break;
        }
      }

      return result;
    }, [
      therapyPlans,
      patients,
    ]);

  /*
   * ============================================================
   * PATIENT LOOKUP
   * ============================================================
   */

  const getPatient = (
    patientId: string
  ) => {
    return patients.find(
      (patient) =>
        patient.id === patientId
    );
  };

  /*
   * ============================================================
   * THERAPIST LOOKUP
   * ============================================================
   */

  const getTherapist = (
    therapistId: string | null
  ) => {
    if (!therapistId) {
      return undefined;
    }

    return therapists.find(
      (therapist) =>
        therapist.id === therapistId
    );
  };

  /*
   * ============================================================
   * ROOM LOOKUP
   * ============================================================
   */

  const getRoom = (
    roomId: string | null
  ) => {
    if (!roomId) {
      return undefined;
    }

    return rooms.find(
      (room) => room.id === roomId
    );
  };

  /*
   * ============================================================
   * FORMAT TIME
   * ============================================================
   */

  const formatTime = (
    time: string
  ) => {
    if (!time) {
      return "—";
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

  /*
   * ============================================================
   * FORMAT STATUS
   * ============================================================
   */

  const getDisplayStatus = (
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

      default:
        return "Unknown";
    }
  };

  /*
   * ============================================================
   * STATUS STYLING
   * ============================================================
   */

  const getStatusClasses = (
    status: string
  ) => {
    switch (
    status?.toUpperCase()
    ) {
      case "PLANNED":
      case "SCHEDULED":
        return "border-blue-200 bg-blue-50 text-blue-700";

      case "IN_PROGRESS":
        return "border-amber-200 bg-amber-50 text-amber-700";

      case "COMPLETED":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";

      case "CANCELLED":
        return "border-red-200 bg-red-50 text-red-700";

      default:
        return "border-gray-200 bg-gray-50 text-gray-600";
    }
  };

  /*
   * ============================================================
   * GREETING
   * ============================================================
   */

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

  /*
   * ============================================================
   * LOADING STATE
   * ============================================================
   */

  if (loading) {
    return (
      <div className="flex min-h-[600px] items-center justify-center bg-[#F7F6F1]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-700" />

          <p className="mt-4 text-sm font-medium text-gray-700">
            Loading your clinical dashboard...
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Fetching patients, treatment plans and sessions
          </p>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * DASHBOARD
   * ============================================================
   */

  return (
    <div className="min-h-full bg-[#F7F6F1] px-6 py-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1500px]">

        {/* ======================================================
            ERROR
        ======================================================= */}

        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
            <p className="text-sm font-medium text-red-700">
              {error}
            </p>
          </div>
        )}

        {/* ======================================================
    HEADER
======================================================= */}

        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#173F32] sm:text-4xl">
            {greeting}, Dr. {user?.fullName ?? "Doctor"}
          </h1>

          <p className="mt-2 text-sm text-[#665849] sm:text-[15px]">
            Here's your clinical overview for today.
          </p>
        </div>

        {/* ======================================================
            STAT CARDS
        ======================================================= */}

        <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {/* PATIENTS */}

          <div className="rounded-2xl border border-[#DDD8CC] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-[#665849]">
                  Patients
                </p>

                <p className="mt-3 text-3xl font-semibold text-[#173F32]">
                  {doctorPatientIds.size}
                </p>

                <p className="mt-1 text-xs text-[#8B8478]">
                  Under your care
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E4EFE8] text-[#087F5B]">
                <UsersRound className="h-5 w-5" />
              </div>

            </div>
          </div>

          {/* ACTIVE PLANS */}

          <div className="rounded-2xl border border-[#DDD8CC] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-[#665849]">
                  Active Plans
                </p>

                <p className="mt-3 text-3xl font-semibold text-[#173F32]">
                  {activePlans.length}
                </p>

                <p className="mt-1 text-xs text-[#8B8478]">
                  Currently in progress
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F2EBDD] text-[#806A3B]">
                <ClipboardList className="h-5 w-5" />
              </div>

            </div>
          </div>

          {/* TODAY'S SESSIONS */}

          <div className="rounded-2xl border border-[#DDD8CC] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-[#665849]">
                  Today's Sessions
                </p>

                <p className="mt-3 text-3xl font-semibold text-[#173F32]">
                  {todaysSessions.length}
                </p>

                <p className="mt-1 text-xs text-[#8B8478]">
                  Scheduled for today
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8EEF7] text-blue-600">
                <CalendarDays className="h-5 w-5" />
              </div>

            </div>
          </div>

          {/* COMPLETED PLANS */}

          <div className="rounded-2xl border border-[#DDD8CC] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-[#665849]">
                  Completed Plans
                </p>

                <p className="mt-3 text-3xl font-semibold text-[#173F32]">
                  {completedPlans.length}
                </p>

                <p className="mt-1 text-xs text-[#8B8478]">
                  Finished treatment plans
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E5F3ED] text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>

            </div>
          </div>

        </div>

        {/* ======================================================
            TODAY'S SESSIONS
        ======================================================= */}

        <section className="mt-6 overflow-hidden rounded-2xl border border-[#DDD8CC] bg-white shadow-sm">

          <div className="flex flex-col gap-3 border-b border-[#E5E1D8] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                  <CalendarDays className="h-4 w-4 text-emerald-700" />
                </div>

                <h2 className="text-lg font-semibold text-[#173F32]">
                  Today's Sessions
                </h2>
              </div>

              <p className="mt-1 text-sm text-[#766F63]">
                Your scheduled therapy sessions for today.
              </p>
            </div>

            <Link
              to="/doctor/sessions"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 transition hover:text-emerald-900"
            >
              View all sessions
              <ArrowRight className="h-4 w-4" />
            </Link>

          </div>

          {todaysSessions.length === 0 ? (

            /* EMPTY */

            <div className="flex min-h-[220px] items-center justify-center px-6 py-10">
              <div className="text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EAF0E5] text-[#4F6B3C]">
                  <CalendarDays className="h-6 w-6" />
                </div>

                <p className="mt-4 font-medium text-[#4E463D]">
                  No sessions scheduled for today
                </p>

                <p className="mt-1 text-sm text-[#91897C]">
                  Your scheduled therapy sessions will appear here.
                </p>

              </div>
            </div>

          ) : (

            /* SESSION LIST */

            <div className="divide-y divide-[#EEEAE2]">

              {todaysSessions
                .slice(0, 5)
                .map((session) => {

                  const patient =
                    getPatient(
                      session.patientId
                    );

                  const therapist =
                    getTherapist(
                      session.therapistId
                    );

                  const room =
                    getRoom(
                      session.roomId
                    );

                  return (
                    <div
                      key={session.id}
                      className="px-5 py-4 transition hover:bg-[#FBFAF7]"
                    >

                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                        {/* LEFT */}

                        <div className="min-w-0 flex-1">

                          <div className="flex flex-wrap items-center gap-2">

                            <h3 className="text-base font-semibold text-[#173F32]">
                              {
                                session.therapyName
                              }
                            </h3>

                            <span
                              className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                                session.status
                              )}`}
                            >
                              {
                                getDisplayStatus(
                                  session.status
                                )
                              }
                            </span>

                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#665849]">

                            <span className="inline-flex items-center gap-1.5">
                              <UserRound className="h-4 w-4 text-gray-400" />

                              {patient?.fullName ??
                                "Unknown Patient"}
                            </span>

                            <span className="hidden text-gray-300 sm:inline">
                              •
                            </span>

                            <span>
                              Day{" "}
                              {
                                session.dayNumber
                              }
                            </span>

                          </div>

                        </div>

                        {/* MIDDLE */}

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:w-[420px]">

                          {/* TIME */}

                          <div className="rounded-xl bg-[#F7F6F1] px-3 py-2.5">

                            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                              <Clock3 className="h-3.5 w-3.5" />
                              Time
                            </div>

                            <p className="mt-1 text-sm font-medium text-gray-800">
                              {formatTime(
                                session.startTime
                              )}
                            </p>

                            <p className="text-xs text-gray-400">
                              to{" "}
                              {formatTime(
                                session.endTime
                              )}
                            </p>

                          </div>

                          {/* THERAPIST */}

                          <div className="rounded-xl bg-[#F7F6F1] px-3 py-2.5">

                            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                              <UsersRound className="h-3.5 w-3.5" />
                              Therapist
                            </div>

                            <p className="mt-1 truncate text-sm font-medium text-gray-800">
                              {therapist?.fullName ??
                                "Not assigned"}
                            </p>

                          </div>

                          {/* ROOM */}

                          <div className="rounded-xl bg-[#F7F6F1] px-3 py-2.5">

                            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                              <DoorOpen className="h-3.5 w-3.5" />
                              Room
                            </div>

                            <p className="mt-1 truncate text-sm font-medium text-gray-800">
                              {room?.roomNumber ??
                                "Not assigned"}
                            </p>

                          </div>

                        </div>

                      </div>

                    </div>
                  );
                })}

            </div>

          )}

        </section>

        {/* ======================================================
            LOWER GRID
        ======================================================= */}

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">

          {/* ====================================================
              ACTIVE TREATMENT PLANS
          ===================================================== */}

          <section className="overflow-hidden rounded-2xl border border-[#DDD8CC] bg-white shadow-sm">

            <div className="flex items-center justify-between border-b border-[#E5E1D8] px-5 py-5">

              <div>
                <div className="flex items-center gap-2">

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F2EBDD] text-[#806A3B]">
                    <ClipboardList className="h-4 w-4" />
                  </div>

                  <h2 className="text-lg font-semibold text-[#173F32]">
                    Active Treatment Plans
                  </h2>

                </div>

                <p className="mt-1 text-sm text-[#766F63]">
                  Plans currently in progress.
                </p>
              </div>

              <Link
                to="/doctor/plans"
                className="text-sm font-medium text-emerald-700 hover:text-emerald-900"
              >
                View all
              </Link>

            </div>

            {activePlans.length === 0 ? (

              <div className="px-5 py-12 text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                  <ClipboardList className="h-5 w-5 text-gray-400" />
                </div>

                <p className="mt-3 text-sm font-medium text-gray-700">
                  No active treatment plans
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Active plans will appear here.
                </p>

              </div>

            ) : (

              <div className="divide-y divide-[#EEEAE2]">

                {activePlans
                  .slice(0, 4)
                  .map((plan) => {

                    const patient =
                      getPatient(
                        plan.patientId
                      );

                    return (
                      <Link
                        key={plan.id}
                        to={`/doctor/patients/${plan.patientId}`}
                        className="block px-5 py-4 transition hover:bg-[#FBFAF7]"
                      >

                        <div className="flex items-center justify-between gap-4">

                          <div className="min-w-0">

                            <p className="truncate text-sm font-semibold text-gray-900">
                              {
                                plan.planName
                              }
                            </p>

                            <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">

                              <UserRound className="h-3.5 w-3.5" />

                              {
                                patient?.fullName ??
                                "Unknown Patient"
                              }

                            </div>

                          </div>

                          <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                            In Progress
                          </span>

                        </div>

                        {plan.diagnosis && (
                          <p className="mt-2 truncate text-xs text-gray-400">
                            {plan.diagnosis}
                          </p>
                        )}

                      </Link>
                    );
                  })}

              </div>

            )}

          </section>

          {/* ====================================================
              RECENT PATIENTS
          ===================================================== */}

          <section className="overflow-hidden rounded-2xl border border-[#DDD8CC] bg-white shadow-sm">

            <div className="flex items-center justify-between border-b border-[#E5E1D8] px-5 py-5">

              <div>
                <div className="flex items-center gap-2">

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E4EFE8] text-[#087F5B]">
                    <UsersRound className="h-4 w-4" />
                  </div>

                  <h2 className="text-lg font-semibold text-[#173F32]">
                    Recent Patients
                  </h2>

                </div>

                <p className="mt-1 text-sm text-[#766F63]">
                  Patients recently receiving care.
                </p>
              </div>

              <Link
                to="/doctor/patients"
                className="text-sm font-medium text-emerald-700 hover:text-emerald-900"
              >
                View all
              </Link>

            </div>

            {recentPatients.length === 0 ? (

              <div className="px-5 py-12 text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                  <UsersRound className="h-5 w-5 text-gray-400" />
                </div>

                <p className="mt-3 text-sm font-medium text-gray-700">
                  No recent patients
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Patient activity will appear here.
                </p>

              </div>

            ) : (

              <div className="divide-y divide-[#EEEAE2]">

                {recentPatients.map(
                  (patient) => (
                    <Link
                      key={patient.id}
                      to={`/doctor/patients/${patient.id}`}
                      className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-[#FBFAF7]"
                    >

                      {/* Avatar */}

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E4EFE8] text-sm font-semibold text-[#315A46]">
                        {patient.fullName
                          ?.charAt(0)
                          ?.toUpperCase() ??
                          "P"}
                      </div>

                      {/* Details */}

                      <div className="min-w-0 flex-1">

                        <p className="truncate text-sm font-medium text-gray-900">
                          {
                            patient.fullName
                          }
                        </p>

                        <p className="mt-0.5 truncate text-xs text-gray-400">
                          {patient.email ||
                            patient.phone ||
                            "Patient"}
                        </p>

                      </div>

                      <ArrowRight className="h-4 w-4 shrink-0 text-gray-300" />

                    </Link>
                  )
                )}

              </div>

            )}

          </section>

        </div>

        {/* ======================================================
            QUICK ACCESS
        ======================================================= */}

        <section className="mt-6 rounded-2xl border border-[#DDD8CC] bg-white p-5 shadow-sm">

          <div className="mb-4">

            <h2 className="text-lg font-semibold text-[#173F32]">
              Quick Access
            </h2>

            <p className="mt-1 text-sm text-[#766F63]">
              Common clinical workflows.
            </p>

          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

            {/* PATIENTS */}

            <Link
              to="/doctor/patients"
              className="group flex items-center gap-4 rounded-xl border border-[#E5E1D8] bg-[#FBFAF7] p-4 transition hover:border-emerald-200 hover:bg-emerald-50/40"
            >

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-700 shadow-sm">
                <UsersRound className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">

                <p className="text-sm font-semibold text-gray-800">
                  Patient Records
                </p>

                <p className="mt-0.5 text-xs text-gray-400">
                  Review patient care
                </p>

              </div>

              <ArrowRight className="h-4 w-4 text-gray-300 transition group-hover:translate-x-1 group-hover:text-emerald-600" />

            </Link>

            {/* PLANS */}

            <Link
              to="/doctor/plans"
              className="group flex items-center gap-4 rounded-xl border border-[#E5E1D8] bg-[#FBFAF7] p-4 transition hover:border-emerald-200 hover:bg-emerald-50/40"
            >

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#806A3B] shadow-sm">
                <FileText className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">

                <p className="text-sm font-semibold text-gray-800">
                  Therapy Plans
                </p>

                <p className="mt-0.5 text-xs text-gray-400">
                  Review treatment plans
                </p>

              </div>

              <ArrowRight className="h-4 w-4 text-gray-300 transition group-hover:translate-x-1 group-hover:text-emerald-600" />

            </Link>

            {/* SESSIONS */}

            <Link
              to="/doctor/sessions"
              className="group flex items-center gap-4 rounded-xl border border-[#E5E1D8] bg-[#FBFAF7] p-4 transition hover:border-emerald-200 hover:bg-emerald-50/40"
            >

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                <Clock3 className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">

                <p className="text-sm font-semibold text-gray-800">
                  Therapy Sessions
                </p>

                <p className="mt-0.5 text-xs text-gray-400">
                  View scheduled treatments
                </p>

              </div>

              <ArrowRight className="h-4 w-4 text-gray-300 transition group-hover:translate-x-1 group-hover:text-emerald-600" />

            </Link>

          </div>

        </section>

      </div>
    </div>
  );
}

export default DoctorDashboard;