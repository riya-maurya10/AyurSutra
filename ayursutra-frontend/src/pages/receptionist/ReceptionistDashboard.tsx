import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Stethoscope,
  Users,
  UserRoundCog,
  RefreshCw,
  BedDouble,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import {
  getReceptionistPatients,
  getReceptionistDoctors,
  getReceptionistTherapists,
  getReceptionistSessionsByDate,
  type TherapySession,
} from "../../services/receptionist/receptionistService";

import type {
  PatientResponse,
  DoctorResponse,
  TherapistResponse,
} from "../../services/doctor/doctorService";

function ReceptionistDashboard() {
  const { user } = useAuth();

  const [patients, setPatients] = useState<PatientResponse[]>([]);
  const [doctors, setDoctors] = useState<DoctorResponse[]>([]);
  const [therapists, setTherapists] = useState<TherapistResponse[]>([]);
  const [todaySessions, setTodaySessions] = useState<TherapySession[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const today = useMemo(() => {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }, []);

  const loadDashboard = async (isRefresh = false) => {
    try {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [
        patientsData,
        doctorsData,
        therapistsData,
        sessionsData,
      ] = await Promise.all([
        getReceptionistPatients(),
        getReceptionistDoctors(),
        getReceptionistTherapists(),
        getReceptionistSessionsByDate(today),
      ]);

      setPatients(patientsData);
      setDoctors(doctorsData);
      setTherapists(therapistsData);
      setTodaySessions(sessionsData);
    } catch (err) {
      console.error("Failed to load receptionist dashboard:", err);
      setError("Unable to load dashboard information.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const availableDoctors = doctors.filter(
    (doctor) => doctor.available
  );

  const availableTherapists = therapists.filter(
    (therapist) => therapist.available
  );

  const scheduledSessions = todaySessions.filter(
    (session) =>
      session.status === "PLANNED" ||
      session.status === "SCHEDULED" ||
      session.status === "IN_PROGRESS"
  );

  const completedSessions = todaySessions.filter(
    (session) => session.status === "COMPLETED"
  );

  const formatTime = (time: string | null) => {
    if (!time) {
      return "Time not set";
    }

    const [hours, minutes] = time.split(":").map(Number);

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getSessionStatusLabel = (
    status: TherapySession["status"]
  ) => {
    switch (status) {
      case "PLANNED":
        return "Planned";

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
        return status;
    }
  };

  const getSessionStatusClass = (
    status: TherapySession["status"]
  ) => {
    switch (status) {
      case "COMPLETED":
        return "bg-[#E8F2E8] text-[#3F6B45]";

      case "IN_PROGRESS":
        return "bg-[#FFF1D8] text-[#9A6A20]";

      case "CANCELLED":
      case "SKIPPED":
        return "bg-[#F9E6E2] text-[#9A4F43]";

      default:
        return "bg-[#EEF1E6] text-[#53683D]";
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0]">
      <main className="p-6 md:p-8">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#6B7F4E]">
              Front Desk
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1F3D2E] md:text-4xl">
              Welcome, {user?.fullName || "Receptionist"}
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-[#6A6258] md:text-base">
              Manage patients, appointments and daily clinic operations from
              one place.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* TODAY */}

            <div className="hidden rounded-xl border border-[#E3DDCF] bg-white px-4 py-3 text-right sm:block">
              <p className="text-xs uppercase tracking-[0.15em] text-[#8A8174]">
                Today
              </p>

              <p className="mt-1 text-sm font-semibold text-[#1F3D2E]">
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* REFRESH — ICON ONLY */}

            <button
              type="button"
              onClick={() => loadDashboard(true)}
              disabled={loading || refreshing}
              aria-label="Refresh dashboard"
              title="Refresh dashboard"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#DCC8A3] bg-white text-[#1F3D2E] transition hover:bg-[#F4F0E7] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={18}
                className={refreshing ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="mt-6 rounded-xl border border-[#E6C7C1] bg-[#FDF0ED] px-4 py-3 text-sm text-[#914D43]">
            {error}
          </div>
        )}

        {/* =====================================================
            MAIN METRIC CARDS
        ===================================================== */}

        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

          {/* PATIENTS */}

          <div className="rounded-2xl border border-[#E8E2D5] bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-[#7A806F]">
                  Total Patients
                </p>

                <p className="mt-3 text-3xl font-semibold text-[#1F3D2E]">
                  {loading ? "—" : patients.length}
                </p>

                <p className="mt-2 text-xs text-[#8A8174]">
                  Registered patients
                </p>
              </div>

              <div className="rounded-xl bg-[#EEF1E6] p-3">
                <Users
                  size={21}
                  className="text-[#53683D]"
                />
              </div>
            </div>
          </div>

          {/* DOCTORS */}

          <div className="rounded-2xl border border-[#E8E2D5] bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-[#7A806F]">
                  Doctors
                </p>

                <p className="mt-3 text-3xl font-semibold text-[#1F3D2E]">
                  {loading ? "—" : doctors.length}
                </p>

                <p className="mt-2 text-xs text-[#8A8174]">
                  {loading
                    ? "Loading doctors..."
                    : `${availableDoctors.length} available today`}
                </p>
              </div>

              <div className="rounded-xl bg-[#F1EBDD] p-3">
                <Stethoscope
                  size={21}
                  className="text-[#8A6A3F]"
                />
              </div>
            </div>
          </div>

          {/* THERAPISTS */}

          <div className="rounded-2xl border border-[#E8E2D5] bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-[#7A806F]">
                  Therapists
                </p>

                <p className="mt-3 text-3xl font-semibold text-[#1F3D2E]">
                  {loading ? "—" : therapists.length}
                </p>

                <p className="mt-2 text-xs text-[#6B7F4E]">
                  {loading
                    ? "Checking availability..."
                    : `${availableTherapists.length} available today`}
                </p>
              </div>

              <div className="rounded-xl bg-[#EEF1E6] p-3">
                <UserRoundCog
                  size={21}
                  className="text-[#53683D]"
                />
              </div>
            </div>
          </div>

          {/* TODAY'S SESSIONS */}

          <div className="rounded-2xl border border-[#E8E2D5] bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-[#7A806F]">
                  Today's Sessions
                </p>

                <p className="mt-3 text-3xl font-semibold text-[#1F3D2E]">
                  {loading ? "—" : todaySessions.length}
                </p>

                <p className="mt-2 text-xs text-[#8A8174]">
                  {loading
                    ? "Loading sessions..."
                    : `${completedSessions.length} completed`}
                </p>
              </div>

              <div className="rounded-xl bg-[#F1EBDD] p-3">
                <CalendarDays
                  size={21}
                  className="text-[#8A6A3F]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            TODAY'S OPERATIONS + THERAPIST AVAILABILITY
        ===================================================== */}

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.5fr_1fr]">

          {/* ===================================================
              TODAY'S OPERATIONS
          =================================================== */}

          <section className="flex h-[520px] min-h-0 flex-col rounded-2xl border border-[#E8E2D5] bg-white shadow-sm">

            {/* HEADER — FIXED */}

            <div className="flex shrink-0 items-center justify-between border-b border-[#EEE9DE] px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-[#1F3D2E]">
                  Today's Operations
                </h2>

                <p className="mt-1 text-sm text-[#7A806F]">
                  Therapy sessions scheduled for today.
                </p>
              </div>

              <div className="rounded-xl bg-[#F4F1E9] p-2.5">
                <Clock3
                  size={18}
                  className="text-[#6B7F4E]"
                />
              </div>
            </div>

            {/* SCROLLABLE CONTENT */}

            <div className="min-h-0 flex-1 overflow-y-auto p-6 [scrollbar-width:thin]">

              {loading ? (
                <div className="py-10 text-center text-sm text-[#8A8174]">
                  Loading today's sessions...
                </div>
              ) : todaySessions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#DDD6C8] bg-[#FAF9F5] px-6 py-10 text-center">
                  <CalendarDays
                    size={28}
                    className="mx-auto text-[#9AA08D]"
                  />

                  <p className="mt-3 text-sm font-medium text-[#5F6656]">
                    No sessions scheduled for today
                  </p>

                  <p className="mt-1 text-xs text-[#8A8174]">
                    Today's therapy schedule will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">

                  {todaySessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex flex-col gap-3 rounded-xl border border-[#ECE7DB] bg-[#FCFBF8] p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-start gap-3">

                        <div className="mt-0.5 rounded-lg bg-[#EEF1E6] p-2">
                          <Clock3
                            size={17}
                            className="text-[#53683D]"
                          />
                        </div>

                        <div className="min-w-0">

                          <p className="truncate text-sm font-semibold text-[#1F3D2E]">
                            {session.therapyName}
                          </p>

                          <p className="mt-1 text-xs text-[#7A806F]">
                            Session #{session.sequenceOrder} · Day{" "}
                            {session.dayNumber}
                          </p>

                          <p className="mt-1 text-xs text-[#8A8174]">
                            {formatTime(session.startTime)}

                            {session.endTime
                              ? ` – ${formatTime(session.endTime)}`
                              : ""}
                          </p>

                        </div>
                      </div>

                      <span
                        className={`w-fit shrink-0 rounded-full px-3 py-1 text-xs font-medium ${getSessionStatusClass(
                          session.status
                        )}`}
                      >
                        {getSessionStatusLabel(session.status)}
                      </span>
                    </div>
                  ))}

                </div>
              )}
            </div>
          </section>

          {/* ===================================================
              THERAPIST AVAILABILITY
          =================================================== */}

          <section className="flex h-[520px] min-h-0 flex-col rounded-2xl border border-[#E8E2D5] bg-white shadow-sm">

            {/* HEADER — FIXED */}

            <div className="flex shrink-0 items-center justify-between border-b border-[#EEE9DE] px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-[#1F3D2E]">
                  Therapist Availability
                </h2>

                <p className="mt-1 text-sm text-[#7A806F]">
                  Current therapist availability.
                </p>
              </div>

              <div className="rounded-xl bg-[#EEF1E6] p-2.5">
                <UserRoundCog
                  size={18}
                  className="text-[#53683D]"
                />
              </div>
            </div>

            {/* SCROLLABLE CONTENT */}

            <div className="min-h-0 flex-1 overflow-y-auto p-6 [scrollbar-width:thin]">

              {loading ? (
                <div className="py-10 text-center text-sm text-[#8A8174]">
                  Loading therapists...
                </div>
              ) : therapists.length === 0 ? (
                <div className="py-10 text-center text-sm text-[#8A8174]">
                  No therapists found.
                </div>
              ) : (
                <div className="space-y-3">

                  {therapists.map((therapist) => (
                    <div
                      key={therapist.id}
                      className="flex items-center justify-between rounded-xl border border-[#ECE7DB] bg-[#FCFBF8] px-4 py-3"
                    >
                      <div className="min-w-0">

                        <p className="truncate text-sm font-medium text-[#1F3D2E]">
                          {therapist.fullName}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-[#8A8174]">
                          {therapist.specialization || "Therapist"}
                        </p>

                      </div>

                      <div className="ml-4 flex shrink-0 items-center gap-2">

                        <span
                          className={`h-2 w-2 rounded-full ${
                            therapist.available
                              ? "bg-[#6B7F4E]"
                              : "bg-[#B7AFA1]"
                          }`}
                        />

                        <span
                          className={`text-xs font-medium ${
                            therapist.available
                              ? "text-[#53683D]"
                              : "text-[#8A8174]"
                          }`}
                        >
                          {therapist.available
                            ? "Available"
                            : "Unavailable"}
                        </span>

                      </div>
                    </div>
                  ))}

                </div>
              )}
            </div>
          </section>
        </div>

        {/* =====================================================
            DOCTORS
        ===================================================== */}

        <div className="mt-8">
          <section className="rounded-2xl border border-[#E8E2D5] bg-white shadow-sm">

            <div className="flex items-center justify-between border-b border-[#EEE9DE] px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-[#1F3D2E]">
                  Doctors
                </h2>
                <p className="mt-1 text-sm text-[#7A806F]">
                  Doctors available at the clinic.
                </p>
              </div>

              <div className="rounded-xl bg-[#F1EBDD] p-2.5">
                <Stethoscope
                  size={18}
                  className="text-[#8A6A3F]"
                />
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="h-24 animate-pulse rounded-xl border border-[#ECE7DB] bg-[#FCFBF8]"
                    />
                  ))}
                </div>
              ) : doctors.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#DDD6C8] bg-[#FAF9F5] px-6 py-10 text-center">
                  <Stethoscope
                    size={28}
                    className="mx-auto text-[#9AA08D]"
                  />
                  <p className="mt-3 text-sm font-medium text-[#5F6656]">
                    No doctors found
                  </p>
                  <p className="mt-1 text-xs text-[#8A8174]">
                    Doctor information will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {doctors.map((doctor) => (
                    <div
                      key={doctor.id}
                      className="group rounded-xl border border-[#ECE7DB] bg-[#FCFBF8] p-4 transition hover:-translate-y-0.5 hover:border-[#DCC8A3] hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F1EBDD]">
                            <Stethoscope
                              size={18}
                              className="text-[#8A6A3F]"
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#1F3D2E]">
                              Dr. {doctor.fullName}
                            </p>
                            <p className="mt-1 truncate text-xs text-[#8A8174]">
                              {doctor.specialization ||
                                doctor.qualification ||
                                "Ayurvedic Doctor"}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                            doctor.available
                              ? "bg-[#E8F2E8] text-[#3F6B45]"
                              : "bg-[#F2EEE8] text-[#8A8174]"
                          }`}
                        >
                          {doctor.available
                            ? "Available"
                            : "Unavailable"}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center gap-2 border-t border-[#EEE9DE] pt-3">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            doctor.available
                              ? "bg-[#6B7F4E]"
                              : "bg-[#B7AFA1]"
                          }`}
                        />
                        <span className="text-xs text-[#7A806F]">
                          {doctor.available
                            ? "Available for appointments"
                            : "Currently unavailable"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* =====================================================
            QUICK OVERVIEW
        ===================================================== */}

        <div className="mt-6 grid gap-4 md:grid-cols-3">

          {/* ACTIVE SESSIONS */}

          <div className="rounded-2xl border border-[#E8E2D5] bg-white px-5 py-4 shadow-sm">
            <div className="flex items-center gap-3">

              <div className="rounded-lg bg-[#EEF1E6] p-2">
                <CheckCircle2
                  size={18}
                  className="text-[#53683D]"
                />
              </div>

              <div>
                <p className="text-xs text-[#8A8174]">
                  Active sessions
                </p>

                <p className="mt-0.5 text-lg font-semibold text-[#1F3D2E]">
                  {loading ? "—" : scheduledSessions.length}
                </p>
              </div>

            </div>
          </div>

          {/* COMPLETED */}

          <div className="rounded-2xl border border-[#E8E2D5] bg-white px-5 py-4 shadow-sm">
            <div className="flex items-center gap-3">

              <div className="rounded-lg bg-[#F1EBDD] p-2">
                <Clock3
                  size={18}
                  className="text-[#8A6A3F]"
                />
              </div>

              <div>
                <p className="text-xs text-[#8A8174]">
                  Completed today
                </p>

                <p className="mt-0.5 text-lg font-semibold text-[#1F3D2E]">
                  {loading ? "—" : completedSessions.length}
                </p>
              </div>

            </div>
          </div>

          {/* AVAILABLE THERAPISTS */}

          <div className="rounded-2xl border border-[#E8E2D5] bg-white px-5 py-4 shadow-sm">
            <div className="flex items-center gap-3">

              <div className="rounded-lg bg-[#EEF1E6] p-2">
                <BedDouble
                  size={18}
                  className="text-[#53683D]"
                />
              </div>

              <div>
                <p className="text-xs text-[#8A8174]">
                  Available therapists
                </p>

                <p className="mt-0.5 text-lg font-semibold text-[#1F3D2E]">
                  {loading ? "—" : availableTherapists.length}
                </p>
              </div>

            </div>
          </div>

        </div>

      </main>
    </div>
  );
}

export default ReceptionistDashboard;