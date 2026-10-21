import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BedDouble,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  HeartPulse,
  Sparkles,
  Stethoscope,
  Users,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../services/api/client";

import Sidebar from "../../components/dashboard/Sidebar";
import Topbar from "../../components/dashboard/Topbar";
import StatCard from "../../components/dashboard/StatCard";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface Patient {
  id: string;
  fullName?: string;
  email?: string;
  phone?: string;
}

interface Doctor {
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

interface Therapist {
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

interface Therapy {
  id: string;
  name?: string;
  description?: string;
  durationMinutes?: number;
  duration?: number;
  type?: string;
  category?: string;
  active?: boolean;
}

interface Room {
  id: string;
  roomNumber: string;
  name: string;
  type: string;
  capacity: number;
  description: string;
  active: boolean;
}

interface TherapyPlan {
  id: string;
  patientId: string;
  doctorId: string;
  planName: string;
  diagnosis: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface TherapySession {
  id: string;
  therapyPlanId: string;
  patientId: string;
  therapistId: string;
  roomId: string;
  therapyId: string;
  therapyName: string;
  dayNumber: number;
  sequenceOrder: number;
  sessionDate: string;
  startTime: string;
  endTime: string;
  plannedDurationMinutes: number;
  actualDurationMinutes?: number;
  status: string;
  notes?: string;
}

function AdminDashboard() {
  const navigate = useNavigate();

  const { user } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [patientCount, setPatientCount] =
    useState<number | null>(null);

  const [doctorCount, setDoctorCount] =
    useState<number | null>(null);

  const [therapistCount, setTherapistCount] =
    useState<number | null>(null);

  const [therapyCount, setTherapyCount] =
    useState<number | null>(null);

  const [roomCount, setRoomCount] =
    useState<number | null>(null);

  const [activePlanCount, setActivePlanCount] =
    useState<number | null>(null);

  const [todaySessions, setTodaySessions] =
    useState<TherapySession[]>([]);

  const [rooms, setRooms] =
    useState<Room[]>([]);

  const [therapies, setTherapies] =
    useState<Therapy[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // =========================================================
  // TODAY'S DATE
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
  // FETCH DASHBOARD DATA
  // =========================================================

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          patientsResponse,
          doctorsResponse,
          therapistsResponse,
          therapiesResponse,
          roomsResponse,
          plansResponse,
          sessionsResponse,
        ] = await Promise.all([
          apiClient.get<ApiResponse<Patient[]>>(
            "/patients"
          ),

          apiClient.get<ApiResponse<Doctor[]>>(
            "/doctors"
          ),

          apiClient.get<ApiResponse<Therapist[]>>(
            "/therapists"
          ),

          apiClient.get<ApiResponse<Therapy[]>>(
            "/therapies"
          ),

          apiClient.get<ApiResponse<Room[]>>(
            "/rooms"
          ),

          apiClient.get<ApiResponse<TherapyPlan[]>>(
            "/therapy-plans"
          ),

          apiClient.get<ApiResponse<TherapySession[]>>(
            `/therapy-sessions/date/${today}`
          ),
        ]);

        // =====================================================
        // COUNTS
        // =====================================================

        const patients =
          patientsResponse.data.data ?? [];

        const doctors =
          doctorsResponse.data.data ?? [];

        const therapists =
          therapistsResponse.data.data ?? [];

        const fetchedTherapies =
          therapiesResponse.data.data ?? [];

        const fetchedRooms =
          roomsResponse.data.data ?? [];

        const plans =
          plansResponse.data.data ?? [];

        const sessions =
          sessionsResponse.data.data ?? [];

        setPatientCount(
          patients.length
        );

        setDoctorCount(
          doctors.length
        );

        setTherapistCount(
          therapists.length
        );

        setTherapyCount(
          fetchedTherapies.length
        );

        setTherapies(
          fetchedTherapies
        );

        setRoomCount(
          fetchedRooms.length
        );

        setRooms(
          fetchedRooms
        );

        // =====================================================
        // ACTIVE THERAPY PLANS
        // =====================================================

        const activePlans =
          plans.filter((plan) => {
            const status =
              plan.status?.toUpperCase();

            return (
              status === "ACTIVE" ||
              status === "ONGOING" ||
              status === "IN_PROGRESS"
            );
          });

        setActivePlanCount(
          activePlans.length
        );

        // =====================================================
        // TODAY'S SESSIONS
        // =====================================================

        setTodaySessions(
          sessions
        );
      } catch (apiError) {
        console.error(
          "Admin dashboard API error:",
          apiError
        );

        setError(
          "Unable to load some dashboard data. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [today]);

  // =========================================================
  // SESSION COUNTS
  // =========================================================

  const completedSessions =
    todaySessions.filter(
      (session) =>
        session.status?.toUpperCase() ===
        "COMPLETED"
    ).length;


  const upcomingSessions =
    todaySessions.filter(
      (session) => {
        const status =
          session.status?.toUpperCase();

        return (
          status !== "COMPLETED" &&
          status !== "CANCELLED"
        );
      }
    ).length;

  // =========================================================
  // FORMAT TIME
  // =========================================================

  const formatTime = (
    time?: string
  ) => {
    if (!time) {
      return "--";
    }

    const [hours, minutes] =
      time.split(":");

    const hour =
      Number(hours);

    const suffix =
      hour >= 12
        ? "PM"
        : "AM";

    const formattedHour =
      hour % 12 || 12;

    return `${formattedHour}:${minutes} ${suffix}`;
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatToday = () => {
    const date = new Date();

    return date.toLocaleDateString(
      "en-IN",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  };

  // =========================================================
  // SESSION STATUS
  // =========================================================

  const getStatusClasses = (
    status?: string
  ) => {
    switch (
    status?.toUpperCase()
    ) {
      case "COMPLETED":
        return "bg-[#E5F0E7] text-[#356044]";

      case "CANCELLED":
        return "bg-[#F7E7E4] text-[#8B4A42]";

      case "IN_PROGRESS":
        return "bg-[#E8EFE0] text-[#617341]";

      case "SCHEDULED":
        return "bg-[#E8EEF3] text-[#496579]";

      default:
        return "bg-[#F3F0E6] text-[#756B4A]";
    }
  };

  // =========================================================
  // QUICK ACTION
  // =========================================================

  const handleQuickAction = (
    path: string
  ) => {
    navigate(path);
  };

  // =========================================================
  // JSX
  // =========================================================

  return (
    <div className="flex min-h-screen bg-[#F8F6F0]">

      {/* ================================================= */}
      {/* SIDEBAR */}
      {/* ================================================= */}

      <Sidebar
        role={user?.role || "ADMIN"}
        isOpen={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
      />

      {/* ================================================= */}
      {/* MAIN AREA */}
      {/* ================================================= */}

      <div className="flex min-w-0 flex-1 flex-col lg:ml-72">

        {/* ================================================= */}
        {/* TOPBAR */}
        {/* ================================================= */}

        <Topbar
          title="Admin Dashboard"
          userName={user?.fullName}
          role={user?.role}
          userEmail={user?.email}
          onMenuClick={() =>
            setSidebarOpen(true)
          }
        />

        {/* ================================================= */}
        {/* MAIN CONTENT */}
        {/* ================================================= */}

        <main className="flex-1 p-5 md:p-8">

          {/* ================================================= */}
          {/* WELCOME */}
          {/* ================================================= */}

          <section className="mb-8">

            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">

              <div>

                <h2 className="font-serif text-3xl font-medium tracking-tight text-[#1F3D2E] md:text-4xl">
                  Welcome back, {user?.fullName}
                </h2>

              </div>

              <div className="flex items-center gap-2 text-sm text-[#718078]">

                <CalendarDays size={17} />

                <span>
                  {formatToday()}
                </span>

              </div>

            </div>

          </section>

          {/* ================================================= */}
          {/* ERROR */}
          {/* ================================================= */}

          {error && (
            <div className="mb-6 rounded-xl border border-[#E2C8C3] bg-[#FFF8F6] px-5 py-4 text-sm text-[#8B4A42]">
              {error}
            </div>
          )}

          {/* ================================================= */}
          {/* PEOPLE & RESOURCES */}
          {/* ================================================= */}

          <section>

            <div className="mb-4">

              <h3 className="text-lg font-semibold text-[#1F3D2E]">
                Clinic Overview
              </h3>

            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">

              <StatCard
                title="Patients"
                value={patientCount ?? 0}
                icon={Users}
                loading={loading}
              />

              <StatCard
                title="Doctors"
                value={doctorCount ?? 0}
                icon={Stethoscope}
                loading={loading}
              />

              <StatCard
                title="Therapists"
                value={therapistCount ?? 0}
                icon={HeartPulse}
                loading={loading}
              />

              <StatCard
                title="Therapies"
                value={therapyCount ?? 0}
                icon={Sparkles}
                loading={loading}
              />

              <StatCard
                title="Rooms"
                value={roomCount ?? 0}
                icon={BedDouble}
                loading={loading}
              />

            </div>

          </section>

          {/* ================================================= */}
          {/* TREATMENT ACTIVITY */}
          {/* ================================================= */}

          <section className="mt-8">

            <div className="mb-4">

              <h3 className="text-lg font-semibold text-[#1F3D2E]">
                Treatment Activity
              </h3>

            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

              <StatCard
                title="Active Plans"
                value={activePlanCount ?? 0}
                icon={ClipboardList}
                loading={loading}
              />

              <StatCard
                title="Today's Sessions"
                value={todaySessions.length}
                icon={CalendarClock}
                loading={loading}
              />

              <StatCard
                title="Completed"
                value={completedSessions}
                icon={CheckCircle2}
                loading={loading}
              />

              <StatCard
                title="Upcoming"
                value={upcomingSessions}
                icon={Clock3}
                loading={loading}
              />

            </div>

          </section>

          {/* ================================================= */}
          {/* TODAY'S SCHEDULE + ROOM OVERVIEW */}
          {/* ================================================= */}

          <section className="mt-8 grid gap-6 xl:grid-cols-[1.6fr_1fr]">

            {/* ================================================= */}
            {/* AVAILABLE THERAPIES */}
            {/* ================================================= */}

            <div className="rounded-2xl border border-[#E1E4DB] bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-[#EEF0EA] px-6 py-5">
                <div>
                  <h3 className="font-semibold text-[#1F3D2E]">
                    Available Therapies
                  </h3>

                  <p className="mt-1 text-xs text-[#7A806F]">
                    Therapies currently offered by the clinic.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/admin/therapies")
                  }
                  className="hidden items-center gap-1 text-sm font-medium text-[#617341] transition hover:text-[#1F3D2E] sm:flex"
                >
                  View all
                  <ArrowRight size={16} />
                </button>
              </div>

              <div className="max-h-[360px] overflow-y-auto p-6">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((item) => (
                      <div
                        key={item}
                        className="h-16 animate-pulse rounded-xl bg-[#F3F4EE]"
                      />
                    ))}
                  </div>
                ) : therapies.length === 0 ? (
                  <div className="flex min-h-40 flex-col items-center justify-center text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E9EFE4] text-[#617341]">
                      <Sparkles size={22} />
                    </div>

                    <p className="mt-4 text-sm font-medium text-[#1F3D2E]">
                      No therapies available
                    </p>

                    <p className="mt-1 text-xs text-[#7A806F]">
                      No therapy records are currently available.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {therapies
                      .slice(0, 6)
                      .map((therapy) => (
                        <div
                          key={therapy.id}
                          className="rounded-xl border border-[#EEF0EA] bg-[#FCFCF9] px-4 py-4"
                        >
                          <div className="flex items-center justify-between gap-4">

                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E9EFE4] text-[#1F3D2E]">
                                <Sparkles size={18} />
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-[#1F3D2E]">
                                  {therapy.name || "Unnamed Therapy"}
                                </p>

                                <p className="mt-1 text-xs text-[#7A806F]">
                                  {therapy.category ||
                                    therapy.type ||
                                    "Ayurvedic Therapy"}
                                </p>
                              </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-3">
                              <div className="hidden text-right sm:block">
                                <p className="text-xs font-medium text-[#1F3D2E]">
                                  {therapy.durationMinutes ??
                                    therapy.duration ??
                                    "--"}{" "}
                                  min
                                </p>
                              </div>

                              <span
                                className={`rounded-full px-3 py-1 text-[10px] font-semibold ${therapy.active === false
                                    ? "bg-[#F3E8E5] text-[#8B4A42]"
                                    : "bg-[#E5F0E7] text-[#356044]"
                                  }`}
                              >
                                {therapy.active === false
                                  ? "Inactive"
                                  : "Active"}
                              </span>
                            </div>

                          </div>
                        </div>
                      ))}

                    
                  </div>
                )}
              </div>
            </div>

            {/* ================================================= */}
            {/* ROOM OVERVIEW */}
            {/* ================================================= */}

            <div className="rounded-2xl border border-[#E1E4DB] bg-white shadow-sm">

              <div className="flex items-center justify-between border-b border-[#EEF0EA] px-6 py-5">

                <div>

                  <h3 className="font-semibold text-[#1F3D2E]">
                    Room Overview
                  </h3>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/admin/rooms")
                  }
                  className="flex items-center gap-1 text-sm font-medium text-[#617341] transition hover:text-[#1F3D2E]"
                >
                  View all
                  <ArrowRight size={16} />
                </button>

              </div>

              <div className="max-h-[360px] overflow-y-auto p-6">

                {loading ? (
                  <div className="space-y-4">

                    {[1, 2, 3, 4].map(
                      (item) => (
                        <div
                          key={item}
                          className="h-14 animate-pulse rounded-xl bg-[#F3F4EE]"
                        />
                      )
                    )}

                  </div>
                ) : rooms.length === 0 ? (

                  <div className="flex min-h-40 flex-col items-center justify-center text-center">

                    <BedDouble
                      size={28}
                      className="text-[#71834F]"
                    />

                    <p className="mt-3 text-sm font-medium text-[#1F3D2E]">
                      No rooms found
                    </p>

                  </div>

                ) : (

                  <div className="space-y-3">

                    {rooms.map((room) => (

                      <div
                        key={room.id}
                        className="flex items-center justify-between rounded-xl border border-[#EEF0EA] bg-[#FCFCF9] px-4 py-3"
                      >

                        <div className="flex min-w-0 items-center gap-3">

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E9EFE4] text-[#1F3D2E]">
                            <BedDouble size={17} />
                          </div>

                          <div className="min-w-0">

                            <p className="truncate text-sm font-medium text-[#1F3D2E]">
                              {room.roomNumber}
                            </p>

                            <p className="truncate text-xs text-[#7A806F]">
                              {room.name}
                            </p>

                          </div>

                        </div>

                        <span
                          className={`ml-3 shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${room.active
                              ? "bg-[#E5F0E7] text-[#356044]"
                              : "bg-[#F3E5E2] text-[#8B4A42]"
                            }`}
                        >
                          {room.active
                            ? "Active"
                            : "Inactive"}
                        </span>

                      </div>

                    ))}

                  </div>

                )}

              </div>

            </div>

          </section>

          {/* ================================================= */}
          {/* QUICK ACTIONS */}
          {/* ================================================= */}

          <section className="mt-8">

            <div className="mb-4">

              <h3 className="text-lg font-semibold text-[#1F3D2E]">
                Quick Actions
              </h3>

            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <button
                type="button"
                onClick={() =>
                  handleQuickAction(
                    "/admin/patients"
                  )
                }
                className="group flex items-center justify-between rounded-2xl border border-[#E1E4DB] bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#C9D4C2] hover:shadow-md"
              >

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E9EFE4] text-[#1F3D2E]">
                    <Users size={19} />
                  </div>

                  <p className="text-sm font-semibold text-[#1F3D2E]">
                    Manage Patients
                  </p>

                </div>

                <ArrowRight
                  size={17}
                  className="text-[#A0A899] transition group-hover:translate-x-1 group-hover:text-[#617341]"
                />

              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickAction(
                    "/admin/doctors"
                  )
                }
                className="group flex items-center justify-between rounded-2xl border border-[#E1E4DB] bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#C9D4C2] hover:shadow-md"
              >

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E9EFE4] text-[#1F3D2E]">
                    <Stethoscope size={19} />
                  </div>

                  <p className="text-sm font-semibold text-[#1F3D2E]">
                    Manage Doctors
                  </p>

                </div>

                <ArrowRight
                  size={17}
                  className="text-[#A0A899] transition group-hover:translate-x-1 group-hover:text-[#617341]"
                />

              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickAction(
                    "/admin/therapists"
                  )
                }
                className="group flex items-center justify-between rounded-2xl border border-[#E1E4DB] bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#C9D4C2] hover:shadow-md"
              >

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E9EFE4] text-[#1F3D2E]">
                    <HeartPulse size={19} />
                  </div>

                  <p className="text-sm font-semibold text-[#1F3D2E]">
                    Manage Therapists
                  </p>

                </div>

                <ArrowRight
                  size={17}
                  className="text-[#A0A899] transition group-hover:translate-x-1 group-hover:text-[#617341]"
                />

              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickAction(
                    "/admin/therapies"
                  )
                }
                className="group flex items-center justify-between rounded-2xl border border-[#E1E4DB] bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#C9D4C2] hover:shadow-md"
              >

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E9EFE4] text-[#1F3D2E]">
                    <Sparkles size={19} />
                  </div>

                  <p className="text-sm font-semibold text-[#1F3D2E]">
                    Manage Therapies
                  </p>

                </div>

                <ArrowRight
                  size={17}
                  className="text-[#A0A899] transition group-hover:translate-x-1 group-hover:text-[#617341]"
                />

              </button>

            </div>

          </section>

        </main>

      </div>

    </div>
  );
}

export default AdminDashboard;